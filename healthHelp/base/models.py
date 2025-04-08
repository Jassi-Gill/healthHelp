import uuid
from django.contrib.auth.models import AbstractUser
from django.db import models
from django.core.exceptions import ValidationError


class User(AbstractUser):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    email = models.EmailField(unique=True)
    gender = models.CharField(
        max_length=20,
        choices=[("Male", "Male"), ("Female", "Female"), ("Other", "Other")],
        blank=True,
        null=True,
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    user_type = models.CharField(
        max_length=10,
        choices=[
            ("patient", "Patient"),
            ("driver", "Driver"),
            ("hospital", "Hospital"),
            ("police", "Police"),
        ],
        default="patient",
    )

    USERNAME_FIELD = "email"
    REQUIRED_FIELDS = ["username"]


class Driver(User):
    address = models.TextField(blank=True, null=True)
    license_number = models.CharField(max_length=50, unique=True, blank=True, null=True)
    license_expiry = models.DateField(blank=True, null=True)
    face_image = models.ImageField(
        upload_to="driver_face_images/", blank=True, null=True
    )
    driving_license_document = models.FileField(
        upload_to="driving_licenses/", blank=True, null=True
    )
    car_insurance_document = models.FileField(
        upload_to="car_insurance/", blank=True, null=True
    )
    car_rc_document = models.FileField(upload_to="car_rc/", blank=True, null=True)
    status = models.CharField(
        max_length=10,
        choices=[("available", "Available"), ("busy", "Busy"), ("offline", "Offline")],
        default="offline",
    )
    rating = models.DecimalField(max_digits=3, decimal_places=2, blank=True, null=True)
    driver_active = models.BooleanField(default=True)
    # latitude = models.DecimalField(
    #     max_digits=9, decimal_places=6, blank=True, null=True
    # )
    # longitude = models.DecimalField(
    #     max_digits=9, decimal_places=6, blank=True, null=True
    # )
    # vehicle_type = models.CharField(
    #     max_length=10,
    #     choices=[("ambulance", "Ambulance"), ("small_taxi", "Small Taxi"), ("small_taxi", "Big Taxi")],
    #     default="offline",
    # )


class Hospital(User):
    name = models.CharField(max_length=100)
    address = models.TextField()
    phone = models.CharField(max_length=20, blank=True, null=True)
    total_beds = models.IntegerField(default=0)
    available_beds = models.IntegerField(default=0)
    oxygen_cylinders = models.IntegerField(default=0)
    ventilators = models.IntegerField(default=0)
    icu_beds = models.IntegerField(default=0)
    total_patients = models.IntegerField(default=0)
    doctors = models.IntegerField(default=0)
    nurses = models.IntegerField(default=0)
    ambulances = models.IntegerField(default=0)
    emergency_rooms = models.IntegerField(default=0)
    hospital_active = models.BooleanField(default=True)
    hospital_email = models.EmailField(unique=True, blank=True, null=True)

    def clean(self):
        if self.available_beds > self.total_beds:
            raise ValidationError("Available beds cannot exceed total beds.")


class HospitalLocation(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    hospital = models.ForeignKey(
        Hospital, on_delete=models.CASCADE, related_name="locations"
    )
    latitude = models.DecimalField(max_digits=10, decimal_places=8)
    longitude = models.DecimalField(max_digits=11, decimal_places=8)


class Police(User):
    badge_number = models.CharField(max_length=50, unique=True, blank=True, null=True)
    station_name = models.CharField(max_length=255, blank=True, null=True)
    rank = models.CharField(max_length=50)
    police_active = models.BooleanField(default=True)
    latitude = models.DecimalField(
        max_digits=9, decimal_places=6, blank=True, null=True
    )
    longitude = models.DecimalField(
        max_digits=9, decimal_places=6, blank=True, null=True
    )
    badge_document = models.FileField(upload_to="police_badges/", blank=True, null=True)


class Patient(User):
    address = models.TextField(blank=True, null=True)
    insurance_document = models.FileField(
        upload_to="insurance_documents/", blank=True, null=True
    )
    face_image = models.ImageField(upload_to="face_images/", blank=True, null=True)
    age = models.IntegerField(blank=True, null=True)
    blood_group = models.CharField(
        max_length=3,
        choices=[
            ("A+", "A+"),
            ("A-", "A-"),
            ("B+", "B+"),
            ("B-", "B-"),
            ("AB+", "AB+"),
            ("AB-", "AB-"),
            ("O+", "O+"),
            ("O-", "O-"),
        ],
        blank=True,
        null=True,
    )

    class Meta:
        db_table = "patient"



class MedicalHistory(models.Model):
    patient = models.ForeignKey(
        Patient, on_delete=models.CASCADE, related_name="medical_histories"
    )
    description = models.TextField()
    document = models.FileField(upload_to="medical_history/", blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)


class EmergencyContact(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(
        User, on_delete=models.CASCADE, related_name="emergency_contacts"
    )
    contact_name = models.CharField(max_length=100)
    relationship = models.CharField(max_length=50, blank=True, null=True)
    contact_number = models.CharField(max_length=20)


class MobileNumber(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(
        User, on_delete=models.CASCADE, related_name="mobile_numbers"
    )
    mobile_number = models.CharField(max_length=20)
    is_primary = models.BooleanField(default=False)


class Vehicle(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    type = models.CharField(
        max_length=20,
        choices=[
            ("ambulance", "Ambulance"),
            ("fire_truck", "Fire Truck"),
            ("police", "Police"),
            ("other", "Other"),
        ],
    )
    registration_number = models.CharField(max_length=50, unique=True)
    model = models.CharField(max_length=100, blank=True, null=True)
    status = models.CharField(
        max_length=15,
        choices=[
            ("active", "Active"),
            ("maintenance", "Maintenance"),
            ("inactive", "Inactive"),
        ],
        default="active",
    )
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
        unique_together = ("vehicle", "is_current")


class EmergencyRequest(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    hospital = models.ForeignKey(
        Hospital,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="emergency_requests",
    )
    patient = models.ForeignKey(
        Patient,
        on_delete=models.CASCADE,
        related_name="emergency_requests",
        null=True,
        blank=True,
    )
    start_location_latitude = models.FloatField(null=True, blank=True)
    start_location_longitude = models.FloatField(null=True, blank=True)
    start_location_name = models.CharField(max_length=255, null=True, blank=True)
    end_location_latitude = models.FloatField(null=True, blank=True)
    end_location_longitude = models.FloatField(null=True, blank=True)
    end_location_name = models.CharField(max_length=255, null=True, blank=True)
    emergency_type = models.CharField(
        max_length=20,
        choices=[
            ("medical", "Medical"),
            ("fire", "Fire"),
            ("police", "Police"),
            ("disaster", "Disaster"),
            ("other", "Other"),
            ("critical", "Critical"),
            ("non-critical", "Non-Critical"),
        ],
    )
    description = models.TextField(blank=True, null=True)
    status = models.CharField(
        max_length=20,
        choices=[
            ("created", "Created"),
            ("assigned", "Assigned"),
            ("in_progress", "In Progress"),
            ("completed", "Completed"),
            ("cancelled", "Cancelled"),
        ],
        default="created",
    )
    priority = models.CharField(
        max_length=10,
        choices=[
            ("low", "Low"),
            ("medium", "Medium"),
            ("high", "High"),
            ("critical", "Critical"),
        ],
        default="medium",
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)


class PatientTreatment(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    patient = models.ForeignKey(
        Patient, on_delete=models.CASCADE, related_name="treatments"
    )
    hospital = models.ForeignKey(
        Hospital, on_delete=models.CASCADE, related_name="patient_treatments"
    )
    emergency_request = models.ForeignKey(
        EmergencyRequest, on_delete=models.SET_NULL, blank=True, null=True
    )
    admission_date = models.DateTimeField()
    discharge_date = models.DateTimeField(blank=True, null=True)
    diagnosis = models.TextField()
    treatment_details = models.TextField()
    follow_up_required = models.BooleanField(default=False)
    vital_signs = models.TextField(blank=True, null=True)  # e.g., "BP: 120/80, HR: 72"
    medications_administered = models.TextField(blank=True, null=True)
    procedures_performed = models.TextField(blank=True, null=True)
    doctor_assigned = models.CharField(max_length=100, blank=True, null=True)
    nurse_assigned = models.CharField(max_length=100, blank=True, null=True)
    follow_up_date = models.DateField(blank=True, null=True)
    follow_up_instructions = models.TextField(blank=True, null=True)
    emergency_contact_name = models.CharField(max_length=100, blank=True, null=True)
    emergency_contact_phone = models.CharField(max_length=20, blank=True, null=True)
    insurance_provider = models.CharField(max_length=100, blank=True, null=True)
    insurance_policy_number = models.CharField(max_length=50, blank=True, null=True)


# class DispatchSystem(models.Model):
#     id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
#     name = models.CharField(max_length=100)
#     status = models.CharField(max_length=20, choices=[('operational', 'Operational'), ('maintenance', 'Maintenance'), ('down', 'Down')], default='operational')
#     region = models.CharField(max_length=100, blank=True, null=True)
#     capacity = models.IntegerField()

# class EmergencyStatusUpdate(models.Model):
#     id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
#     request = models.ForeignKey(EmergencyRequest, on_delete=models.CASCADE, related_name='status_updates')
#     status = models.CharField(max_length=20, choices=[('created', 'Created'), ('assigned', 'Assigned'), ('in_progress', 'In Progress'), ('completed', 'Completed'), ('cancelled', 'Cancelled')])
#     notes = models.TextField(blank=True, null=True)
#     updated_by = models.UUIDField()
#     updated_at = models.DateTimeField(auto_now=True)

# class VehicleLocationHistory(models.Model):
#     id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
#     vehicle = models.ForeignKey(Vehicle, on_delete=models.CASCADE, related_name='location_history')
#     latitude = models.DecimalField(max_digits=10, decimal_places=8)
#     longitude = models.DecimalField(max_digits=11, decimal_places=8)
#     timestamp = models.DateTimeField(auto_now_add=True)
#     speed = models.DecimalField(max_digits=5, decimal_places=2, blank=True, null=True)
#     heading = models.IntegerField(blank=True, null=True)
