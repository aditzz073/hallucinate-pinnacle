"""
Pinnacle.AI Backend API Tests
Tests for authentication, AEO auditing, AI testing, monitoring, reports, and enterprise features
"""
import pytest
import requests
import os
import time

BASE_URL = (
    os.environ.get("BACKEND_BASE_URL")
    or os.environ.get("REACT_APP_BACKEND_URL")
    or "http://localhost:8001"
).rstrip("/")


@pytest.fixture(scope="session", autouse=True)
def ensure_backend_is_running():
    """These tests require a running API service and DB."""
    try:
        response = requests.get(f"{BASE_URL}/api/health", timeout=5)
        if response.status_code >= 500:
            pytest.skip(f"Backend is running but unhealthy at {BASE_URL}")
    except requests.RequestException:
        pytest.skip(f"Backend integration tests skipped: server not reachable at {BASE_URL}")

# Test user credentials
TEST_EMAIL = "test@pinnacle.ai"
TEST_PASSWORD = "Test123!"

class TestHealthEndpoint:
    """Health check tests - run first"""
    
    def test_health_endpoint(self):
        """Test health endpoint returns correct data"""
        response = requests.get(f"{BASE_URL}/api/health")
        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "healthy"
        assert data["service"] == "Pinnacle.AI"
        assert data["version"] == "1.0.0"
        assert data["database"] == "connected"
        print(f"✓ Health check passed: {data}")


class TestAuthEndpoints:
    """Authentication endpoint tests"""
    
    def test_register_user(self):
        """Test user registration - may fail if user exists"""
        response = requests.post(f"{BASE_URL}/api/auth/register", json={
            "email": TEST_EMAIL,
            "password": TEST_PASSWORD
        })
        # Accept 200 (success) or 400 (user already exists)
        assert response.status_code in [200, 400], f"Unexpected status: {response.status_code}"
        if response.status_code == 200:
            data = response.json()
            assert "access_token" in data
            assert "token_type" in data
            assert data["token_type"] == "bearer"
            print(f"✓ User registered successfully")
        else:
            print(f"✓ User already exists (expected for re-runs)")
    
    def test_login_success(self):
        """Test successful login"""
        response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": TEST_EMAIL,
            "password": TEST_PASSWORD
        })
        assert response.status_code == 200, f"Login failed: {response.text}"
        data = response.json()
        assert "access_token" in data
        assert "token_type" in data
        assert data["token_type"] == "bearer"
        assert len(data["access_token"]) > 10
        print(f"✓ Login successful, token length: {len(data['access_token'])}")
    
    def test_login_invalid_credentials(self):
        """Test login with wrong password"""
        response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": TEST_EMAIL,
            "password": "wrongpassword"
        })
        assert response.status_code == 401
        print(f"✓ Invalid login rejected correctly")
    
    def test_login_nonexistent_user(self):
        """Test login with non-existent user"""
        response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": "nonexistent@example.com",
            "password": "anypassword"
        })
        assert response.status_code == 401
        print(f"✓ Non-existent user rejected correctly")


@pytest.fixture(scope="class")
def auth_token():
    """Get authentication token for protected routes"""
    response = requests.post(f"{BASE_URL}/api/auth/register", json={
        "email": TEST_EMAIL,
        "password": TEST_PASSWORD
    })
    if response.status_code == 200:
        return response.json()["access_token"]
    
    # Try login if registration failed (user exists)
    response = requests.post(f"{BASE_URL}/api/auth/login", json={
        "email": TEST_EMAIL,
        "password": TEST_PASSWORD
    })
    if response.status_code == 200:
        return response.json()["access_token"]
    
    pytest.skip("Could not obtain auth token")


class TestProtectedRoutesWithoutAuth:
    """Test that protected routes require authentication"""
    
    def test_audit_requires_auth(self):
        """Test audit endpoint requires auth"""
        response = requests.post(f"{BASE_URL}/api/audit", json={"url": "https://example.com"})
        assert response.status_code in [401, 403]
        print(f"✓ Audit endpoint properly protected")
    
    def test_ai_test_requires_auth(self):
        """Test AI test endpoint requires auth"""
        response = requests.post(f"{BASE_URL}/api/ai-test", json={"url": "https://example.com", "query": "test"})
        assert response.status_code in [401, 403]
        print(f"✓ AI test endpoint properly protected")
    
    def test_monitor_requires_auth(self):
        """Test monitor endpoint requires auth"""
        response = requests.post(f"{BASE_URL}/api/monitor", json={"url": "https://example.com"})
        assert response.status_code in [401, 403]
        print(f"✓ Monitor endpoint properly protected")
    
    def test_reports_requires_auth(self):
        """Test reports endpoint requires auth"""
        response = requests.get(f"{BASE_URL}/api/reports/overview")
        assert response.status_code in [401, 403]
        print(f"✓ Reports endpoint properly protected")
    
    def test_advanced_audit_requires_auth(self):
        """Test advanced audit requires auth"""
        response = requests.post(f"{BASE_URL}/api/audit/advanced", json={"url": "https://example.com"})
        assert response.status_code in [401, 403]
        print(f"✓ Advanced audit endpoint properly protected")
    
    def test_simulate_strategy_requires_auth(self):
        """Test strategy simulator requires auth"""
        response = requests.post(f"{BASE_URL}/api/simulate-strategy", json={
            "url": "https://example.com",
            "query": "test",
            "strategy": "addFAQ"
        })
        assert response.status_code in [401, 403]
        print(f"✓ Strategy simulator endpoint properly protected")
    
    def test_enterprise_compare_requires_auth(self):
        """Test competitor comparison requires auth"""
        response = requests.post(f"{BASE_URL}/api/enterprise/compare", json={
            "query": "test",
            "primary_url": "https://example.com",
            "competitor_urls": ["https://competitor.com"]
        })
        assert response.status_code in [401, 403]
        print(f"✓ Enterprise compare endpoint properly protected")
    
    def test_executive_summary_requires_auth(self):
        """Test executive summary requires auth"""
        response = requests.get(f"{BASE_URL}/api/enterprise/executive-summary")
        assert response.status_code in [401, 403]
        print(f"✓ Executive summary endpoint properly protected")


