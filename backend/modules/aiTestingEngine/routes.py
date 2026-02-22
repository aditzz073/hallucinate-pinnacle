"""AI Testing Engine Routes - Phase 2"""
from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from middlewares.auth_middleware import verify_token, verify_token_optional
from typing import Optional

router = APIRouter(prefix="/ai-test", tags=["AI Citation Testing"])


class AITestRequest(BaseModel):
    url: str
    query: str


@router.post("")
async def run_ai_test(req: AITestRequest, current_user: Optional[dict] = Depends(verify_token_optional)):
    from modules.aiTestingEngine.service import run_ai_test as _run_ai_test

    if not req.query.strip():
        raise HTTPException(status_code=400, detail="Query cannot be empty")
    
    # Guest mode: user_id is None
    user_id = current_user["user_id"] if current_user else None
    
    try:
        result = await _run_ai_test(str(req.url), req.query.strip(), user_id)
        return result
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=502, detail=f"AI test failed: {str(e)}")


@router.get("")
async def list_ai_tests(current_user: dict = Depends(verify_token)):
    from modules.aiTestingEngine.service import get_user_ai_tests

    tests = await get_user_ai_tests(current_user["user_id"])
    return {"tests": tests}


@router.get("/{test_id}")
async def get_ai_test(test_id: str, current_user: dict = Depends(verify_token)):
    from modules.aiTestingEngine.service import get_ai_test_detail

    test = await get_ai_test_detail(test_id, current_user["user_id"])
    if not test:
        raise HTTPException(status_code=404, detail="AI test not found")
    return test
