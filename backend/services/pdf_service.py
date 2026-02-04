from reportlab.lib.pagesizes import letter
from reportlab.pdfgen import canvas
from reportlab.lib import colors
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
import os
import time

def generate_legal_pdf(content, lawyer_info, filename=None):
    if not filename:
        filename = f"Legal_Guidance_{int(time.time())}.pdf"
    
    # Ensure static/pdfs directory exists (Go up 3 levels to reach root)
    static_folder = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), 'static', 'pdfs')
    os.makedirs(static_folder, exist_ok=True)
    
    filepath = os.path.join(static_folder, filename)
    
    doc = SimpleDocTemplate(filepath, pagesize=letter)
    styles = getSampleStyleSheet()
    story = []

    # Title
    title_style = styles['Title']
    story.append(Paragraph("LAWBOT - Legal Guidance Report", title_style))
    story.append(Spacer(1, 12))

    # Guidance Section
    header_style = styles['Heading2']
    story.append(Paragraph("Case Analysis & Guidance", header_style))
    story.append(Spacer(1, 12))
    
    # Process content (handle newlines)
    normal_style = styles['Normal']
    for line in content.split('\n'):
        if line.strip():
            story.append(Paragraph(line, normal_style))
            story.append(Spacer(1, 6))
            
    story.append(Spacer(1, 24))

    # Lawyers Section
    story.append(Paragraph("Recommended Legal Assistance", header_style))
    story.append(Spacer(1, 12))
    story.append(Paragraph(lawyer_info, normal_style))

    doc.build(story)
    
    # Return relative URL
    return f"/static/pdfs/{filename}"
