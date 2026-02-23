#!/usr/bin/env python3

import requests
import sys
import json
from datetime import datetime
import uuid

class AIDiscoverabilityAPITester:
    def __init__(self, base_url="https://query-ready.preview.emergentagent.com"):
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
        
        if success:
            service_name = response.get("service", "")
            version = response.get("version", "")
            
            # Check for Pinnacle.AI branding
            if service_name == "Pinnacle.AI" and version == "1.0.0":
                print("✅ Health endpoint shows correct Pinnacle.AI branding and version")
            else:
                print(f"⚠️ Expected service='Pinnacle.AI' version='1.0.0', got service='{service_name}' version='{version}'")
            
            if response.get("status") == "healthy" and response.get("database") == "connected":
                print("✅ Health endpoint shows system is healthy with DB connected")
                return True
            else:
                print(f"⚠️ Health endpoint - status: {response.get('status')}, database: {response.get('database')}")
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

        # Phase 5-9: New Pinnacle.AI Features Testing
        print("\n" + "=" * 40)
        print("🔬 Testing Pinnacle.AI - Phases 5-9") 
        print("=" * 40)

        # Phase 5: Advanced Audit Tests
        print("\n🧠 Phase 5: Advanced Audit with Explainability")
        self.test_advanced_audit_valid_url()
        
        # Phase 6: AI Content Compiler Tests
        print("\n📝 Phase 6: AI Content Compiler") 
        self.test_ai_content_compiler()
        
        # Phase 7: Strategy Simulator Tests
        print("\n🎯 Phase 7: Strategy Simulator")
        self.test_strategy_simulator_add_faq()
        self.test_strategy_simulator_add_schema()
        self.test_strategy_simulator_invalid()
        
        # Phase 8: Security Tests 
        print("\n🔒 Phase 8: Security & Rate Limiting")
        self.test_security_headers()
        
        # Phase 9: Enterprise Features Tests
        print("\n🏢 Phase 9: Enterprise Features")
        self.test_sensitivity_test_authority()
        self.test_sensitivity_test_invalid()
        self.test_competitor_comparison()
        self.test_executive_summary()

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

    # Phase 5-9: Pinnacle.AI Features Tests
    def test_advanced_audit_valid_url(self):
        """Test POST /api/audit/advanced with explainability"""
        success, response = self.run_test(
            "Advanced Audit with Explainability",
            "POST",
            "api/audit/advanced",
            200,
            data={"url": "https://example.com"},
            expected_response_keys=["id", "url", "overall_score", "breakdown", "explainability", "audit_integrity", "historical_intelligence"]
        )
        if success:
            # Check explainability structure
            explainability = response.get("explainability", {})
            expected_explainability = ["structure", "trust", "media", "schema", "technical"]
            for key in expected_explainability:
                if key not in explainability:
                    print(f"⚠️ Missing explainability key: {key}")
                    continue
                category = explainability[key]
                expected_cat_keys = ["score", "contributing_factors", "penalties", "detected_signals", "evidence"]
                for cat_key in expected_cat_keys:
                    if cat_key not in category:
                        print(f"⚠️ Missing explainability.{key}.{cat_key}")
            
            # Check audit integrity 
            integrity = response.get("audit_integrity", {})
            expected_integrity = ["deterministic", "scoring_version", "total_signals_evaluated"]
            for key in expected_integrity:
                if key not in integrity:
                    print(f"⚠️ Missing audit_integrity key: {key}")
            
            if integrity.get("deterministic") == True:
                print("✅ Audit integrity shows deterministic=true")
            
            print(f"✅ Advanced audit completed with {integrity.get('total_signals_evaluated', 0)} signals evaluated")
        return success

    def test_ai_content_compiler(self):
        """Test POST /api/compile returns compilation analysis"""
        success, response = self.run_test(
            "AI Content Compiler",
            "POST",
            "api/compile", 
            200,
            data={"url": "https://example.com"},
            expected_response_keys=["compilation_readiness", "semantic_breakdown", "total_blocks"]
        )
        if success:
            readiness = response.get("compilation_readiness", -1)
            if 0 <= readiness <= 100:
                print(f"✅ Compilation readiness score {readiness}% is in valid range")
            else:
                print(f"⚠️ Compilation readiness {readiness}% outside valid range 0-100")
            
            total_blocks = response.get("total_blocks", 0)
            print(f"✅ Found {total_blocks} content blocks for compilation")
        return success

    def test_strategy_simulator_add_faq(self):
        """Test POST /api/simulate-strategy with addFAQ strategy"""
        success, response = self.run_test(
            "Strategy Simulator - Add FAQ",
            "POST",
            "api/simulate-strategy",
            200,
            data={
                "url": "https://example.com", 
                "query": "what is example.com",
                "strategy": "addFAQ"
            },
            expected_response_keys=["original_probability", "simulated_probability", "improvement_delta", "adjustments_applied"]
        )
        if success:
            delta = response.get("improvement_delta", 0)
            orig = response.get("original_probability", 0)
            sim = response.get("simulated_probability", 0)
            
            if delta > 0:
                print(f"✅ addFAQ strategy shows positive improvement: +{delta} points ({orig}% -> {sim}%)")
            else:
                print(f"⚠️ addFAQ strategy shows no improvement: {delta} points")
                
            adjustments = response.get("adjustments_applied", [])
            print(f"✅ Applied {len(adjustments)} strategy adjustments")
        return success

    def test_strategy_simulator_add_schema(self):
        """Test POST /api/simulate-strategy with addSchema strategy"""
        success, response = self.run_test(
            "Strategy Simulator - Add Schema",
            "POST", 
            "api/simulate-strategy",
            200,
            data={
                "url": "https://example.com",
                "query": "what is example.com", 
                "strategy": "addSchema"
            },
            expected_response_keys=["original_probability", "simulated_probability", "improvement_delta"]
        )
        if success:
            delta = response.get("improvement_delta", 0)
            print(f"✅ addSchema strategy delta: {delta} points")
        return success

    def test_strategy_simulator_invalid(self):
        """Test POST /api/simulate-strategy with invalid strategy returns 400"""
        success, response = self.run_test(
            "Strategy Simulator - Invalid Strategy",
            "POST",
            "api/simulate-strategy", 
            400,
            data={
                "url": "https://example.com",
                "query": "test query",
                "strategy": "invalidStrategy" 
            }
        )
        return success

    def test_security_headers(self):
        """Test that security headers are present in responses"""
        # Make a request and check headers
        url = f"{self.base_url}/api/health"
        try:
            response = requests.get(url, timeout=10)
            headers = response.headers
            
            expected_headers = [
                "X-Content-Type-Options",
                "X-Frame-Options", 
                "X-XSS-Protection",
                "Referrer-Policy",
                "Permissions-Policy"
            ]
            
            missing_headers = []
            for header in expected_headers:
                if header not in headers:
                    missing_headers.append(header)
            
            if not missing_headers:
                print("✅ All required security headers present")
                self.tests_passed += 1
                self.test_results.append({"test": "Security Headers", "status": "PASSED", "details": "All headers present"})
                self.tests_run += 1
                return True
            else:
                print(f"⚠️ Missing security headers: {missing_headers}")
                self.test_results.append({"test": "Security Headers", "status": "FAILED", "details": f"Missing: {missing_headers}"})
                self.tests_run += 1
                return False
                
        except Exception as e:
            print(f"❌ Security headers test failed: {e}")
            self.test_results.append({"test": "Security Headers", "status": "FAILED", "details": str(e)})
            self.tests_run += 1
            return False

    def test_sensitivity_test_authority(self):
        """Test POST /api/enterprise/sensitivity-test with authorityFocused mode"""
        success, response = self.run_test(
            "Sensitivity Test - Authority Focused",
            "POST",
            "api/enterprise/sensitivity-test",
            200,
            data={
                "url": "https://example.com",
                "query": "what is example.com", 
                "mode": "authorityFocused"
            },
            expected_response_keys=["default_probability", "mode_probability", "weights_used", "mode"]
        )
        if success:
            default_prob = response.get("default_probability", 0)
            mode_prob = response.get("mode_probability", 0) 
            weights = response.get("weights_used", {})
            
            # Check that authority weight is higher (should be 0.40 for authorityFocused)
            authority_weight = weights.get("authority", 0)
            if authority_weight >= 0.35:  # Allow some flexibility
                print(f"✅ Authority-focused mode has high authority weight: {authority_weight}")
            else:
                print(f"⚠️ Authority weight {authority_weight} seems low for authorityFocused mode")
                
            print(f"✅ Sensitivity test: default {default_prob}% vs authority-focused {mode_prob}%")
        return success

    def test_sensitivity_test_invalid(self):
        """Test POST /api/enterprise/sensitivity-test with invalid mode returns 400"""
        success, response = self.run_test(
            "Sensitivity Test - Invalid Mode",
            "POST",
            "api/enterprise/sensitivity-test",
            400,
            data={
                "url": "https://example.com", 
                "query": "test query",
                "mode": "invalidMode"
            }
        )
        return success

    def test_competitor_comparison(self):
        """Test POST /api/enterprise/compare with primary and competitor URLs"""
        success, response = self.run_test(
            "Competitor Comparison",
            "POST",
            "api/enterprise/compare", 
            200,
            data={
                "query": "what is example.com",
                "primary_url": "https://example.com",
                "competitor_urls": ["https://httpbin.org", "https://google.com"]
            },
            expected_response_keys=["ranking_order", "score_comparison", "gap_analysis", "total_compared"]
        )
        if success:
            ranking_order = response.get("ranking_order", [])
            gap_analysis = response.get("gap_analysis", [])
            total_compared = response.get("total_compared", 0)
            
            print(f"✅ Compared {total_compared} URLs with {len(gap_analysis)} gap analyses")
            print(f"✅ Ranking order: {ranking_order[:2]}...")  # Show first 2 URLs
        return success

    def test_executive_summary(self):
        """Test GET /api/enterprise/executive-summary returns health data""" 
        success, response = self.run_test(
            "Executive Summary",
            "GET",
            "api/enterprise/executive-summary",
            200, 
            expected_response_keys=["overall_health", "key_weaknesses", "highest_impact_improvement", "competitive_standing"]
        )
        if success:
            health = response.get("overall_health", {})
            weaknesses = response.get("key_weaknesses", [])
            impact = response.get("highest_impact_improvement", {})
            
            health_status = health.get("status", "unknown")
            health_score = health.get("score", 0)
            print(f"✅ Executive summary - Health: {health_status} ({health_score}), Weaknesses: {len(weaknesses)}")
        return success

def main():
    tester = AIDiscoverabilityAPITester()
    success = tester.run_all_tests()
    return 0 if success else 1

if __name__ == "__main__":
    sys.exit(main())