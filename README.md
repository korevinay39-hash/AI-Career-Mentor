# AI Career Mentor

An intelligent career guidance and planning platform powered by LangChain, FastAPI, React, and local LLMs (Ollama).

---

## Application Access

When running the application, access the services at:

* **Frontend Web App**: [http://localhost:5173](http://localhost:5173)
* **Backend API**: [http://127.0.0.1:8000](http://127.0.0.1:8000)
* **API Documentation (Swagger UI)**: [http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs)

---

## Overview

AI Career Mentor provides automated, personalized career recommendations based on student skills, education, and career aspirations. The platform offers skill gap analysis, personalized roadmaps, mock interview preparation, curated learning resources, and real-time progress tracking.

---

## Features

* **AI Career Chat**: Real-time streaming conversation to answer questions regarding career choices, resumes, and technical paths.
* **Skill Gap Analysis**: Compares current competencies against target job requirements to identify missing skills.
* **Personalized Roadmap**: Generates structured, milestone-based learning plans tailored to specific roles.
* **Curriculum Progress Tracking**: Interactive checklist of core competencies with persistent tracking in SQLite.
* **AI Next-Task Recommendation**: Suggests the optimal next learning or project objective based on completed topics.
* **Interview Preparation**: Generates role-tailored technical and behavioral interview questions.
* **Project Recommendations**: Recommends practical portfolio projects suited to the student's current proficiency level.
* **Stop Generation**: ChatGPT-style interruption capability to cancel AI generation mid-stream on demand.
* **Profile Persistence**: Saves and retrieves user background details using an SQLite database.

---

## System Architecture

The application adopts a decoupled architecture:
1. **Frontend**: React application built with Vite, styled with a modern dark theme design system.
2. **Backend**: FastAPI REST and streaming server providing real-time token streaming.
3. **Core AI Logic**: LangChain pipelines connecting to local LLMs via Ollama (`qwen2.5:3b`).
4. **Data Layer**: SQLite database (`career_mentor.db`) storing student profiles and progress.

---

## Getting Started

### Prerequisites

* Python 3.10 or higher
* Node.js 18 or higher with npm
* Ollama installed with the `qwen2.5:3b` model:
  ```bash
  ollama pull qwen2.5:3b
  ollama run qwen2.5:3b
  ```

---

### Running the Application

#### Option 1: One-Click Windows Launcher
Run the batch file in the root directory:
```cmd
start_app.bat
```
This starts both the FastAPI backend on port 8000 and the React frontend on port 5173.

#### Option 2: Manual Setup

1. **Start the Backend**:
   ```bash
   # Activate virtual environment
   .\venv\Scripts\activate       # Windows
   # source venv/bin/activate    # macOS/Linux

   # Install dependencies
   pip install -r requirements.txt

   # Start the API server
   uvicorn server:app --reload --port 8000
   ```

2. **Start the Frontend**:
   ```bash
   cd frontend
   npm install
   npm run dev
   ```

3. **Open the Application**:
   Navigate to [http://localhost:5173](http://localhost:5173).

---

### Alternative Modes

* **Terminal CLI Mode**:
  ```bash
  python main.py
  ```
* **Streamlit Interface (Legacy)**:
  ```bash
  streamlit run app.py
  ```

---

## API Reference

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| GET | `/api/health` | Service health check |
| GET | `/api/profile` | Retrieve current student profile |
| POST | `/api/profile` | Save or update student profile |
| GET | `/api/progress` | Fetch completed learning topics |
| POST | `/api/progress` | Mark a topic as completed |
| GET | `/api/resources` | Fetch categorized study resources |
| POST | `/api/ai/chat` | Stream career mentoring responses |
| POST | `/api/ai/skill-analysis` | Stream technical skill gap analysis |
| POST | `/api/ai/roadmap` | Stream milestone-based career roadmap |
| POST | `/api/ai/next-task` | Stream next recommended learning step |
| POST | `/api/ai/interview` | Stream mock interview questions |
| POST | `/api/ai/projects` | Stream portfolio project suggestions |

---

## Project Structure

```text
ai-career-mentor/
├── frontend/                  # React client (Vite)
│   ├── src/
│   │   ├── App.jsx            # Core UI component & streaming logic
│   │   ├── App.css            # Component styles
│   │   ├── index.css          # Design system & theme tokens
│   │   └── main.jsx           # React DOM root
│   ├── package.json
│   └── vite.config.js         # Server proxy configuration
├── data/
│   └── resources.json         # Learning resources dataset
├── career_agent.py            # LangChain agent class
├── database.py                # SQLite database operations
├── prompts.py                 # LLM prompt templates
├── llm.py                     # Ollama model configuration
├── server.py                  # FastAPI application
├── main.py                    # Terminal CLI entry point
├── app.py                     # Streamlit application
├── start_app.bat              # Windows launcher script
├── requirements.txt           # Python dependencies
└── README.md                  # Project documentation
```

---

## Tech Stack

* **Frontend**: React, Vite, Lucide React, React Markdown
* **Backend**: FastAPI, Uvicorn, Pydantic
* **AI & LLM**: LangChain, Ollama (`qwen2.5:3b`)
* **Database**: SQLite
