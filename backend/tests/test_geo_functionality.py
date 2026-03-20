"""
GEO (Generative Engine Optimization) Backend Tests
Tests for the new GEO integration into AI Testing Engine including:
- GEO Score calculation in /api/ai-test response
- Generative Readiness score (0-100)
- Summarization Resilience score (0-100)
- Brand Retention Probability score (0-100)
- Detected Brand extraction
- GEO Insights with strengths, weaknesses, and improvement suggestions
"""
import pytest
import requests
import os

BASE_URL = (
    os.environ.get("BACKEND_BASE_URL")
    or os.environ.get("REACT_APP_BACKEND_URL")
    or "http://localhost:8001"
).rstrip("/")


@pytest.fixture(scope="module", autouse=True)
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


@pytest.fixture(scope="module")
def auth_token():
    """Get authentication token for protected routes"""
    # Try login first
    response = requests.post(f"{BASE_URL}/api/auth/login", json={
        "email": TEST_EMAIL,
        "password": TEST_PASSWORD
    })
    if response.status_code == 200:
        return response.json()["access_token"]
    
    # If login fails, try register
    response = requests.post(f"{BASE_URL}/api/auth/register", json={
        "email": TEST_EMAIL,
        "password": TEST_PASSWORD
    })
    if response.status_code == 200:
        return response.json()["access_token"]
    
    pytest.skip("Could not obtain auth token")


class TestGEOScoreInAITest:
    """Test GEO score is included in AI Test responses"""
    
    def test_ai_test_returns_geo_score(self, auth_token):
        """Test that AI test response includes geo_score field"""
        headers = {"Authorization": f"Bearer {auth_token}"}
        response = requests.post(
            f"{BASE_URL}/api/ai-test",
            headers=headers,
            json={"url": "https://example.com", "query": "What is example.com?"}
        )
        assert response.status_code == 200, f"AI test failed: {response.text}"
        data = response.json()
        
        # Verify GEO score is present
        assert "geo_score" in data, "geo_score field missing from response"
        assert isinstance(data["geo_score"], (int, float)), "geo_score should be a number"
        assert 0 <= data["geo_score"] <= 100, f"geo_score should be 0-100, got {data['geo_score']}"
        print(f"✓ GEO Score: {data['geo_score']}%")
    
    def test_ai_test_returns_generative_readiness(self, auth_token):
        """Test Generative Readiness score (0-100)"""
        headers = {"Authorization": f"Bearer {auth_token}"}
        response = requests.post(
            f"{BASE_URL}/api/ai-test",
            headers=headers,
            json={"url": "https://example.com", "query": "example domain"}
        )
        assert response.status_code == 200
        data = response.json()
        
        assert "generative_readiness" in data, "generative_readiness missing"
        assert isinstance(data["generative_readiness"], (int, float))
        assert 0 <= data["generative_readiness"] <= 100
        print(f"✓ Generative Readiness: {data['generative_readiness']}%")
    
    def test_ai_test_returns_summarization_resilience(self, auth_token):
        """Test Summarization Resilience score (0-100)"""
        headers = {"Authorization": f"Bearer {auth_token}"}
        response = requests.post(
            f"{BASE_URL}/api/ai-test",
            headers=headers,
            json={"url": "https://example.com", "query": "example website"}
        )
        assert response.status_code == 200
        data = response.json()
        
        assert "summarization_resilience" in data, "summarization_resilience missing"
        assert isinstance(data["summarization_resilience"], (int, float))
        assert 0 <= data["summarization_resilience"] <= 100
        print(f"✓ Summarization Resilience: {data['summarization_resilience']}%")
    
    def test_ai_test_returns_brand_retention_probability(self, auth_token):
        """Test Brand Retention Probability score (0-100)"""
        headers = {"Authorization": f"Bearer {auth_token}"}
        response = requests.post(
            f"{BASE_URL}/api/ai-test",
            headers=headers,
            json={"url": "https://example.com", "query": "example website"}
        )
        assert response.status_code == 200
        data = response.json()
        
        assert "brand_retention_probability" in data, "brand_retention_probability missing"
        assert isinstance(data["brand_retention_probability"], (int, float))
        assert 0 <= data["brand_retention_probability"] <= 100
        print(f"✓ Brand Retention Probability: {data['brand_retention_probability']}%")
    
    def test_ai_test_returns_detected_brand(self, auth_token):
        """Test Detected Brand extraction from URL/title/schema"""
        headers = {"Authorization": f"Bearer {auth_token}"}
        response = requests.post(
            f"{BASE_URL}/api/ai-test",
            headers=headers,
            json={"url": "https://example.com", "query": "example website"}
        )
        assert response.status_code == 200
        data = response.json()
        
        # detected_brand can be None or a string
        assert "detected_brand" in data, "detected_brand field missing"
        if data["detected_brand"]:
            assert isinstance(data["detected_brand"], str)
            print(f"✓ Detected Brand: {data['detected_brand']}")
        else:
            print("✓ Detected Brand: None (no brand detected)")


