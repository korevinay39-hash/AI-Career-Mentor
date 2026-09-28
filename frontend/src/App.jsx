import React, { useState, useEffect, useRef } from 'react';
import ReactMarkdown from 'react-markdown';
import {
  MessageSquare,
  BarChart2,
  Map,
  BookOpen,
  TrendingUp,
  Mic,
  Lightbulb,
  Save,
  Send,
  Sparkles,
  CheckCircle2,
  Circle,
  Copy,
  Check,
  RefreshCw,
  AlertCircle,
  Target,
  UserCheck,
  Square
} from 'lucide-react';
import './App.css';

const CORE_PROGRESS_TOPICS = [
  "Python",
  "OOP",
  "SQL",
  "REST API",
  "Git & GitHub",
  "React",
  "Machine Learning",
  "Generative AI",
  "LangChain",
  "RAG",
  "AI Agents",
  "Cloud"
];

export default function App() {
  // Navigation
  const [activeTab, setActiveTab] = useState('chat');

  // Student Profile State
  const [profile, setProfile] = useState({
    name: '',
    education: '',
    skills: '',
    goal: ''
  });
  const [saveStatus, setSaveStatus] = useState(null); // 'saving' | 'saved' | 'error'
  const [apiConnected, setApiConnected] = useState(true);

  // Tab 1: Chat State
  const [chatMessages, setChatMessages] = useState([]);
  const [chatInput, setChatInput] = useState('');
  const [isChatStreaming, setIsChatStreaming] = useState(false);
  const chatBottomRef = useRef(null);

  // Tab 2: Skill Analysis State
  const [skillAnalysis, setSkillAnalysis] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  // Tab 3: Roadmap State
  const [roadmap, setRoadmap] = useState('');
  const [isGeneratingRoadmap, setIsGeneratingRoadmap] = useState(false);

  // Tab 4: Resources State
  const [resourcesData, setResourcesData] = useState({});
  const [activeResourceCategory, setActiveResourceCategory] = useState('');
  const [checkedResources, setCheckedResources] = useState({});

  // Tab 5: Progress State
  const [completedTopics, setCompletedTopics] = useState([]);
  const [nextTaskResult, setNextTaskResult] = useState('');
  const [isGeneratingNextTask, setIsGeneratingNextTask] = useState(false);

  // Tab 6: Interview State
  const [interviewQuestions, setInterviewQuestions] = useState('');
  const [isGeneratingInterview, setIsGeneratingInterview] = useState(false);

  // Tab 7: Projects State
  const [projectsResult, setProjectsResult] = useState('');
  const [isGeneratingProjects, setIsGeneratingProjects] = useState(false);

  // Copy feedback state
  const [copiedSection, setCopiedSection] = useState(null);

  // AbortController ref to allow stopping streaming requests like ChatGPT
  const abortControllerRef = useRef(null);

  // Stop Generation Handler (ChatGPT style)
  const handleStopGeneration = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
    setIsChatStreaming(false);
    setIsAnalyzing(false);
    setIsGeneratingRoadmap(false);
    setIsGeneratingNextTask(false);
    setIsGeneratingInterview(false);
    setIsGeneratingProjects(false);
  };

  // Load initial data from backend API
  useEffect(() => {
    fetchProfile();
    fetchProgress();
    fetchResources();
  }, []);

  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages, isChatStreaming]);

  const fetchProfile = async () => {
    try {
      const res = await fetch('/api/profile');
      if (res.ok) {
        const data = await res.json();
        setProfile({
          name: data.name || '',
          education: data.education || '',
          skills: data.skills || '',
          goal: data.goal || ''
        });
        setApiConnected(true);
      }
    } catch (err) {
      console.error('Error fetching profile:', err);
      setApiConnected(false);
    }
  };

  const fetchProgress = async () => {
    try {
      const res = await fetch('/api/progress');
      if (res.ok) {
        const data = await res.json();
        setCompletedTopics(data.completed || []);
      }
    } catch (err) {
      console.error('Error fetching progress:', err);
    }
  };

  const fetchResources = async () => {
    try {
      const res = await fetch('/api/resources');
      if (res.ok) {
        const data = await res.json();
        setResourcesData(data);
        const categories = Object.keys(data);
        if (categories.length > 0) {
          setActiveResourceCategory(categories[0]);
        }
      }
    } catch (err) {
      console.error('Error fetching resources:', err);
    }
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    if (!profile.name || !profile.education || !profile.skills || !profile.goal) {
      setSaveStatus('error');
      setTimeout(() => setSaveStatus(null), 3500);
      return;
    }
    setSaveStatus('saving');
    try {
      const res = await fetch('/api/profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(profile)
      });
      if (res.ok) {
        setSaveStatus('saved');
        setApiConnected(true);
        setTimeout(() => setSaveStatus(null), 3000);
      } else {
        setSaveStatus('error');
      }
    } catch (err) {
      setSaveStatus('error');
    }
  };

  const isProfileComplete = profile.name && profile.education && profile.skills && profile.goal;

  // Generic Stream Reader with AbortController support
  const executeStreamRequest = async (url, payload, setStreamText, setLoadingState) => {
    if (!isProfileComplete) {
      alert('Please fill out and save your Student Profile first!');
      return;
    }

    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    const controller = new AbortController();
    abortControllerRef.current = controller;

    setLoadingState(true);
    setStreamText('');

    try {
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
        signal: controller.signal
      });

      if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);

      const reader = res.body.getReader();
      const decoder = new TextDecoder('utf-8');
      let textBuffer = '';

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value, { stream: true });
        textBuffer += chunk;
        setStreamText(textBuffer);
      }
    } catch (err) {
      if (err.name === 'AbortError') {
        // Stopped cleanly by user
        return;
      }
      setStreamText(`⚠️ Error: ${err.message}. Please check if the backend API and Ollama are running.`);
    } finally {
      setLoadingState(false);
      abortControllerRef.current = null;
    }
  };

  // Chat Submission with AbortController support
  const handleSendChat = async (e) => {
    if (e) e.preventDefault();
    if (isChatStreaming) {
      handleStopGeneration();
      return;
    }

    const query = chatInput.trim();
    if (!query) return;

    if (!isProfileComplete) {
      alert('Please fill out and save your Student Profile first!');
      return;
    }

    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    const controller = new AbortController();
    abortControllerRef.current = controller;

    const newMessages = [...chatMessages, { role: 'user', content: query }];
    setChatMessages(newMessages);
    setChatInput('');
    setIsChatStreaming(true);

    const assistantIndex = newMessages.length;
    setChatMessages([...newMessages, { role: 'assistant', content: '' }]);

    try {
      const res = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: profile.name,
          education: profile.education,
          skills: profile.skills,
          goal: profile.goal,
          question: query
        }),
        signal: controller.signal
      });

      if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);

      const reader = res.body.getReader();
      const decoder = new TextDecoder('utf-8');
      let accumulated = '';

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;
        accumulated += decoder.decode(value, { stream: true });
        setChatMessages((prev) => {
          const updated = [...prev];
          updated[assistantIndex] = { role: 'assistant', content: accumulated };
          return updated;
        });
      }
    } catch (err) {
      if (err.name === 'AbortError') {
        // Stopped cleanly by user, keep accumulated text
        return;
      }
      setChatMessages((prev) => {
        const updated = [...prev];
        updated[assistantIndex] = {
          role: 'assistant',
          content: `⚠️ Error: ${err.message}. Please check your backend and Ollama.`
        };
        return updated;
      });
    } finally {
      setIsChatStreaming(false);
      abortControllerRef.current = null;
    }
  };

  // Toggle Topic Progress
  const handleToggleTopic = async (topic) => {
    const isCompleted = completedTopics.includes(topic);
    if (!isCompleted) {
      try {
        const res = await fetch('/api/progress', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ topic })
        });
        if (res.ok) {
          const data = await res.json();
          setCompletedTopics(data.completed || []);
        }
      } catch (err) {
        console.error('Error adding progress:', err);
      }
    }
  };

  const handleCopy = (text, sectionKey) => {
    navigator.clipboard.writeText(text);
    setCopiedSection(sectionKey);
    setTimeout(() => setCopiedSection(null), 2000);
  };

  // Progress metrics
  const totalTopics = CORE_PROGRESS_TOPICS.length;
  const completedCount = CORE_PROGRESS_TOPICS.filter((t) => completedTopics.includes(t)).length;
  const progressPercent = Math.round((completedCount / totalTopics) * 100);

  return (
    <div className="app-container">
      {/* ================= SIDEBAR ================= */}
      <aside className="sidebar">
        <div className="brand-section">
          <div className="brand-icon">🎓</div>
          <div>
            <h1 className="brand-title">AI Career Mentor</h1>
            <span className="brand-subtitle">GenAI Powered Advisor</span>
          </div>
        </div>

        {/* Profile Card */}
        <div className="profile-card">
          <div className="profile-card-header">
            <span className="section-label">
              <UserCheck size={16} /> Student Profile
            </span>
            {isProfileComplete && (
              <span style={{ fontSize: '0.75rem', color: '#10b981', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <CheckCircle2 size={12} /> Active
              </span>
            )}
          </div>

          <form onSubmit={handleSaveProfile} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <div className="form-group">
              <label>Full Name</label>
              <input
                type="text"
                placeholder="Name"
                value={profile.name}
                onChange={(e) => setProfile({ ...profile, name: e.target.value })}
              />
            </div>

            <div className="form-group">
              <label>Education</label>
              <input
                type="text"
                placeholder="e.g. B.Tech Computer Engineering"
                value={profile.education}
                onChange={(e) => setProfile({ ...profile, education: e.target.value })}
              />
            </div>

            <div className="form-group">
              <label>Current Skills</label>
              <textarea
                rows={2}
                placeholder="e.g. Python, SQL, React, Git"
                value={profile.skills}
                onChange={(e) => setProfile({ ...profile, skills: e.target.value })}
              />
            </div>

            <div className="form-group">
              <label>Career Goal</label>
              <input
                type="text"
                placeholder="e.g. AI / ML Engineer"
                value={profile.goal}
                onChange={(e) => setProfile({ ...profile, goal: e.target.value })}
              />
            </div>

            <button type="submit" className="btn-primary" disabled={saveStatus === 'saving'}>
              {saveStatus === 'saving' ? (
                <>
                  <RefreshCw size={16} className="animate-spin" /> Saving...
                </>
              ) : (
                <>
                  <Save size={16} /> Save Profile
                </>
              )}
            </button>
          </form>

          {saveStatus === 'saved' && (
            <div className="toast-msg success">
              <CheckCircle2 size={16} /> Profile saved successfully!
            </div>
          )}
          {saveStatus === 'error' && (
            <div className="toast-msg warning">
              <AlertCircle size={16} /> Please fill all fields before saving.
            </div>
          )}
        </div>

        {/* System Status */}
        <div className="system-status">
          <span>
            <span
              className="status-dot"
              style={{
                backgroundColor: apiConnected ? 'var(--accent-success)' : 'var(--accent-danger)',
                boxShadow: apiConnected ? '0 0 8px var(--accent-success)' : '0 0 8px var(--accent-danger)'
              }}
            />
            {apiConnected ? 'API Connected' : 'API Offline'}
          </span>
          <span style={{ fontSize: '0.72rem' }}>v1.0.0</span>
        </div>
      </aside>

      {/* ================= MAIN CONTENT ================= */}
      <main className="main-content">
        {/* Top Header Navigation Tabs */}
        <header className="top-header">
          <nav className="nav-tabs">
            <button
              className={`nav-tab-btn ${activeTab === 'chat' ? 'active' : ''}`}
              onClick={() => setActiveTab('chat')}
            >
              <MessageSquare size={16} /> Career Chat
            </button>
            <button
              className={`nav-tab-btn ${activeTab === 'analysis' ? 'active' : ''}`}
              onClick={() => setActiveTab('analysis')}
            >
              <BarChart2 size={16} /> Skill Analysis
            </button>
            <button
              className={`nav-tab-btn ${activeTab === 'roadmap' ? 'active' : ''}`}
              onClick={() => setActiveTab('roadmap')}
            >
              <Map size={16} /> Roadmap
            </button>
            <button
              className={`nav-tab-btn ${activeTab === 'resources' ? 'active' : ''}`}
              onClick={() => setActiveTab('resources')}
            >
              <BookOpen size={16} /> Resources
            </button>
            <button
              className={`nav-tab-btn ${activeTab === 'progress' ? 'active' : ''}`}
              onClick={() => setActiveTab('progress')}
            >
              <TrendingUp size={16} /> Progress
            </button>
            <button
              className={`nav-tab-btn ${activeTab === 'interview' ? 'active' : ''}`}
              onClick={() => setActiveTab('interview')}
            >
              <Mic size={16} /> Interview
            </button>
            <button
              className={`nav-tab-btn ${activeTab === 'projects' ? 'active' : ''}`}
              onClick={() => setActiveTab('projects')}
            >
              <Lightbulb size={16} /> Projects
            </button>
          </nav>
        </header>

        {/* Tab 1: Career Chat */}
        {activeTab === 'chat' && (
          <div className="view-container">
            <div className="view-header">
              <h2><MessageSquare size={26} color="#6366f1" /> AI Career Chat</h2>
              <p>Discuss your career questions, interview concerns, and learning strategies with your mentor.</p>
            </div>

            <div className="chat-container">
              <div className="chat-history">
                {chatMessages.length === 0 ? (
                  <div style={{ textAlign: 'center', margin: 'auto', color: 'var(--text-muted)' }}>
                    <Sparkles size={40} color="#6366f1" style={{ marginBottom: 12 }} />
                    <h3 style={{ color: 'var(--text-secondary)' }}>Welcome to your AI Career Mentor</h3>
                    <p style={{ maxWidth: 460, margin: '8px auto', fontSize: '0.9rem' }}>
                      Ask anything about breaking into tech, tailoring your resume, choosing technologies, or preparing for interviews.
                    </p>
                  </div>
                ) : (
                  chatMessages.map((msg, idx) => (
                    <div key={idx} className={`chat-message ${msg.role}`}>
                      <div className="chat-avatar">{msg.role === 'user' ? '👤' : '🤖'}</div>
                      <div className="chat-bubble">
                        {msg.role === 'user' ? (
                          msg.content
                        ) : (
                          <div className="markdown-body">
                            <ReactMarkdown>{msg.content || 'Thinking...'}</ReactMarkdown>
                            {isChatStreaming && idx === chatMessages.length - 1 && (
                              <span className="typing-cursor" />
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  ))
                )}
                <div ref={chatBottomRef} />
              </div>

              {/* Stop Generation Button for Chat (ChatGPT style) */}
              {isChatStreaming && (
                <div className="chat-stop-bar">
                  <button type="button" className="btn-stop" onClick={handleStopGeneration}>
                    <Square size={14} fill="currentColor" /> Stop Generating
                  </button>
                </div>
              )}

              {/* Quick Prompts */}
              <div className="quick-prompts">
                <button
                  className="quick-prompt-btn"
                  onClick={() => setChatInput("How can I become an AI/ML Engineer in 6 months?")}
                >
                  ⚡ Roadmap in 6 months
                </button>
                <button
                  className="quick-prompt-btn"
                  onClick={() => setChatInput("What are the top 3 projects to showcase on my resume?")}
                >
                  ⚡ Top resume projects
                </button>
                <button
                  className="quick-prompt-btn"
                  onClick={() => setChatInput("What are common interview questions for my goal?")}
                >
                  ⚡ Common interview questions
                </button>
                {chatMessages.length > 0 && (
                  <button
                    className="quick-prompt-btn"
                    style={{ marginLeft: 'auto', color: 'var(--accent-danger)' }}
                    onClick={() => setChatMessages([])}
                  >
                    Clear Chat
                  </button>
                )}
              </div>

              {/* Chat Input */}
              <form className="chat-input-area" onSubmit={handleSendChat}>
                <input
                  type="text"
                  placeholder={
                    isProfileComplete
                      ? "Ask your career question..."
                      : "Please save your student profile in the sidebar first..."
                  }
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  disabled={!isProfileComplete}
                />
                {isChatStreaming ? (
                  <button
                    type="button"
                    className="btn-stop"
                    onClick={handleStopGeneration}
                    title="Stop Generating"
                  >
                    <Square size={14} fill="currentColor" /> Stop
                  </button>
                ) : (
                  <button
                    type="submit"
                    className="btn-primary"
                    disabled={!isProfileComplete || !chatInput.trim()}
                  >
                    <Send size={16} />
                  </button>
                )}
              </form>
            </div>
          </div>
        )}

        {/* Tab 2: Skill Analysis */}
        {activeTab === 'analysis' && (
          <div className="view-container">
            <div className="view-header">
              <h2><BarChart2 size={26} color="#6366f1" /> Skill Gap Analysis</h2>
              <p>Compare your current technical competencies against industry standards for your target role.</p>
            </div>

            <div className="content-card">
              <div className="action-banner">
                <div>
                  <strong>Target: {profile.goal || "No goal specified"}</strong>
                  <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                    Current Skills: {profile.skills || "None provided"}
                  </div>
                </div>

                {isAnalyzing ? (
                  <button className="btn-stop" onClick={handleStopGeneration}>
                    <Square size={14} fill="currentColor" /> Stop Generating
                  </button>
                ) : (
                  <button
                    className="btn-primary"
                    onClick={() =>
                      executeStreamRequest(
                        '/api/ai/skill-analysis',
                        {
                          name: profile.name,
                          education: profile.education,
                          skills: profile.skills,
                          goal: profile.goal
                        },
                        setSkillAnalysis,
                        setIsAnalyzing
                      )
                    }
                  >
                    <Sparkles size={16} /> Analyze My Skills
                  </button>
                )}
              </div>

              {skillAnalysis && (
                <div className="response-box">
                  <div className="response-header">
                    <span className="section-label">Analysis Output</span>
                    <button
                      className="btn-secondary"
                      onClick={() => handleCopy(skillAnalysis, 'analysis')}
                    >
                      {copiedSection === 'analysis' ? <Check size={14} color="#10b981" /> : <Copy size={14} />}
                      {copiedSection === 'analysis' ? 'Copied' : 'Copy'}
                    </button>
                  </div>
                  <div className="markdown-body">
                    <ReactMarkdown>{skillAnalysis}</ReactMarkdown>
                    {isAnalyzing && <span className="typing-cursor" />}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Tab 3: Roadmap */}
        {activeTab === 'roadmap' && (
          <div className="view-container">
            <div className="view-header">
              <h2><Map size={26} color="#6366f1" /> Personalized Career Roadmap</h2>
              <p>Step-by-step milestones to transition from your current skillset to your dream role.</p>
            </div>

            <div className="content-card">
              <div className="action-banner">
                <div>
                  <strong>Roadmap Target: {profile.goal || "Goal not set"}</strong>
                  <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                    Tailored for: {profile.name || "Student"}
                  </div>
                </div>

                {isGeneratingRoadmap ? (
                  <button className="btn-stop" onClick={handleStopGeneration}>
                    <Square size={14} fill="currentColor" /> Stop Generating
                  </button>
                ) : (
                  <button
                    className="btn-primary"
                    onClick={() =>
                      executeStreamRequest(
                        '/api/ai/roadmap',
                        {
                          name: profile.name,
                          education: profile.education,
                          skills: profile.skills,
                          goal: profile.goal
                        },
                        setRoadmap,
                        setIsGeneratingRoadmap
                      )
                    }
                  >
                    <Map size={16} /> Generate Roadmap
                  </button>
                )}
              </div>

              {roadmap && (
                <div className="response-box">
                  <div className="response-header">
                    <span className="section-label">Your Custom Learning Path</span>
                    <button
                      className="btn-secondary"
                      onClick={() => handleCopy(roadmap, 'roadmap')}
                    >
                      {copiedSection === 'roadmap' ? <Check size={14} color="#10b981" /> : <Copy size={14} />}
                      {copiedSection === 'roadmap' ? 'Copied' : 'Copy'}
                    </button>
                  </div>
                  <div className="markdown-body">
                    <ReactMarkdown>{roadmap}</ReactMarkdown>
                    {isGeneratingRoadmap && <span className="typing-cursor" />}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Tab 4: Resources */}
        {activeTab === 'resources' && (
          <div className="view-container">
            <div className="view-header">
              <h2><BookOpen size={26} color="#6366f1" /> Curated Learning Resources</h2>
              <p>Key topics and concepts recommended for high-impact technical domains.</p>
            </div>

            <div className="content-card">
              {/* Category Pills */}
              <div className="category-pills">
                {Object.keys(resourcesData).map((cat) => (
                  <button
                    key={cat}
                    className={`category-pill ${activeResourceCategory === cat ? 'active' : ''}`}
                    onClick={() => setActiveResourceCategory(cat)}
                  >
                    {cat}
                  </button>
                ))}
              </div>

              {activeResourceCategory && resourcesData[activeResourceCategory] && (
                <div>
                  <h3 style={{ marginBottom: 16, color: '#a5b4fc' }}>
                    Recommended Topics for {activeResourceCategory}
                  </h3>
                  <div className="progress-grid">
                    {resourcesData[activeResourceCategory].map((topic, idx) => {
                      const isChecked = checkedResources[`${activeResourceCategory}_${topic}`] || false;
                      return (
                        <div
                          key={idx}
                          className={`progress-item ${isChecked ? 'completed' : ''}`}
                          onClick={() =>
                            setCheckedResources({
                              ...checkedResources,
                              [`${activeResourceCategory}_${topic}`]: !isChecked
                            })
                          }
                        >
                          {isChecked ? (
                            <CheckCircle2 size={18} color="#10b981" />
                          ) : (
                            <Circle size={18} color="var(--text-muted)" />
                          )}
                          <span style={{ fontSize: '0.9rem', color: isChecked ? '#34d399' : 'var(--text-primary)' }}>
                            {topic}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Tab 5: Progress & Next Task */}
        {activeTab === 'progress' && (
          <div className="view-container">
            <div className="view-header">
              <h2><TrendingUp size={26} color="#6366f1" /> Learning Progress Tracker</h2>
              <p>Track foundational and advanced topics. Mark completed items to unlock targeted task suggestions.</p>
            </div>

            <div className="content-card">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                <div>
                  <h3 style={{ fontSize: '1.25rem' }}>Core Curriculum Completion</h3>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                    {completedCount} of {totalTopics} topics finished
                  </p>
                </div>
                <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#10b981' }}>
                  {progressPercent}%
                </div>
              </div>

              <div className="progress-bar-container">
                <div className="progress-bar-fill" style={{ width: `${progressPercent}%` }} />
              </div>

              <div className="progress-grid">
                {CORE_PROGRESS_TOPICS.map((topic) => {
                  const isDone = completedTopics.includes(topic);
                  return (
                    <div
                      key={topic}
                      className={`progress-item ${isDone ? 'completed' : ''}`}
                      onClick={() => handleToggleTopic(topic)}
                    >
                      {isDone ? (
                        <CheckCircle2 size={18} color="#10b981" />
                      ) : (
                        <Circle size={18} color="var(--text-muted)" />
                      )}
                      <span style={{ fontSize: '0.9rem', color: isDone ? '#34d399' : 'var(--text-primary)' }}>
                        {topic}
                      </span>
                    </div>
                  );
                })}
              </div>

              <div style={{ marginTop: 24, paddingTop: 20, borderTop: '1px solid var(--border-subtle)' }}>
                <div className="action-banner" style={{ marginBottom: 0 }}>
                  <div>
                    <strong>Ready for the next step?</strong>
                    <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                      Our agent analyzes your completed topics and recommends the exact next task to work on.
                    </div>
                  </div>

                  {isGeneratingNextTask ? (
                    <button className="btn-stop" onClick={handleStopGeneration}>
                      <Square size={14} fill="currentColor" /> Stop Generating
                    </button>
                  ) : (
                    <button
                      className="btn-primary"
                      onClick={() =>
                        executeStreamRequest(
                          '/api/ai/next-task',
                          {
                            name: profile.name,
                            education: profile.education,
                            skills: profile.skills,
                            goal: profile.goal,
                            completed_topics: completedTopics
                          },
                          setNextTaskResult,
                          setIsGeneratingNextTask
                        )
                      }
                    >
                      <Target size={16} /> Suggest My Next Task
                    </button>
                  )}
                </div>

                {nextTaskResult && (
                  <div className="response-box" style={{ marginTop: 20 }}>
                    <div className="response-header">
                      <span className="section-label">Next Action Plan</span>
                      <button
                        className="btn-secondary"
                        onClick={() => handleCopy(nextTaskResult, 'next_task')}
                      >
                        {copiedSection === 'next_task' ? <Check size={14} color="#10b981" /> : <Copy size={14} />}
                        {copiedSection === 'next_task' ? 'Copied' : 'Copy'}
                      </button>
                    </div>
                    <div className="markdown-body">
                      <ReactMarkdown>{nextTaskResult}</ReactMarkdown>
                      {isGeneratingNextTask && <span className="typing-cursor" />}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Tab 6: Interview Prep */}
        {activeTab === 'interview' && (
          <div className="view-container">
            <div className="view-header">
              <h2><Mic size={26} color="#6366f1" /> Interview Preparation</h2>
              <p>Practice with role-specific questions tailored to your target position and current tech stack.</p>
            </div>

            <div className="content-card">
              <div className="action-banner">
                <div>
                  <strong>Interview Role: {profile.goal || "Goal not set"}</strong>
                  <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                    Based on your skills: {profile.skills || "Not provided"}
                  </div>
                </div>

                {isGeneratingInterview ? (
                  <button className="btn-stop" onClick={handleStopGeneration}>
                    <Square size={14} fill="currentColor" /> Stop Generating
                  </button>
                ) : (
                  <button
                    className="btn-primary"
                    onClick={() =>
                      executeStreamRequest(
                        '/api/ai/interview',
                        {
                          name: profile.name,
                          skills: profile.skills,
                          goal: profile.goal
                        },
                        setInterviewQuestions,
                        setIsGeneratingInterview
                      )
                    }
                  >
                    <Mic size={16} /> Generate Interview Questions
                  </button>
                )}
              </div>

              {interviewQuestions && (
                <div className="response-box">
                  <div className="response-header">
                    <span className="section-label">Mock Interview Questions & Guidance</span>
                    <button
                      className="btn-secondary"
                      onClick={() => handleCopy(interviewQuestions, 'interview')}
                    >
                      {copiedSection === 'interview' ? <Check size={14} color="#10b981" /> : <Copy size={14} />}
                      {copiedSection === 'interview' ? 'Copied' : 'Copy'}
                    </button>
                  </div>
                  <div className="markdown-body">
                    <ReactMarkdown>{interviewQuestions}</ReactMarkdown>
                    {isGeneratingInterview && <span className="typing-cursor" />}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Tab 7: Project Suggestions */}
        {activeTab === 'projects' && (
          <div className="view-container">
            <div className="view-header">
              <h2><Lightbulb size={26} color="#6366f1" /> AI Project Suggestions</h2>
              <p>Discover resume-worthy portfolio projects designed specifically for your experience level.</p>
            </div>

            <div className="content-card">
              <div className="action-banner">
                <div>
                  <strong>Portfolio for: {profile.goal || "Goal not set"}</strong>
                  <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                    Using technologies: {profile.skills || "Not specified"}
                  </div>
                </div>

                {isGeneratingProjects ? (
                  <button className="btn-stop" onClick={handleStopGeneration}>
                    <Square size={14} fill="currentColor" /> Stop Generating
                  </button>
                ) : (
                  <button
                    className="btn-primary"
                    onClick={() =>
                      executeStreamRequest(
                        '/api/ai/projects',
                        {
                          name: profile.name,
                          education: profile.education,
                          skills: profile.skills,
                          goal: profile.goal
                        },
                        setProjectsResult,
                        setIsGeneratingProjects
                      )
                    }
                  >
                    <Lightbulb size={16} /> Suggest Projects
                  </button>
                )}
              </div>

              {projectsResult && (
                <div className="response-box">
                  <div className="response-header">
                    <span className="section-label">Recommended Project Ideas</span>
                    <button
                      className="btn-secondary"
                      onClick={() => handleCopy(projectsResult, 'projects')}
                    >
                      {copiedSection === 'projects' ? <Check size={14} color="#10b981" /> : <Copy size={14} />}
                      {copiedSection === 'projects' ? 'Copied' : 'Copy'}
                    </button>
                  </div>
                  <div className="markdown-body">
                    <ReactMarkdown>{projectsResult}</ReactMarkdown>
                    {isGeneratingProjects && <span className="typing-cursor" />}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
