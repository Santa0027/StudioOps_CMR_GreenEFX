import time
import hmac
import hashlib
from django.conf import settings



# project/storage_backends.py
from django.core.files.storage import FileSystemStorage
from django.conf import settings
from storages.backends.s3boto3 import S3Boto3Storage # Import S3Boto3Storage

class CustomLocalMediaStorage(FileSystemStorage):
    """
    Custom storage for local media files, distinct from NAS or cloud.
    """
    def __init__(self, location=settings.MEDIA_ROOT, base_url=settings.MEDIA_URL, **kwargs):
        super().__init__(location, base_url, **kwargs)

class NASStorage(FileSystemStorage):
    """
    Custom storage for NAS-based media files.
    """
    def __init__(self, location='/mnt/StudioOps', base_url='/nas-media/', **kwargs):
        super().__init__(location, base_url, **kwargs)

class S3MediaStorage(S3Boto3Storage):
    """
    Custom storage for S3-based media files.
    """
    location = settings.AWS_LOCATION
    default_acl = settings.AWS_DEFAULT_ACL
    file_overwrite = settings.AWS_S3_FILE_OVERWRITE

# It's better to use the class directly in models rather than this instance,
# but keeping it for backward compatibility if needed elsewhere.
nas_storage = NASStorage()


def generate_signed_token(asset_id, expires_in=300):
    expiry = int(time.time()) + expires_in
    msg = f"{asset_id}:{expiry}".encode()
    signature = hmac.new(
        settings.SECRET_KEY.encode(),
        msg,
        hashlib.sha256
    ).hexdigest()
    return f"{expiry}:{signature}"
