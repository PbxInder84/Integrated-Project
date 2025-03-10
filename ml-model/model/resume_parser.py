import pdfminer.high_level
import docx2txt

def extract_text(file):
    """Extract text from PDF or DOCX resume."""
    file_path = "temp_resume" + (".pdf" if file.filename.endswith(".pdf") else ".docx")
    file.save(file_path)

    try:
        if file.filename.endswith('.pdf'):
            text = pdfminer.high_level.extract_text(file_path)
        else:
            text = docx2txt.process(file_path)
    except Exception as e:
        return f"Error extracting text: {str(e)}"

    return text.strip()
