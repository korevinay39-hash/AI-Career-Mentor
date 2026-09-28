import json
import os
from typing import List, Optional
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from pydantic import BaseModel

# Import existing core modules directly without modifications
from career_agent import CareerMentorAgent
from database import (
    create_tables,
    save_profile,
    get_profile,
    add_progress,
    get_completed_topics
)

# Initialize database tables
create_tables()

app = FastAPI(title="AI Career Mentor API", version="1.0.0")

# Enable CORS for React frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize agent
agent = CareerMentorAgent()

# Helper to load learning resources
RESOURCES_FILE = os.path.join(os.path.dirname(__file__), "data", "resources.json")

def load_resources_data():
    if os.path.exists(RESOURCES_FILE):
        with open(RESOURCES_FILE, "r", encoding="utf-8") as f:
            return json.load(f)
    return {}

# Pydantic Schemas
class ProfileRequest(BaseModel):
    name: str
    education: str
    skills: str
    goal: str

class ProgressRequest(BaseModel):
    topic: str

class ChatRequest(BaseModel):
    name: str
    education: str
    skills: str
    goal: str
    question: str

class PromptRequest(BaseModel):
    name: str
    education: Optional[str] = ""
    skills: str
    goal: str
    completed_topics: Optional[List[str]] = []

def safe_stream_generator(gen_callable):
    """Wraps streaming generator with error handling if Ollama/LLM fails."""
    try:
        for chunk in gen_callable():
            yield chunk
    except Exception as e:
        yield f"\n\n⚠️ **Error generating response**: {str(e)}\n\n*Make sure Ollama is running locally with model 'qwen2.5:3b' (`ollama run qwen2.5:3b`).*"

@app.get("/api/health")
def health_check():
    return {"status": "ok", "message": "AI Career Mentor API is running"}

@app.get("/api/profile")
def fetch_profile():
    result = get_profile()
    if result:
        return {
            "name": result[0] or "",
            "education": result[1] or "",
            "skills": result[2] or "",
            "goal": result[3] or ""
        }
    return {"name": "", "education": "", "skills": "", "goal": ""}

@app.post("/api/profile")
def update_profile(data: ProfileRequest):
    if not (data.name and data.education and data.skills and data.goal):
        raise HTTPException(status_code=400, detail="All profile fields are required.")
    save_profile(data.name, data.education, data.skills, data.goal)
    return {"status": "success", "message": "Profile saved successfully"}

@app.get("/api/progress")
def fetch_progress():
    completed = get_completed_topics()
    return {"completed": completed}

@app.post("/api/progress")
def record_progress(data: ProgressRequest):
    add_progress(data.topic)
    return {"status": "success", "completed": get_completed_topics()}

@app.get("/api/resources")
def fetch_resources():
    return load_resources_data()

# ==================================================
# AI STREAMING ENDPOINTS
# ==================================================

@app.post("/api/ai/chat")
def ai_chat(data: ChatRequest):
    def generate():
        return agent.chat(
            data.name,
            data.education,
            data.skills,
            data.goal,
            data.question
        )
    return StreamingResponse(safe_stream_generator(generate), media_type="text/plain")

@app.post("/api/ai/skill-analysis")
def ai_skill_analysis(data: PromptRequest):
    def generate():
        return agent.skill_analysis(
            data.name,
            data.education,
            data.skills,
            data.goal
        )
    return StreamingResponse(safe_stream_generator(generate), media_type="text/plain")

@app.post("/api/ai/roadmap")
def ai_roadmap(data: PromptRequest):
    def generate():
        return agent.roadmap(
            data.name,
            data.education,
            data.skills,
            data.goal
        )
    return StreamingResponse(safe_stream_generator(generate), media_type="text/plain")

@app.post("/api/ai/interview")
def ai_interview(data: PromptRequest):
    def generate():
        return agent.interview(
            data.name,
            data.skills,
            data.goal
        )
    return StreamingResponse(safe_stream_generator(generate), media_type="text/plain")

@app.post("/api/ai/projects")
def ai_projects(data: PromptRequest):
    def generate():
        return agent.projects(
            data.name,
            data.education,
            data.skills,
            data.goal
        )
    return StreamingResponse(safe_stream_generator(generate), media_type="text/plain")

@app.post("/api/ai/next-task")
def ai_next_task(data: PromptRequest):
    completed = data.completed_topics or get_completed_topics()
    def generate():
        return agent.next_task(
            data.name,
            data.skills,
            data.goal,
            completed
        )
    return StreamingResponse(safe_stream_generator(generate), media_type="text/plain")
