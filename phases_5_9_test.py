#!/usr/bin/env python3

import requests
import sys
import json
from datetime import datetime

class PinnacleAIPhasesTest:
    def __init__(self, base_url="https://aeo-staging-lab.preview.emergentagent.com"):
        self.base_url = base_url
        self.token = None
        self.tests_run = 0
        self.tests_passed = 0
        self.test_results = []

    def run_test(self, name, method, endpoint, expected_status, data=None, expected_response_keys=None):
        """Run a single API test"""
        url = f"{self.base_url}/{endpoint}"
        headers = {'Content-Type': 'application/json'}
        if self.token:
            headers['Authorization'] = f'Bearer {self.token}'

        self.tests_run += 1
        print(f"\n🔍 Testing {name}...")
        
        try:
            if method == 'GET':
                response = requests.get(url, headers=headers, timeout=15)
            elif method == 'POST':
                response = requests.post(url, json=data, headers=headers, timeout=15)

            print(f"   Status Code: {response.status_code}")
            
            try:
                response_json = response.json()
            except:
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
                self.test_results.append({"test": name, "status": "PASSED"})
            else:
                print(f"❌ {name} - FAILED - Expected {expected_status}, got {response.status_code}")
                self.test_results.append({"test": name, "status": "FAILED", "details": f"Expected {expected_status}, got {response.status_code}"})

            return success, response_json

        except Exception as e:
            print(f"❌ {name} - FAILED - Error: {str(e)}")
            self.test_results.append({"test": name, "status": "FAILED", "details": f"Error: {str(e)}"})
            return False, {}

    def login(self):
        """Login to get JWT token"""
        success, response = self.run_test(
            "Login",
            "POST", 
            "api/auth/login",
            200,
            data={"email": "test@example.com", "password": "test123"}
        )
        if success:
            self.token = response.get("access_token")
            return True
        return False

    def test_health_pinnacle_branding(self):
        """Test health endpoint returns Pinnacle.AI branding"""
        success, response = self.run_test(
            "Health - Pinnacle.AI Branding",
            "GET",
            "api/health", 
            200,
            expected_response_keys=["service", "version"]
        )
        if success:
            service = response.get("service", "")
            version = response.get("version", "")
            if service == "Pinnacle.AI" and version == "1.0.0":
                print(f"✅ Correct branding: {service} v{version}")
            else:
                print(f"⚠️ Expected Pinnacle.AI v1.0.0, got {service} v{version}")
        return success

    def test_advanced_audit(self):
        """Test POST /api/audit/advanced with explainability"""
        success, response = self.run_test(
            "Advanced Audit with Explainability", 
            "POST",
            "api/audit/advanced",
            200,
            data={"url": "https://example.com"},
            expected_response_keys=["explainability", "audit_integrity", "historical_intelligence"]
        )
        if success:
            # Check explainability structure
            explainability = response.get("explainability", {})
            required_categories = ["structure", "trust", "media", "schema", "technical"]
            for category in required_categories:
                if category in explainability:
                    cat_data = explainability[category]
                    required_fields = ["score", "contributing_factors", "penalties", "detected_signals", "evidence"]
                    for field in required_fields:
                        if field not in cat_data:
                            print(f"⚠️ Missing explainability.{category}.{field}")
                            return False
                else:
                    print(f"⚠️ Missing explainability category: {category}")
                    return False
            
            # Check audit integrity
            integrity = response.get("audit_integrity", {})
            if integrity.get("deterministic") == True:
                print("✅ Audit integrity shows deterministic=true")
            else:
                print("⚠️ Audit integrity deterministic should be true")
                
            print("✅ Advanced audit explainability structure is complete")
        return success

    def test_content_compiler(self):
        """Test POST /api/compile"""
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
            blocks = response.get("total_blocks", 0)
            print(f"✅ Compilation readiness: {readiness}%, Total blocks: {blocks}")
        return success

    def test_strategy_simulator_add_faq(self):
        """Test strategy simulator with addFAQ"""
        success, response = self.run_test(
            "Strategy Simulator - addFAQ",
            "POST",
            "api/simulate-strategy", 
            200,
            data={
                "url": "https://example.com",
                "query": "what is example.com",
                "strategy": "addFAQ"
            },
            expected_response_keys=["original_probability", "simulated_probability", "improvement_delta"]
        )
        if success:
            orig = response.get("original_probability", 0)
            sim = response.get("simulated_probability", 0)
            delta = response.get("improvement_delta", 0)
            if delta > 0:
                print(f"✅ addFAQ shows improvement: {orig}% -> {sim}% (+{delta})")
            else:
                print(f"⚠️ addFAQ shows no improvement: +{delta}")
        return success

    def test_strategy_simulator_invalid(self):
        """Test strategy simulator with invalid strategy"""
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
        """Test security headers are present"""
        print("\n🔍 Testing Security Headers...")
        try:
            response = requests.get(f"{self.base_url}/api/health", timeout=10)
            headers = response.headers
            
            expected_headers = [
                "X-Content-Type-Options", 
                "X-Frame-Options",
                "X-XSS-Protection",
                "Referrer-Policy",
                "Permissions-Policy"
            ]
            
            missing = []
            for header in expected_headers:
                if header not in headers:
                    missing.append(header)
            
            if not missing:
                print("✅ Security Headers - PASSED")
                self.tests_passed += 1
                self.test_results.append({"test": "Security Headers", "status": "PASSED"})
            else:
                print(f"❌ Security Headers - FAILED - Missing: {missing}")
                self.test_results.append({"test": "Security Headers", "status": "FAILED", "details": f"Missing: {missing}"})
            
            self.tests_run += 1
            return len(missing) == 0
        except Exception as e:
            print(f"❌ Security Headers - FAILED - {e}")
            self.test_results.append({"test": "Security Headers", "status": "FAILED", "details": str(e)})
            self.tests_run += 1
            return False

    def test_sensitivity_test(self):
        """Test enterprise sensitivity testing"""
        success, response = self.run_test(
            "Sensitivity Test - authorityFocused",
            "POST",
            "api/enterprise/sensitivity-test",
            200,
            data={
                "url": "https://example.com",
                "query": "what is example.com",
                "mode": "authorityFocused" 
            },
            expected_response_keys=["default_probability", "mode_probability", "weights_used"]
        )
        if success:
            default = response.get("default_probability", 0)
            mode = response.get("mode_probability", 0) 
            weights = response.get("weights_used", {})
            authority_weight = weights.get("authority", 0)
            print(f"✅ Sensitivity test: default {default}% vs authority-focused {mode}% (authority weight: {authority_weight})")
        return success

    def test_sensitivity_invalid_mode(self):
        """Test sensitivity test with invalid mode"""
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
        """Test competitor comparison"""
        success, response = self.run_test(
            "Competitor Comparison",
            "POST",
            "api/enterprise/compare",
            200,
            data={
                "query": "what is example.com",
                "primary_url": "https://example.com", 
                "competitor_urls": ["https://httpbin.org"]
            },
            expected_response_keys=["ranking_order", "score_comparison", "gap_analysis"]
        )
        if success:
            ranking = response.get("ranking_order", [])
            gaps = response.get("gap_analysis", [])
            print(f"✅ Compared URLs, ranking: {ranking}, gaps: {len(gaps)}")
        return success

    def test_executive_summary(self):
        """Test executive summary"""
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
            print(f"✅ Executive summary - Health status: {health.get('status', 'unknown')}, Weaknesses: {len(weaknesses)}")
        return success

    def run_phases_5_9_tests(self):
        """Run all Phase 5-9 tests"""
        print("🚀 Starting Pinnacle.AI Phases 5-9 Testing")
        print(f"📡 Testing against: {self.base_url}")
        print("=" * 60)

        # Login first
        if not self.login():
            print("❌ Failed to login, stopping tests")
            return False

        # Phase 5-9 Tests
        print("\n" + "=" * 40)
        print("🔬 Testing Pinnacle.AI - Phases 5-9")
        print("=" * 40)

        # Health with branding check
        self.test_health_pinnacle_branding()
        
        # Phase 5: Advanced Audit
        print("\n🧠 Phase 5: Advanced Audit")
        self.test_advanced_audit()
        
        # Phase 6: Content Compiler  
        print("\n📝 Phase 6: AI Content Compiler")
        self.test_content_compiler()
        
        # Phase 7: Strategy Simulator
        print("\n🎯 Phase 7: Strategy Simulator")
        self.test_strategy_simulator_add_faq()
        self.test_strategy_simulator_invalid()
        
        # Phase 8: Security
        print("\n🔒 Phase 8: Security Headers")
        self.test_security_headers()
        
        # Phase 9: Enterprise Features
        print("\n🏢 Phase 9: Enterprise Features")
        self.test_sensitivity_test()
        self.test_sensitivity_invalid_mode()
        self.test_competitor_comparison()
        self.test_executive_summary()

        # Results
        print("\n" + "=" * 60)
        print(f"📊 Phase 5-9 Results: {self.tests_passed}/{self.tests_run} tests passed")
        
        if self.tests_passed == self.tests_run:
            print("🎉 All Phase 5-9 tests PASSED!")
            return True
        else:
            failed = self.tests_run - self.tests_passed
            print(f"❌ {failed} tests FAILED")
            for result in self.test_results:
                if result["status"] == "FAILED":
                    print(f"  - {result['test']}: {result.get('details', 'Failed')}")
            return False

if __name__ == "__main__":
    tester = PinnacleAIPhasesTest()
    success = tester.run_phases_5_9_tests()
    sys.exit(0 if success else 1)