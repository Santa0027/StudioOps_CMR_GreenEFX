import time
import hmac
import hashlib
from django.conf import settings
import boto3 # Import boto3



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
    def __init__(self, location=None, base_url=settings.NAS_MEDIA_URL, **kwargs):
        _location = location if location is not None else settings.NAS_MEDIA_ROOT
        super().__init__(_location, base_url, **kwargs)

class S3MediaStorage(S3Boto3Storage):
    """
    Custom storage for S3-based media files.
    """
    def __init__(self, bucket_name=None, region_name=None, **kwargs):
        if bucket_name:
            self.bucket_name = bucket_name
        if region_name:
            self.region_name = region_name
        super().__init__(**kwargs)

# It's better to use the class directly in models rather than this instance,
# but keeping it for backward compatibility if needed elsewhere.
# Remove the direct instantiation as it might cause issues with dynamic settings
# nas_storage = NASStorage()


def generate_s3_presigned_url(object_name, expiration=3600, bucket_name=None, region_name=None):
    """
    Generate a presigned URL to share an S3 object.
    :param object_name: S3 object name (key).
    :param expiration: Time in seconds for the presigned URL to remain valid.
    :return: Presigned URL as string.
    """
    _bucket_name = bucket_name if bucket_name else settings.AWS_STORAGE_BUCKET_NAME
    _region_name = region_name if region_name else settings.AWS_S3_REGION_NAME

    if not all([settings.AWS_ACCESS_KEY_ID, settings.AWS_SECRET_ACCESS_KEY, _bucket_name, _region_name]):
        # Fallback or raise error if S3 settings are incomplete
        return None # Or raise an exception

    s3_client = boto3.client(
        's3',
        aws_access_key_id=settings.AWS_ACCESS_KEY_ID,
        aws_secret_access_key=settings.AWS_SECRET_ACCESS_KEY,
        region_name=_region_name,
        endpoint_url=getattr(settings, 'AWS_S3_ENDPOINT_URL', None) # For MinIO or custom S3 endpoints
    )
    
    try:
        response = s3_client.generate_presigned_url(
            'get_object',
            Params={
                'Bucket': _bucket_name,
                'Key': f"{settings.AWS_LOCATION}/{object_name}"
            },
            ExpiresIn=expiration
        )
    except Exception as e:
        print(f"Error generating presigned URL: {e}")
        return None
    return response


def generate_signed_token(asset_id, expires_in=300):
    expiry = int(time.time()) + expires_in
    msg = f"{asset_id}:{expiry}".encode()
    signature = hmac.new(
        settings.SECRET_KEY.encode(),
        msg,
        hashlib.sha256
    ).hexdigest()
    return f"{expiry}:{signature}"
