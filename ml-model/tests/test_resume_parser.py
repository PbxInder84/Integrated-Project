import unittest
from model.resume_parser import extract_text

class TestResumeParser(unittest.TestCase):
    def test_pdf_parsing(self):
        text = extract_text("sample_resume.pdf")
        self.assertTrue(len(text) > 0)

    def test_docx_parsing(self):
        text = extract_text("sample_resume.docx")
        self.assertTrue(len(text) > 0)

if __name__ == '__main__':
    unittest.main()
