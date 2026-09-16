import json
import streamlit as st

from career_agent import CareerMentorAgent

from database import (
    create_tables,
    save_profile,
    get_profile,
    add_progress,
    get_completed_topics
)


# --------------------------------------------------
# INITIALIZATION
# --------------------------------------------------

create_tables()

st.set_page_config(
    page_title="AI Career Mentor",
    page_icon="🎓",
    layout="wide"
)


# --------------------------------------------------
# LOAD AGENT
# --------------------------------------------------

@st.cache_resource
def load_agent():
    return CareerMentorAgent()


agent = load_agent()


# --------------------------------------------------
# LOAD RESOURCES
# --------------------------------------------------

def load_resources():
    with open(
        "data/resources.json",
        "r",
        encoding="utf-8"
    ) as file:
        return json.load(file)


resources = load_resources()


# --------------------------------------------------
# TITLE
# --------------------------------------------------

st.title("🎓 AI Career Mentor")

st.write(
    "Your personal GenAI-powered career planning assistant"
)

st.divider()


# --------------------------------------------------
# SIDEBAR
# --------------------------------------------------

st.sidebar.title("👨‍🎓 Student Profile")

name = st.sidebar.text_input(
    "Name"
)

education = st.sidebar.text_input(
    "Education",
    placeholder="B.Tech Computer Engineering"
)

skills = st.sidebar.text_area(
    "Current Skills",
    placeholder="Python, Java, React, SQL"
)

goal = st.sidebar.text_input(
    "Career Goal",
    placeholder="AI Developer"
)


# --------------------------------------------------
# SAVE PROFILE
# --------------------------------------------------

if st.sidebar.button(
    "💾 Save Profile",
    use_container_width=True
):

    if name and education and skills and goal:

        save_profile(
            name,
            education,
            skills,
            goal
        )

        st.sidebar.success(
            "Profile saved successfully!"
        )

    else:

        st.sidebar.warning(
            "Please fill all profile fields."
        )


# --------------------------------------------------
# LOAD SAVED PROFILE
# --------------------------------------------------

saved_profile = get_profile()

if saved_profile:

    saved_name, saved_education, saved_skills, saved_goal = saved_profile

else:

    saved_name = ""
    saved_education = ""
    saved_skills = ""
    saved_goal = ""


# --------------------------------------------------
# TABS
# --------------------------------------------------

tabs = st.tabs([
    "💬 Career Chat",
    "📊 Skill Analysis",
    "🗺️ Career Roadmap",
    "📚 Resources",
    "📈 Progress",
    "🎤 Interview",
    "💡 Projects"
])


# ==================================================
# 1. CAREER CHAT
# ==================================================

with tabs[0]:

    st.header("💬 AI Career Chat")

    st.write(
        "Ask the AI mentor anything about your career."
    )

    # Initialize chat history
    if "messages" not in st.session_state:

        st.session_state.messages = []


    # Display previous messages
    for message in st.session_state.messages:

        with st.chat_message(
            message["role"]
        ):

            st.markdown(
                message["content"]
            )


    # Chat input
    question = st.chat_input(
        "Ask your career question..."
    )


    if question:

        if not saved_name:

            st.warning(
                "Please save your student profile first."
            )

        else:

            # ------------------------------------------
            # USER MESSAGE
            # ------------------------------------------

            st.session_state.messages.append(
                {
                    "role": "user",
                    "content": question
                }
            )

            with st.chat_message("user"):

                st.markdown(question)


            # ------------------------------------------
            # AI RESPONSE - STREAMING
            # ------------------------------------------

            with st.chat_message("assistant"):

                with st.spinner(
                    "AI Mentor is thinking..."
                ):

                    answer = st.write_stream(
                        agent.chat(
                            saved_name,
                            saved_education,
                            saved_skills,
                            saved_goal,
                            question
                        )
                    )


            # ------------------------------------------
            # SAVE AI RESPONSE
            # ------------------------------------------

            st.session_state.messages.append(
                {
                    "role": "assistant",
                    "content": answer
                }
            )


# ==================================================
# 2. SKILL ANALYSIS
# ==================================================

with tabs[1]:

    st.header("📊 Skill Gap Analysis")

    st.write(
        "Compare your current skills with your target career."
    )


    if st.button(
        "🔍 Analyze My Skills",
        key="skill_button"
    ):

        if not saved_name:

            st.warning(
                "Please save your profile first."
            )

        else:

            st.write("### AI Skill Analysis")

            # Stream directly into UI
            result = st.write_stream(
                agent.skill_analysis(
                    saved_name,
                    saved_education,
                    saved_skills,
                    saved_goal
                )
            )


