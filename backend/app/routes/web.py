import os
from fastapi import APIRouter, Request
from fastapi.responses import HTMLResponse
from fastapi.templating import Jinja2Templates

router = APIRouter(tags=["Web"])

CURRENT_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
TEMPLATES_DIR = os.path.join(CURRENT_DIR, "templates")

templates = Jinja2Templates(directory=TEMPLATES_DIR)

@router.get("/", response_class=HTMLResponse)
async def read_root(request: Request):
    return templates.TemplateResponse(
        request=request, 
        name="dashboard_v2.html"
    )

@router.get("/login.html", response_class=HTMLResponse)
async def read_login_page(request: Request):
    return templates.TemplateResponse(
        request=request, 
        name="login.html"
    )

@router.get("/index.html", response_class=HTMLResponse)
async def read_index_page(request: Request):
    return templates.TemplateResponse(
        request=request, 
        name="dashboard_v2.html"
    )
