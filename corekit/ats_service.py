# ats_service.py - ATS score evaluation service
from flask import Blueprint, request, jsonify

from feature_services.ats.main import calculate_ats_score

ats_bp = Blueprint("ats", __name__)


@ats_bp.route("/ats-evaluate", methods=["POST"])
def evaluate_ats():
    try:
        data = request.json
        resume_text = data.get("resumeText", "")
        job_description = data.get("jobDescription", "")

        if not resume_text or not job_description:
            return (
                jsonify({"error": "Both resume text and job description are required"}),
                400,
            )

        ats_anlysis = calculate_ats_score(resume_text, job_description)

        ats_score = ats_anlysis["ats_score"]
        matched_skills = ats_anlysis["matched_skills"]
        missing_skills = ats_anlysis["missing_skills"]

        return jsonify(
            {
                "ats_score": ats_score,
                "matched_skills": matched_skills,
                "missing_skills": missing_skills,
            }
        )

    except Exception as e:
        return jsonify({"error": str(e)}), 500
