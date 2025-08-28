
import os
from fastapi import FastAPI, HTTPException, Header, Query
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional

# import fungsi dari modul kamu
from myxl.api_request import (
    get_otp, submit_otp, get_new_token,
    get_profile, get_balance, get_family, get_package, purchase_package
)
# kalau kamu mau pakai API_KEY default dari crypto_helper
from myxl.crypto_helper import API_KEY as DEFAULT_MYXL_API_KEY

# ---------- FastAPI setup ----------
app = FastAPI(title="myXL Bridge API", version="1.1.0")

# Origins yang diizinkan untuk CORS
# - Selalu izinkan dev localhost
# - Tambahan origin produksi via ENV: WEB_ORIGIN (pisahkan dengan koma bila lebih dari satu)
#   contoh: WEB_ORIGIN="https://app.example.com,https://www.example.com"
allowed_origins = {"http://localhost:5173", "http://127.0.0.1:5173"}
if os.getenv("WEB_ORIGIN"):
    for item in os.getenv("WEB_ORIGIN").split(","):
        item = item.strip()
        if item:
            allowed_origins.add(item)

app.add_middleware(
    CORSMiddleware,
    allow_origins=list(allowed_origins),
    allow_methods=["*"],
    allow_headers=["*"],
)

# ---------- Schemas ----------
class ContactBody(BaseModel):
    contact: str

class OTPBody(BaseModel):
    contact: str
    code: str

class RefreshBody(BaseModel):
    refresh_token: str

class TokensBody(BaseModel):
    access_token: str
    id_token: str

# ---------- Helpers ----------
def resolve_myxl_key(x_api_key: Optional[str]) -> str:
    """
    Urutan prioritas:
    1) Header X-API-Key (request)
    2) ENV MYXL_API_KEY (jika diset di hosting)
    3) DEFAULT_MYXL_API_KEY dari crypto_helper
    """
    return x_api_key or os.getenv("MYXL_API_KEY") or DEFAULT_MYXL_API_KEY

# ---------- Health & Root ----------
@app.get("/health")
def health():
    return {"ok": True}

@app.get("/")
def root():
    return {
        "service": "myXL Bridge API",
        "version": "1.1.0",
        "docs": "/docs",
        "health": "/health"
    }

# ---------- Auth / OTP ----------
@app.post("/auth/otp")
def route_get_otp(body: ContactBody):
    sid = get_otp(body.contact)
    if not sid:
        raise HTTPException(400, "Gagal meminta OTP (cek nomor atau rate limit).")
    return {"subscriber_id": sid}

@app.post("/auth/token")
def route_submit_otp(body: OTPBody):
    tokens = submit_otp(body.contact, body.code)
    if not tokens:
        raise HTTPException(400, "OTP salah/kadaluarsa atau format salah.")
    return tokens

@app.post("/auth/token/refresh")
def route_refresh_token(body: RefreshBody):
    try:
        tokens = get_new_token(body.refresh_token)
        return tokens
    except Exception as e:
        raise HTTPException(400, f"Gagal refresh token: {e}")

# ---------- Profile / Balance ----------
@app.get("/profile")
def route_profile(
    access_token: str = Query(...),
    id_token: str = Query(...),
    x_api_key: Optional[str] = Header(default=None, convert_underscores=False),
):
    myxl_key = resolve_myxl_key(x_api_key)
    data = get_profile(myxl_key, access_token, id_token)
    if data is None:
        raise HTTPException(502, "Gagal ambil profil.")
    return data

@app.get("/balance")
def route_balance(
    id_token: str = Query(...),
    x_api_key: Optional[str] = Header(default=None, convert_underscores=False),
):
    myxl_key = resolve_myxl_key(x_api_key)
    bal = get_balance(myxl_key, id_token)
    if bal is None:
        raise HTTPException(502, "Gagal ambil saldo/balance.")
    return bal

# ---------- Packages ----------
@app.get("/packages/family/{family_code}")
def route_get_family(
    family_code: str,
    access_token: str = Query(...),
    id_token: str = Query(...),
    x_api_key: Optional[str] = Header(default=None, convert_underscores=False),
):
    myxl_key = resolve_myxl_key(x_api_key)
    tokens = {"access_token": access_token, "id_token": id_token}
    data = get_family(myxl_key, tokens, family_code)
    if data is None:
        raise HTTPException(502, f"Gagal ambil paket family {family_code}.")
    return data

@app.get("/packages/{package_option_code}")
def route_get_package(
    package_option_code: str,
    id_token: str = Query(...),
    x_api_key: Optional[str] = Header(default=None, convert_underscores=False),
):
    myxl_key = resolve_myxl_key(x_api_key)
    tokens = {"id_token": id_token}
    data = get_package(myxl_key, tokens, package_option_code)
    if data is None:
        raise HTTPException(502, f"Gagal ambil paket {package_option_code}.")
    return data

# ---------- Purchase ----------
@app.post("/purchase/{package_option_code}")
def route_purchase(
    package_option_code: str,
    body: TokensBody,
    x_api_key: Optional[str] = Header(default=None, convert_underscores=False),
):
    myxl_key = resolve_myxl_key(x_api_key)
    tokens = {"access_token": body.access_token, "id_token": body.id_token}
    result = purchase_package(myxl_key, tokens, package_option_code)
    if not result:
        raise HTTPException(502, "Gagal melakukan pembelian.")
    return result
