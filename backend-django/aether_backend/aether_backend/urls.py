from django.contrib import admin
from django.urls import path
# On importe les nouvelles vues dédiées à AÉTHER
from core.views import home, aether_chat, aether_login_view, aether_register_view 

urlpatterns = [
    path('admin/', admin.site.urls),
    path('', home, name='home'),
    
    # Routes dédiées à l'authentification AÉTHER
    path('login/', aether_login_view, name='login'),

    
    # API
    path('api/aether/', aether_chat, name='aether_chat'),
]