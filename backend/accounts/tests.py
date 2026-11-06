"""
Automated checks for the accounts API. Run them with:

    python manage.py test

Each test uses a fresh, temporary database, so your real accounts are never touched.
"""
import json

from django.contrib.auth import get_user_model
from django.test import Client, TestCase

User = get_user_model()


class AccountApiTests(TestCase):
    def setUp(self):
        # enforce_csrf_checks=True makes the test behave like a real browser.
        self.client = Client(enforce_csrf_checks=True)
        self.client.get("/api/csrf/")
        # self.token = self.client.cookies["csrftoken"].value
        # The above line is commented out because it was causing an error. 

    def post(self, url, data):
        return self.client.post(
            url, 
            json.dumps(data), 
            content_type="application/json", 
            HTTP_X_CSRFTOKEN=self.client.cookies["csrftoken"].value,
            # HTTP_X_CSRFTOKEN=self.token
            # The above line is commented out because it was causing an error, was advised by Claude to use the non-comment line above instead.
        )



    def signup(self, email="sam@example.com", password="Backlog-Hero-42", username="sam"):
        return self.post("/api/signup/", {"email": email, "password": password, "username": username})

    def test_signup_creates_account_and_signs_in(self):
        response = self.signup()
        self.assertEqual(response.status_code, 201)
        self.assertEqual(response.json()["user"]["username"], "sam")
        user = User.objects.get(email="sam@example.com")
        self.assertNotEqual(user.password, "Backlog-Hero-42")  # stored hashed
        self.assertTrue(user.check_password("Backlog-Hero-42"))
        self.assertEqual(self.client.get("/api/me/").json()["user"]["email"], "sam@example.com")

    def test_duplicate_email_rejected(self):
        self.signup()
        response = self.signup(email="SAM@example.com", username="other")
        self.assertEqual(response.status_code, 400)
        self.assertEqual(User.objects.count(), 1)

    def test_weak_password_rejected(self):
        response = self.signup(password="123")
        self.assertEqual(response.status_code, 400)
        self.assertEqual(User.objects.count(), 0)

    def test_login_logout(self):
        self.signup()
        self.post("/api/logout/", {})
        self.assertIsNone(self.client.get("/api/me/").json()["user"])

        response = self.post("/api/login/", {"email": "sam@example.com", "password": "Backlog-Hero-42"})
        self.assertEqual(response.status_code, 200)
        self.assertEqual(self.client.get("/api/me/").json()["user"]["username"], "sam")

    def test_wrong_password_rejected(self):
        self.signup()
        self.post("/api/logout/", {})
        response = self.post("/api/login/", {"email": "sam@example.com", "password": "wrong-password"})
        self.assertEqual(response.status_code, 401)
        self.assertIsNone(self.client.get("/api/me/").json()["user"])

    def test_post_without_csrf_token_rejected(self):
        response = self.client.post(
            "/api/login/", json.dumps({"email": "a@b.com", "password": "x"}), content_type="application/json"
        )
        self.assertEqual(response.status_code, 403)
