from django.contrib import admin
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from base.views import PatientProfileUpdateView, EmergencyRequestViewSet  # Import the new viewset
from django.conf import settings
from django.conf.urls.static import static

router = DefaultRouter()
router.register(r'emergency-requests', EmergencyRequestViewSet)  # New route

urlpatterns = [
    path('api/', include(router.urls)),
    path('api/patients/profile/', PatientProfileUpdateView.as_view(), name='patient-profile-update'),
    ]


urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
