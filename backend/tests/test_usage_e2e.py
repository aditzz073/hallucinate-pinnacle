import httpx
import asyncio
import os

BASE_URL = "http://127.0.0.1:8000/api"

async def main():
    async with httpx.AsyncClient() as client:
        print("=== 1. Registering new 'free' user ===")
        email = "test44_user@example.com" # change if need random
        try:
            res = await client.post(f"{BASE_URL}/auth/register", json={
                "email": email,
                "password": "password123",
                "nickname": "Tester"
            })
            if res.status_code == 400:
                print("User exists, logging in instead...")
                res = await client.post(f"{BASE_URL}/auth/login", json={
                    "email": email,
                    "password": "password123"
                })
        except Exception as e:
            print(f"Error connecting: {e}")
            return
            
        data = res.json()
        assert res.status_code == 200, f"Auth failed: {data}"
        token = data["access_token"]
        headers = {"Authorization": f"Bearer {token}"}
        plan = data["user"]["plan"]
        print(f"User registered. Plan in response: {plan}")
        assert plan == "free", f"Expected free plan, got {plan}"

        print("\n=== 2. Hitting discover+ feature (advanced_audit) with free user ===")
        res = await client.post(f"{BASE_URL}/audit/advanced", headers=headers, json={"url": "example.com"})
        print(f"Status Code: {res.status_code}")
        data = res.json()
        assert res.status_code == 403, f"Expected 403, got {res.status_code}"
        assert data["error"] == "no_active_plan", f"Expected no_active_plan, got {data}"
        print(f"Feature locked message: {data['message']}")

        print("\n=== 3. Getting Billing Status ===")
        res = await client.get(f"{BASE_URL}/billing/status", headers=headers)
        data = res.json()
        assert res.status_code == 200
        print("Billing data:")
        print(f"  Plan: {data['plan']}")
        print(f"  AEO used: {data['usage']['aeo_audits_used']} / {data['usage']['aeo_audits_limit']}")
        print(f"  AI Tests used: {data['usage']['ai_lab_tests_used']} / {data['usage']['ai_lab_tests_limit']}")

        print("\n=== 4. Hit usage limit manually? ===")
        # Usually it's hard to hit limit without mocking DB or running loop
        print("Running an isolated aeo audit (free allows 5)...")
        for i in range(1, 7):
            print(f"  Attempt {i}")
            res = await client.post(f"{BASE_URL}/audit", headers=headers, json={"url": f"example{i}.com"})
            if res.status_code == 429:
                data = res.json()
                print(f"  Hit limit! 429: {data['error']} - {data['used']}/{data['limit']}")
                assert data["error"] == "usage_limit_reached"
                assert data["used"] == 5
                assert data["limit"] == 5
                break
            else:
                assert res.status_code in [200, 422, 502, 500], f"Unexpected status {res.status_code}" # It might fail on analyze if not real URL, but usage limit check happens BEFORE analyze runs. Wait, does checking usage come before actual URL scraping? Yes.
        
        print("\n=== ALL TESTS PASSED ===")

if __name__ == "__main__":
    asyncio.run(main())
