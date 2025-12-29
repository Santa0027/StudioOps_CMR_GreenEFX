import threading

_local = threading.local()

def get_current_user():
    return getattr(_local, "user", None)

def get_current_ip():
    return getattr(_local, "ip", None)


class AuditMiddleware:
    """
    Stores request.user and IP for signal access
    """
    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        _local.user = getattr(request, "user", None)
        _local.ip = request.META.get("REMOTE_ADDR")
        return self.get_response(request)
