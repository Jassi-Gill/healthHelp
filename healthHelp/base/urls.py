from django.contrib import admin
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from base.views import (
    PatientProfileUpdateView, EmergencyRequestViewSet, MedicalHistoryViewSet,
    DriverStatusView, PoliceStatusView, HospitalStatusView, DriverProfileUpdateView,
    PoliceProfileUpdateView, NearbyHospitalsView, PatientTreatmentViewSet
)
from django.conf import settings
from django.conf.urls.static import static

router = DefaultRouter()
router.register(r'emergency-requests', EmergencyRequestViewSet)
router.register(r'medical-histories', MedicalHistoryViewSet)
router.register(r'patient-treatments', PatientTreatmentViewSet)

urlpatterns = [
    path('api/', include(router.urls)),
    path('api/patients/profile/', PatientProfileUpdateView.as_view(), name='patient-profile-update'),
    path('api/drivers/profile/', DriverProfileUpdateView.as_view(), name='driver-profile-update'),
    path('api/police/profile/', PoliceProfileUpdateView.as_view(), name='police-profile-update'),
    path('api/driver/status/', DriverStatusView.as_view(), name='driver-status'),
    path('api/police/status/', PoliceStatusView.as_view(), name='police-status'),
    path('api/hospital/status/', HospitalStatusView.as_view(), name='hospital-status'),
    path('api/nearby-hospitals/', NearbyHospitalsView.as_view(), name='nearby-hospitals'),
]

urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)