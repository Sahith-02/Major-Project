from models.database import connect_to_db

def fetch_question_from_db(subject, difficulty, asked_questions):
    connection = connect_to_db()
    if not connection:
        return None
    try:
        with connection.cursor() as cursor:
            if asked_questions:
                asked_questions_tuple = tuple(asked_questions)
                query = """
                SELECT question_text
                FROM questions
                WHERE subject = %s AND difficulty = %s
                AND question_text NOT IN %s
                ORDER BY RANDOM()
                LIMIT 1;
                """
                cursor.execute(query, (subject, difficulty, asked_questions_tuple))
            else:
                query = """
                SELECT question_text
                FROM questions
                WHERE subject = %s AND difficulty = %s
                ORDER BY RANDOM()
                LIMIT 1;
                """
                cursor.execute(query, (subject, difficulty))
            result = cursor.fetchone()
            print(result)
            return result[0] if result else None
    except Exception as e:
        print(f"Error fetching question from the database: {e}")
        return None
    finally:
        connection.close()
