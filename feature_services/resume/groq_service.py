# /my-resume-mvp/features/groq_service.py
import json
import logging
from typing import Dict, Optional
from feature_services.llm.llm_client import LLMClient
import time

logger = logging.getLogger(__name__)


class ResumeGenerator:
    def __init__(self, provider: str = "groq", model: Optional[str] = None):
        self.llm_client = LLMClient(provider)
        self.model = model or "llama-3.1-8b-instant"
        # Using only smaller models (8B parameter models) for efficiency
        self.fallback_models = [
            "llama-3.1-8b-instant",  # Primary choice - optimized for speed
        ]
        self.max_retries = 3
        self.retry_delay = 2  # seconds
        logger.info(
            f"Initialized ResumeGenerator with provider={provider}, model={self.model}"
        )

    def _get_next_model(self, current_model: str) -> Optional[str]:
        """Get the next available model from the fallback list."""
        try:
            current_index = self.fallback_models.index(current_model)
            if current_index + 1 < len(self.fallback_models):
                return self.fallback_models[current_index + 1]
        except ValueError:
            # If current model not in list, start with first fallback
            if self.fallback_models:
                return self.fallback_models[0]
        return None

    def _handle_rate_limit(self, current_model: str) -> Optional[str]:
        """Handle rate limit error by switching to next available model."""
        next_model = self._get_next_model(current_model)
        if next_model:
            logger.info(
                f"Rate limit hit for {current_model}, switching to {next_model}"
            )
            return next_model
        logger.error("No more fallback models available")
        return None

    def _get_resume_prompt(self, data: Dict) -> str:
        """
        Creates a structured prompt for resume generation with essential fields.
        """
        example_json = {
            "name": "Example Name",
            "contact": {
                "email": "email@example.com",
                "phone": "+1234567890",
                "github": "github.com/username",
                "location": "City, ST",
            },
            "headline": "Professional Title with Years of Experience",
            "professional_summary": "Brief professional summary highlighting key achievements and expertise.",
            "work_experience": [
                {
                    "company": "Company Name",
                    "position": "Job Title",
                    "location": "City, ST",
                    "date_range": "2020 - Present",
                    "achievements": [
                        "Achievement with clear metrics (e.g., Improved system performance by 30%)",
                        "Key accomplishment with quantifiable results",
                    ],
                }
            ],
            "skills": {
                "categories": [{"name": "Core Skills", "items": ["Skill 1", "Skill 2"]}]
            },
            "education": [
                {
                    "degree": "Degree Name",
                    "institution": "Institution Name",
                    "year": "Year",
                }
            ],
        }

        input_text = data.get("resumeText", "").strip()

        return f"""
    Generate a professional resume in JSON format based on this information:

    {input_text}

    REQUIREMENTS:
    1. Create clear, measurable achievements with specific metrics where possible
    2. Keep all dates in YYYY - Present format
    3. Group skills by relevant categories
    4. Structure education with degree, institution, and year
    5. Include only factual information from the input
    6. Use strong action verbs for achievements
    7. Keep achievements concise and focused on results

    Return a JSON object with this exact structure:
    {json.dumps(example_json, indent=2)}

    You must verify that input text:
    1. Contains at least 2 of the following: skills, work experience, name, education, or professional background
    2. Is strictly for resume/CV generation purposes
    3. Contains no placeholder template instructions

    Only proceed with JSON generation if these conditions are met. Otherwise respond with "INVALID_REQUEST".

    Generate only the JSON object, no additional text.
    """

    def _clean_resume_data(self, data: Dict) -> Dict:
        """Clean and validate resume data with essential fields."""
        try:
            cleaned = {
                "name": "",
                "contact": {"email": "", "phone": "", "github": "", "location": ""},
                "headline": "",
                "professional_summary": "",
                "work_experience": [],
                "skills": {"categories": []},
                "education": [],
            }

            # Copy direct fields
            cleaned["name"] = str(data.get("name", ""))
            cleaned["headline"] = str(data.get("headline", ""))
            cleaned["professional_summary"] = str(data.get("professional_summary", ""))

            # Copy contact info
            contact_data = data.get("contact", {})
            if isinstance(contact_data, dict):
                for field in ["email", "phone", "github", "location"]:
                    cleaned["contact"][field] = str(contact_data.get(field, ""))

            # Handle work experience
            if isinstance(data.get("work_experience"), list):
                for exp in data["work_experience"]:
                    if isinstance(exp, dict):
                        cleaned_exp = {
                            "company": str(exp.get("company", "")),
                            "position": str(exp.get("position", "")),
                            "location": str(exp.get("location", "")),
                            "date_range": str(exp.get("date_range", "")),
                            "achievements": [],
                        }
                        # Clean achievements
                        achievements = exp.get("achievements", [])
                        if isinstance(achievements, list):
                            cleaned_exp["achievements"] = [
                                str(a) for a in achievements if a
                            ]
                        cleaned["work_experience"].append(cleaned_exp)

            # Handle skills with categories
            skills_data = data.get("skills", {})
            if isinstance(skills_data, dict) and isinstance(
                skills_data.get("categories"), list
            ):
                for category in skills_data["categories"]:
                    if (
                        isinstance(category, dict)
                        and category.get("name")
                        and isinstance(category.get("items"), list)
                    ):
                        cleaned["skills"]["categories"].append(
                            {
                                "name": str(category["name"]),
                                "items": [
                                    str(item) for item in category["items"] if item
                                ],
                            }
                        )

            # Handle education
            if isinstance(data.get("education"), list):
                for edu in data["education"]:
                    if isinstance(edu, dict):
                        cleaned["education"].append(
                            {
                                "degree": str(edu.get("degree", "")),
                                "institution": str(edu.get("institution", "")),
                                "year": str(edu.get("year", "")),
                            }
                        )

            return cleaned

        except Exception as e:
            logger.error(f"Error while cleaning data: {str(e)}")
            # Continue with partially cleaned data instead of returning empty
            return cleaned

    def _get_empty_resume(self) -> Dict:
        """Return empty resume structure."""
        return {
            "name": "",
            "contact": {"email": "", "phone": "", "github": "", "location": ""},
            "headline": "",
            "professional_summary": "",
            "work_experience": [],
            "skills": {"categories": []},
            "education": [],
        }

    def generate_resume(self, user_data: Dict) -> Dict:
        current_model = self.model
        retries = 0
        last_error = None

        while retries < self.max_retries:
            try:
                logger.debug(
                    f"Attempting resume generation with model: {current_model}"
                )
                response = self.llm_client.get_completion(
                    prompt=self._get_resume_prompt(user_data),
                    model=current_model,
                    temperature=0.1,
                )

                if not response.strip():
                    raise ValueError("Empty response from LLM")

                json_str = self._extract_json(response)
                resume_data = json.loads(json_str)
                cleaned_data = self._clean_resume_data(resume_data)

                logger.info(
                    f"Successfully generated resume with model: { current_model}"
                )
                return cleaned_data

            except Exception as e:
                last_error = e
                logger.warning(f"Error with model {current_model}: {str(e)}")

                if "429" in str(e) or "Too Many Requests" in str(e):
                    # Rate limit hit - try to switch models
                    next_model = self._handle_rate_limit(current_model)
                    if next_model:
                        current_model = next_model
                        retries += 1
                        time.sleep(self.retry_delay)
                        continue
                    break
                else:
                    # For non-rate-limit errors, retry with same model
                    retries += 1
                    time.sleep(self.retry_delay)

        logger.error(
            f"Resume generation failed after {retries} retries. Last error: {str(last_error)}"
        )
        return self._get_empty_resume()

    def _extract_json(self, text: str) -> str:
        """Extract JSON content from text, handling common LLM response formats."""
        try:
            if "```json" in text:
                start = text.find("```json") + 7
                end = text.find("```", start)
                if end != -1:
                    return text[start:end].strip()

            start = text.find("{")
            end = text.rfind("}") + 1
            if start != -1 and end != 0:
                return text[start:end]

            return text.strip()
        except Exception as e:
            logger.error(f"Failed to extract JSON: {str(e)}")
            raise


def llm_generate_resume(query_data: Dict) -> Dict:
    """Main function to generate a resume from user input."""
    generator = ResumeGenerator(provider="groq")
    return generator.generate_resume(query_data)