class TestGEOInsights:
    """Test GEO Insights with strengths, weaknesses, and improvement suggestions"""
    
    def test_ai_test_returns_geo_insights(self, auth_token):
        """Test GEO Insights structure"""
        headers = {"Authorization": f"Bearer {auth_token}"}
        response = requests.post(
            f"{BASE_URL}/api/ai-test",
            headers=headers,
            json={"url": "https://example.com", "query": "What is example?"}
        )
        assert response.status_code == 200
        data = response.json()
        
        assert "geo_insights" in data, "geo_insights missing"
        geo_insights = data["geo_insights"]
        assert isinstance(geo_insights, dict), "geo_insights should be a dict"
        
        # Check structure
        assert "strengths" in geo_insights, "strengths missing from geo_insights"
        assert "weaknesses" in geo_insights, "weaknesses missing from geo_insights"
        assert "improvement_suggestions" in geo_insights, "improvement_suggestions missing from geo_insights"
        
        print(f"✓ GEO Insights: {len(geo_insights.get('strengths', []))} strengths, "
              f"{len(geo_insights.get('weaknesses', []))} weaknesses, "
              f"{len(geo_insights.get('improvement_suggestions', []))} suggestions")
    
    def test_geo_insights_strengths_structure(self, auth_token):
        """Test strength items have proper structure"""
        headers = {"Authorization": f"Bearer {auth_token}"}
        response = requests.post(
            f"{BASE_URL}/api/ai-test",
            headers=headers,
            json={"url": "https://en.wikipedia.org/wiki/Artificial_intelligence", "query": "What is AI?"}
        )
        assert response.status_code == 200
        data = response.json()
        
        geo_insights = data.get("geo_insights", {})
        strengths = geo_insights.get("strengths", [])
        
        for s in strengths:
            assert "area" in s, "strength missing 'area' field"
            assert "strength" in s, "strength missing 'strength' field"
            assert "detail" in s, "strength missing 'detail' field"
        
        print(f"✓ {len(strengths)} strengths validated with proper structure")
    
    def test_geo_insights_weaknesses_structure(self, auth_token):
        """Test weakness items have proper structure"""
        headers = {"Authorization": f"Bearer {auth_token}"}
        response = requests.post(
            f"{BASE_URL}/api/ai-test",
            headers=headers,
            json={"url": "https://example.com", "query": "example website"}
        )
        assert response.status_code == 200
        data = response.json()
        
        geo_insights = data.get("geo_insights", {})
        weaknesses = geo_insights.get("weaknesses", [])
        
        for w in weaknesses:
            assert "area" in w, "weakness missing 'area' field"
            assert "weakness" in w, "weakness missing 'weakness' field"
            assert "detail" in w, "weakness missing 'detail' field"
            # severity is optional but should be valid if present
            if "severity" in w:
                assert w["severity"] in ["critical", "high", "medium", "low"]
        
        print(f"✓ {len(weaknesses)} weaknesses validated with proper structure")
    
    def test_geo_insights_suggestions_structure(self, auth_token):
        """Test improvement suggestion items have proper structure"""
        headers = {"Authorization": f"Bearer {auth_token}"}
        response = requests.post(
            f"{BASE_URL}/api/ai-test",
            headers=headers,
            json={"url": "https://example.com", "query": "example website"}
        )
        assert response.status_code == 200
        data = response.json()
        
        geo_insights = data.get("geo_insights", {})
        suggestions = geo_insights.get("improvement_suggestions", [])
        
        for s in suggestions:
            assert "issue" in s, "suggestion missing 'issue' field"
            assert "why_it_matters_for_generation" in s, "suggestion missing 'why_it_matters_for_generation' field"
            assert "how_to_fix" in s, "suggestion missing 'how_to_fix' field"
        
        print(f"✓ {len(suggestions)} suggestions validated with proper structure")


class TestGEOScoreCalculation:
    """Test GEO score is calculated correctly from components"""
    
    def test_geo_score_within_expected_range(self, auth_token):
        """Test GEO score is weighted average: 40% readiness + 30% resilience + 30% brand"""
        headers = {"Authorization": f"Bearer {auth_token}"}
        response = requests.post(
            f"{BASE_URL}/api/ai-test",
            headers=headers,
            json={"url": "https://example.com", "query": "example website"}
        )
        assert response.status_code == 200
        data = response.json()
        
        geo_score = data.get("geo_score", 0)
        readiness = data.get("generative_readiness", 0)
        resilience = data.get("summarization_resilience", 0)
        brand_retention = data.get("brand_retention_probability", 0)
        
        # Calculate expected score
        expected = int(round(readiness * 0.40 + resilience * 0.30 + brand_retention * 0.30))
        
        # Allow for minor rounding differences
        assert abs(geo_score - expected) <= 1, f"GEO score {geo_score} doesn't match expected {expected}"
        print(f"✓ GEO Score {geo_score}% = 40%*{readiness} + 30%*{resilience} + 30%*{brand_retention}")


