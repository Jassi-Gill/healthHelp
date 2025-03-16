from django.urls import path
from . import views

urlpatterns = [
    path("", views.getRoutes),
    path("users/", views.getUsers),
    # path("rooms/<str:pk>", views.getRoom),
]