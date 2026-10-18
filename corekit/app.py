import os
from flask import Flask, jsonify, request, send_from_directory
from flask_cors import CORS
import firebase_admin
from firebase_admin import credentials, firestore
from dotenv import load_dotenv

from corekit.auth_service import auth_bp
from corekit.resume_service import resume_bp
from corekit.ats_service import ats_bp

load_dotenv()

DAILY_FREE_CREDITS = int(os.getenv("DAILY_FREE_CREDITS"))
PORT = int(os.getenv("PORT"))

# ✅ Init Firebase Admin SDK
# Service account key path can be configured via FIREBASE_SERVICE_ACCOUNT_KEY env var
# Defaults to "serviceAccountKey.json" in the project root
service_account_key_path = os.getenv(
    "FIREBASE_SERVICE_ACCOUNT_KEY", "serviceAccountKey.json"
)
cred = credentials.Certificate(service_account_key_path)
firebase_admin.initialize_app(cred)

# ✅ Firestore through Admin SDK
db = firestore.client()

# ✅ Flask + CORS
STATIC_FOLDER = os.getenv("STATIC_FOLDER", "")
STATIC_URL_PATH = os.getenv("STATIC_URL_PATH", "/")
SECOND_STATIC_FOLDER = os.getenv("SECOND_STATIC_FOLDER", "")

app = Flask(__name__, static_folder=STATIC_FOLDER, static_url_path=STATIC_URL_PATH)

CORS(app)

# Register blueprints
app.register_blueprint(auth_bp)
app.register_blueprint(resume_bp)
app.register_blueprint(ats_bp)

# Make db and constants available to other modules
app.config["db"] = db
app.config["DAILY_FREE_CREDITS"] = DAILY_FREE_CREDITS


# ✅ Add explicit routes for legal documents
@app.route("/privacy_policy.html")
def privacy_policy():
    return send_from_directory(SECOND_STATIC_FOLDER, "privacy_policy.html")


@app.route("/refund_policy.html")
def refund_policy():
    return send_from_directory(SECOND_STATIC_FOLDER, "refund_policy.html")


@app.route("/terms.html")
def terms():
    return send_from_directory(SECOND_STATIC_FOLDER, "terms.html")


# ✅ Alternative: Generic route for static files from second folder
@app.route("/<path:filename>")
def serve_static_files(filename):
    # Check if file exists in second static folder first
    if SECOND_STATIC_FOLDER and os.path.exists(
        os.path.join(SECOND_STATIC_FOLDER, filename)
    ):
        return send_from_directory(SECOND_STATIC_FOLDER, filename)

    # Check if file exists in main static folder
    if STATIC_FOLDER and os.path.exists(os.path.join(STATIC_FOLDER, filename)):
        return send_from_directory(STATIC_FOLDER, filename)

    # If not found, fall back to SPA routing
    return app.send_static_file("index.html")


@app.route("/")
def serve_index():
    return app.send_static_file("index.html")


@app.errorhandler(404)
def not_found(e):
    # Only return JSON error for API routes
    if request.path.startswith("/api"):
        return jsonify({"error": "API endpoint not found"}), 404

    # For all other routes, try to serve index.html for SPA routing
    return app.send_static_file("index.html")


if __name__ == "__main__":
    app.run(debug=os.getenv("FLASK_DEBUG") == "1", port=PORT)
