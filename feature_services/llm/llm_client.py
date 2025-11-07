# /root/resumequick.pro/feature_services/llm/llm_client.py
import logging
from tqdm import tqdm
from dotenv import load_dotenv
from groq import Groq
from openai import OpenAI
from pathlib import Path
from typing import List, Dict, Optional, Literal
import time
import json
import os

load_dotenv()

# Configure logging
logging.basicConfig(level=logging.WARNING)
logger = logging.getLogger(__name__)

ProviderType = Literal["groq", "openai"]


class LLMClient:
    """Factory class for creating LLM clients."""

    def __init__(self, provider: ProviderType):
        self.provider = provider
        self.client = self._init_client()
        self.default_models = {}

    def _init_client(self):
        """Initialize the appropriate client based on provider."""
        if self.provider == "groq":
            api_key = os.getenv("GROQ_API_KEY")
            if not api_key:
                raise ValueError("GROQ_API_KEY not found in environment")
            return Groq(api_key=api_key)
        elif self.provider == "openai":
            api_key = os.getenv("OPENAI_API_KEY")
            if not api_key:
                raise ValueError("OPENAI_API_KEY not found in environment")
            return OpenAI(api_key=api_key)
        else:
            raise ValueError(f"Unsupported provider: {self.provider}")

    def get_completion(
        self, prompt: str, model: Optional[str] = None, temperature: float = 0.1
    ) -> str:
        """Get completion from the LLM provider."""
        try:
            if self.provider == "groq":
                model = model or self.default_models["groq"]
                completion = self.client.chat.completions.create(
                    model=model,
                    messages=[{"role": "user", "content": prompt}],
                    temperature=temperature,
                )
                return completion.choices[0].message.content

            elif self.provider == "openai":
                model = model or self.default_models["openai"]
                completion = self.client.chat.completions.create(
                    model=model,
                    messages=[{"role": "user", "content": prompt}],
                    temperature=temperature,
                )
                return completion.choices[0].message.content

        except Exception as e:
            logger.error(f"Error getting completion from {self.provider}: {str(e)}")
            raise
