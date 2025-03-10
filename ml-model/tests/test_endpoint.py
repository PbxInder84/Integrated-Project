# test_endpoint.py  
import requests
import os
import sys
from pdfminer.high_level import extract_text

def test_ml_endpoint():
    try:
        # Test if ML service is running
        health_check_url = 'http://localhost:5001/models/status'
        try:
            health_response = requests.get(health_check_url)
            print(f"ML Service Status: {health_response.json()}")
        except requests.ConnectionError:
            print("Error: ML service is not running! Please start the ML service first.")
            print("Run 'python main.py' in the ml-model directory")
            return

        # Test resume analysis endpoint
        url = 'http://localhost:5001/analyze'
        
        test_resume_path = os.path.join(os.path.dirname(os.path.dirname(__file__)), 
                                      "data", "resumes", "test_resume.pdf")
        
        if not os.path.exists(test_resume_path):
            print(f"Error: Test resume not found at {test_resume_path}")
            return

        print(f"\nTesting with resume: {test_resume_path}")
        
        # Extract and print PDF contents using pdfminer
        try:
            pdf_text = extract_text(test_resume_path)
            print("\nFile contents:")
            print(pdf_text)
        except Exception as e:
            print(f"Error reading PDF: {str(e)}")
            
        files = {'resume': open(test_resume_path, 'rb')}
        print("\nSending request to ML endpoint...")
        
        response = requests.post(url, files=files)
        
        print("\nResponse Details:")
        print(f"Status Code: {response.status_code}")
        print("Response Content:", response.json())
        
    except Exception as e:
        print(f"\nError occurred: {str(e)}")
        print("\nDebug Information:")
        print(f"Python version: {sys.version}")
        print(f"Working directory: {os.getcwd()}")

if __name__ == "__main__":
    print("Starting ML endpoint test...")
    test_ml_endpoint()