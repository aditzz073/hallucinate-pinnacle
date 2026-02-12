"""AI Content Compiler Routes - Phase 6"""
from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from middlewares.auth_middleware import verify_token

router = APIRouter(prefix="/compile", tags=["AI Content Compiler"])


class CompileRequest(BaseModel):
    url: str


@router.post("")
async def compile_content(req: CompileRequest, current_user: dict = Depends(verify_token)):
    from modules.aiContentCompiler.service import compile_content as _compile

    try:
        result = await _compile(str(req.url))
        return result
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=502, detail=f"Content compilation failed: {str(e)}")
