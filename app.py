"""Optional local Flask host for the same static files deployed to Pages."""
from pathlib import Path
from flask import Flask, send_from_directory

DEMO = Path(__file__).resolve().parent / "demo"
app = Flask(__name__, static_folder=str(DEMO), static_url_path="")

@app.get("/")
def home():
    return send_from_directory(DEMO, "index.html")

if __name__ == "__main__":
    app.run(host="127.0.0.1", debug=False)
