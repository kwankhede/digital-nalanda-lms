from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response


@api_view(["GET"])
@permission_classes([AllowAny])
def health_check(request):
    """Liveness probe used by Docker/load balancers and uptime monitoring."""
    return Response({"status": "ok", "service": "digital-nalanda-api"})
