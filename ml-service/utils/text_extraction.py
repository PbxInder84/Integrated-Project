"""
Text extraction utilities for different file formats.
Supports PDF, DOCX, and DOC formats.
"""

import os
import logging
import pdfplumber
import docx
from docx import Document
import re
import subprocess
import tempfile

# Initialize logger
logger = logging.getLogger(__name__)

def extract_text_from_file(file_path):
    """
    Extract text from a file based on its extension.
    
    Args:
        file_path (str): Path to the file
        
    Returns:
        str: Extracted text
    
    Raises:
        ValueError: If file format is not supported
    """
    _, file_extension = os.path.splitext(file_path)
    file_extension = file_extension.lower()
    
    if file_extension == '.pdf':
        return extract_text_from_pdf(file_path)
    elif file_extension == '.docx':
        return extract_text_from_docx(file_path)
    elif file_extension == '.doc':
        return extract_text_from_doc(file_path)
    elif file_extension == '.txt':
        return extract_text_from_txt(file_path)
    else:
        # For testing purposes, try to read as text if it's not a recognized format
        try:
            return extract_text_from_txt(file_path)
        except:
            raise ValueError(f"Unsupported file format: {file_extension}")

def extract_text_from_pdf(pdf_path):
    """
    Extract text from PDF file with enhanced error handling.
    Tries multiple methods if one fails.
    
    Args:
        pdf_path (str): Path to the PDF file
        
    Returns:
        str: Extracted text
    """
    text = ""
    
    # Method 1: Using pdfplumber (primary method)
    try:
        logger.info(f"Extracting text from PDF using pdfplumber: {pdf_path}")
        with pdfplumber.open(pdf_path) as pdf:
            for page in pdf.pages:
                page_text = page.extract_text() or ""
                text += page_text + "\n\n"
    except Exception as e:
        logger.warning(f"pdfplumber extraction failed: {str(e)}, trying alternative methods")
    
    # If primary method returned some text, clean it and return
    if text.strip():
        return clean_extracted_text(text)
    
    # Method 2: Try using OCR if text extraction fails (implement if needed)
    # This would require additional dependencies like pytesseract
    
    return clean_extracted_text(text)

def extract_text_from_docx(docx_path):
    """
    Extract text from DOCX file with improved structure preservation.
    
    Args:
        docx_path (str): Path to the DOCX file
        
    Returns:
        str: Extracted text
    """
    try:
        logger.info(f"Extracting text from DOCX: {docx_path}")
        doc = Document(docx_path)
        
        # Get full text with better paragraph and line breaks
        full_text = []
        
        # Process paragraphs
        for para in doc.paragraphs:
            if para.text.strip():
                full_text.append(para.text)
        
        # Process tables
        for table in doc.tables:
            for row in table.rows:
                row_text = []
                for cell in row.cells:
                    if cell.text.strip():
                        row_text.append(cell.text.strip())
                if row_text:
                    full_text.append(" | ".join(row_text))
        
        text = "\n\n".join(full_text)
        return clean_extracted_text(text)
    
    except Exception as e:
        logger.error(f"Error extracting text from DOCX: {str(e)}")
        return ""

def extract_text_from_doc(doc_path):
    """
    Extract text from DOC file by first converting to DOCX.
    Falls back to other methods if conversion fails.
    
    Args:
        doc_path (str): Path to the DOC file
        
    Returns:
        str: Extracted text
    """
    try:
        logger.info(f"Extracting text from DOC: {doc_path}")
        
        # For Windows environments, try to use a direct approach
        try:
            # First try with python-docx if it works
            doc = Document(doc_path)
            paragraphs = [p.text for p in doc.paragraphs if p.text.strip()]
            text = "\n\n".join(paragraphs)
            if text.strip():
                return clean_extracted_text(text)
        except Exception as e:
            logger.warning(f"Direct DOC reading failed: {str(e)}")
        
        # If we have antiword installed, use it (Unix systems)
        try:
            text = subprocess.check_output(['antiword', doc_path]).decode('utf-8', errors='ignore')
            if text.strip():
                return clean_extracted_text(text)
        except (subprocess.SubprocessError, FileNotFoundError) as e:
            logger.warning(f"Antiword extraction failed: {str(e)}")
        
        # As a last resort, try a simple text extraction
        with open(doc_path, 'rb') as f:
            content = f.read()
            # Extract text from binary content - very crude, but better than nothing
            printable_chars = re.findall(b'[ -~\n\r\t]+', content)
            extracted_text = b''.join(printable_chars).decode('utf-8', errors='ignore')
            return clean_extracted_text(extracted_text)
    
    except Exception as e:
        logger.error(f"All DOC extraction methods failed: {str(e)}")
        return ""

def extract_text_from_txt(txt_path):
    """
    Extract text from a plain text file.
    
    Args:
        txt_path (str): Path to the text file
        
    Returns:
        str: Extracted text
    """
    try:
        logger.info(f"Extracting text from TXT file: {txt_path}")
        with open(txt_path, 'r', encoding='utf-8', errors='ignore') as f:
            text = f.read()
        return clean_extracted_text(text)
    except Exception as e:
        logger.error(f"Error extracting text from TXT file: {str(e)}")
        # Try binary mode if text mode fails
        with open(txt_path, 'rb') as f:
            content = f.read()
            text = content.decode('utf-8', errors='ignore')
        return clean_extracted_text(text)

def clean_extracted_text(text):
    """
    Clean extracted text by:
    - Removing excessive whitespace
    - Standardizing line breaks
    - Removing special characters that may interfere with processing
    
    Args:
        text (str): Raw extracted text
        
    Returns:
        str: Cleaned text
    """
    if not text:
        return ""
    
    # Replace multiple spaces with a single space
    text = re.sub(r' +', ' ', text)
    
    # Replace multiple newlines with double newlines to preserve paragraphs
    text = re.sub(r'\n{3,}', '\n\n', text)
    
    # Remove non-printable characters
    text = re.sub(r'[^\x20-\x7E\n\r\t]', '', text)
    
    # Fix common PDF extraction artifacts
    text = re.sub(r'([a-z])- ([a-z])', r'\1\2', text)  # Fix hyphenation
    
    return text.strip() 