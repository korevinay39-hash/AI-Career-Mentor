# 🤖 AI Career Mentor

AI Career Mentor is an AI-powered career guidance application that provides personalized career recommendations, learning roadmaps, skill gap analysis, interview preparation, and progress tracking.

---

## 🚀 Tech Stack

- **Frontend**: React (Vite) + Lucide Icons + React Markdown + Vanilla CSS Design System
- **Backend API**: FastAPI + Uvicorn
- **AI / LLM**: LangChain + Ollama (`qwen2.5:3b`)
- **Database**: SQLite
- **Legacy UI**: Streamlit

---

## ✨ Features

- 👤 **Student Profile Management**: Persist student background, education, and career aspirations in SQLite.
- 💬 **Interactive AI Career Chat**: Real-time token streaming with prompt shortcuts.
- 📊 **Skill Gap Analysis**: Deep comparison of current technical stack vs. industry role expectations.
- 🗺️ **Personalized Career Roadmap**: Milestone-based transition path to your target position.
- 📚 **Learning Resources**: Interactive curriculum organized by domain (Python, AI, Web Dev, Java, Cloud).
- 📈 **Progress Tracker & Next Task**: Checklist of 12 core competencies with live % completion and AI next-task suggestions.
- 🎤 **Interview Preparation**: Tailored technical and behavioral question generation.
- 💡 **AI Project Recommendations**: Portfolio projects designed for your specific skill level.

---

## 🏃 Quick Start (React + FastAPI)

### Option 1: One-Click Startup (Windows)
Double-click or run:
```cmd
start_app.bat
```

### Option 2: Manual Startup

1. **Activate Python Virtual Environment & Install Dependencies:**
   ```bash
   .\venv\Scripts\activate
   pip install -r requirements.txt
   ```

2. **Start the FastAPI Backend (Port 8000):**
   ```bash
   uvicorn server:app --reload --port 8000
   ```

3. **Start the React Frontend (Port 5173):**
   ```bash
   cd frontend
   npm run dev
   ```

4. Open your browser at **`http://localhost:5173`**.

---

## 💻 Optional: Running the Streamlit App
If you still want to run the original Streamlit interface:
```bash
streamlit run app.py
```
