import os
from google import genai
from supabase import create_client, Client
from dotenv import load_dotenv

load_dotenv()

# Clients
client_gemini = genai.Client(api_key=os.getenv("GEMINI_API_KEY"))
supabase: Client = create_client(os.getenv("SUPABASE_URL"), os.getenv("SUPABASE_ANON_KEY"))

def get_context_data(user_pseudo=None):
    """Récupère les infos pertinentes de la BDD pour nourrir l'IA"""
    context_str = "\n[DONNÉES TEMPS RÉEL SPL] :\n"
    
    # 1. Liste des outils/services
    outils = supabase.table("outils").select("nom_outil, categorie, prix, description").execute()
    if outils.data:
        context_str += "- Outils disponibles : " + str(outils.data) + "\n"

    # 2. Requêtes de l'utilisateur
    if user_pseudo and user_pseudo != "Invité":
        try:
            user = supabase.table("utilisateur").select("mat_user").eq("pseudo_user", user_pseudo).single().execute()
            if user.data:
                mat_user = user.data['mat_user']
                compte = supabase.table("compte").select("num_cpt").eq("mat_user", mat_user).single().execute()
                if compte.data:
                    reqs = supabase.table("requete").select("nom_rqt, status, progress").eq("num_cpt", compte.data['num_cpt']).execute()
                    if reqs.data:
                        context_str += f"- Tes requêtes en cours ({user_pseudo}) : " + str(reqs.data) + "\n"
        except Exception:
            pass

    return context_str

from context_data import build_final_prompt

def ask_aether(message, user_pseudo="Invité", role="GUEST", is_creator=False):
    # 1. Génération automatique de l’instruction système
    system_instruction = build_final_prompt(message, is_creator)

    # 2. Contexte BDD
    db_context = get_context_data(user_pseudo)

    # 3. Définition du rôle
    role_tag = "[ROOT]" if is_creator else "[CLIENT]" if role == "CLIENT" else "[GUEST]"

    # 4. Construction du prompt final
    prompt = (
        f"{system_instruction}\n\n"
        f"USER_ROLE: {role_tag}\n"
        f"USER_NAME: {user_pseudo}\n\n"
        f"DATA:\n{db_context}\n\n"
        f"MESSAGE: {message}"
    )

    # 5. Envoi vers Gemini (avec fallback Gemma)
    try:
        response = client_gemini.models.generate_content(
            model="gemini-1.5-flash",
            contents=prompt
        )
        return response.text
    except Exception as e:
        print(f"⚠️ Échec Gemini: {e}")
        try:
            print("🔄 Tentative de repli sur Gemma 3 4B...")
            response = client_gemini.models.generate_content(
                model="gemma-3-4b-it",
                contents=prompt
            )
            return response.text
        except Exception as e2:
            return f"❌ Erreur système critique : {e2}"