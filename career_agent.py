from langchain_core.prompts import ChatPromptTemplate

from llm import get_llm

from prompts import (
    CAREER_CHAT_PROMPT,
    SKILL_ANALYSIS_PROMPT,
    ROADMAP_PROMPT,
    INTERVIEW_PROMPT,
    PROJECT_PROMPT,
    NEXT_TASK_PROMPT
)


class CareerMentorAgent:

    def __init__(self):
        self.llm = get_llm()

    def generate(self, prompt, variables):
        """
        Sends prompt to the LLM through LangChain.
        """

        template = ChatPromptTemplate.from_template(prompt)

        chain = template | self.llm

        for chunk in chain.stream(variables):
            if chunk.content:
                yield chunk.content

    def chat(self, name, education, skills, goal, question):

        return self.generate(
            CAREER_CHAT_PROMPT,
            {
                "name": name,
                "education": education,
                "skills": skills,
                "goal": goal,
                "question": question
            }
        )

    def skill_analysis(self, name, education, skills, goal):

        return self.generate(
            SKILL_ANALYSIS_PROMPT,
            {
                "name": name,
                "education": education,
                "skills": skills,
                "goal": goal
            }
        )

    def roadmap(self, name, education, skills, goal):

        return self.generate(
            ROADMAP_PROMPT,
            {
                "name": name,
                "education": education,
                "skills": skills,
                "goal": goal
            }
        )

    def interview(self, name, skills, goal):

        return self.generate(
            INTERVIEW_PROMPT,
            {
                "name": name,
                "skills": skills,
                "goal": goal
            }
        )

    def projects(self, name, education, skills, goal):

        return self.generate(
            PROJECT_PROMPT,
            {
                "name": name,
                "education": education,
                "skills": skills,
                "goal": goal
            }
        )

    def next_task(
        self,
        name,
        skills,
        goal,
        completed_topics
    ):

        topics = ", ".join(completed_topics)

        if not topics:
            topics = "No topics completed yet"

        return self.generate(
            NEXT_TASK_PROMPT,
            {
                "name": name,
                "skills": skills,
                "goal": goal,
                "completed_topics": topics
            }
        )