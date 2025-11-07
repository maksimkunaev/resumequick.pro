# feature_services/generate_resume/generate_resume_service.py

from .groq_service import llm_generate_resume


def generate_resume_from_input(input_data: dict) -> dict:
    """
    Generate resume data using LLM based on provided input.

    Args:
        input_data (dict): User input (e.g., experience, skills, etc.)

    Returns:
        dict: Generated resume data or empty structure if failed
    """
    print(input_data)

    try:
        resume_data = llm_generate_resume(input_data)

        is_empty = all(
            not value
            for value in resume_data.values()
            if not isinstance(value, list) or not value
        )

        if is_empty:
            return {
                "error": "empty_resume",
                "message": (
                    "We couldn't generate your resume. "
                    "Please provide more details about your experience and skills."
                ),
            }

        return {"resumeData": resume_data}

    except Exception as e:
        print(f"[ERROR] generate_resume_from_input: {e}")
        return {
            "error": "generation_failed",
            "message": (
                "Something went wrong while generating your resume. "
                "Please try again in a few moments."
            ),
        }
