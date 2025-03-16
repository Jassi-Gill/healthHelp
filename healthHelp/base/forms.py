from django.forms import ModelForm

# from django.contrib.auth.models import User
from .models import User
from django.contrib.auth.forms import UserCreationForm


class MyUserCreationForm(UserCreationForm):
    class Meta:
        model = User
        fields = ["username", "email", "password1", "password2"]


class UserUpdateForm(ModelForm):
    class Meta:
        model = User
        fields = ["avatar", "name", "email", "username", "bio"]
