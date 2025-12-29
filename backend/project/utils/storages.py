import time
import hmac
import hashlib
from django.conf import settings



# project/storage_backends.py
from django.core.files.storage import FileSystemStorage

nas_storage = FileSystemStorage(location='/mnt/StudioOps', base_url='/media/')


def generate_signed_token(asset_id, expires_in=300):
    expiry = int(time.time()) + expires_in
    msg = f"{asset_id}:{expiry}".encode()
    signature = hmac.new(
        settings.SECRET_KEY.encode(),
        msg,
        hashlib.sha256
    ).hexdigest()
    return f"{expiry}:{signature}"
