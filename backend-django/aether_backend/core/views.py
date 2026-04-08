import os
from django.shortcuts import render
from supabase import create_client
from rest_framework.decorators import api_view
from rest_framework.response import Response

from .services.ai_service import ask_aether
from .context_data import get_system_prompt # Import indispensable

# Initialisation
supabase = create_client(os.getenv("SUPABASE_URL"), os.getenv("SUPABASE_ANON_KEY"))

def get_user_from_token(request):
    auth_header = request.headers.get('Authorization')
    if not auth_header or not auth_header.startswith('Bearer '): return None
    token = auth_header.split(' ')[1]
    try:
        user_response = supabase.auth.get_user(token)
        return user_response.user
    except: return None

@api_view(['POST'])
def aether_chat(request):
    message = request.data.get('message')
    sb_user = get_user_from_token(request)
    
    user_pseudo = "Invité"
    role = "INVITÉ"
    is_creator = False

    if sb_user:
        if sb_user.email == "thespirit411@gmail.com":
            is_creator = True
            user_pseudo = "The Spirit"
            role = "ROOT"
        
        try:
            res = supabase.table("utilisateur").select("*").eq("auth_id", sb_user.id).single().execute()
            if res.data:
                role = res.data.get('role_user', 'CLIENT')
                user_pseudo = res.data.get('pseudo_user', user_pseudo)
        except: pass

    # 1. ON RÉCUPÈRE LE SAVOIR INFORMATIQUE (Anti-spirituel)
    knowledge_base = get_system_prompt()

    # 2. ON APPELLE L'IA
    reply = ask_aether(message, knowledge_base, user_pseudo, role, is_creator)
    
    return Response({
        'reply': reply, 
        'status': role, 
        'pseudo': user_pseudo,
        'is_creator': is_creator
    })
# Ajoute ceci à la fin de core/views.py si c'est manquant :

def home(request):
    context = {
        "SUPABASE_URL": os.getenv("SUPABASE_URL"),
        "SUPABASE_ANON_KEY": os.getenv("SUPABASE_ANON_KEY"),
    }
    return render(request, 'home.html', context)

def aether_login_view(request):
    context = {
        "SUPABASE_URL": os.getenv("SUPABASE_URL"),
        "SUPABASE_ANON_KEY": os.getenv("SUPABASE_ANON_KEY"),
    }
    return render(request, 'aether_login.html', context)

def aether_register_view(request):
    return render(request, 'register.html')