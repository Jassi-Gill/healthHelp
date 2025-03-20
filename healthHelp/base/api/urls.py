from django.urls import path
from . import views

urlpatterns = [
    path("", views.getRoutes),
    path("users/", views.getUsers),
    path('signup', views.signup, name='signup'),
    path('login/', views.login, name='login'),
]