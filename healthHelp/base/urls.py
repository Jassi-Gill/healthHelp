from django.contrib import admin
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from base.views import PatientProfileUpdateView, EmergencyRequestViewSet  # Import the new viewset

router = DefaultRouter()
router.register(r'emergency-requests', EmergencyRequestViewSet)  # New route

urlpatterns = [
    path('api/', include(router.urls)),
    # Uncomment if using DirectionsProxy
    # path('directions/', DirectionsProxy.as_view(), name='directions_proxy'),
]

urlpatterns += [
    path('api/patient/profile/update/', PatientProfileUpdateView.as_view(), name='patient-profile-update'),
]