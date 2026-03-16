from pydantic import BaseModel, HttpUrl
from typing import Optional

class CLIAnalyzeRequest(BaseModel):
    url: HttpUrl
    html: str
    query: Optional[str] = None
