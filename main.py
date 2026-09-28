from career_agent import CareerMentorAgent


def main():
    print("===================================")
    print("      AI CAREER MENTOR AGENT")
    print("===================================")

    name = input("Enter your name: ")
    skills = input("Enter your current skills: ")
    goal = input("Enter your career goal: ")

    agent = CareerMentorAgent()

    print("\n========== CAREER PLAN ==========\n")
    for chunk in agent.roadmap(name, "", skills, goal):
        print(chunk, end="", flush=True)
    print()


if __name__ == "__main__":
    main()