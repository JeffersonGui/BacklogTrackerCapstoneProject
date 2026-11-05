from django.urls import path
from .views import forgot_password, reset_password

urlpatterns = [
    path("forgot-password/", forgot_password, name="forgot_password"),
    path("reset-password/", reset_password, name="reset_password"),
]