import pypdf
import re
from typing import Dict, Set, List


def extract_text_from_pdf(file_path):
    with open(file_path, "rb") as f:
        reader = pypdf.PdfReader(f)
        return "".join(page.extract_text() for page in reader.pages)


def extract_text_from_txt(file_path):
    with open(file_path, "r", encoding="utf-8") as f:
        return f.read()


# Categorized skills with synonyms
SKILLS = {
    "frontend": {
        "react": ["react.js", "reactjs"],
        "vue": ["vue.js", "vuejs"],
        "angular": ["angular.js", "angularjs"],
        "typescript": ["ts"],
        "javascript": ["js", "ecmascript"],
        "html": ["html5"],
        "css": ["css3", "sass", "scss", "less"],
        "redux": ["redux toolkit"],
        "webpack": [],
        "babel": [],
        "jest": [],
    },
    "backend": {
        "node.js": ["nodejs", "node"],
        "python": [],
        "java": [],
        "c++": ["cpp"],
        "rest api": ["rest", "restful"],
        "graphql": [],
        "microservices": [],
    },
    "database": {
        "sql": ["mysql", "postgresql", "postgres"],
        "mongodb": ["mongo"],
        "redis": [],
    },
    "devops": {
        "docker": [],
        "kubernetes": ["k8s"],
        "ci/cd": ["continuous integration", "continuous deployment"],
        "git": ["github", "gitlab"],
        "aws": ["amazon web services"],
        "azure": [],
        "gcp": ["google cloud"],
    },
    "soft_skills": {
        "agile": ["scrum"],
        "jira": [],
        "problem-solving": [],
        "communication": [],
    },
}


def normalize_text(text: str) -> str:
    text = text.lower()
    text = re.sub(r"[^\w\s/+#.-]", " ", text)
    text = re.sub(r"\s+", " ", text)
    return text


def extract_key_skills(text: str) -> Dict[str, Set[str]]:
    normalized = normalize_text(text)
    found = {category: set() for category in SKILLS}

    for category, skills in SKILLS.items():
        for skill, synonyms in skills.items():
            all_variants = [skill] + synonyms
            for variant in all_variants:
                pattern = r"\b" + re.escape(variant) + r"\b"
                if re.search(pattern, normalized):
                    found[category].add(skill)
                    break

    return found


def calculate_ats_score(resume_text: str, job_desc_text: str) -> Dict:
    resume_skills = extract_key_skills(resume_text)
    job_skills = extract_key_skills(job_desc_text)

    # Flatten skills
    resume_flat = {s for cat in resume_skills.values() for s in cat}
    job_flat = {s for cat in job_skills.values() for s in cat}

    if not job_flat:
        return {"error": "No skills found in job description"}

    matched = resume_flat & job_flat
    missing = job_flat - resume_flat

    # Category breakdown
    category_scores = {}
    for category in SKILLS:
        job_cat = job_skills[category]
        resume_cat = resume_skills[category]
        if job_cat:
            matched_cat = resume_cat & job_cat
            category_scores[category] = {
                "score": round(len(matched_cat) / len(job_cat) * 100, 2),
                "matched": sorted(matched_cat),
                "missing": sorted(job_cat - resume_cat),
            }

    return {
        "ats_score": round(len(matched) / len(job_flat) * 100, 2),
        "matched_skills": sorted(matched),
        "missing_skills": sorted(missing),
        "category_breakdown": category_scores,
        "total_resume_skills": len(resume_flat),
        "total_job_skills": len(job_flat),
    }
