import csv
from django.core.management.base import BaseCommand
from base.models import Hospital, HospitalLocation
# python manage.py import_hospitals_from_csv hospitals_assam.csv
class Command(BaseCommand):
    help = 'Import hospitals from CSV file and create/update Hospital and HospitalLocation objects'

    def add_arguments(self, parser):
        parser.add_argument('csv_file', type=str, help='Path to File')

    def handle(self, *args, **kwargs):
        csv_file_path = kwargs['csv_file']
        try:
            with open(csv_file_path, 'r', encoding='utf-8') as csvfile:
                reader = csv.DictReader(csvfile)
                # Verify expected headers
                expected_headers = {'Name', 'Address', 'Latitude', 'Longitude', 'Username', 'Email'}
                if not expected_headers.issubset(reader.fieldnames):
                    self.stderr.write("CSV file is missing required headers.")
                    return

                for row in reader:
                    name = row['Name']
                    address = row['Address']
                    try:
                        latitude = float(row['Latitude'])
                        longitude = float(row['Longitude'])
                    except ValueError:
                        self.stdout.write(f"Skipping {name}: Invalid latitude or longitude.")
                        continue
                    username = row['Username']
                    email = row['Email']

                    # Create or update the hospital based on username
                    hospital, created = Hospital.objects.update_or_create(
                        username=username,
                        defaults={
                            "email": email,
                            "name": name,
                            "address": address,
                            "user_type": "hospital",
                            "capacity": 100,
                            "emergency_capacity": 50,
                            "hospital_active": True,
                        }
                    )

                    # Set the default password
                    hospital.set_password('QweR@1234')
                    hospital.save()

                    # Update location: delete existing and create new
                    hospital.locations.all().delete()
                    HospitalLocation.objects.create(
                        hospital=hospital,
                        latitude=latitude,
                        longitude=longitude
                    )

                    # Provide feedback
                    if created:
                        self.stdout.write(f"Created hospital: {name}")
                    else:
                        self.stdout.write(f"Updated hospital: {name}")

            self.stdout.write(self.style.SUCCESS("Import completed successfully."))
        except FileNotFoundError:
            self.stderr.write(f"Error: CSV file '{csv_file_path}' not found.")
        except Exception as e:
            self.stderr.write(f"An error occurred: {str(e)}")