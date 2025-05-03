# PowerShell script to update requirements.txt

$requirements = @"
# Core ML & NLP libraries
tensorflow==2.13.0
numpy>=1.22.0
scikit-learn>=1.0.2
nltk>=3.7
spacy>=3.5.0
textblob>=0.17.1
python-docx>=0.8.11
PyPDF2>=2.10.0
pdfminer.six>=20221105

# ML serving dependencies
flask>=2.2.3
flask-cors>=3.0.10
gunicorn>=20.1.0
Werkzeug>=2.2.3

# System utilities
python-dotenv>=0.21.0
requests>=2.28.2
tqdm>=4.64.1
psutil>=5.9.4

# Performance optimization
cython>=0.29.33
joblib>=1.2.0

# Monitoring and logging
prometheus-client>=0.16.0
sentry-sdk>=1.17.0
"@

# Write to requirements.txt file
$requirements | Out-File -FilePath "requirements.txt" -Encoding utf8
Write-Host "requirements.txt has been updated successfully." 