import time
import requests
import csv
from django.core.management.base import BaseCommand
from base.models import Hospital, HospitalLocation
from django.utils.text import slugify  # For generating unique usernames

class Command(BaseCommand):
    help = 'Fetch hospitals in Assam from Google Maps API and save to database'

    def handle(self, *args, **kwargs):
        api_key = None  # Replace with your actual Google Maps API key

        cities = [
            "Guwahati", "Dibrugarh", "Jorhat", "Silchar", "Tezpur",
            "Nagaon", "Tinsukia", "Karimganj", "Sivasagar", "Dhubri"
        ]

        for city in cities:
            query = f"hospitals in {city}, Assam"
            url = f"https://maps.googleapis.com/maps/api/place/textsearch/json?query={query}&key={api_key}"
            print(f"Fetching hospitals in {city}...")

            while True:
                response = requests.get(url).json()

                if response["status"] != "OK":
                    print(f"API request failed for {city}: {response.get('status', 'Unknown error')}")
                    break

                for place in response["results"]:
                    name = place["name"]
                    address = place["formatted_address"]
                    lat = place["geometry"]["location"]["lat"]
                    lng = place["geometry"]["location"]["lng"]

                    # Generate synthetic email and username
                    base_username = slugify(name)  # Convert name to a valid username (e.g., "Apollo Hospitals" -> "apollo-hospitals")
                    username = base_username
                    email = f"{base_username}@example.com"
                    counter = 1

                    # Ensure username and email are unique
                    while Hospital.objects.filter(username=username).exists():
                        username = f"{base_username}{counter}"
                        email = f"{username}@example.com"
                        counter += 1

                    hospital, created = Hospital.objects.get_or_create(
                        name=name,
                        address=address,
                        defaults={
                            "username": username,
                            "email": email,
                            "user_type": "hospital",  # Set user_type explicitly
                            "capacity": 100,
                            "emergency_capacity": 50,
                            "hospital_active": True,
                        }
                    )

                    if created:
                        HospitalLocation.objects.create(
                            hospital=hospital,
                            latitude=lat,
                            longitude=lng
                        )
                        print(f"Added {name} in {city}")
                    else:
                        print(f"Hospital {name} in {city} already exists")

                if "next_page_token" in response:
                    next_page_token = response["next_page_token"]
                    time.sleep(2)
                    url = f"https://maps.googleapis.com/maps/api/place/textsearch/json?pagetoken={next_page_token}&key={api_key}"
                else:
                    break

        self.generate_csv()

    def generate_csv(self):
        with open('hospitals_assam.csv', 'w', newline='', encoding='utf-8') as csvfile:
            writer = csv.writer(csvfile)
            writer.writerow(['Name', 'Address', 'Latitude', 'Longitude', 'Username', 'Email'])

            for hospital in Hospital.objects.all():
                location = hospital.locations.first()  # Assumes related_name='locations'
                if location:
                    writer.writerow([
                        hospital.name,
                        hospital.address,
                        location.latitude,
                        location.longitude,
                        hospital.username or "N/A",
                        hospital.email or "N/A"
                    ])

        print("CSV file generated: hospitals_assam.csv")