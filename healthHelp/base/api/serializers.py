from rest_framework.serializers import ModelSerializer
from base.models import User, Patient, Police, Driver, Hospital, Trip, Location, TripStatus

class LocationSerializer(ModelSerializer):
    class Meta:
        model = Location
        fields = ['id', 'name', 'latitude', 'longitude']

class TripSerializer(ModelSerializer):
    start_location = LocationSerializer()
    end_location = LocationSerializer()

    class Meta:
        model = Trip
        fields = ['id', 'name', 'start_location', 'end_location', 'created_at']

    def create(self, validated_data):
        start_location_data = validated_data.pop('start_location')
        end_location_data = validated_data.pop('end_location')
        start_location = Location.objects.create(**start_location_data)
        end_location = Location.objects.create(**end_location_data)
        trip = Trip.objects.create(
            start_location=start_location,
            end_location=end_location,
            **validated_data
        )
        return trip

class TripStatusSerializer(ModelSerializer):
    class Meta:
        model = TripStatus
        fields = ['trip', 'current_latitude', 'current_longitude', 'updated_at']

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