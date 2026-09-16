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

    cursor.execute("""
        CREATE TABLE IF NOT EXISTS progress (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            topic TEXT UNIQUE,
            completed INTEGER DEFAULT 0
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


def add_progress(topic):
    conn = get_connection()
    cursor = conn.cursor()

    cursor.execute("""
        INSERT OR REPLACE INTO progress(topic, completed)
        VALUES (?, 1)
    """, (topic,))

    conn.commit()
    conn.close()


def get_completed_topics():
    conn = get_connection()
    cursor = conn.cursor()

    cursor.execute("""
        SELECT topic
        FROM progress
        WHERE completed = 1
    """)

    results = cursor.fetchall()

    conn.close()

    return [row[0] for row in results]