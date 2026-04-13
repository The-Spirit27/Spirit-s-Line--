import os
from google import genai
from supabase import create_client, Client
from dotenv import load_dotenv

# Importation des données et fonctions de context_data.py
from context_data import (
    AETHER_KNOWLEDGE,
    SPL_SERVICES,
    get_system_prompt,
    detect_intent,
    build_final_prompt
)

# --- Initialisation des clients ---
load_dotenv()
client_gemini = genai.Client(api_key=os.getenv("GEMINI_API_KEY"))
supabase: Client = create_client(os.getenv("SUPABASE_URL"), os.getenv("SUPABASE_ANON_KEY"))

# --- Contexte dynamique depuis la BDD ---
def get_context_data(user_pseudo=None):
    context_str = "\n[DONNÉES TEMPS RÉEL SPL] :\n"
    try:
        outils = supabase.table("outils").select("nom_outil, categorie, prix, description").execute()
        if outils.data:
            context_str += "- Outils disponibles : " + str(outils.data) + "\n"
    except Exception as e:
        print(f"Erreur Supabase (Outils): {e}")

    if user_pseudo and user_pseudo != "Invité":
        try:
            user = supabase.table("utilisateur").select("mat_user").eq("pseudo_user", user_pseudo).single().execute()
            if user.data:
                mat_user = user.data['mat_user']
                compte = supabase.table("compte").select("num_cpt").eq("mat_user", mat_user).single().execute()
                if compte.data:
                    reqs = supabase.table("requete").select("nom_rqt, status, progress").eq("num_cpt", compte.data['num_cpt']).execute()
                    if reqs.data:
                        context_str += f"- Requêtes en cours ({user_pseudo}) : {str(reqs.data)}\n"
        except Exception as e:
            print(f"Erreur Supabase (User Context): {e}")

    return context_str

# --- Fonction principale ---
def ask_aether(message, user_pseudo="Invité", role="GUEST", is_creator=False):
    # Génération du prompt système via context_data
    system_instruction = build_final_prompt(message, is_creator)

    # Contexte BDD
    db_context = get_context_data(user_pseudo)

    # Rôle
    role_tag = "[ROOT]" if is_creator else f"[{role}]"

    # Prompt final
    prompt = (
        f"{system_instruction}\n\n"
        f"USER_ROLE: {role_tag}\n"
        f"USER_NAME: {user_pseudo}\n\n"
        f"DATA:\n{db_context}\n\n"
        f"MESSAGE: {message}"
    )

    # Envoi vers Gemini (fallback Gemma)
    try:
        response = client_gemini.models.generate_content(
            model="gemini-1.5-flash",
            contents=prompt
        )
        return response.text
    except Exception as e:
        print(f"⚠️ Échec Gemini: {e}")
        try:
            response = client_gemini.models.generate_content(
                model="gemma-3-4b-it",
                contents=prompt
            )
            return response.text
        except Exception as e2:
            return f"❌ Erreur critique : {e2}"