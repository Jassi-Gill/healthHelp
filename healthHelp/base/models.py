import uuid
from django.contrib.auth.models import AbstractUser
from django.db import models

class User(AbstractUser):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    email = models.EmailField(unique=True)
    image_path = models.CharField(max_length=255, blank=True, null=True)
    gender = models.CharField(max_length=20, choices=[('Male', 'Male'), ('Female', 'Female'), ('Other', 'Other')], blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['username']

class EmergencyContact(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='emergency_contacts')
    contact_name = models.CharField(max_length=100)
    relationship = models.CharField(max_length=50, blank=True, null=True)
    contact_number = models.CharField(max_length=20)

class MobileNumber(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='mobile_numbers')
    mobile_number = models.CharField(max_length=20)
    is_primary = models.BooleanField(default=False)

class Patient(User):
    address = models.TextField(blank=True, null=True)
    medical_history = models.TextField(blank=True, null=True)
    insurance_details = models.JSONField(blank=True, null=True)

class Driver(User):
    license_number = models.CharField(max_length=50, unique=True)
    license_expiry = models.DateField()
    status = models.CharField(max_length=10, choices=[('available', 'Available'), ('busy', 'Busy'), ('offline', 'Offline')], default='offline')
    rating = models.DecimalField(max_digits=3, decimal_places=2, blank=True, null=True)

class Vehicle(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    type = models.CharField(max_length=20, choices=[('ambulance', 'Ambulance'), ('fire_truck', 'Fire Truck'), ('police', 'Police'), ('other', 'Other')])
    registration_number = models.CharField(max_length=50, unique=True)
    model = models.CharField(max_length=100, blank=True, null=True)
    status = models.CharField(max_length=15, choices=[('active', 'Active'), ('maintenance', 'Maintenance'), ('inactive', 'Inactive')], default='active')
    capacity = models.IntegerField(blank=True, null=True)
    last_maintenance_date = models.DateField(blank=True, null=True)

class DriverVehicleAssignment(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    driver = models.ForeignKey(Driver, on_delete=models.CASCADE)
    vehicle = models.ForeignKey(Vehicle, on_delete=models.CASCADE)
    assigned_from = models.DateTimeField()
    assigned_until = models.DateTimeField(blank=True, null=True)
    is_current = models.BooleanField(default=True)

    class Meta:
        unique_together = ('vehicle', 'is_current')

class Hospital(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=100)
    email = models.EmailField(unique=True, blank=True, null=True)
    address = models.TextField()
    phone = models.CharField(max_length=20, blank=True, null=True)
    capacity = models.IntegerField()
    emergency_capacity = models.IntegerField()
    is_active = models.BooleanField(default=True)

class HospitalLocation(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    hospital = models.ForeignKey(Hospital, on_delete=models.CASCADE, related_name='locations')
    latitude = models.DecimalField(max_digits=10, decimal_places=8)
    longitude = models.DecimalField(max_digits=11, decimal_places=8)

class EmergencyRequest(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    patient = models.ForeignKey(Patient, on_delete=models.CASCADE, related_name='emergency_requests')
    emergency_type = models.CharField(max_length=20, choices=[('medical', 'Medical'), ('fire', 'Fire'), ('police', 'Police'), ('disaster', 'Disaster'), ('other', 'Other')])
    description = models.TextField(blank=True, null=True)
    status = models.CharField(max_length=20, choices=[('created', 'Created'), ('assigned', 'Assigned'), ('in_progress', 'In Progress'), ('completed', 'Completed'), ('cancelled', 'Cancelled')], default='created')
    priority = models.CharField(max_length=10, choices=[('low', 'Low'), ('medium', 'Medium'), ('high', 'High'), ('critical', 'Critical')], default='medium')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

class PatientTreatment(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    patient = models.ForeignKey(Patient, on_delete=models.CASCADE, related_name='treatments')
    hospital = models.ForeignKey(Hospital, on_delete=models.CASCADE, related_name='patient_treatments')
    emergency_request = models.ForeignKey(EmergencyRequest, on_delete=models.SET_NULL, blank=True, null=True)
    admission_date = models.DateTimeField()
    discharge_date = models.DateTimeField(blank=True, null=True)
    diagnosis = models.TextField()
    treatment_details = models.TextField()
    follow_up_required = models.BooleanField(default=False)

class DispatchSystem(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=100)
    status = models.CharField(max_length=20, choices=[('operational', 'Operational'), ('maintenance', 'Maintenance'), ('down', 'Down')], default='operational')
    region = models.CharField(max_length=100, blank=True, null=True)
    capacity = models.IntegerField()

class EmergencyStatusUpdate(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    request = models.ForeignKey(EmergencyRequest, on_delete=models.CASCADE, related_name='status_updates')
    status = models.CharField(max_length=20, choices=[('created', 'Created'), ('assigned', 'Assigned'), ('in_progress', 'In Progress'), ('completed', 'Completed'), ('cancelled', 'Cancelled')])
    notes = models.TextField(blank=True, null=True)
    updated_by = models.UUIDField()
    updated_at = models.DateTimeField(auto_now=True)

class VehicleLocationHistory(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    vehicle = models.ForeignKey(Vehicle, on_delete=models.CASCADE, related_name='location_history')
    latitude = models.DecimalField(max_digits=10, decimal_places=8)
    longitude = models.DecimalField(max_digits=11, decimal_places=8)
    timestamp = models.DateTimeField(auto_now_add=True)
    speed = models.DecimalField(max_digits=5, decimal_places=2, blank=True, null=True)
    heading = models.IntegerField(blank=True, null=True)
