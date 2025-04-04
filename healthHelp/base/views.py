from rest_framework import viewsets
from rest_framework.views import APIView
from rest_framework.response import Response
import requests
from .models import MedicalHistory ,EmergencyRequest, Patient
from base.api.serializers import EmergencyRequestSerializer, PatientSerializer, MedicalHistorySerializer
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework import status
from google.cloud import vision
import face_recognition
from PIL import Image
import numpy as np
import io
#jassi
from rest_framework.permissions import IsAuthenticated
from rest_framework.authentication import TokenAuthentication, SessionAuthentication
from rest_framework_simplejwt.authentication import JWTAuthentication
from django.contrib.auth import update_session_auth_hash


class PatientProfileUpdateView(APIView):
    # permission_classes = [IsAuthenticated]
    # authentication_classes = [JWTAuthentication, TokenAuthentication, SessionAuthentication]
    def get(self, request, *args, **kwargs):
        # if not request.user.is_authenticated:
        #     return Response(
        #         {'error': 'Authentication required'},
        #         status=status.HTTP_401_UNAUTHORIZED
        #     )
        if request.user.user_type != 'patient':
            return Response(
                {'error': 'This endpoint is only for patients'},
                status=status.HTTP_403_FORBIDDEN
            )
        # Get the Patient instance
        try:
            patient = request.user.patient
        except AttributeError:
            return Response(
                {'error': 'Patient profile not found for this user'},
                status=status.HTTP_404_NOT_FOUND
            )
        serializer = PatientSerializer(patient, context={'request': request})
        return Response(serializer.data, status=status.HTTP_200_OK)
    
    def put(self, request, *args, **kwargs):
        # if not request.user.is_authenticated:
        #     return Response(
        #         {'error': 'Authentication required'},
        #         status=status.HTTP_401_UNAUTHORIZED
        #     )
        if request.user.user_type != 'patient':
            return Response(
                {'error': 'This endpoint is only for patients'},
                status=status.HTTP_403_FORBIDDEN
            )
        try:
            patient = request.user.patient
        except AttributeError:
            return Response(
                {'error': 'Patient profile not found for this user'},
                status=status.HTTP_404_NOT_FOUND
            )
        if not isinstance(patient, Patient):
            return Response({'error': 'Not a patient'}, status=status.HTTP_400_BAD_REQUEST)
        

        # Handle insurance document deletion
        if request.data.get('delete_insurance_document') == 'true':
            if patient.insurance_document:
                patient.insurance_document.delete(save=False)
            patient.insurance_document = None
        else:
            if 'insurance_document' in request.FILES:
                patient.insurance_document = request.FILES['insurance_document']

        # Update patient profile
        patient.username = request.data.get('username', patient.username)
        patient.email = request.data.get('email', patient.email)
        patient.first_name = request.data.get('first_name', patient.first_name)
        patient.last_name = request.data.get('last_name', patient.last_name)
        patient.gender = request.data.get('gender', patient.gender)
        patient.address = request.data.get('address', patient.address)
        
        if request.data.get('delete_face_image') == 'true':
            if patient.face_image:
                patient.face_image.delete(save=False)  # Delete the file from storage
            patient.face_image = None
        elif 'face_image' in request.FILES:
            patient.face_image = request.FILES['face_image']
        
        patient.save()

        if 'currentPassword' in request.data and 'newPassword' in request.data:
            if request.user.check_password(request.data['currentPassword']):
                request.user.set_password(request.data['newPassword'])
                try:
                    request.user.save()
                except Exception as e:
                    print(f"Save failed: {e}")
            else:
                return Response(
                    {'error': 'Current password is incorrect'},
                    status=status.HTTP_400_BAD_REQUEST
                )
            update_session_auth_hash(request, request.user)


        # Handle new medical history entries
        medical_history_data = {}
        for key in request.data:
            if key.startswith('medical_history_description_'):
                index = key.split('_')[-1]
                medical_history_data[index] = {'description': request.data[key]}
        for key in request.FILES:
            if key.startswith('medical_history_file_'):
                index = key.split('_')[-1]
                if index in medical_history_data:
                    medical_history_data[index]['file'] = request.FILES[key]
        for index, data in medical_history_data.items():
            if 'description' in data:
                MedicalHistory.objects.create(
                    patient=patient,
                    description=data['description'],
                    document=data.get('file')
                )

        return Response({'message': 'Profile updated successfully'}, status=status.HTTP_200_OK)

class MedicalHistoryViewSet(viewsets.ModelViewSet):
    queryset = MedicalHistory.objects.all()
    serializer_class = MedicalHistorySerializer
    # permission_classes = [IsAuthenticated]

    def get_queryset(self):
        # Only allow patients to see their own medical history
        return MedicalHistory.objects.filter(patient=self.request.user.patient)

    def perform_destroy(self, instance):
        # Delete the file from storage
        if instance.document:
            instance.document.delete()
        instance.delete()


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