# ==================================================
# 3. ROADMAP
# ==================================================

with tabs[2]:

    st.header("🗺️ Personalized Career Roadmap")

    st.write(
        "Generate a learning path based on your current skills."
    )


    if st.button(
        "🚀 Generate Roadmap",
        key="roadmap_button"
    ):

        if not saved_name:

            st.warning(
                "Please save your profile first."
            )

        else:

            st.write("### Your Personalized Roadmap")

            # Stream directly into UI
            result = st.write_stream(
                agent.roadmap(
                    saved_name,
                    saved_education,
                    saved_skills,
                    saved_goal
                )
            )


# ==================================================
# 4. RESOURCES
# ==================================================

with tabs[3]:

    st.header("📚 Learning Resources")

    st.write(
        "Topics recommended according to your career."
    )


    category = st.selectbox(
        "Choose a category",
        list(resources.keys())
    )


    st.subheader(
        f"Recommended topics for {category}"
    )


    for item in resources[category]:

        st.checkbox(
            item,
            key=f"resource_{category}_{item}"
        )


# ==================================================
# 5. PROGRESS
# ==================================================

with tabs[4]:

    st.header("📈 Learning Progress")

    st.write(
        "Mark topics that you have completed."
    )


    progress_topics = [
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
    ]


    # ----------------------------------------------
    # GET COMPLETED TOPICS
    # ----------------------------------------------

    completed = get_completed_topics()


    # ----------------------------------------------
    # TOPIC CHECKBOXES
    # ----------------------------------------------

    for topic in progress_topics:

        checked = topic in completed

        value = st.checkbox(
            topic,
            value=checked,
            key=f"progress_{topic}"
        )


        if value and not checked:

            add_progress(topic)


    # Refresh completed topics
    completed = get_completed_topics()


    st.divider()


    # ----------------------------------------------
    # CALCULATE PROGRESS
    # ----------------------------------------------

    total = len(progress_topics)

    completed_count = len(
        [
            topic
            for topic in progress_topics
            if topic in completed
        ]
    )


    percentage = (
        completed_count / total
    ) * 100


    st.progress(
        percentage / 100
    )


    st.write(
        f"### Progress: {percentage:.0f}%"
    )


    st.write(
        f"{completed_count} / {total} topics completed"
    )


    st.divider()


    # ----------------------------------------------
    # NEXT TASK
    # ----------------------------------------------

    if st.button(
        "🎯 Suggest My Next Task",
        key="next_task_button"
    ):

        if not saved_name:

            st.warning(
                "Please save your profile first."
            )

        else:

            st.write("### 🎯 Your Next Learning Task")

            # Stream directly into UI
            result = st.write_stream(
                agent.next_task(
                    saved_name,
                    saved_skills,
                    saved_goal,
                    completed
                )
            )


# ==================================================
# 6. INTERVIEW
# ==================================================

with tabs[5]:

    st.header("🎤 Interview Preparation")

    st.write(
        "Generate role-specific interview questions."
    )


    if st.button(
        "📝 Generate Interview Questions",
        key="interview_button"
    ):

        if not saved_name:

            st.warning(
                "Please save your profile first."
            )

        else:

            st.write("### 🎤 Interview Questions")

            # Stream directly into UI
            result = st.write_stream(
                agent.interview(
                    saved_name,
                    saved_skills,
                    saved_goal
                )
            )


# ==================================================
# 7. PROJECTS
# ==================================================

with tabs[6]:

    st.header("💡 AI Project Suggestions")

    st.write(
        "Find projects suitable for your current level."
    )


    if st.button(
        "🚀 Suggest Projects",
        key="project_button"
    ):

        if not saved_name:

            st.warning(
                "Please save your profile first."
            )

        else:

            st.write("### 💡 Recommended Projects")

            # Stream directly into UI
            result = st.write_stream(
                agent.projects(
                    saved_name,
                    saved_education,
                    saved_skills,
                    saved_goal
                )
            )


# --------------------------------------------------
# FOOTER
# --------------------------------------------------

st.divider()

st.caption(
    "AI Career Mentor | Python + Streamlit + LangChain + Ollama + SQLite"
)