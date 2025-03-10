from fpdf import FPDF

def create_test_resume():
    pdf = FPDF()
    pdf.add_page()
    pdf.set_font("Arial", size=12)
    
    # Add sample content
    content = """
    John Doe
    Software Engineer
    
    Experience:
    5 years of experience in software development
    
    Skills:
    Python, JavaScript, React.js, Node.js
    AWS, Docker, Kubernetes
    SQL, MongoDB
    
    Education:
    Bachelor's in Computer Science
    """
    
    pdf.multi_cell(0, 10, content)
    pdf.output("data/resumes/test_resume.pdf")

if __name__ == "__main__":
    create_test_resume() 