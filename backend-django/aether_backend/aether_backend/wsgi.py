import os
from django.core.wsgi import get_wsgi_application

# ✅ mettre le chemin complet
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'aether_backend.aether_backend.settings')

application = get_wsgi_application()