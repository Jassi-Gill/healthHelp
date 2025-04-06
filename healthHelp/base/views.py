from rest_framework import viewsets, status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework import status
from google.cloud import vision
from django_filters.rest_framework import DjangoFilterBackend
# import face_recognition
from PIL import Image
import numpy as np
import io
from rest_framework.permissions import IsAuthenticated
from rest_framework.authentication import TokenAuthentication, SessionAuthentication
from rest_framework_simplejwt.authentication import JWTAuthentication
from django.contrib.auth import update_session_auth_hash
from .models import (
    MedicalHistory,
    EmergencyRequest,
    Patient,
    Driver,
    Hospital,
    Police,
    HospitalLocation,
    PatientTreatment
)
from base.api.serializers import (
    EmergencyRequestSerializer,
    PatientSerializer,
    MedicalHistorySerializer,
    DriverSerializer,
    PoliceSerializer,
    PatientTreatmentSerializer,
    HospitalSerializer,
)

from math import radians, cos, sin, asin, sqrt


def haversine(lon1, lat1, lon2, lat2):
    """
    Calculate the great circle distance in kilometers between two points
    on the earth (specified in decimal degrees).
    """
    # Convert decimal degrees to radians
    lon1, lat1, lon2, lat2 = map(radians, [lon1, lat1, lon2, lat2])
    # Haversine formula
    dlon = lon2 - lon1
    dlat = lat2 - lat1
    a = sin(dlat / 2) ** 2 + cos(lat1) * cos(lat2) * sin(dlon / 2) ** 2
    c = 2 * asin(sqrt(a))
    r = 6371  # Radius of earth in kilometers
    return c * r


