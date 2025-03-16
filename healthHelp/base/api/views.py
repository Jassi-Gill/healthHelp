# from django.http import JsonResponse
from rest_framework.decorators import api_view
from rest_framework.response import Response
from base.models import Patient, User, Driver
from .serializers import UsersSerializer

@api_view(['GET'])
def getRoutes(request):
    routes = [
        "GET /api/users", 
        "GET /api/users/:username", 
    ]

    return Response(routes)


@api_view(['GET'])
def getUsers(request):
    users = User.objects.all()
    serializer = UsersSerializer(users)
    return Response(serializer.data)
