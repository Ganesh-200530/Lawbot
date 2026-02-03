import google.generativeai as genai
import os
from dotenv import load_dotenv

load_dotenv()

API_KEY = os.getenv("GEMINI_API_KEY")

if API_KEY:
    genai.configure(api_key=API_KEY)

def generate_plain_language_explanation(legal_context, user_question, language="English", user_location=None):
    """
    Generates a simple explanation using Gemini.
    """
    if not API_KEY:
        return "Error: Gemini API Key not configured."

    # Using a model that is confirmed to be in the user's available list
    try:
        model = genai.GenerativeModel('gemini-2.0-flash')
    except:
        try:
             model = genai.GenerativeModel('gemini-1.5-flash')
        except:
             model = genai.GenerativeModel('gemini-pro')
    
    prompt = f"""
    You are LAWBOT, a helpful legal assistant for Indian citizens.
    
    Context (Retrieved Case Law - use ONLY if directly relevant):
    {legal_context}

    User Question: {user_question}
    User Location: {user_location}
    Target Language: {language}

    Task:
    1. Provide practical legal guidance based on Indian Law (Acts, Sections, Constitutional Articles).
    2. Focus on "What to do" (Actionable steps) and "How to do it" (Procedure).
    3. Mention the specific Acts/Laws applicable in {user_location}.
    4. Important: If the provided 'Context' is not directly relevant to the specific question, IGNORE IT. Do not mention "I don't have cases" or "The cases provided...". Instead, rely on your general knowledge of Indian Law.
    5. Do not list irrelevant case names.

    Output Format:
    Section 1: Guidance
    [Your response here. Structure with headings like "**Legal Rights**", "**Steps to Take**", "**Relevant Acts**".]

    Section 2: Recommended Lawyers
    [Your specific lawyer search suggestions here]
    
    Disclaimer: Start guidance with a clear statement that this is information, not legal advice.
    """

    try:
        response = model.generate_content(prompt)
        text = response.text
        
        parts = text.split("Section 2:")
        guidance = parts[0].replace("Section 1:", "").strip()
        lawyers = parts[1].strip() if len(parts) > 1 else "Consult a civil or criminal lawyer based on the case."
        
        return guidance, lawyers
    except Exception as e:
        return f"Error generating response: {str(e)}", "N/A"

def analyze_document_with_gemini(doc_text, user_question, location="India", language="English"):
    if not API_KEY:
        return "Error: Gemini API Key not configured.", "Check configuration."

    try:
         model = genai.GenerativeModel('gemini-2.0-flash')
    except:
         try:
             model = genai.GenerativeModel('gemini-1.5-flash')
         except:
             model = genai.GenerativeModel('gemini-pro')

    prompt = f"""
    You are LAWBOT, an expert legal AI.
    
    Task 1: Analyze the provided legal document text and the user's question.
    Task 2: Provide specific legal guidance based on the document.
    Task 3: Suggest 3 generic search queries or types of lawyers the user should look for in {location} for this specific case (e.g. "Divorce lawyers in Bangalore", "Property dispute attorneys in Delhi").
    
    Document Text:
    {doc_text[:10000]}  # Limit text to avoid token limits if necessary

    User Question: {user_question}
    Location: {location}
    Language: {language}

    Output Format:
    Section 1: Analysis & Guidance
    [Your analysis here]

    Section 2: Recommended Lawyer Types (Search Suggestions)
    [Your suggestions here]
    """
    
    try:
        response = model.generate_content(prompt)
        text = response.text
        
        # Naive split for the PDF generation (Production would use structure)
        # We assume Gemini follows the Section headers roughly
        parts = text.split("Section 2:")
        guidance = parts[0].replace("Section 1:", "").strip()
        lawyers = parts[1].strip() if len(parts) > 1 else "Consult a general practitioner."
        
        return guidance, lawyers
        
    except Exception as e:
        return f"Error: {str(e)}", "N/A"

