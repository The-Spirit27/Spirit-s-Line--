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
def ask_aether(message, system_instruction, user_pseudo, role, is_creator=False):

    db_context = get_context_data(user_pseudo)

    role_tag = (
        "[ROOT]" if is_creator
        else "[CLIENT]" if role == "CLIENT"
        else "[GUEST]"
    )

    prompt = f"""
{system_instruction}

USER_ROLE: {role_tag}
USER_NAME: {user_pseudo}

DATA:
{db_context}

MESSAGE:
{message}
"""

    models_to_try = [
        "models/gemini-2.0-flash",
        "models/gemini-1.5-flash",
        "models/gemma-3-4b-it"
    ]

    for model_name in models_to_try:

        try:
            print(f"Tentative avec {model_name}")

            response = client_gemini.models.generate_content(
                model=model_name,
                contents=prompt
            )

            if hasattr(response, "text") and response.text:
                return response.text

        except Exception as e:
            print(f"Erreur avec {model_name}: {e}")

    return "⚠️ Tous les modèles IA sont indisponibles."