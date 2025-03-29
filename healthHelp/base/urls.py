from django.contrib import admin
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from base.views import TripViewSet, LocationViewSet, TripStatusList,EmergencyRequestViewSet  # Import the new viewset

router = DefaultRouter()
router.register(r'trips', TripViewSet)
router.register(r'locations', LocationViewSet)
router.register(r'trip-statuses', TripStatusList)
router.register(r'emergency-requests', EmergencyRequestViewSet)  # New route

urlpatterns = [
    path('api/', include(router.urls)),
    # Uncomment if using DirectionsProxy
    # path('directions/', DirectionsProxy.as_view(), name='directions_proxy'),
]