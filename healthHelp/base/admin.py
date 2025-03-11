from django.contrib import admin
from .models import (
    User, EmergencyContact, MobileNumber, Patient, Driver, Vehicle, 
    DriverVehicleAssignment, Hospital, HospitalLocation, EmergencyRequest, 
    PatientTreatment, DispatchSystem, EmergencyStatusUpdate, VehicleLocationHistory
)

admin.site.register(User)
admin.site.register(EmergencyContact)
admin.site.register(MobileNumber)
admin.site.register(Patient)
admin.site.register(Driver)
admin.site.register(Vehicle)
admin.site.register(DriverVehicleAssignment)
admin.site.register(Hospital)
admin.site.register(HospitalLocation)
admin.site.register(EmergencyRequest)
admin.site.register(PatientTreatment)
admin.site.register(DispatchSystem)
admin.site.register(EmergencyStatusUpdate)
admin.site.register(VehicleLocationHistory)
