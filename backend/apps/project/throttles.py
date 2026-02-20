from rest_framework.throttling import UserRateThrottle

class AssetStreamRateThrottle(UserRateThrottle):
    scope = 'asset_stream'
