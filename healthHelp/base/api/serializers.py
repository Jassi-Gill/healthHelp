from rest_framework.serializers import ModelSerializer
from base.models import User, Patient, Police, Driver, Hospital

class UserSerializer(ModelSerializer):
    class Meta:
        model = User
        fields = "__all__"

class HospitalSerializer(ModelSerializer):
    class Meta:
        model = Hospital
        fields = "__all__"

class PatientSerializer(ModelSerializer):
    class Meta:
        model = Patient
        fields = "__all__"

class DriverSerializer(ModelSerializer):
    class Meta:
        model = Driver
        fields = "__all__"

class PoliceSerializer(ModelSerializer):
    class Meta:
        model = Police
        fields = "__all__"