class NearbyHospitalsView(APIView):
    permission_classes = []
    def get(self, request, *args, **kwargs):
        lat = request.query_params.get("lat")
        lon = request.query_params.get("lon")
        if not lat or not lon:
            return Response(
                {"error": "Latitude and longitude are required"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        try:
            lat = float(lat)
            lon = float(lon)
        except ValueError:
            return Response(
                {"error": "Invalid latitude or longitude"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        hospitals = Hospital.objects.all()
        hospital_locations = HospitalLocation.objects.all()

        nearby_hospitals = []
        for hospital in hospitals:
            location = hospital.locations.first()  # Assuming one location per hospital
            if location:
                distance = haversine(lon, lat, location.longitude, location.latitude)
                if distance <= 10:  # Filter hospitals within 10 km
                    nearby_hospitals.append(
                        {
                            "id": str(hospital.id),
                            "name": hospital.name,
                            "address": hospital.address,
                            "latitude": float(location.latitude),
                            "longitude": float(location.longitude),
                            "distance": round(distance, 2),
                        }
                    )

        # Sort by distance
        nearby_hospitals.sort(key=lambda x: x["distance"])

        if len(nearby_hospitals) == 0:
            return Response(
                {'message': 'No'},
                status=status.HTTP_200_OK
            )

        return Response(nearby_hospitals, status=status.HTTP_200_OK)


class DriverProfileUpdateView(APIView):
    # permission_classes = [IsAuthenticated]
    # authentication_classes = [JWTAuthentication]

    def get(self, request, *args, **kwargs):
        if request.user.user_type != "driver":
            return Response(
                {"error": "This endpoint is only for drivers"},
                status=status.HTTP_403_FORBIDDEN,
            )
        try:
            driver = request.user.driver
        except AttributeError:
            return Response(
                {"error": "Driver profile not found for this user"},
                status=status.HTTP_404_NOT_FOUND,
            )
        serializer = DriverSerializer(driver, context={"request": request})
        return Response(serializer.data, status=status.HTTP_200_OK)

    def put(self, request, *args, **kwargs):
        if request.user.user_type != "driver":
            return Response(
                {"error": "This endpoint is only for drivers"},
                status=status.HTTP_403_FORBIDDEN,
            )
        try:
            driver = request.user.driver
        except AttributeError:
            return Response(
                {"error": "Driver profile not found for this user"},
                status=status.HTTP_404_NOT_FOUND,
            )

        # Handle document deletions
        if request.data.get("delete_face_image") == "true":
            if driver.face_image:
                driver.face_image.delete(save=False)
            driver.face_image = None
        if request.data.get("delete_driving_license_document") == "true":
            if driver.driving_license_document:
                driver.driving_license_document.delete(save=False)
            driver.driving_license_document = None
        if request.data.get("delete_car_insurance_document") == "true":
            if driver.car_insurance_document:
                driver.car_insurance_document.delete(save=False)
            driver.car_insurance_document = None
        if request.data.get("delete_car_rc_document") == "true":
            if driver.car_rc_document:
                driver.car_rc_document.delete(save=False)
            driver.car_rc_document = None

        # Update driver fields
        driver.username = request.data.get("username", driver.username)
        driver.email = request.data.get("email", driver.email)
        driver.first_name = request.data.get("first_name", driver.first_name)
        driver.last_name = request.data.get("last_name", driver.last_name)
        driver.gender = request.data.get("gender", driver.gender)
        driver.address = request.data.get("address", driver.address)
        driver.license_number = request.data.get(
            "license_number", driver.license_number
        )

        # Handle file uploads
        if "face_image" in request.FILES:
            driver.face_image = request.FILES["face_image"]
            print("file uploaded")
        if "driving_license_document" in request.FILES:
            driver.driving_license_document = request.FILES["driving_license_document"]
            print("file uploaded")
        if "car_insurance_document" in request.FILES:
            driver.car_insurance_document = request.FILES["car_insurance_document"]
            print("file uploaded")
        if "car_rc_document" in request.FILES:
            driver.car_rc_document = request.FILES["car_rc_document"]
            print("file uploaded")

        driver.save()

        # Handle password change
        if "currentPassword" in request.data and "newPassword" in request.data:
            if request.user.check_password(request.data["currentPassword"]):
                request.user.set_password(request.data["newPassword"])
                request.user.save()
                update_session_auth_hash(request, request.user)
            else:
                return Response(
                    {"error": "Current password is incorrect"},
                    status=status.HTTP_400_BAD_REQUEST,
                )

        return Response(
            {"message": "Profile updated successfully"}, status=status.HTTP_200_OK
        )


class PatientProfileUpdateView(APIView):
    permission_classes = [IsAuthenticated]
    authentication_classes = [JWTAuthentication]

    def get(self, request, *args, **kwargs):
        if request.user.user_type != "patient":
            return Response(
                {"error": "This endpoint is only for patients"},
                status=status.HTTP_403_FORBIDDEN,
            )
        try:
            patient = request.user.patient
        except AttributeError:
            return Response(
                {"error": "Patient profile not found for this user"},
                status=status.HTTP_404_NOT_FOUND,
            )
        serializer = PatientSerializer(patient, context={"request": request})
        return Response(serializer.data, status=status.HTTP_200_OK)

    def put(self, request, *args, **kwargs):
        if request.user.user_type != "patient":
            return Response(
                {"error": "This endpoint is only for patients"},
                status=status.HTTP_403_FORBIDDEN,
            )
        try:
            patient = request.user.patient
        except AttributeError:
            return Response(
                {"error": "Patient profile not found for this user"},
                status=status.HTTP_404_NOT_FOUND,
            )
        if not isinstance(patient, Patient):
            return Response(
                {"error": "Not a patient"}, status=status.HTTP_400_BAD_REQUEST
            )

        if request.data.get("delete_insurance_document") == "true":
            if patient.insurance_document:
                patient.insurance_document.delete(save=False)
            patient.insurance_document = None
        else:
            if "insurance_document" in request.FILES:
                patient.insurance_document = request.FILES["insurance_document"]

        patient.username = request.data.get("username", patient.username)
        patient.email = request.data.get("email", patient.email)
        patient.first_name = request.data.get("first_name", patient.first_name)
        patient.last_name = request.data.get("last_name", patient.last_name)
        patient.gender = request.data.get("gender", patient.gender)
        patient.address = request.data.get("address", patient.address)

        if request.data.get("delete_face_image") == "true":
            if patient.face_image:
                patient.face_image.delete(save=False)
            patient.face_image = None
        elif "face_image" in request.FILES:
            patient.face_image = request.FILES["face_image"]

        patient.save()

        if "currentPassword" in request.data and "newPassword" in request.data:
            if request.user.check_password(request.data["currentPassword"]):
                request.user.set_password(request.data["newPassword"])
                request.user.save()
                update_session_auth_hash(request, request.user)
            else:
                return Response(
                    {"error": "Current password is incorrect"},
                    status=status.HTTP_400_BAD_REQUEST,
                )

        medical_history_data = {}
        for key in request.data:
            if key.startswith("medical_history_description_"):
                index = key.split("_")[-1]
                medical_history_data[index] = {"description": request.data[key]}
        for key in request.FILES:
            if key.startswith("medical_history_file_"):
                index = key.split("_")[-1]
                if index in medical_history_data:
                    medical_history_data[index]["file"] = request.FILES[key]
        for index, data in medical_history_data.items():
            if "description" in data:
                MedicalHistory.objects.create(
                    patient=patient,
                    description=data["description"],
                    document=data.get("file"),
                )

        return Response({'message': 'Profile updated successfully'}, status=status.HTTP_200_OK)
    
class PoliceProfileUpdateView(APIView):
    permission_classes = [IsAuthenticated]
    authentication_classes = [JWTAuthentication]

    def get(self, request, *args, **kwargs):
        if request.user.user_type != 'police':
            return Response(
                {'error': 'This endpoint is only for police'},
                status=status.HTTP_403_FORBIDDEN
            )
        try:
            police = request.user.police
        except AttributeError:
            return Response(
                {'error': 'Police profile not found for this user'},
                status=status.HTTP_404_NOT_FOUND
            )
        serializer = PoliceSerializer(police, context={'request': request})
        return Response(serializer.data, status=status.HTTP_200_OK)

    def put(self, request, *args, **kwargs):
        if request.user.user_type != 'police':
            return Response(
                {'error': 'This endpoint is only for police'},
                status=status.HTTP_403_FORBIDDEN
            )
        try:
            police = request.user.police
        except AttributeError:
            return Response(
                {'error': 'Police profile not found for this user'},
                status=status.HTTP_404_NOT_FOUND
            )

        # Handle document deletions
        if request.data.get('delete_badge_document') == 'true':
            if police.badge_document:
                police.badge_document.delete(save=False)
            police.badge_document = None

        # Update police fields
        police.username = request.data.get('username', police.username)
        police.email = request.data.get('email', police.email)
        police.first_name = request.data.get('first_name', police.first_name)
        police.last_name = request.data.get('last_name', police.last_name)
        police.gender = request.data.get('gender', police.gender) if(request.data.get('gender')) else None

        police.rank = request.data.get('rank', police.rank)
        police.station_name = request.data.get('station_name', police.station_name)

        # Handle file uploads
        if 'badge_document' in request.FILES:
            police.badge_document = request.FILES['badge_document']

        police.save()

        # Handle password change
        if 'currentPassword' in request.data and 'newPassword' in request.data:
            if request.user.check_password(request.data['currentPassword']):
                request.user.set_password(request.data['newPassword'])
                request.user.save()
                update_session_auth_hash(request, request.user)
            else:
                return Response(
                    {'error': 'Current password is incorrect'},
                    status=status.HTTP_400_BAD_REQUEST
                )

        return Response({'message': 'Profile updated successfully'}, status=status.HTTP_200_OK)
class HospitalResourceUpdateView(APIView):
    permission_classes = [IsAuthenticated]
    authentication_classes = [JWTAuthentication]

    def get(self, request):
        if request.user.user_type != 'hospital':
            return Response({'error': 'This endpoint is only for hospitals'}, status=status.HTTP_403_FORBIDDEN)
        try:
            hospital = Hospital.objects.get(id=request.user.id)
        except Hospital.DoesNotExist:
            return Response({'error': 'Hospital profile not found'}, status=status.HTTP_404_NOT_FOUND)
        serializer = HospitalSerializer(hospital)
        return Response(serializer.data, status=status.HTTP_200_OK)

    def put(self, request):
        if request.user.user_type != 'hospital':
            return Response({'error': 'This endpoint is only for hospitals'}, status=status.HTTP_403_FORBIDDEN)
        try:
            hospital = Hospital.objects.get(id=request.user.id)
        except Hospital.DoesNotExist:
            return Response({'error': 'Hospital profile not found'}, status=status.HTTP_404_NOT_FOUND)
        serializer = HospitalSerializer(hospital, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response({'message': 'Resources updated successfully'}, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
class DriverStatusView(APIView):
    # permission_classes = [IsAuthenticated]
    # authentication_classes = [JWTAuthentication]

    def get(self, request):
        try:
            driver = Driver.objects.get(id=request.user.id)
            return Response(
                {"driver_active": driver.driver_active, "status": driver.status},
                status=status.HTTP_200_OK,
            )
        except Driver.DoesNotExist:
            return Response(
                {"error": "Driver profile not found"}, status=status.HTTP_404_NOT_FOUND
            )

    def patch(self, request):
        try:
            driver = Driver.objects.get(id=request.user.id)
            if "driver_active" in request.data:
                driver.driver_active = request.data["driver_active"]
                if driver.driver_active:
                    driver.status = "available"
                else:
                    driver.status = "offline"
                driver.save()
                return Response(
                    {
                        "driver_active": driver.driver_active,
                        "status": driver.status,
                        "message": f'Driver status updated to {"active" if driver.driver_active else "inactive"}',
                    },
                    status=status.HTTP_200_OK,
                )
            else:
                return Response(
                    {"error": "driver_active field is required"},
                    status=status.HTTP_400_BAD_REQUEST,
                )
        except Driver.DoesNotExist:
            return Response(
                {"error": "Driver profile not found"}, status=status.HTTP_404_NOT_FOUND
            )


class HospitalStatusView(APIView):
    permission_classes = [IsAuthenticated]
    authentication_classes = [JWTAuthentication]

    def get(self, request):
        try:
            hospital = Hospital.objects.get(id=request.user.id)
            return Response(
                {
                    "hospital_active": hospital.hospital_active,
                    "status": "available" if hospital.hospital_active else "offline",
                },
                status=status.HTTP_200_OK,
            )
        except Hospital.DoesNotExist:
            return Response(
                {"error": "Hospital profile not found"},
                status=status.HTTP_404_NOT_FOUND,
            )

    def patch(self, request):
        try:
            hospital = Hospital.objects.get(id=request.user.id)
            if "hospital_active" in request.data:
                hospital.hospital_active = request.data["hospital_active"]
                hospital.save()
                return Response(
                    {
                        "hospital_active": hospital.hospital_active,
                        "status": (
                            "available" if hospital.hospital_active else "offline"
                        ),
                        "message": f'Hospital status updated to {"active" if hospital.hospital_active else "inactive"}',
                    },
                    status=status.HTTP_200_OK,
                )
            else:
                return Response(
                    {"error": "hospital_active field is required"},
                    status=status.HTTP_400_BAD_REQUEST,
                )
        except Hospital.DoesNotExist:
            return Response(
                {"error": "Hospital profile not found"},
                status=status.HTTP_404_NOT_FOUND,
            )


class PoliceStatusView(APIView):
    # permission_classes = [IsAuthenticated]
    # authentication_classes = [JWTAuthentication]

    def get(self, request):
        try:
            police = Police.objects.get(id=request.user.id)
            return Response(
                {
                    "police_active": police.police_active,
                    "status": "available" if police.police_active else "offline",
                },
                status=status.HTTP_200_OK,
            )
        except Police.DoesNotExist:
            return Response(
                {"error": "Police profile not found"}, status=status.HTTP_404_NOT_FOUND
            )

    def patch(self, request):
        try:
            police = Police.objects.get(id=request.user.id)
            if "police_active" in request.data:
                police.police_active = request.data["police_active"]
                police.save()
                return Response(
                    {
                        "police_active": police.police_active,
                        "status": "available" if police.police_active else "offline",
                        "message": f'Police status updated to {"active" if police.police_active else "inactive"}',
                    },
                    status=status.HTTP_200_OK,
                )
            else:
                return Response(
                    {"error": "police_active field is required"},
                    status=status.HTTP_400_BAD_REQUEST,
                )
        except Police.DoesNotExist:
            return Response(
                {"error": "Police profile not found"}, status=status.HTTP_404_NOT_FOUND
            )


class MedicalHistoryViewSet(viewsets.ModelViewSet):
    queryset = MedicalHistory.objects.all()
    serializer_class = MedicalHistorySerializer

    def get_queryset(self):
        return MedicalHistory.objects.filter(patient=self.request.user.patient)

    def perform_destroy(self, instance):
        if instance.document:
            instance.document.delete()
        instance.delete()


class EmergencyRequestViewSet(viewsets.ModelViewSet):
    queryset = EmergencyRequest.objects.all()
    serializer_class = EmergencyRequestSerializer
    permission_classes = [IsAuthenticated]
    authentication_classes = [JWTAuthentication]
    # filter_backends = [DjangoFilterBackend]
    # filterset_fields = ['status']  

    def get_queryset(self):

        queryset = super().get_queryset()

        user = self.request.user
        
        if user.is_authenticated and hasattr(user, 'user_type') and user.user_type == 'hospital':
            queryset = queryset.filter(hospital=user)
            
        
        return queryset

    def perform_create(self, serializer):
        user = self.request.user
        if user.is_authenticated and hasattr(user, 'user_type'):
            if user.user_type == "patient":
                try:
                    patient = user.patient  # Access the Patient profile
                    serializer.save(patient=patient)
                    print("Patient User Saved", patient.id)
                    # return serializer
                except AttributeError:
                    print("Patient not found in perform create in emergencyRequestViewSet", AttributeError)
            else:
                serializer.save() # Non-patient users (e.g., anonymous or other types) leave patient as null
        else:
            serializer.save()  # Unauthenticated users leave patient as null

    def create(self, request, *args, **kwargs):
        photo = request.FILES.get("photo")
        # if photo:
        #     # Perform optional photo detection and verification
        #     try:
        #         # Step 1: Use Google Cloud Vision API to detect faces
        #         client = vision.ImageAnnotatorClient()
        #         image_content = photo.read()
        #         image = vision.Image(content=image_content)
        #         response = client.face_detection(image=image)
        #         faces = response.face_annotations

        #         if len(faces) != 1:
        #             return Response({'error': 'Exactly one face must be present in the photo'}, status=status.HTTP_400_BAD_REQUEST)

        #         # Step 2: Check if patient has a stored face image (requires authentication)
        #         if not request.user.is_authenticated or not hasattr(request.user, 'patient'):
        #             return Response({'error': 'Authentication required for photo verification'}, status=status.HTTP_401_UNAUTHORIZED)

        #         patient = request.user.patient
        #         if not patient.face_image:
        #             return Response({'error': 'No face image stored for this patient'}, status=status.HTTP_400_BAD_REQUEST)

        #         # Step 3: Use face_recognition to verify identity
        #         stored_image = Image.open(io.BytesIO(patient.face_image))
        #         stored_image_np = np.array(stored_image)
        #         #stored_encodings = face_recognition.face_encodings(stored_image_np)
        #         if len(stored_encodings) != 1:
        #             return Response({'error': 'Stored image must contain exactly one face'}, status=status.HTTP_400_BAD_REQUEST)
        #         stored_encoding = stored_encodings[0]

        #         new_image = Image.open(io.BytesIO(image_content))
        #         new_image_np = np.array(new_image)
        #         #new_encodings = face_recognition.face_encodings(new_image_np)
        #         if len(new_encodings) != 1:
        #             return Response({'error': 'New image must contain exactly one face'}, status=status.HTTP_400_BAD_REQUEST)
        #         new_encoding = new_encodings[0]

        #         #match = face_recognition.compare_faces([stored_encoding], new_encoding)[0]
        #         if not match:
        #             return Response({'error': 'Face verification failed'}, status=status.HTTP_403_FORBIDDEN)

        #     except Exception as e:
        #         return Response({'error': f'Error during photo verification: {str(e)}'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

        # Proceed with creating the emergency request

        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        self.perform_create(serializer)
        headers = self.get_success_headers(serializer.data)
        return Response(
            serializer.data, status=status.HTTP_201_CREATED, headers=headers
        )



class PatientTreatmentViewSet(viewsets.ModelViewSet):
    queryset = PatientTreatment.objects.all()
    serializer_class = PatientTreatmentSerializer
    permission_classes = [IsAuthenticated]

    def perform_create(self, serializer):
        if self.request.user.user_type == 'hospital':
            serializer.save(hospital=self.request.user)
        else:
            serializer.save()
