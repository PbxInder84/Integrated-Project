import nltk

def download_nltk_resources():
    print("Downloading required NLTK resources...")
    resources = [
        'punkt',
        'punkt_tab',
        'averaged_perceptron_tagger',
        'maxent_ne_chunker',
        'words',
        'stopwords'
    ]
    
    for resource in resources:
        try:
            nltk.download(resource, quiet=True)
            print(f"Successfully downloaded {resource}")
        except Exception as e:
            print(f"Error downloading {resource}: {str(e)}")

    # Verify punkt_tab installation
    try:
        nltk.data.find('tokenizers/punkt_tab/english.pickle')
        print("punkt_tab verification successful")
    except LookupError:
        print("Manual punkt_tab download required")
        nltk.download('punkt_tab')

if __name__ == "__main__":
    download_nltk_resources() 