from career_agent import CareerMentorAgent


def main():
    print("===================================")
    print("      AI CAREER MENTOR AGENT")
    print("===================================")

    name = input("Enter your name: ")
    skills = input("Enter your current skills: ")
    goal = input("Enter your career goal: ")

    agent = CareerAgent()

    result = agent.create_career_plan(name, skills, goal)

    print("\n========== CAREER PLAN ==========\n")
    print(result)


if __name__ == "__main__":
    main()