
from django.contrib.auth import get_user_model
from django.test import TestCase
from django.contrib.auth.tokens import default_token_generator
from django.utils.encoding import force_bytes
from django.utils.http import urlsafe_base64_encode


class PasswordResetTests(TestCase):

    def setUp(self):
        self.user = get_user_model().objects.create_user(
            username="testplayer",
            email="testplayer@example.com",
            password="OriginalPass123!"
        )

    def test_forgot_password(self):
        response = self.client.post(
            "/api/accounts/forgot-password/",
            data={"email": "testplayer@example.com"},
            content_type="application/json"
        )

        self.assertEqual(response.status_code, 200)
        self.assertIn("message", response.json())

    def test_invalid_reset_link(self):
        response = self.client.post(
            "/api/accounts/reset-password/",
            data={
                "uid": "invalid",
                "token": "invalid",
                "new_password": "NewSecurePass456!"
            },
            content_type="application/json"
        )

        self.assertEqual(response.status_code, 400)


    def test_successful_password_reset(self):
        uid = urlsafe_base64_encode(force_bytes(self.user.pk))
        token = default_token_generator.make_token(self.user)

        response = self.client.post(
            "/api/accounts/reset-password/",
            data={
                "uid": uid,
                "token": token,
                "new_password": "NewSecurePass456!"
            },
            content_type="application/json"
        )

        self.assertEqual(response.status_code, 200)

        self.user.refresh_from_db()
        self.assertTrue(
            self.user.check_password("NewSecurePass456!")
        )