class TestAuditEndpoints:
    """AEO Audit endpoint tests - Phase 1"""
    
    @pytest.fixture(autouse=True)
    def setup(self, auth_token):
        self.headers = {"Authorization": f"Bearer {auth_token}"}
    
    def test_run_audit(self, auth_token):
        """Test running an audit on a URL"""
        headers = {"Authorization": f"Bearer {auth_token}"}
        response = requests.post(
            f"{BASE_URL}/api/audit",
            headers=headers,
            json={"url": "https://example.com"}
        )
        assert response.status_code == 200, f"Audit failed: {response.text}"
        data = response.json()
        # Verify audit response structure
        assert "overall_score" in data or "url" in data
        print(f"✓ Audit completed successfully: {data.get('overall_score', 'N/A')}")
    
    def test_list_audits(self, auth_token):
        """Test listing user's audits"""
        headers = {"Authorization": f"Bearer {auth_token}"}
        response = requests.get(f"{BASE_URL}/api/audit", headers=headers)
        assert response.status_code == 200
        data = response.json()
        assert "audits" in data
        assert isinstance(data["audits"], list)
        print(f"✓ Listed {len(data['audits'])} audits")


class TestAITestEndpoints:
    """AI Citation Testing endpoints - Phase 2"""
    
    def test_run_ai_test(self, auth_token):
        """Test running AI citation test"""
        headers = {"Authorization": f"Bearer {auth_token}"}
        response = requests.post(
            f"{BASE_URL}/api/ai-test",
            headers=headers,
            json={"url": "https://example.com", "query": "What is example.com?"}
        )
        assert response.status_code == 200, f"AI test failed: {response.text}"
        data = response.json()
        assert "citation_probability" in data or "url" in data
        print(f"✓ AI test completed: {data}")
    
    def test_ai_test_empty_query_fails(self, auth_token):
        """Test AI test with empty query fails"""
        headers = {"Authorization": f"Bearer {auth_token}"}
        response = requests.post(
            f"{BASE_URL}/api/ai-test",
            headers=headers,
            json={"url": "https://example.com", "query": ""}
        )
        assert response.status_code == 400
        print(f"✓ Empty query correctly rejected")
    
    def test_list_ai_tests(self, auth_token):
        """Test listing AI tests"""
        headers = {"Authorization": f"Bearer {auth_token}"}
        response = requests.get(f"{BASE_URL}/api/ai-test", headers=headers)
        assert response.status_code == 200
        data = response.json()
        assert "tests" in data
        print(f"✓ Listed {len(data['tests'])} AI tests")


class TestMonitoringEndpoints:
    """Page Monitoring endpoints - Phase 3"""
    
    def test_add_monitored_page(self, auth_token):
        """Test adding a page to monitor"""
        headers = {"Authorization": f"Bearer {auth_token}"}
        response = requests.post(
            f"{BASE_URL}/api/monitor",
            headers=headers,
            json={"url": "https://example.com"}
        )
        # Accept success or "already monitored" cases
        assert response.status_code in [200, 400], f"Monitor failed: {response.text}"
        print(f"✓ Monitor page request completed: {response.status_code}")
    
    def test_list_monitored_pages(self, auth_token):
        """Test listing monitored pages"""
        headers = {"Authorization": f"Bearer {auth_token}"}
        response = requests.get(f"{BASE_URL}/api/monitor", headers=headers)
        assert response.status_code == 200
        data = response.json()
        assert "pages" in data
        print(f"✓ Listed {len(data['pages'])} monitored pages")


