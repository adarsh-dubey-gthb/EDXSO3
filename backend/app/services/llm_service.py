import os
import json
import re
import logging
from typing import Dict, Any, Optional
import httpx
from app.config import GEMINI_API_KEY, OPENAI_API_KEY

logger = logging.getLogger(__name__)

# Check for new google.genai or legacy google.generativeai
HAVE_NEW_GENAI = False
HAVE_OLD_GENAI = False

try:
    from google import genai
    HAVE_NEW_GENAI = True
except ImportError:
    try:
        import warnings
        with warnings.catch_warnings():
            warnings.simplefilter("ignore")
            import google.generativeai as legacy_genai
        HAVE_OLD_GENAI = True
    except ImportError:
        pass


def extract_json_from_text(text: str) -> Dict[str, Any]:
    """Helper to clean markdown fences and parse JSON robustly."""
    text = text.strip()
    match = re.search(r"```(?:json)?\s*([\s\S]*?)\s*```", text)
    if match:
        text = match.group(1).strip()
    start = text.find("{")
    end = text.rfind("}")
    if start != -1 and end != -1:
        text = text[start:end+1]
    
    return json.loads(text)


class LLMService:
    def __init__(self):
        pass

    async def generate_content(
        self,
        prompt: str,
        system_instruction: Optional[str] = None,
        api_key: Optional[str] = None,
        provider: str = "gemini",
        temperature: float = 0.4
    ) -> Optional[str]:
        """Call Gemini or OpenAI or fallback gracefully."""
        active_gemini_key = api_key if (provider == "gemini" and api_key) else (GEMINI_API_KEY or api_key)
        active_openai_key = api_key if (provider == "openai" and api_key) else (OPENAI_API_KEY or api_key)

        # 1. Try Gemini (New SDK)
        if provider == "gemini" and active_gemini_key and HAVE_NEW_GENAI:
            try:
                client = genai.Client(api_key=active_gemini_key)
                models = ["gemini-3.1-flash-lite", "gemini-3.5-flash-lite", "gemini-3.8-flash", "gemini-flash-latest", "gemini-3.7-flash"]
                for m in models:
                    try:
                        full_prompt = f"{system_instruction}\n\n{prompt}" if system_instruction else prompt
                        response = client.models.generate_content(
                            model=m,
                            contents=full_prompt,
                        )
                        if response and response.text:
                            return response.text
                    except Exception as me:
                        logger.warning(f"Gemini {m} error: {me}")
            except Exception as e:
                logger.error(f"Gemini Client error: {e}")

        # 2. Try Gemini (Legacy SDK)
        if provider == "gemini" and active_gemini_key and HAVE_OLD_GENAI:
            try:
                legacy_genai.configure(api_key=active_gemini_key)
                model = legacy_genai.GenerativeModel(
                    model_name="gemini-1.5-flash",
                    system_instruction=system_instruction
                )
                res = model.generate_content(prompt)
                if res and res.text:
                    return res.text
            except Exception as e:
                logger.error(f"Legacy Gemini error: {e}")

        # 3. Try OpenAI if selected or provided
        if (provider == "openai" or (not active_gemini_key and active_openai_key)) and active_openai_key:
            try:
                async with httpx.AsyncClient(timeout=35.0) as client:
                    messages = []
                    if system_instruction:
                        messages.append({"role": "system", "content": system_instruction})
                    messages.append({"role": "user", "content": prompt})
                    
                    resp = await client.post(
                        "https://api.openai.com/v1/chat/completions",
                        headers={
                            "Authorization": f"Bearer {active_openai_key}",
                            "Content-Type": "application/json"
                        },
                        json={
                            "model": "gpt-4o-mini",
                            "messages": messages,
                            "temperature": temperature
                        }
                    )
                    if resp.status_code == 200:
                        data = resp.json()
                        return data["choices"][0]["message"]["content"]
                    else:
                        logger.error(f"OpenAI error {resp.status_code}: {resp.text}")
            except Exception as e:
                logger.error(f"OpenAI API invocation error: {e}")

        # 4. Graceful fallback if no key or error occurred
        return None

    async def generate_json(
        self,
        prompt: str,
        system_instruction: Optional[str] = None,
        api_key: Optional[str] = None,
        provider: str = "gemini",
        temperature: float = 0.2
    ) -> Optional[Dict[str, Any]]:
        """Generate structured JSON response with automatic parse error recovery."""
        sys_prompt = (system_instruction or "") + "\nIMPORTANT: Return ONLY a valid JSON object. No markdown fences, no explanatory text outside the JSON."
        raw_text = await self.generate_content(
            prompt=prompt,
            system_instruction=sys_prompt,
            api_key=api_key,
            provider=provider,
            temperature=temperature
        )
        if not raw_text:
            return None
        
        try:
            return extract_json_from_text(raw_text)
        except Exception as e:
            logger.error(f"Failed to parse LLM JSON: {e}. Raw content: {raw_text[:200]}")
            return None

    async def transcribe_audio(self, audio_bytes: bytes, mime_type: str = "audio/webm") -> Optional[str]:
        """Transcribe speech audio file using Gemini Multimodal Audio model with high technical precision."""
        if HAVE_NEW_GENAI and GEMINI_API_KEY:
            try:
                from google.genai import types
                client = genai.Client(api_key=GEMINI_API_KEY)
                clean_mime = mime_type.split(";")[0].strip() or "audio/webm"
                
                models_to_try = ["gemini-3.1-flash-lite", "gemini-3.5-flash-lite", "gemini-flash-latest", "gemini-3.8-flash"]
                for m in models_to_try:
                    try:
                        response = client.models.generate_content(
                            model=m,
                            contents=[
                                types.Part.from_bytes(data=audio_bytes, mime_type=clean_mime),
                                "You are an expert technical speech-to-text transcriber for engineering interviews. "
                                "Transcribe the candidate's speech accurately, preserving technical terms, frameworks, and metrics. "
                                "Return ONLY the plain transcript text with zero preamble or commentary."
                            ]
                        )
                        if response and response.text:
                            return response.text.strip()
                    except Exception as me:
                        logger.warning(f"Audio transcription {m} error: {me}")
            except Exception as e:
                logger.error(f"Gemini audio transcription error: {e}")
        return None

llm_service = LLMService()
