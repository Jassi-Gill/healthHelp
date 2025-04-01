from rest_framework import viewsets
from rest_framework.views import APIView
from rest_framework.response import Response
import requests
from .models import Trip, Location, TripStatus, EmergencyRequest
from base.api.serializers import TripSerializer, LocationSerializer, TripStatusSerializer, EmergencyRequestSerializer
from rest_framework.permissions import IsAuthenticated
from rest_framework.permissions import AllowAny


from rest_framework import status
from google.cloud import vision
import face_recognition
from PIL import Image
import numpy as np
import io
from .models import Patient

class TripViewSet(viewsets.ModelViewSet):
    queryset = Trip.objects.all()
    serializer_class = TripSerializer
    # permission_classes = [IsAuthenticated]  # Added basic authentication

class LocationViewSet(viewsets.ModelViewSet):
    queryset = Location.objects.all()
    serializer_class = LocationSerializer
    # permission_classes = [IsAuthenticated]  # Added basic authentication
class TripStatusList(viewsets.ModelViewSet):
    serializer_class = TripStatusSerializer
    # permission_classes = [IsAuthenticated]
    queryset = TripStatus.objects.all()  # Define the queryset here

    def get_queryset(self):
        """
        Optionally filter the queryset based on query parameters.
        """
        trip_id = self.request.query_params.get('trip', None)
        if trip_id is not None:
            return TripStatus.objects.filter(trip_id=trip_id).order_by('-updated_at')
        return TripStatus.objects.all()
class EmergencyRequestViewSet(viewsets.ModelViewSet):
    queryset = EmergencyRequest.objects.all()
    serializer_class = EmergencyRequestSerializer
    permission_classes = [AllowAny]  # Explicitly allow unauthenticated access

    def perform_create(self, serializer):
        # If authenticated and user is a patient, set patient field
        if self.request.user.is_authenticated and self.request.user.user_type == 'patient':
            serializer.save(patient=self.request.user.patient)
        else:
            serializer.save()  # Save without patient if not authenticated

# Uncomment and update if needed
# class DirectionsProxy(APIView):
#     def get(self, request):
#         origin = request.query_params.get('origin')
#         destination = request.query_params.get('destination')
#         api_key = 'YOUR_OLA_MAPS_API_KEY'  # Replace with your Ola Maps API key
#         url = f'https://api.olamaps.io/routing/v1/directions?origin={origin}&destination={destination}&api_key={api_key}'
#         response = requests.get(url)
#         return Response(response.json())