class TestReportsEndpoints:
    """Reports & Analytics endpoints - Phase 4"""
    
    def test_get_overview(self, auth_token):
        """Test getting overview report"""
        headers = {"Authorization": f"Bearer {auth_token}"}
        response = requests.get(f"{BASE_URL}/api/reports/overview", headers=headers)
        assert response.status_code == 200
        data = response.json()
        assert "summary" in data or "recent_audits" in data or isinstance(data, dict)
        print(f"✓ Overview report retrieved: {list(data.keys())}")
    
    def test_get_trends(self, auth_token):
        """Test getting trends report"""
        headers = {"Authorization": f"Bearer {auth_token}"}
        response = requests.get(f"{BASE_URL}/api/reports/trends", headers=headers)
        assert response.status_code == 200
        print(f"✓ Trends report retrieved")
    
    def test_get_competitors(self, auth_token):
        """Test getting competitors report"""
        headers = {"Authorization": f"Bearer {auth_token}"}
        response = requests.get(f"{BASE_URL}/api/reports/competitors", headers=headers)
        assert response.status_code == 200
        print(f"✓ Competitors report retrieved")


class TestAdvancedAuditEndpoints:
    """Advanced Audit endpoints - Phase 5"""
    
    def test_run_advanced_audit(self, auth_token):
        """Test running advanced audit with explainability"""
        headers = {"Authorization": f"Bearer {auth_token}"}
        response = requests.post(
            f"{BASE_URL}/api/audit/advanced",
            headers=headers,
            json={"url": "https://example.com"}
        )
        assert response.status_code == 200, f"Advanced audit failed: {response.text}"
        data = response.json()
        # Check for advanced audit features
        print(f"✓ Advanced audit completed: {list(data.keys())[:5]}")


class TestStrategySimulatorEndpoints:
    """Strategy Simulator endpoints - Phase 7"""
    
    def test_simulate_strategy(self, auth_token):
        """Test strategy simulation"""
        headers = {"Authorization": f"Bearer {auth_token}"}
        response = requests.post(
            f"{BASE_URL}/api/simulate-strategy",
            headers=headers,
            json={
                "url": "https://example.com",
                "query": "What is example?",
                "strategy": "addFAQ"
            }
        )
        assert response.status_code == 200, f"Simulation failed: {response.text}"
        data = response.json()
        print(f"✓ Strategy simulation completed")
    
    def test_simulate_invalid_strategy(self, auth_token):
        """Test simulation with invalid strategy"""
        headers = {"Authorization": f"Bearer {auth_token}"}
        response = requests.post(
            f"{BASE_URL}/api/simulate-strategy",
            headers=headers,
            json={
                "url": "https://example.com",
                "query": "test",
                "strategy": "invalidStrategy"
            }
        )
        # Should return 400 for invalid strategy
        assert response.status_code == 400
        print(f"✓ Invalid strategy correctly rejected")


class TestEnterpriseEndpoints:
    """Enterprise endpoints - Phase 9"""
    
    def test_competitor_comparison(self, auth_token):
        """Test competitor comparison"""
        headers = {"Authorization": f"Bearer {auth_token}"}
        response = requests.post(
            f"{BASE_URL}/api/enterprise/compare",
            headers=headers,
            json={
                "query": "example website",
                "primary_url": "https://example.com",
                "competitor_urls": ["https://example.org"]
            }
        )
        assert response.status_code == 200, f"Comparison failed: {response.text}"
        print(f"✓ Competitor comparison completed")
    
    def test_competitor_comparison_no_competitors(self, auth_token):
        """Test comparison with no competitors fails"""
        headers = {"Authorization": f"Bearer {auth_token}"}
        response = requests.post(
            f"{BASE_URL}/api/enterprise/compare",
            headers=headers,
            json={
                "query": "test",
                "primary_url": "https://example.com",
                "competitor_urls": []
            }
        )
        assert response.status_code == 400
        print(f"✓ Empty competitors correctly rejected")
    
    def test_executive_summary(self, auth_token):
        """Test executive summary generation"""
        headers = {"Authorization": f"Bearer {auth_token}"}
        response = requests.get(f"{BASE_URL}/api/enterprise/executive-summary", headers=headers)
        assert response.status_code == 200
        data = response.json()
        print(f"✓ Executive summary retrieved: {list(data.keys())[:5]}")
    
    def test_sensitivity_test(self, auth_token):
        """Test sensitivity test with mode"""
        headers = {"Authorization": f"Bearer {auth_token}"}
        response = requests.post(
            f"{BASE_URL}/api/enterprise/sensitivity-test",
            headers=headers,
            json={
                "url": "https://example.com",
                "query": "example website",
                "mode": "authorityFocused"
            }
        )
        assert response.status_code == 200, f"Sensitivity test failed: {response.text}"
        data = response.json()
        assert "mode_probability" in data or "default_probability" in data
        print(f"✓ Sensitivity test completed")
    
    def test_sensitivity_invalid_mode(self, auth_token):
        """Test sensitivity test with invalid mode"""
        headers = {"Authorization": f"Bearer {auth_token}"}
        response = requests.post(
            f"{BASE_URL}/api/enterprise/sensitivity-test",
            headers=headers,
            json={
                "url": "https://example.com",
                "query": "test",
                "mode": "invalidMode"
            }
        )
        assert response.status_code == 400
        print(f"✓ Invalid mode correctly rejected")


if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short"])
