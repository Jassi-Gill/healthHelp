# from django.http import JsonResponse
from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.permissions import AllowAny
from base.models import Patient, User, Driver, Hospital, Police
from .serializers import (
    UserSerializer,
    HospitalSerializer,
    PoliceSerializer,
    DriverSerializer,
    PatientSerializer,
)
from django.db import transaction
from datetime import datetime, timedelta
from rest_framework_simplejwt.tokens import RefreshToken
from django.db.models import Q
from django.contrib.auth import authenticate


@api_view(["POST"])
@permission_classes([AllowAny])
def login(request):
    """
    Login API endpoint that authenticates users and returns tokens and user type.
    """
    email = request.data.get("email")
    password = request.data.get("password")

    if not email or not password:
        return Response(
            {"detail": "Please provide both email and password."},
            status=status.HTTP_400_BAD_REQUEST,
        )

    try:
        # Find user by email
        user = User.objects.get(email=email)

        # Try to authenticate
        authenticated_user = authenticate(request, email=email, password=password)

        if authenticated_user is None:
            return Response(
                {"detail": "Invalid credentials."}, status=status.HTTP_401_UNAUTHORIZED
            )

        # Generate tokens
        refresh = RefreshToken.for_user(authenticated_user)
        tokens = {
            "refresh": str(refresh),
            "access": str(refresh.access_token),
        }

        # Get user_type from the User model
        user_type = authenticated_user.user_type
        user_data = {
            "id": str(authenticated_user.id),
            "username": authenticated_user.username,
            "email": authenticated_user.email,
        }

        # Add type-specific data based on user_type
        if user_type == "patient":
            patient = authenticated_user.patient
            user_data.update(
                {
                    "address": patient.address,
                    }
            )

        elif user_type == "driver":
            driver = authenticated_user.driver
            user_data.update(
                {
                    "license_number": driver.license_number,
                    "license_expiry": driver.license_expiry.strftime("%Y-%m-%d"),
                    "status": driver.status,
                    "rating": float(driver.rating) if driver.rating else None,
                }
            )

        elif user_type == "police":
            police = authenticated_user.police
            user_data.update(
                {
                    "badge_number": police.badge_number,
                    "station_name": police.station_name,
                    "rank": police.rank,
                }
            )

        elif user_type == 'hospital':
            hospital = authenticated_user.hospital
            user_data.update({
                'name': hospital.name,
                'address': hospital.address,
                'phone': hospital.phone,
                'capacity': hospital.capacity,
                'emergency_capacity': hospital.emergency_capacity,
                'hospital_active': hospital.hospital_active,
                'hospital_email': hospital.hospital_email,
                'hospital_active': hospital.is_active,  # User account status
            })

        return Response(
            {
                "detail": "Login successful.",
                "tokens": tokens,
                "user_type": user_type,
                "user": user_data,
            },
            status=status.HTTP_200_OK,
        )

    except User.DoesNotExist:
        return Response(
            {"detail": "No account found with this email."},
            status=status.HTTP_404_NOT_FOUND,
        )
    except Hospital.DoesNotExist:
        return Response(
            {"detail": "Hospital data not found for this email."},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR,
        )
    except Exception as e:
        return Response(
            {"detail": f"Login failed: {str(e)}"},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR,
        )


@api_view(["GET"])
def getRoutes(request):
    routes = [
        "GET /api/users",
        # "GET /api/users/:username",
        "POST /api/signup",
    ]

    return Response(routes)


@api_view(["GET"])
def getUsers(request):
    users = User.objects.all()
    serializer = UserSerializer(users, many=True)
    return Response(serializer.data)


@api_view(["POST"])
@permission_classes([AllowAny])
def signup(request):
    """
    Create a new user based on the user_type (patient, driver, hospital, police).
    """
    # Extract data from request
    username = request.data.get("username")
    email = request.data.get("email")
    password = request.data.get("password")
    user_type = request.data.get("user_type")

    # Validate required fields
    if not all([username, email, password, user_type]):
        return Response(
            {"detail": "Please provide username, email, password, and user type."},
            status=status.HTTP_400_BAD_REQUEST,
        )

    # Check if email already exists
    if User.objects.filter(email=email).exists():
        return Response(
            {"detail": "Email already exists."}, status=status.HTTP_400_BAD_REQUEST
        )

    # Validate user type
    valid_user_types = ["patient", "driver", "hospital", "police"]
    if user_type not in valid_user_types:
        return Response(
            {
                "detail": f'Invalid user type. Must be one of: {", ".join(valid_user_types)}'
            },
            status=status.HTTP_400_BAD_REQUEST,
        )

    # Create user based on type
    try:
        with transaction.atomic():
            if user_type == 'hospital':
                hospital = Hospital.objects.create_user(
                    username=username,
                    email=email,
                    password=password,
                    user_type='hospital',
                    name=request.data.get('name', f"{username}'s Hospital"),
                    address=request.data.get('address', ''),
                    phone=request.data.get('phone', ''),
                    capacity=request.data.get('capacity', 100),
                    emergency_capacity=request.data.get('emergency_capacity', 20),
                    hospital_active=True,
                    hospital_email=request.data.get('hospital_email', email)
                )
                serializer = HospitalSerializer(hospital)

            elif user_type == "patient":
                # Create a Patient user
                patient = Patient.objects.create_user(
                    username=username,
                    email=email,
                    password=password,
                    user_type="patient",
                    address=request.data.get("address", ""),
                )

                serializer = PatientSerializer(patient)

            elif user_type == "driver":
                # Validate driver-specific fields
                license_number = request.data.get("license_number")
                license_expiry = request.data.get("license_expiry")

                # if not license_number:
                #     return Response(
                #         {
                #             "detail": "License number is required for driver registration."
                #         },
                #         status=status.HTTP_400_BAD_REQUEST,
                #     )

                # Set default expiry date if not provided (1 year from now)
                # if not license_expiry:
                #     license_expiry = (datetime.now() + timedelta(days=365)).strftime(
                #         "%Y-%m-%d"
                #     )

                driver = Driver.objects.create_user(
                    username=username,
                    email=email,
                    password=password,
                    user_type="driver",
                    license_number=license_number,
                    license_expiry=license_expiry,
                    status="offline",
                )

                serializer = DriverSerializer(driver)

            elif user_type == "police":
                # Validate police-specific fields
                badge_number = request.data.get("badge_number")
                station_name = request.data.get("station_name")
                rank = request.data.get("rank", "Officer")

                # if not badge_number or not station_name:
                #     return Response(
                #         {
                #             "detail": "Badge number and station name are required for police registration."
                #         },
                #         status=status.HTTP_400_BAD_REQUEST,
                #     )

                police = Police.objects.create_user(
                    username=username,
                    email=email,
                    password=password,
                    user_type="police",
                    badge_number=badge_number,
                    station_name=station_name,
                    rank=rank,
                )

                serializer = PoliceSerializer(police)

            return Response(
                {
                    "detail": f"{user_type.capitalize()} registered successfully.",
                    "user": serializer.data,
                },
                status=status.HTTP_201_CREATED,
            )

    except Exception as e:
        return Response(
            {"detail": f"Failed to register {user_type}: {str(e)}"},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR,
        )
