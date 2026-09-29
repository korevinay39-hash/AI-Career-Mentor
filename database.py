import sqlite3


DB_NAME = "career_mentor.db"


def get_connection():
    return sqlite3.connect(DB_NAME)


def create_tables():
    conn = get_connection()
    cursor = conn.cursor()

    cursor.execute("""
        CREATE TABLE IF NOT EXISTS student_profile (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT,
            education TEXT,
            skills TEXT,
            goal TEXT
        )
    """)

    conn.commit()
    conn.close()


def save_profile(name, education, skills, goal):
    conn = get_connection()
    cursor = conn.cursor()

    cursor.execute("DELETE FROM student_profile")

    cursor.execute("""
        INSERT INTO student_profile
        (name, education, skills, goal)
        VALUES (?, ?, ?, ?)
    """, (name, education, skills, goal))

    conn.commit()
    conn.close()


def get_profile():
    conn = get_connection()
    cursor = conn.cursor()

    cursor.execute("""
        SELECT name, education, skills, goal
        FROM student_profile
        ORDER BY id DESC
        LIMIT 1
    """)

    result = cursor.fetchone()

    conn.close()

    return result
