from rest_framework import viewsets
from rest_framework.views import APIView
from rest_framework.response import Response
import requests
from .models import Trip, Location, TripStatus, EmergencyRequest, Patient
from base.api.serializers import TripSerializer, LocationSerializer, TripStatusSerializer, EmergencyRequestSerializer
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework import status
from google.cloud import vision
import face_recognition
from PIL import Image
import numpy as np
import io

from rest_framework.permissions import IsAuthenticated

class PatientProfileUpdateView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        patient = request.user
        face_image = request.FILES.get('face_image')
        if face_image:
            # Verify the image has exactly one face
            client = vision.ImageAnnotatorClient()
            image_content = face_image.read()
            image = vision.Image(content=image_content)
            response = client.face_detection(image=image)
            if len(response.face_annotations) != 1:
                return Response({'error': 'Image must contain exactly one face'}, status=status.HTTP_400_BAD_REQUEST)
            patient.face_image = image_content
            patient.save()
            return Response({'message': 'Face image updated successfully'}, status=status.HTTP_200_OK)
        return Response({'error': 'No image provided'}, status=status.HTTP_400_BAD_REQUEST)

class EmergencyRequestViewSet(viewsets.ModelViewSet):
    queryset = EmergencyRequest.objects.all()
    serializer_class = EmergencyRequestSerializer
    permission_classes = [AllowAny]  # Explicitly allow unauthenticated access

    def create(self, request, *args, **kwargs):
        photo = request.FILES.get('photo')
        if photo:
            # Perform optional photo detection and verification
            try:
                # Step 1: Use Google Cloud Vision API to detect faces
                client = vision.ImageAnnotatorClient()
                image_content = photo.read()
                image = vision.Image(content=image_content)
                response = client.face_detection(image=image)
                faces = response.face_annotations

                if len(faces) != 1:
                    return Response({'error': 'Exactly one face must be present in the photo'}, status=status.HTTP_400_BAD_REQUEST)

                # Step 2: Check if patient has a stored face image (requires authentication)
                if not request.user.is_authenticated or not hasattr(request.user, 'patient'):
                    return Response({'error': 'Authentication required for photo verification'}, status=status.HTTP_401_UNAUTHORIZED)

                patient = request.user.patient
                if not patient.face_image:
                    return Response({'error': 'No face image stored for this patient'}, status=status.HTTP_400_BAD_REQUEST)

                # Step 3: Use face_recognition to verify identity
                stored_image = Image.open(io.BytesIO(patient.face_image))
                stored_image_np = np.array(stored_image)
                stored_encodings = face_recognition.face_encodings(stored_image_np)
                if len(stored_encodings) != 1:
                    return Response({'error': 'Stored image must contain exactly one face'}, status=status.HTTP_400_BAD_REQUEST)
                stored_encoding = stored_encodings[0]

                new_image = Image.open(io.BytesIO(image_content))
                new_image_np = np.array(new_image)
                new_encodings = face_recognition.face_encodings(new_image_np)
                if len(new_encodings) != 1:
                    return Response({'error': 'New image must contain exactly one face'}, status=status.HTTP_400_BAD_REQUEST)
                new_encoding = new_encodings[0]

                match = face_recognition.compare_faces([stored_encoding], new_encoding)[0]
                if not match:
                    return Response({'error': 'Face verification failed'}, status=status.HTTP_403_FORBIDDEN)

            except Exception as e:
                return Response({'error': f'Error during photo verification: {str(e)}'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

        # Proceed with creating the emergency request
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        self.perform_create(serializer)
        headers = self.get_success_headers(serializer.data)
        return Response(serializer.data, status=status.HTTP_201_CREATED, headers=headers)

    def perform_create(self, serializer):
        # If authenticated and user is a patient, set patient field
        if self.request.user.is_authenticated and self.request.user.user_type == 'patient':
            serializer.save(patient=self.request.user.patient)
        else:
            serializer.save()  # Save without patient if not authenticated
