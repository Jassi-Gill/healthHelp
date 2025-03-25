from django.contrib import admin
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from base.views import TripViewSet, LocationViewSet, TripStatusList

router = DefaultRouter()
router.register(r'trips', TripViewSet)
router.register(r'trip-status', TripStatusList, basename='trip-status')

urlpatterns = [
    path('api/', include(router.urls)),
    
    # path('api/directions/', DirectionsProxy.as_view(), name='directions'),
]