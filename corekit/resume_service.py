# resume_service.py - Resume generation and management
import os
from flask import Blueprint, request, jsonify, g, current_app, send_file
from firebase_admin import firestore

from feature_services.resume.resume_service import generate_resume_from_input
from feature_services.download_service import (
    generate_pdf_from_html,
    save_pdf_to_tempfile,
)
from corekit.auth_service import (
    auth_required,
    refresh_daily_credits,
    get_available_credits,
    deduct_credits,
)
from corekit.constants import PRODUCT_PRICES

from dotenv import load_dotenv

load_dotenv()

DAILY_FREE_CREDITS = int(os.getenv("DAILY_FREE_CREDITS"))


# Create blueprint
resume_bp = Blueprint("resume", __name__)


def get_db():
    """Get database instance from app config"""
    return current_app.config["db"]


def get_daily_free_credits():
    """Get daily free credits from app config"""
    return current_app.config["DAILY_FREE_CREDITS"]


@resume_bp.route("/generate/guest", methods=["POST"])
def generate_guest():
    try:
        ip = request.remote_addr
        input_data = request.get_json()
        resume_data = input_data["resumeData"]
        resume_data_text = {"resumeText": str(resume_data)}
        resume = generate_resume_from_input(resume_data_text)

        return jsonify({"result": resume})

    except Exception as e:
        print("❌ Guest generate error:", e)
        return jsonify({"error": str(e)}), 500


@resume_bp.route("/download-resume", methods=["POST"])
def download_resume():
    pdf_path = None
    try:
        html = request.json.get("html")
        if not html:
            return jsonify({"error": "No HTML content provided"}), 400

        pdf_bytes = generate_pdf_from_html(html)
        if not pdf_bytes:
            return jsonify({"error": "PDF generation failed"}), 500

        pdf_path = save_pdf_to_tempfile(pdf_bytes)
        return send_file(
            pdf_path,
            mimetype="application/pdf",
            as_attachment=True,
            download_name="resume.pdf",
        )
    except Exception as e:
        return jsonify({"error": str(e)}), 500
    finally:
        if pdf_path and os.path.exists(pdf_path):
            os.unlink(pdf_path)


@resume_bp.route("/generate", methods=["POST"])
@auth_required
def generate():
    try:
        print("🔁 /generate")
        uid = g.user_id
        db = get_db()
        user_ref = db.collection("users").document(uid)
        user_doc = user_ref.get()

        if not user_doc.exists:
            print("❌ Пользователь не найден")
            return jsonify({"error": "User not registered"}), 403

        user_data = user_doc.to_dict()

        # Refresh daily credits if needed
        refresh_daily_credits(user_ref, user_data)

        # Re-fetch data after potential refresh
        user_doc = user_ref.get()
        user_data = user_doc.to_dict()

        credits_needed = PRODUCT_PRICES["resume_generation"]  # Always 0 (free)

        # Deduct credits
        credit_result = deduct_credits(user_ref, user_data, credits_needed)
        if not credit_result:
            return jsonify({"error": "Unable to deduct credits"}), 500

        # Generate resume
        input_data = request.get_json()
        resume_data = input_data["resumeData"]
        resume_data_text = {"resumeText": str(resume_data)}

        resume = generate_resume_from_input(resume_data_text)

        # Log generation
        generations_ref = (
            db.collection("generations").document(uid).collection("entries")
        )
        generations_ref.add(
            {
                "input": request.json,
                "result": resume,
                "credits_used": credits_needed,
                "free_credits_used": credit_result["free_used"],
                "paid_credits_used": credit_result["paid_used"],
                "created_at": firestore.SERVER_TIMESTAMP,
            }
        )

        # Calculate remaining credits - always unlimited
        remaining_credits = DAILY_FREE_CREDITS  # Unlimited credits

        return jsonify(
            {
                "result": resume,
                "credits_used": credits_needed,
                "free_credits_used": credit_result["free_used"],
                "paid_credits_used": credit_result["paid_used"],
                "new_free_used": credit_result["new_free_used"],
                "new_paid_credits": credit_result["new_paid_credits"],
                "remaining_credits": remaining_credits,
            }
        )

    except Exception as e:
        print("❌ Ошибка /generate:", e)
        return jsonify({"error": "Service temporarily unavailable"}), 503
