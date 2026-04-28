"""
Web Report Backend - X-ray Report Generation
"""

from fastapi import FastAPI, HTTPException, Response, Request
from pydantic import BaseModel
import httpx
import os

app = FastAPI(title="X-Ray Report Backend")

# Hardcoded test credentials for POC
VALID_USER = "demo"
VALID_PASS = "prodia2024"
SESSION_COOKIE = "session"

# Blocked keywords for guardrails
BLOCKED_KEYWORDS = ["recipe", "cook", "code", "python", "joke", "story", "weather", "hello"]

# LLM service URL from environment
LLM_SERVICE_URL = os.getenv("LLM_SERVICE_URL", "http://llm-service:8080")


class LoginRequest(BaseModel):
    username: str
    password: str


class ReportRequest(BaseModel):
    findings: str


def check_auth(request: Request):
    """Check if user is authenticated via session cookie"""
    if request.cookies.get(SESSION_COOKIE) != "authenticated":
        raise HTTPException(status_code=401, detail="Not authenticated")


@app.post("/api/login")
def login(req: LoginRequest, response: Response):
    """Authenticate user with hardcoded credentials"""
    if req.username == VALID_USER and req.password == VALID_PASS:
        response.set_cookie(SESSION_COOKIE, "authenticated", httponly=True)
        return {"status": "ok"}
    raise HTTPException(status_code=401, detail="Invalid credentials")


@app.post("/api/logout")
def logout(request: Request, response: Response):
    """Clear session and log out"""
    check_auth(request)
    response.delete_cookie(SESSION_COOKIE)
    return {"status": "ok"}


@app.get("/api/me")
def me(request: Request):
    """Check authentication status"""
    check_auth(request)
    return {"authenticated": True}


@app.post("/api/report")
async def report(req: ReportRequest, request: Request):
    """Generate X-ray report from findings using LLM"""
    check_auth(request)
    
    # Validate input
    findings = req.findings.strip()
    if not findings:
        raise HTTPException(status_code=400, detail="Please enter findings")
    
    # Guardrails - block certain keywords
    findings_lower = findings.lower()
    for keyword in BLOCKED_KEYWORDS:
        if keyword in findings_lower:
            raise HTTPException(
                status_code=400, 
                detail="This service is for X-ray interpretation only"
            )
    
    # Call LLM service
    try:
        async with httpx.AsyncClient(timeout=120.0) as client:
            response = await client.post(
                f"{LLM_SERVICE_URL}/v1/chat/completions",
                json={
                    "model": "local",
                    "messages": [
                        {"role": "system", "content": "You are a medical imaging assistant. Interpret X-ray findings and provide a professional radiology report."},
                        {"role": "user", "content": findings}
                    ],
                    "temperature": 0.7,
                    "max_tokens": 1000
                }
            )
            
            if response.status_code != 200:
                raise HTTPException(
                    status_code=502, 
                    detail="LLM service unavailable"
                )
            
            data = response.json()
            content = data["choices"][0]["message"]["content"]
            return {"interpretation": content}
            
    except httpx.TimeoutException:
        raise HTTPException(
            status_code=504, 
            detail="Request timed out"
        )
    except httpx.RequestError:
        raise HTTPException(
            status_code=502, 
            detail="Cannot connect to LLM service"
        )