class TestGEOWithDifferentURLs:
    """Test GEO with different URLs to verify varied scores"""
    
    def test_wikipedia_url_has_geo_scores(self, auth_token):
        """Test GEO scores for Wikipedia (well-structured content)"""
        headers = {"Authorization": f"Bearer {auth_token}"}
        response = requests.post(
            f"{BASE_URL}/api/ai-test",
            headers=headers,
            json={"url": "https://en.wikipedia.org/wiki/Artificial_intelligence", "query": "What is AI?"}
        )
        assert response.status_code == 200
        data = response.json()
        
        assert "geo_score" in data
        assert "generative_readiness" in data
        assert "summarization_resilience" in data
        assert "brand_retention_probability" in data
        
        print(f"✓ Wikipedia GEO Scores: Overall={data['geo_score']}%, "
              f"Readiness={data['generative_readiness']}%, "
              f"Resilience={data['summarization_resilience']}%, "
              f"Brand={data['brand_retention_probability']}%")


class TestExistingAITestFunctionality:
    """Verify all existing AI Testing features still work alongside GEO"""
    
    def test_citation_probability_still_works(self, auth_token):
        """Test citation probability is still returned"""
        headers = {"Authorization": f"Bearer {auth_token}"}
        response = requests.post(
            f"{BASE_URL}/api/ai-test",
            headers=headers,
            json={"url": "https://example.com", "query": "example website"}
        )
        assert response.status_code == 200
        data = response.json()
        
        assert "citation_probability" in data
        assert 0 <= data["citation_probability"] <= 100
        print(f"✓ Citation Probability: {data['citation_probability']}%")
    
    def test_position_estimation_still_works(self, auth_token):
        """Test position estimation is still returned"""
        headers = {"Authorization": f"Bearer {auth_token}"}
        response = requests.post(
            f"{BASE_URL}/api/ai-test",
            headers=headers,
            json={"url": "https://example.com", "query": "example website"}
        )
        assert response.status_code == 200
        data = response.json()
        
        assert "likely_position" in data
        assert data["likely_position"] in ["Top 3", "Top 5", "Top 10", "Low likelihood"]
        print(f"✓ Likely Position: {data['likely_position']}")
    
    def test_citation_gaps_still_work(self, auth_token):
        """Test why_not_cited gaps are still returned"""
        headers = {"Authorization": f"Bearer {auth_token}"}
        response = requests.post(
            f"{BASE_URL}/api/ai-test",
            headers=headers,
            json={"url": "https://example.com", "query": "example website"}
        )
        assert response.status_code == 200
        data = response.json()
        
        assert "why_not_cited" in data
        assert isinstance(data["why_not_cited"], list)
        print(f"✓ Why Not Cited Gaps: {len(data['why_not_cited'])}")
    
    def test_improvement_suggestions_still_work(self, auth_token):
        """Test improvement_suggestions are still returned"""
        headers = {"Authorization": f"Bearer {auth_token}"}
        response = requests.post(
            f"{BASE_URL}/api/ai-test",
            headers=headers,
            json={"url": "https://example.com", "query": "example website"}
        )
        assert response.status_code == 200
        data = response.json()
        
        assert "improvement_suggestions" in data
        assert isinstance(data["improvement_suggestions"], list)
        print(f"✓ Improvement Suggestions: {len(data['improvement_suggestions'])}")
    
    def test_breakdown_still_works(self, auth_token):
        """Test breakdown scores are still returned"""
        headers = {"Authorization": f"Bearer {auth_token}"}
        response = requests.post(
            f"{BASE_URL}/api/ai-test",
            headers=headers,
            json={"url": "https://example.com", "query": "example website"}
        )
        assert response.status_code == 200
        data = response.json()
        
        assert "breakdown" in data
        breakdown = data["breakdown"]
        assert "intent_match" in breakdown
        assert "extractability" in breakdown
        assert "authority" in breakdown
        assert "schema_support" in breakdown
        assert "content_depth" in breakdown
        print(f"✓ Breakdown: {breakdown}")


class TestGEOInTestHistory:
    """Test that GEO scores appear in test history list"""
    
    def test_list_ai_tests_includes_geo_score(self, auth_token):
        """Test that listing AI tests includes geo_score"""
        headers = {"Authorization": f"Bearer {auth_token}"}
        
        # First run a test to ensure there's data
        requests.post(
            f"{BASE_URL}/api/ai-test",
            headers=headers,
            json={"url": "https://example.com", "query": "test history geo"}
        )
        
        # Then list tests
        response = requests.get(f"{BASE_URL}/api/ai-test", headers=headers)
        assert response.status_code == 200
        data = response.json()
        
        assert "tests" in data
        tests = data["tests"]
        
        if tests:
            # Check first test has geo_score
            first_test = tests[0]
            assert "geo_score" in first_test, "geo_score missing from test history item"
            assert "citation_probability" in first_test, "citation_probability missing"
            print(f"✓ Test history includes geo_score: {first_test.get('geo_score')}%")
        else:
            print("✓ No tests in history yet")


if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short"])
