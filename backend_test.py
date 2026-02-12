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

        if not self.token:
            print("❌ No authentication token available for Phase 1-4 testing. Stopping here.")
            print("📊 Test Results: {self.tests_passed}/{self.tests_run} tests passed")
            return False

        print("\n" + "=" * 40)
        print("🔬 Testing AI Discoverability Copilot - Phases 1-4")
        print("=" * 40)

        # Phase 1: AEO Engine Tests
        print("\n📊 Phase 1: AEO Engine Testing")
        self.test_audit_valid_url()
        self.test_audit_determinism()
        self.test_list_audits()

        # Phase 2: AI Testing Engine Tests  
        print("\n🤖 Phase 2: AI Citation Testing")
        self.test_ai_test_valid()
        self.test_list_ai_tests()

        # Phase 3: Monitoring Tests
        print("\n👁️ Phase 3: Page Monitoring")
        monitor_id = self.test_add_monitor()
        if monitor_id:
            self.test_list_monitors()
            self.test_refresh_monitor(monitor_id)
            self.test_get_changes(monitor_id)
            self.test_delete_monitor(monitor_id)
        
        # Phase 4: Reports Tests
        print("\n📈 Phase 4: Reports & Analytics")
        self.test_reports_overview()
        self.test_reports_trends()
        self.test_reports_competitors()

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

    # Phase 1: AEO Engine Tests
    def test_audit_valid_url(self):
        """Test POST /api/audit with valid URL"""
        success, response = self.run_test(
            "Audit Valid URL",
            "POST", 
            "api/audit",
            200,
            data={"url": "https://example.com"},
            expected_response_keys=["id", "url", "overall_score", "breakdown", "signals", "recommendations"]
        )
        if success:
            self.test_audit_id = response.get("id")
            # Check score is between 0-100
            score = response.get("overall_score", -1)
            if 0 <= score <= 100:
                print(f"✅ Overall score {score} is in valid range")
            else:
                print(f"⚠️ Overall score {score} is outside valid range 0-100")
            
            # Check breakdown has expected keys
            breakdown = response.get("breakdown", {})
            expected_breakdown = ["structure", "trust", "media", "schema", "technical"]
            for key in expected_breakdown:
                if key not in breakdown:
                    print(f"⚠️ Missing breakdown key: {key}")
        return success

    def test_audit_determinism(self):
        """Test auditing same URL twice gives same scores"""
        # First audit
        success1, response1 = self.run_test(
            "Audit Determinism Test 1",
            "POST",
            "api/audit", 
            200,
            data={"url": "https://httpbin.org/html"}
        )
        
        if not success1:
            return False
            
        # Second audit of same URL
        success2, response2 = self.run_test(
            "Audit Determinism Test 2", 
            "POST",
            "api/audit",
            200,
            data={"url": "https://httpbin.org/html"}
        )
        
        if not success2:
            return False
            
        # Compare scores
        score1 = response1.get("overall_score")
        score2 = response2.get("overall_score")
        
        if score1 == score2:
            print(f"✅ Determinism check passed - both audits returned score {score1}")
            return True
        else:
            print(f"⚠️ Determinism check failed - scores differ: {score1} vs {score2}")
            return False

    def test_list_audits(self):
        """Test GET /api/audit returns list of audits"""
        success, response = self.run_test(
            "List User Audits",
            "GET",
            "api/audit", 
            200,
            expected_response_keys=["audits"]
        )
        if success:
            audits = response.get("audits", [])
            print(f"✅ Found {len(audits)} audits for user")
        return success

    # Phase 2: AI Testing Engine Tests
    def test_ai_test_valid(self):
        """Test POST /api/ai-test with valid URL and query"""
        success, response = self.run_test(
            "AI Test Valid Query",
            "POST",
            "api/ai-test",
            200, 
            data={"url": "https://example.com", "query": "what is example.com"},
            expected_response_keys=["id", "url", "query", "citation_probability", "breakdown", "likely_position"]
        )
        if success:
            self.test_ai_test_id = response.get("id")
            # Check citation probability is between 0-100
            prob = response.get("citation_probability", -1)
            if 0 <= prob <= 100:
                print(f"✅ Citation probability {prob}% is in valid range")
            else:
                print(f"⚠️ Citation probability {prob}% is outside valid range 0-100")
        return success

    def test_list_ai_tests(self):
        """Test GET /api/ai-test returns list of tests"""
        success, response = self.run_test(
            "List User AI Tests",
            "GET", 
            "api/ai-test",
            200,
            expected_response_keys=["tests"]
        )
        if success:
            tests = response.get("tests", [])
            print(f"✅ Found {len(tests)} AI tests for user")
        return success

    # Phase 3: Monitoring Tests
    def test_add_monitor(self):
        """Test POST /api/monitor adds a monitored page"""
        success, response = self.run_test(
            "Add Monitored Page",
            "POST",
            "api/monitor",
            200,
            data={"url": "https://httpbin.org/html"},
            expected_response_keys=["id", "url", "created_at", "initial_snapshot"]
        )
        if success:
            monitor_id = response.get("id")
            print(f"✅ Created monitored page with ID: {monitor_id}")
            return monitor_id
        return None

    def test_add_monitor_duplicate(self):
        """Test POST /api/monitor with duplicate URL returns 400"""
        success, response = self.run_test(
            "Add Duplicate Monitor",
            "POST", 
            "api/monitor",
            400,
            data={"url": "https://httpbin.org/html"}
        )
        return success

    def test_list_monitors(self):
        """Test GET /api/monitor returns monitored pages"""
        success, response = self.run_test(
            "List Monitored Pages",
            "GET",
            "api/monitor",
            200,
            expected_response_keys=["pages"]
        )
        if success:
            pages = response.get("pages", [])
            print(f"✅ Found {len(pages)} monitored pages")
        return success

    def test_refresh_monitor(self, monitor_id):
        """Test POST /api/monitor/{id}/refresh takes new snapshot"""
        success, response = self.run_test(
            "Refresh Monitor Snapshot",
            "POST",
            f"api/monitor/{monitor_id}/refresh",
            200,
            expected_response_keys=["snapshot", "changes", "changes_count"]
        )
        if success:
            changes_count = response.get("changes_count", 0)
            print(f"✅ Refresh detected {changes_count} changes")
        return success

    def test_get_changes(self, monitor_id):
        """Test GET /api/monitor/{id}/changes returns change log"""
        success, response = self.run_test(
            "Get Page Changes",
            "GET",
            f"api/monitor/{monitor_id}/changes",
            200,
            expected_response_keys=["changes"]
        )
        if success:
            changes = response.get("changes", [])
            print(f"✅ Found {len(changes)} logged changes")
        return success

    def test_delete_monitor(self, monitor_id):
        """Test DELETE /api/monitor/{id} removes monitored page"""
        success, response = self.run_test(
            "Delete Monitored Page",
            "DELETE",
            f"api/monitor/{monitor_id}",
            200
        )
        return success

    # Phase 4: Reports Tests
    def test_reports_overview(self):
        """Test GET /api/reports/overview returns dashboard stats"""
        success, response = self.run_test(
            "Reports Overview",
            "GET",
            "api/reports/overview",
            200,
            expected_response_keys=["summary", "recent_audits", "recent_ai_tests"]
        )
        if success:
            summary = response.get("summary", {})
            expected_summary_keys = ["total_audits", "total_ai_tests", "total_monitored_pages", 
                                   "total_changes_detected", "average_aeo_score", "average_citation_probability"]
            for key in expected_summary_keys:
                if key not in summary:
                    print(f"⚠️ Missing summary key: {key}")
        return success

    def test_reports_trends(self):
        """Test GET /api/reports/trends returns trend data"""
        success, response = self.run_test(
            "Reports Trends",
            "GET", 
            "api/reports/trends",
            200,
            expected_response_keys=["audit_trends", "test_trends", "weekly_averages", "breakdown_averages", "deltas"]
        )
        if success:
            audit_trends = response.get("audit_trends", [])
            test_trends = response.get("test_trends", [])
            print(f"✅ Found {len(audit_trends)} audit trends, {len(test_trends)} test trends")
        return success

    def test_reports_competitors(self):
        """Test GET /api/reports/competitors returns URL comparison"""
        success, response = self.run_test(
            "Reports Competitors",
            "GET",
            "api/reports/competitors", 
            200,
            expected_response_keys=["comparison", "total_urls"]
        )
        if success:
            comparison = response.get("comparison", [])
            total_urls = response.get("total_urls", 0)
            print(f"✅ Found comparison data for {total_urls} URLs")
        return success

def main():
    tester = AIDiscoverabilityAPITester()
    success = tester.run_all_tests()
    return 0 if success else 1

if __name__ == "__main__":
    sys.exit(main())