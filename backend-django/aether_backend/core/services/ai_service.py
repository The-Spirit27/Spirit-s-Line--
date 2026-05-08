import os
from google import genai
from supabase import create_client, Client
from dotenv import load_dotenv

load_dotenv()

# Clients
client_gemini = genai.Client(api_key=os.getenv("GEMINI_API_KEY"))
supabase: Client = create_client(os.getenv("SUPABASE_URL"), os.getenv("SUPABASE_ANON_KEY"))

def get_context_data(user_pseudo=None):
    """Construit un contexte optimisé pour AÉTHER"""

    context_lines = []
    context_lines.append("[DONNÉES TEMPS RÉEL SPL]")

    # =========================
    # SERVICES / OUTILS
    # =========================
    try:

        outils = (
            supabase.table("outils")
            .select("nom_outil, categorie, prix")
            .limit(5)
            .execute()
        )

        if outils.data:

            context_lines.append("\nServices disponibles :")

            for outil in outils.data:

                nom = outil.get("nom_outil", "Service")
                categorie = outil.get("categorie", "Général")
                prix = outil.get("prix", "Non défini")

                context_lines.append(
                    f"- {nom} | Catégorie : {categorie} | Prix : {prix} FCFA"
                )

    except Exception as e:
        print("Erreur outils :", e)

    # =========================
    # REQUÊTES UTILISATEUR
    # =========================
    if user_pseudo and user_pseudo != "Invité":

        try:

            user = (
                supabase.table("utilisateur")
                .select("mat_user")
                .eq("pseudo_user", user_pseudo)
                .single()
                .execute()
            )

            if user.data:

                mat_user = user.data["mat_user"]

                compte = (
                    supabase.table("compte")
                    .select("num_cpt")
                    .eq("mat_user", mat_user)
                    .single()
                    .execute()
                )

                if compte.data:

                    reqs = (
                        supabase.table("requete")
                        .select("nom_rqt, status")
                        .eq("num_cpt", compte.data["num_cpt"])
                        .limit(3)
                        .execute()
                    )

                    if reqs.data:

                        context_lines.append(
                            f"\nRequêtes actives de {user_pseudo} :"
                        )

                        for req in reqs.data:

                            nom = req.get("nom_rqt", "Requête")
                            status = req.get("status", "Inconnu")

                            context_lines.append(
                                f"- {nom} | Statut : {status}"
                            )

        except Exception as e:
            print("Erreur requêtes utilisateur :", e)

    return "\n".join(context_lines)
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
        "gemini-2.5-flash",
        "gemini-2.0-flash",
        "gemini-1.5-flash"
    ]

    for model_name in models_to_try:

        try:
            print(f"Tentative avec : {model_name}")

            response = client_gemini.models.generate_content(
                model=model_name,
                contents=[
                    {
                        "role": "user",
                        "parts": [
                            {"text": prompt}
                        ]
                    }
                ]
            )

            print("Réponse brute :", response)

            # Vérification robuste
            if (
                hasattr(response, "candidates")
                and response.candidates
            ):

                candidate = response.candidates[0]

                if (
                    hasattr(candidate, "content")
                    and candidate.content.parts
                ):

                    text = candidate.content.parts[0].text

                    if text:
                        return text

        except Exception as e:
            import traceback

            print(f"Erreur avec {model_name}:")
            traceback.print_exc()

    return "⚠️ Tous les modèles IA sont indisponibles."