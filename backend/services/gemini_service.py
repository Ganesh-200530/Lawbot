import google.generativeai as genai
import os
from dotenv import load_dotenv

load_dotenv()

API_KEY = os.getenv("GEMINI_API_KEY")

if API_KEY:
    genai.configure(api_key=API_KEY)

def _query_gemini_with_fallback(prompt, user_location="India"):
    candidate_models = [
        "gemini-2.5-flash",
        "gemini-2.0-flash",
        "gemini-flash-latest",
        "gemini-1.5-flash",
        "gemini-pro"
    ]

    for model_name in candidate_models:
        try:
            model = genai.GenerativeModel(model_name)
            response = model.generate_content(
                prompt,
                generation_config=genai.types.GenerationConfig(
                    temperature=0.2, # Keep it deterministic for translation
                    top_p=0.8
                )
            )
            text = response.text
            
            guidance = "Analysis not available."
            lawyers = "General Legal Counsel"
            search_key = f"Lawyers in {user_location}"

            try:
                parts = text.split("Section 2:")
                guidance = parts[0].replace("Section 1:", "").strip()
                
                rest = parts[1]
                if "Section 3:" in rest:
                    lawyer_parts = rest.split("Section 3:")
                    lawyers = lawyer_parts[0].strip()
                    search_key = lawyer_parts[1].strip()
                else:
                    lawyers = rest.strip()
            except:
                guidance = text

            return guidance, lawyers, search_key

        except Exception as e:
            print(f"Model {model_name} failed: {e}")
            continue

    return "Error: Could not generate response with any available model.", "N/A", "Lawyers in India"

def generate_plain_language_explanation(legal_context, user_question, language="English", user_location=None):
    if not API_KEY:
        return "Error: Gemini API Key not configured.", "N/A", "Lawyers in India"

    prompt = f"""
    You are LAWBOT, a helpful legal assistant for Indian citizens.
    
    Context (Retrieved Case Law):
    {legal_context}

    User Question: {user_question}
    User Location: {user_location}
    Target Language: {language}

    Task:
    1. Provide practical legal guidance based on Indian Law.
    2. Focus on actionable steps and procedure.
    3. Mention specific Acts/Laws applicable in {user_location}.
    4. Ignore context if irrelevant.

    Output Format:
    Section 1: Guidance
    [Your response here]

    Section 2: Recommended Lawyers
    [Brief text search suggestions]

    Section 3: Search Key
    [A single optimized search query string for Google]
    """

    return _query_gemini_with_fallback(prompt, user_location)

def analyze_document_with_gemini(doc_text, user_question, location="India", language="English"):
    if not API_KEY:
        return "Error: Gemini API Key not configured.", "Check configuration.", "Lawyers in India"

    prompt = f"""
    You are LAWBOT, an expert legal AI.
    
    Task 1: Analyze the provided legal document text and the user's question.
    Task 2: Provide specific legal guidance.
    Task 3: Suggest 3 generic search queries for lawyers in {location}.
    
    Document Text:
    {doc_text[:10000]}

    User Question: {user_question}
    Location: {location}
    Language: {language}

    Output Format:
    Section 1: Analysis & Guidance
    [Your analysis here]

    Section 2: Recommended Lawyer Types (Search Suggestions)
    [Your suggestions here]

    Section 3: Search Key
    [A single optimized search query string]
    """
    
    return _query_gemini_with_fallback(prompt, location)
