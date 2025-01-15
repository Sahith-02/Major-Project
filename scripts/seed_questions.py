import psycopg2

# Database connection details
DB_HOST = "localhost"
DB_PORT = "5432"
DB_NAME = "smart_interview_system"
DB_USER = "postgres"
DB_PASSWORD = "Sahith@02"

# Sample questions
questions = [
    {
        "subject": "OOPs",
        "difficulty": "easy",
        "question_text": "What is polymorphism?",
        "correct_answer": "Polymorphism is the ability of a function to behave differently based on the context."
    },
    {
        "subject": "DBMS",
        "difficulty": "medium",
        "question_text": "Explain normalization in databases.",
        "correct_answer": "Normalization is a process of organizing data to reduce redundancy and improve data integrity."
    },
    {
        "subject": "OS",
        "difficulty": "hard",
        "question_text": "What is a deadlock in operating systems?",
        "correct_answer": "A deadlock is a situation where a set of processes are blocked because each process is holding a resource and waiting for another resource."
    }
]

# Insert questions into PostgreSQL
def seed_questions():
    try:
        conn = psycopg2.connect(
            host=DB_HOST,
            port=DB_PORT,
            database=DB_NAME,
            user=DB_USER,
            password=DB_PASSWORD
        )
        cursor = conn.cursor()

        for q in questions:
            cursor.execute(
                """
                INSERT INTO questions (subject, difficulty, question_text, correct_answer)
                VALUES (%s, %s, %s, %s)
                """,
                (q["subject"], q["difficulty"], q["question_text"], q["correct_answer"])
            )

        conn.commit()
        cursor.close()
        conn.close()
        print("Questions seeded successfully!")
    except Exception as e:
        print(f"Error seeding questions: {e}")

if __name__ == "__main__":
    seed_questions()
