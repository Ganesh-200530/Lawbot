from flask import Blueprint, request, jsonify
from flask_login import current_user, login_required
from werkzeug.utils import secure_filename
import os
from pypdf import PdfReader

from ..services.rag_service import rag_service
from ..services.gemini_service import generate_plain_language_explanation, analyze_document_with_gemini, generate_followup
from ..services.tts_service import text_to_speech
from ..services.pdf_service import generate_legal_pdf
from ..models import db, QueryHistory

chat_bp = Blueprint('chat', __name__)

ALLOWED_EXTENSIONS = {'txt', 'pdf'}

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

@chat_bp.route('/upload_and_analyze', methods=['POST'])
@login_required
def upload_analyze():
    if 'file' not in request.files:
        return jsonify({"error": "No file part"}), 400
    
    file = request.files['file']
    question = request.form.get('question', '')
    language = request.form.get('language', 'English')
    location_filter = request.form.get('location', '')
    
    if not location_filter and current_user.is_authenticated:
        location_filter = current_user.state

    if file.filename == '':
        return jsonify({"error": "No selected file"}), 400

    if file and allowed_file(file.filename):
        filename = secure_filename(file.filename)
        # Save temporally or read into memory
        # Reading into memory for simplicity
        text_content = ""
        
        try:
            if filename.endswith('.pdf'):
                reader = PdfReader(file)
                for page in reader.pages:
                    text_content += page.extract_text() + "\n"
            else:
                text_content = file.read().decode('utf-8')

            # Analyze
            guidance, lawyer_types, search_key = analyze_document_with_gemini(
                doc_text=text_content,
                user_question=question,
                location=location_filter,
                language=language,
                user_name=current_user.name if current_user.is_authenticated else "User"
            )
            
            # Reading first 500 chars for speed/demo
            audio_file = text_to_speech(guidance[:1000], lang=lang_code)

            # Save to Database History
            new_query = QueryHistory(
                user_id=current_user.id,
                question=question or "Document Analysis",
                response=guidance,
                lawyer_suggestions=lawyer_types,
                search_key=search_key
            )
            db.session.add(new_query)
            db.session.commit()

            return jsonify({
                "response": guidance,
                "lawyer_suggestions": lawyer_types,
                "search_key": search_key,
                "pdf_url": pdf_url, 
                "audio_url": f"/static/audio/{audio_file}" if audio_file else None
            })

        except Exception as e:
            return jsonify({"error": f"Processing failed: {str(e)}"}), 500

    return jsonify({"error": "Invalid file type"}), 400

@chat_bp.route('/query', methods=['POST'])
@login_required 
def query_lawbot():
    data = request.get_json()
    question = data.get('question')
    language = data.get('language', 'English')
    location_filter = data.get('location') # e.g. "Tamil Nadu"

    # If logged in, prioritize user's location if not provided
    if not location_filter and current_user.is_authenticated:
        location_filter = current_user.state

    if not question:
        return jsonify({"error": "Question is required"}), 400

    try:
        # 1. RAG Retrieval
        print(f"Retrieving docs for: {question}")
        retrieved_docs = rag_service.search(question)
        
        context_text = ""
        for doc in retrieved_docs:
            context_text += f"Case: {doc.get('case_name')}\nAnswer: {doc.get('answer')}\n\n"

        # 2. Gemini Generation
        print("calling Gemini...")
        explanation, lawyer_suggestions, search_key = generate_plain_language_explanation(
            legal_context=context_text,
            user_question=question,
            language=language,
            user_location=location_filter,
            user_name=current_user.name if current_user.is_authenticated else "User"
        )
        print("Gemini response received.")

        # 3. PDF Generation
        full_report = f"User Question: {question}\n\nRelated Cases:\n{context_text}\n\nGuidance:\n{explanation}"
        pdf_url = generate_legal_pdf(full_report, lawyer_suggestions)

        # 4. TTS (Optional)
        audio_file = None
        if data.get('audio_response', False):
            # Map languages to gTTS code, simplified
            lang_code = 'ta' if 'tamil' in language.lower() else 'en'
            audio_file = text_to_speech(explanation[:1000], lang=lang_code)

        # 5. Save to Database History
        new_query = QueryHistory(
            user_id=current_user.id,
            question=question,
            response=explanation,
            lawyer_suggestions=lawyer_suggestions,
            search_key=search_key
        )
        db.session.add(new_query)
        db.session.commit()

        return jsonify({
            "response": explanation,
            "lawyer_suggestions": lawyer_suggestions,
            "search_key": search_key,
            "pdf_url": pdf_url,
            "retrieved_cases": [d.get('case_name') for d in retrieved_docs],
            "audio_url": f"/static/audio/{audio_file}" if audio_file else None
        })

    except Exception as e:
        print(f"SERVER ERROR: {str(e)}")
        import traceback
        traceback.print_exc()
        return jsonify({"error": str(e)}), 500

@chat_bp.route('/history', methods=['GET'])
@login_required
def get_user_history():
    queries = QueryHistory.query.filter_by(user_id=current_user.id).order_by(QueryHistory.timestamp.desc()).all()
    return jsonify([q.to_dict() for q in queries])

@chat_bp.route('/followup', methods=['POST'])
@login_required
def followup_chat():
    data = request.get_json()
    history = data.get('history', [])
    question = data.get('question')
    language = data.get('language', 'English')
    
    if not question:
        return jsonify({"error": "Question is required"}), 400
        
    try:
        answer = generate_followup(history, question, language, user_name=current_user.name if current_user.is_authenticated else "User")
        return jsonify({"response": answer})
    except Exception as e:
        import traceback
        traceback.print_exc()
        return jsonify({"error": str(e)}), 500
