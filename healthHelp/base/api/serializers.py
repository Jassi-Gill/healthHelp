from rest_framework.serializers import ModelSerializer
from rest_framework import serializers
from base.models import (
    User,
    Patient,
    Police,
    Driver,
    Hospital,
    EmergencyRequest,
    MedicalHistory,
)


class MedicalHistorySerializer(serializers.ModelSerializer):
    document_url = serializers.SerializerMethodField()

    class Meta:
        model = MedicalHistory
        fields = ["description", "document_url"]

    def get_document_url(self, obj):
        return obj.document.url if obj.document else None


class UserSerializer(ModelSerializer):
    class Meta:
        model = User
        fields = "__all__"


class HospitalSerializer(ModelSerializer):
    class Meta:
        model = Hospital
        fields = "__all__"


class PatientSerializer(ModelSerializer):
    face_image_url = serializers.SerializerMethodField()
    insurance_document_url = serializers.SerializerMethodField()
    medical_histories = MedicalHistorySerializer(many=True, read_only=True)  # Fixed

    class Meta:
        model = Patient
        fields = "__all__"

    def get_user(self, obj):
        return {
            "username",
            "email",
            "first_name",
            "last_name",
            "gender",
            "address",
            "face_image_url",
            "insurance_document_url",
            "medical_histories",
        }

    def get_face_image_url(self, obj):
        return obj.face_image.url if obj.face_image else None

    def get_insurance_document_url(self, obj):
        return obj.insurance_document.url if obj.insurance_document else None


class DriverSerializer(ModelSerializer):
    class Meta:
        model = Driver
        fields = "__all__"


class PoliceSerializer(ModelSerializer):
    class Meta:
        model = Police
        fields = "__all__"


class EmergencyRequestSerializer(serializers.ModelSerializer):
    class Meta:
        model = EmergencyRequest
        fields = [
            "id",
            "patient",
            "start_location_latitude",
            "start_location_longitude",
            "start_location_name",
            "end_location_latitude",
            "end_location_longitude",
            "end_location_name",
            "emergency_type",
            "description",
            "status",
            "priority",
            "created_at",
            "updated_at",
        ]
