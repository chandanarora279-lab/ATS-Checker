import sys

from resumechecker.analyzer import extract_text_from_pdf

if __name__ == "__main__":
    path = sys.argv[1] if len(sys.argv) > 1 else "python_developer@pwc_chandan (1).pdf"
    print(extract_text_from_pdf(path))
