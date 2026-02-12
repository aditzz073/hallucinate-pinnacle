#!/usr/bin/env python3

import requests
import sys
import json
from datetime import datetime
import uuid

class AIDiscoverabilityAPITester:
    def __init__(self, base_url="https://bb660214-716d-4734-b334-8ca799b6c718.preview.emergentagent.com"):
        self.base_url = base_url
        self.token = None
        self.tests_run = 0
        self.tests_passed = 0
        self.test_results = []
        self.test_user_id = None

    def run_test(self, name, method, endpoint, expected_status, data=None, expected_response_keys=None):
        """Run a single API test"""
        url = f"{self.base_url}/{endpoint}"
        headers = {'Content-Type': 'application/json'}
        if self.token:
            headers['Authorization'] = f'Bearer {self.token}'

        self.tests_run += 1
        print(f"\n🔍 Testing {name}...")
        print(f"   URL: {url}")
        
        try:
            if method == 'GET':
                response = requests.get(url, headers=headers, timeout=10)
            elif method == 'POST':
                response = requests.post(url, json=data, headers=headers, timeout=10)
            elif method == 'PUT':
                response = requests.put(url, json=data, headers=headers, timeout=10)
            elif method == 'DELETE':
                response = requests.delete(url, headers=headers, timeout=10)

            print(f"   Status Code: {response.status_code}")
            
            try:
                response_json = response.json()
                print(f"   Response: {json.dumps(response_json, indent=2)}")
            except:
                print(f"   Raw Response: {response.text}")
                response_json = {}

            success = response.status_code == expected_status
            
            # Check expected response keys if provided
            if success and expected_response_keys and response_json:
                for key in expected_response_keys:
                    if key not in response_json:
                        success = False
                        print(f"   ❌ Missing expected key: {key}")
                        break

            if success:
                self.tests_passed += 1
                print(f"✅ {name} - PASSED")
                self.test_results.append({"test": name, "status": "PASSED", "details": f"Status: {response.status_code}"})
            else:
                print(f"❌ {name} - FAILED - Expected {expected_status}, got {response.status_code}")
                self.test_results.append({"test": name, "status": "FAILED", "details": f"Expected {expected_status}, got {response.status_code}"})

            return success, response_json

        except requests.exceptions.RequestException as e:
            print(f"❌ {name} - FAILED - Network Error: {str(e)}")
            self.test_results.append({"test": name, "status": "FAILED", "details": f"Network Error: {str(e)}"})
            return False, {}
        except Exception as e:
            print(f"❌ {name} - FAILED - Error: {str(e)}")
            self.test_results.append({"test": name, "status": "FAILED", "details": f"Error: {str(e)}"})
            return False, {}

    def test_health(self):
        """Test health endpoint - should return healthy status with db connected"""
        success, response = self.run_test(
            "Health Check",
            "GET",
            "api/health",
            200,
            expected_response_keys=["status", "database", "service", "version"]
        )
        
        if success and response.get("status") == "healthy" and response.get("database") == "connected":
            print("✅ Health endpoint shows system is healthy with DB connected")
            return True
        elif success:
            print(f"⚠️ Health endpoint returned success but status: {response.get('status')}, database: {response.get('database')}")
            return False
        return False

    def test_register_success(self):
        """Test successful user registration"""
        unique_email = f"test_{uuid.uuid4().hex[:8]}@example.com"
        success, response = self.run_test(
            "Register Success",
            "POST",
            "api/auth/register",
            200,
            data={"email": unique_email, "password": "test123456"},
            expected_response_keys=["access_token", "token_type", "user"]
        )
        
        if success and response.get("user", {}).get("email") == unique_email:
            print(f"✅ Registration successful for {unique_email}")
            return True, response
        return False, {}

    def test_register_duplicate_email(self):
        """Test registration with duplicate email returns 400"""
        # Use the existing test user
        success, response = self.run_test(
            "Register Duplicate Email",
            "POST",
            "api/auth/register",
            400,
            data={"email": "test@example.com", "password": "test123456"}
        )
        return success

    def test_register_short_password(self):
        """Test registration with short password returns 422"""
        unique_email = f"test_short_{uuid.uuid4().hex[:8]}@example.com"
        success, response = self.run_test(
            "Register Short Password",
            "POST",
            "api/auth/register",
            422,
            data={"email": unique_email, "password": "123"}
        )
        return success

    def test_login_success(self):
        """Test login with valid credentials"""
        success, response = self.run_test(
            "Login Success",
            "POST",
            "api/auth/login",
            200,
            data={"email": "test@example.com", "password": "test123"},
            expected_response_keys=["access_token", "token_type", "user"]
        )
        
        if success:
            self.token = response.get("access_token")
            self.test_user_id = response.get("user", {}).get("id")
            print(f"✅ Login successful, token stored")
            return True
        return False

    def test_login_wrong_password(self):
        """Test login with wrong password returns 401"""
        success, response = self.run_test(
            "Login Wrong Password",
            "POST",
            "api/auth/login",
            401,
            data={"email": "test@example.com", "password": "wrongpassword"}
        )
        return success

    def test_protected_route_with_token(self):
        """Test /api/auth/me with valid JWT returns user info"""
        if not self.token:
            print("❌ No token available for protected route test")
            return False
            
        success, response = self.run_test(
            "Protected Route with Token",
            "GET",
            "api/auth/me",
            200,
            expected_response_keys=["id", "email", "created_at"]
        )
        
        if success and response.get("email") == "test@example.com":
            print("✅ Protected route returned correct user info")
            return True
        return False

    def test_protected_route_without_token(self):
        """Test /api/auth/me without token returns 401/403"""
        # Temporarily remove token
        temp_token = self.token
        self.token = None
        
        success, response = self.run_test(
            "Protected Route without Token",
            "GET",
            "api/auth/me",
            403  # FastAPI HTTPBearer returns 403 for missing auth
        )
        
        # Restore token
        self.token = temp_token
        return success

    def run_all_tests(self):
        """Run all tests in order"""
        print("🚀 Starting AI Discoverability Copilot API Tests")
        print(f"📡 Testing against: {self.base_url}")
        print("=" * 60)

        # Test 1: Health check
        self.test_health()

        # Test 2: Registration with new user
        reg_success, reg_response = self.test_register_success()

        # Test 3: Registration with duplicate email
        self.test_register_duplicate_email()

        # Test 4: Registration with short password
        self.test_register_short_password()

        # Test 5: Login with valid credentials
        self.test_login_success()

        # Test 6: Login with wrong password
        self.test_login_wrong_password()

        # Test 7: Protected route with token
        self.test_protected_route_with_token()

        # Test 8: Protected route without token
        self.test_protected_route_without_token()

        # Print final results
        print("\n" + "=" * 60)
        print(f"📊 Test Results: {self.tests_passed}/{self.tests_run} tests passed")
        
        if self.tests_passed == self.tests_run:
            print("🎉 All tests PASSED!")
            return True
        else:
            print(f"❌ {self.tests_run - self.tests_passed} tests FAILED")
            print("\nFailed tests:")
            for result in self.test_results:
                if result["status"] == "FAILED":
                    print(f"  - {result['test']}: {result['details']}")
            return False

def main():
    tester = AIDiscoverabilityAPITester()
    success = tester.run_all_tests()
    return 0 if success else 1

if __name__ == "__main__":
    sys.exit(main())