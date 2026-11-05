import json
import token

from django.contrib.auth import get_user_model
from django.contrib.auth.tokens import default_token_generator
from django.core.mail import send_mail
from django.http import JsonResponse
from django.utils.encoding import force_bytes
from django.utils.http import urlsafe_base64_encode
from django.views.decorators.http import require_POST
from django.views.decorators.csrf import csrf_exempt
from django.contrib.auth.password_validation import validate_password
from django.core.exceptions import ValidationError
from django.utils.encoding import force_str
from django.utils.http import urlsafe_base64_decode

@csrf_exempt
@require_POST
def forgot_password(request):
    try:
        data = json.loads(request.body)
    except (json.JSONDecodeError, UnicodeDecodeError):
        return JsonResponse(
            {"error": "Invalid request."},
            status=400
        )

    if not isinstance(data, dict):
        return JsonResponse(
            {"error": "Invalid request."},
            status=400
        )

    email = data.get("email", "")

    if not isinstance(email, str):
        return JsonResponse(
            {"error": "Please enter a valid email address."},
            status=400
        )

    email = email.strip()

    if not email:
        return JsonResponse(
            {"error": "Please enter your email address."},
            status=400
        )

    User = get_user_model()

    users = User.objects.filter(
        email__iexact=email,
        is_active=True
    )

    for user in users:
        if not user.has_usable_password():
            continue

        uid = urlsafe_base64_encode(force_bytes(user.pk))
        token = default_token_generator.make_token(user)
        

        reset_link = (
            f"http://localhost:8443/reset-password"
            f"?uid={uid}&token={token}"
        )

        send_mail(
            "Reset your Inventory password",
            f"Use this link to reset your password:\n{reset_link}",
            None,
            [user.email],
        )

    return JsonResponse({
        "message": (
            "If an account exists with that email, "
            "a password reset link has been sent."
        )
    })

@csrf_exempt
@require_POST
def reset_password(request):
    try:
        data = json.loads(request.body)
    except (json.JSONDecodeError, UnicodeDecodeError):
        return JsonResponse(
            {"error": "Invalid request."},
            status=400
        )

    if not isinstance(data, dict):
        return JsonResponse(
            {"error": "Invalid request."},
            status=400
        )

    uid = data.get("uid")
    token = data.get("token")
    new_password = data.get("new_password")

    if not all(
        isinstance(value, str) and value
        for value in (uid, token, new_password)
    ):
        return JsonResponse(
            {"error": "Missing or invalid information."},
            status=400
        )

    try:
        user_id = force_str(urlsafe_base64_decode(uid))
        user = get_user_model().objects.get(pk=user_id)

    except (TypeError, ValueError, OverflowError, get_user_model().DoesNotExist):
        return JsonResponse(
            {"error": "Invalid or expired reset link."},
            status=400
        )

    
    if not user.is_active or not default_token_generator.check_token(user, token):
        return JsonResponse(
            {"error": "Invalid or expired reset link."},
            status=400
        )

    try:
        validate_password(new_password, user=user)
    except ValidationError as error:
        return JsonResponse(
            {"error": error.messages},
            status=400
        )

    user.set_password(new_password)
    user.save()

    return JsonResponse({
        "message": "Your password has been reset successfully."
    })