# from django.http import JsonResponse
from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.permissions import AllowAny
from base.models import Patient, User, Driver
from .serializers import UsersSerializer

@api_view(['GET'])
def getRoutes(request):
    routes = [
        "GET /api/users", 
        "GET /api/users/:username", 
        "POST /api/signup", 
    ]

    return Response(routes)


@api_view(['GET'])
def getUsers(request):
    users = User.objects.all()
    serializer = UsersSerializer(users)
    return Response(serializer.data)

@api_view(['POST'])
@permission_classes([AllowAny])
def signup(request):
    """
    Create a new user and associated profile.
    """
    # Extract data from request
    username = request.data.get('username')
    email = request.data.get('email')
    password = request.data.get('password')
    user_type = request.data.get('user_type')
    
    # Validate required fields
    if not all([username, email, password, user_type]):
        return Response(
            {'detail': 'Please provide username, email, password, and user type.'},
            status=status.HTTP_400_BAD_REQUEST
        )
    
    # Check if user already exists
    # if User.objects.filter(username=username).exists():
    #     return Response(
    #         {'detail': 'Username already exists.'},
    #         status=status.HTTP_400_BAD_REQUEST
    #     )
    
    if User.objects.filter(email=email).exists():
        return Response(
            {'detail': 'Email already exists.'},
            status=status.HTTP_400_BAD_REQUEST
        )
    
    # Validate user type
    valid_user_types = ['patient', 'driver', 'hospital', 'police']
    if user_type not in valid_user_types:
        return Response(
            {'detail': f'Invalid user type. Must be one of: {", ".join(valid_user_types)}'},
            status=status.HTTP_400_BAD_REQUEST
        )
    
    # Create user
    try:
        user = User.objects.create_user(
            username=username,
            email=email,
            password=password,
        )
        
        # Create user profile with user type
        # User.objects.create(
        #     user=user,
        #     user_type=user_type
        # )
        
        # Serialize the user data for response
        serializer = UsersSerializer(user)
        return Response(
            {
                'detail': 'User registered successfully.',
                'user': serializer.data
            },
            status=status.HTTP_201_CREATED
        )
    
    except Exception as e:
        # Delete user if profile creation fails
        if 'user' in locals():
            user.delete()
        
        return Response(
            {'detail': f'Failed to register user: {str(e)}'},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )
