import json, uuid, requests, time
from datetime import datetime, timezone, timedelta
from typing import Any, Dict, Optional, Union

from .crypto_helper import (
    encryptsign_xdata, java_like_timestamp, ts_gmt7_without_colon,
    ax_api_signature, decrypt_xdata, API_KEY as DEFAULT_API_KEY,
    make_x_signature_payment, build_encrypted_field
)

BASE_URL = "https://api.myxl.xlaxiata.co.id"

def validate_contact(contact: str) -> bool:
    if not contact.startswith("628") or len(contact) > 14:
        print("Invalid number")
        return False
    return True

def get_otp(contact: str) -> Optional[str]:
    if not validate_contact(contact):
        return None

    url = "https://gede.ciam.xlaxiata.co.id/realms/xl-ciam/auth/otp"
    querystring = {"contact": contact, "contactType": "SMS", "alternateContact": "false"}

    now = datetime.now(timezone(timedelta(hours=7)))
    ax_request_at = java_like_timestamp(now)
    ax_request_id = str(uuid.uuid4())

    headers = {
        "Accept-Encoding": "gzip, deflate, br",
        "Authorization": "Basic OWZjOTdlZDEtNmEzMC00OGQ1LTk1MTYtNjBjNTNjZTNhMTM1OllEV21GNExKajlYSUt3UW56eTJlMmxiMHRKUWIyOW8z",
        "Ax-Device-Id": "92fb44c0804233eb4d9e29f838223a14",
        "Ax-Fingerprint": "YmQLy9ZiLLBFAEVcI4Dnw9+NJWZcdGoQyewxMF/9hbfk/8GbKBgtZxqdiiam8+m2lK31E/zJQ7kjuPXpB3EE8naYL0Q8+0WLhFV1WAPl9Eg=",
        "Ax-Request-At": ax_request_at,
        "Ax-Request-Device": "samsung",
        "Ax-Request-Device-Model": "SM-N935F",
        "Ax-Request-Id": ax_request_id,
        "Ax-Substype": "PREPAID",
        "Content-Type": "application/json",
        "Host": "gede.ciam.xlaxiata.co.id",
        "User-Agent": "myXL / 8.6.0(1179); com.android.vending; (samsung; SM-N935F; SDK 33; Android 13)"
    }

    print("Requesting OTP...")
    try:
        r = requests.get(url, headers=headers, params=querystring, timeout=30)
        body = r.json()
        if "subscriber_id" not in body:
            print(body.get("error", "No error message in response"))
            raise ValueError("Subscriber ID not found in response")
        return body["subscriber_id"]
    except Exception as e:
        print(f"Error requesting OTP: {e}")
        return None

def submit_otp(contact: str, code: str) -> Optional[Dict[str, Any]]:
    if not validate_contact(contact):
        print("Invalid number"); return None
    if not code or len(code) != 6:
        print("Invalid OTP code format"); return None

    url = "https://gede.ciam.xlaxiata.co.id/realms/xl-ciam/protocol/openid-connect/token"

    now_gmt7 = datetime.now(timezone(timedelta(hours=7)))
    ts_for_sign = ts_gmt7_without_colon(now_gmt7)
    ts_header = ts_gmt7_without_colon(now_gmt7 - timedelta(minutes=5))
    signature = ax_api_signature(ts_for_sign, contact, code, "SMS")

    payload = f"contactType=SMS&code={code}&grant_type=password&contact={contact}&scope=openid"
    headers = {
        "Accept-Encoding": "gzip, deflate, br",
        "Authorization": "Basic OWZjOTdlZDEtNmEzMC00OGQ1LTk1MTYtNjBjNTNjZTNhMTM1OllEV21GNExKajlYSUt3UW56eTJlMmxiMHRKUWIyOW8z",
        "Ax-Api-Signature": signature,
        "Ax-Device-Id": "92fb44c0804233eb4d9e29f838223a14",
        "Ax-Fingerprint": "YmQLy9ZiLLBFAEVcI4Dnw9+NJWZcdGoQyewxMF/9hbfk/8GbKBgtZxqdiiam8+m2lK31E/zJQ7kjuPXpB3EE8naYL0Q8+0WLhFV1WAPl9Eg=",
        "Ax-Request-At": ts_header,
        "Ax-Request-Device": "samsung",
        "Ax-Request-Device-Model": "SM-N935F",
        "Ax-Request-Id": str(uuid.uuid4()),
        "Ax-Substype": "PREPAID",
        "Content-Type": "application/x-www-form-urlencoded",
        "User-Agent": "myXL / 8.6.0(1179); com.android.vending; (samsung; SM-N935F; SDK 33; Android 13)",
    }

    try:
        r = requests.post(url, data=payload, headers=headers, timeout=30)
        body = r.json()
        if "error" in body:
            print(f"[Error submit_otp]: {body.get('error_description', body['error'])}")
            return None
        return body
    except requests.RequestException as e:
        print(f"[Error submit_otp]: {e}")
        return None

def save_tokens(tokens: dict, filename: str = "tokens.json"):
    with open(filename, 'w') as f:
        json.dump(tokens, f, indent=2, ensure_ascii=False)

def load_tokens(filename: str = "tokens.json") -> dict:
    try:
        with open(filename, 'r') as f:
            tokens = json.load(f)
            if not isinstance(tokens, dict) or "refresh_token" not in tokens or "id_token" not in tokens:
                raise ValueError("Invalid token format in file")
            return tokens
    except FileNotFoundError:
        print(f"File {filename} not found. Returning empty tokens.")
        return {}

def get_new_token(refresh_token: str) -> Dict[str, Any]:
    url = "https://gede.ciam.xlaxiata.co.id/realms/xl-ciam/protocol/openid-connect/token"

    now = datetime.now(timezone(timedelta(hours=7)))
    ax_request_at = now.strftime("%Y-%m-%dT%H:%M:%S.%f")[:-3] + "+0700"
    ax_request_id = str(uuid.uuid4())

    headers = {
        "Host": "gede.ciam.xlaxiata.co.id",
        "ax-request-at": ax_request_at,
        "ax-device-id": "92fb44c0804233eb4d9e29f838223a15",
        "ax-request-id": ax_request_id,
        "ax-request-device": "samsung",
        "ax-request-device-model": "SM-N935F",
        "ax-fingerprint": "YmQLy9ZiLLBFAEVcI4Dnw9+NJWZcdGoQyewxMF/9hbfk/8GbKBgtZxqdiiam8+m2lK31E/zJQ7kjuPXpB3EE8uHGk5i+PevKLaUFo/Xi5Fk=",
        "authorization": "Basic OWZjOTdlZDEtNmEzMC00OGQ1LTk1MTYtNjBjNTNjZTNhMTM1OllEV21GNExKajlYSUt3UW56eTJlMmxiMHRKUWIyOW8z",
        "user-agent": "myXL / 8.6.0(1179); com.android.vending; (samsung; SM-N935F; SDK 33; Android 13)",
        "ax-substype": "PREPAID",
        "content-type": "application/x-www-form-urlencoded"
    }

    data = {"grant_type": "refresh_token", "refresh_token": refresh_token}
    print("Refreshing token...")

    r = requests.post(url, headers=headers, data=data, timeout=30)
    r.raise_for_status()
    body = r.json()

    if "error" in body or "id_token" not in body:
        raise ValueError(f"Refresh failed: {body}")
    print("Token refreshed successfully.")
    save_tokens(body)
    return body

# ---------- Core HTTP helper ----------
def send_api_request(
    api_key: Optional[str],
    path: str,
    payload_dict: dict,
    id_token: str,
    method: str = "POST",
) -> Dict[str, Any]:
    """
    Selalu return dict agar caller aman.
    """
    api_key = api_key or DEFAULT_API_KEY

    encrypted_payload = encryptsign_xdata(
        api_key=api_key,
        method=method,
        path=path,
        id_token=id_token,
        payload=payload_dict
    )

    xtime = int(encrypted_payload["encrypted_body"]["xtime"])
    sig_time_sec = (xtime // 1000)

    body = encrypted_payload["encrypted_body"]
    x_sig = encrypted_payload["x_signature"]

    headers = {
        "host": "api.myxl.xlaxiata.co.id",
        "content-type": "application/json; charset=utf-8",
        "user-agent": "myXL / 8.6.0(1179); com.android.vending; (samsung; SM-N935F; SDK 33; Android 13)",
        "x-api-key": api_key,
        "authorization": f"Bearer {id_token}",
        "x-hv": "v3",
        "x-signature-time": str(sig_time_sec),
        "x-signature": x_sig,
        "x-request-id": str(uuid.uuid4()),
        "x-request-at": java_like_timestamp(datetime.now(timezone.utc).astimezone()),
        "x-version-app": "8.6.0",
    }

    url = f"{BASE_URL}/{path}"
    try:
        r = requests.request(method.upper(), url, headers=headers, data=json.dumps(body), timeout=30)
    except Exception as e:
        return {"status": "ERROR", "error": f"HTTP request failed: {e}"}

    try:
        decrypted = decrypt_xdata(api_key, json.loads(r.text))
        return decrypted if isinstance(decrypted, dict) else {"status": "ERROR", "raw": r.text}
    except Exception as e:
        print("[decrypt err]", e)
        try:
            raw_json = r.json()
        except Exception:
            raw_json = {"text": r.text}
        return {"status": "ERROR", "http_status": r.status_code, "raw": raw_json, "decrypt_error": str(e)}

# ---------- High-level wrappers ----------
def _ensure_dict(res: Union[Dict[str, Any], Any]) -> Optional[Dict[str, Any]]:
    if isinstance(res, dict):
        return res
    print("Unexpected upstream response type:", type(res), res)
    return None

def get_profile(api_key: str, access_token: str, id_token: str) -> Optional[Dict[str, Any]]:
    path = "api/v8/profile"
    payload = {"access_token": access_token, "app_version": "8.6.0", "is_enterprise": False, "lang": "en"}
    print("Fetching profile...")
    res = _ensure_dict(send_api_request(api_key, path, payload, id_token, "POST"))
    return res.get("data") if res else None

def get_balance(api_key: str, id_token: str) -> Optional[Dict[str, Any]]:
    path = "api/v8/packages/balance-and-credit"
    payload = {"is_enterprise": False, "lang": "en"}
    print("Fetching balance...")
    res = _ensure_dict(send_api_request(api_key, path, payload, id_token, "POST"))
    if not res: return None
    if "data" in res and isinstance(res["data"], dict) and "balance" in res["data"]:
        return res["data"]["balance"]
    print("Error getting balance:", res.get("error") or res.get("raw"))
    return None

def get_family(api_key: str, tokens: dict, family_code: str) -> Optional[Dict[str, Any]]:
    print("Fetching package family...")
    path = "api/v8/xl-stores/options/list"
    payload = {
        "is_show_tagging_tab": True, "is_dedicated_event": True, "is_transaction_routine": False,
        "migration_type": "", "package_family_code": family_code, "is_autobuy": False,
        "is_enterprise": False, "is_pdlp": True, "referral_code": "", "is_migration": False, "lang": "en"
    }
    res = _ensure_dict(send_api_request(api_key, path, payload, tokens.get("id_token"), "POST"))
    if not res or res.get("status") != "SUCCESS":
        print(f"Failed to get family {family_code}: {res}")
        return None
    return res["data"]

def get_package(api_key: str, tokens: dict, package_option_code: str) -> Optional[Dict[str, Any]]:
    path = "api/v8/xl-stores/options/detail"
    payload = {
        "is_transaction_routine": False, "migration_type": "", "package_family_code": "",
        "family_role_hub": "", "is_autobuy": False, "is_enterprise": False, "is_shareable": False,
        "is_migration": False, "lang": "en", "package_option_code": package_option_code,
        "is_upsell_pdp": False, "package_variant_code": ""
    }
    print("Fetching package...")
    res = _ensure_dict(send_api_request(api_key, path, payload, tokens["id_token"], "POST"))
    if not res or "data" not in res:
        print("Error getting package:", res.get("error") if res else "no response")
        return None
    return res["data"]

def send_payment_request(
    api_key: str,
    payload_dict: dict,
    access_token: str,
    id_token: str,
    token_payment: str,
    ts_to_sign: int,
) -> Dict[str, Any]:
    path = "payments/api/v8/settlement-balance"
    package_code = payload_dict["items"][0]["item_code"]

    encrypted_payload = encryptsign_xdata(
        api_key=api_key, method="POST", path=path, id_token=id_token, payload=payload_dict
    )
    xtime = int(encrypted_payload["encrypted_body"]["xtime"])
    sig_time_sec = (xtime // 1000)
    x_requested_at = datetime.fromtimestamp(sig_time_sec, tz=timezone.utc).astimezone()
    payload_dict["timestamp"] = ts_to_sign

    body = encrypted_payload["encrypted_body"]
    x_sig2 = make_x_signature_payment(access_token, ts_to_sign, package_code, token_payment)

    headers = {
        "host": "api.myxl.xlaxiata.co.id",
        "content-type": "application/json; charset=utf-8",
        "user-agent": "myXL / 8.6.0(1179); com.android.vending; (samsung; SM-N935F; SDK 33; Android 13)",
        "x-api-key": api_key,
        "authorization": f"Bearer {id_token}",
        "x-hv": "v3",
        "x-signature-time": str(sig_time_sec),
        "x-signature": x_sig2,
        "x-request-id": str(uuid.uuid4()),
        "x-request-at": java_like_timestamp(x_requested_at),
        "x-version-app": "8.6.0",
    }

    url = f"{BASE_URL}/{path}"
    r = requests.post(url, headers=headers, data=json.dumps(body), timeout=30)
    try:
        return decrypt_xdata(api_key, json.loads(r.text))
    except Exception as e:
        print("[decrypt err]", e)
        try:
            raw_json = r.json()
        except Exception:
            raw_json = {"text": r.text}
        return {"status": "ERROR", "http_status": r.status_code, "raw": raw_json, "decrypt_error": str(e)}

def purchase_package(api_key: str, tokens: dict, package_option_code: str) -> Optional[Dict[str, Any]]:
    package_details_data = get_package(api_key, tokens, package_option_code)
    if not package_details_data:
        print("Failed to get package details for purchase.")
        return None

    token_confirmation = package_details_data["token_confirmation"]
    payment_target = package_details_data["package_option"]["package_option_code"]
    price = package_details_data["package_option"]["price"]

    payment_path = "payments/api/v8/payment-methods-option"
    payment_payload = {
        "payment_type": "PURCHASE",
        "is_enterprise": False,
        "payment_target": payment_target,
        "lang": "en",
        "is_referral": False,
        "token_confirmation": token_confirmation
    }

    print("Initiating payment...")
    payment_res = _ensure_dict(send_api_request(api_key, payment_path, payment_payload, tokens["id_token"], "POST"))
    if not payment_res or payment_res.get("status") != "SUCCESS":
        print("Failed to initiate payment:", payment_res)
        return None

    token_payment = payment_res["data"]["token_payment"]
    ts_to_sign = payment_res["data"]["timestamp"]

    settlement_payload = {
        "total_discount": 0, "is_enterprise": False, "payment_token": "", "token_payment": token_payment,
        "activated_autobuy_code": "", "cc_payment_type": "", "is_myxl_wallet": False, "pin": "",
        "ewallet_promo_id": "", "members": [], "total_fee": 0, "fingerprint": "",
        "autobuy_threshold_setting": {"label": "", "type": "", "value": 0},
        "is_use_point": False, "lang": "en", "payment_method": "BALANCE",
        "timestamp": int(time.time()), "points_gained": 0, "can_trigger_rating": False,
        "akrab_members": [], "akrab_parent_alias": "", "referral_unique_code": "", "coupon": "",
        "payment_for": "BUY_PACKAGE", "with_upsell": False, "topup_number": "", "stage_token": "",
        "authentication_id": "", "encrypted_payment_token": build_encrypted_field(urlsafe_b64=True),
        "token": "", "token_confirmation": "", "access_token": tokens["access_token"], "wallet_number": "",
        "encrypted_authentication_id": build_encrypted_field(urlsafe_b64=True), "additional_data": {},
        "total_amount": price, "is_using_autobuy": False,
        "items": [{"item_code": payment_target, "product_type": "", "item_price": price, "item_name": "", "tax": 0}]
    }

    print("Processing purchase...")
    result = send_payment_request(api_key, settlement_payload, tokens["access_token"], tokens["id_token"], token_payment, ts_to_sign)
    print(f"Purchase result:\n{json.dumps(result, indent=2)}")
    return result
