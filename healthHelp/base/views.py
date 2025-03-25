from rest_framework import viewsets
from rest_framework.views import APIView
from rest_framework.response import Response
import requests
from .models import Trip, Location, TripStatus
from base.api.serializers import TripSerializer, LocationSerializer, TripStatusSerializer
from rest_framework import generics
from rest_framework import viewsets
from .models import TripStatus

class TripViewSet(viewsets.ModelViewSet):
    queryset = Trip.objects.all()
    serializer_class = TripSerializer

class LocationViewSet(viewsets.ModelViewSet):
    queryset = Location.objects.all()
    serializer_class = LocationSerializer


class TripStatusList(viewsets.ModelViewSet):
    serializer_class = TripStatusSerializer

    def get_queryset(self):
        trip_id = self.request.query_params.get('trip', None)
        if trip_id is not None:
            return TripStatus.objects.filter(trip_id=trip_id).order_by('-updated_at')
        return TripStatus.objects.all()

# class DirectionsProxy(APIView):
#     def get(self, request):
#         origin = request.query_params.get('origin')
#         destination = request.query_params.get('destination')
#         api_key = 'YOUR_OLA_MAPS_API_KEY'  # Replace with your Ola Maps API key
#         url = f'https://api.olamaps.io/routing/v1/directions?origin={origin}&destination={destination}&api_key={api_key}'
#         response = requests.get(url)
#         return Response(response.json())