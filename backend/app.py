from flask import Flask, jsonify, request
from flask_cors import CORS
import psycopg2
import random
import spacy
import PyPDF2
import os

nlp = spacy.load("en_core_web_sm")
app = Flask(__name__)

# Enable CORS
CORS(app, origins=["http://localhost:3000"])

DB_HOST = "localhost"
DB_PORT = "5432"
DB_NAME = "smart_interview_system"
DB_USER = "postgres"
DB_PASSWORD = "Sahith@02"

# (rest of your code)


# Get database connection
def get_db_connection():
    conn = psycopg2.connect(
        host=DB_HOST,
        port=DB_PORT,
        database=DB_NAME,
        user=DB_USER,
        password=DB_PASSWORD
    )
    return conn



@app.route("/submit-rating", methods=["POST"])
def submit_rating():
    try:
        data = request.json
        subject_ratings = data.get("ratings")  # {"OOPs": 8, "DBMS": 7, "OS": 9}
        
        # Store these ratings in your database or process them as needed
        # For now, let's print them (you can modify to save in the database)
        print("Received Ratings:", subject_ratings)
        
        # Based on ratings, send appropriate response back
        return jsonify({"message": "Ratings submitted successfully!"})
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route("/next-question", methods=["GET","POST"])
def get_next_question():
    try:
        data = request.json
        candidate_id = data.get("candidate_id")
        subject = data.get("subject")
        previous_status = data.get("previous_status", None)

        conn = get_db_connection()
        cursor = conn.cursor()

        # Adjust difficulty based on previous status
        difficulty = "easy"
        if previous_status == "correct":
            difficulty = "medium"
        elif previous_status == "incorrect":
            difficulty = "easy"

        # Fetch a new question
        cursor.execute(
            """
            SELECT id, question_text, difficulty, correct_answer 
            FROM questions 
            WHERE subject = %s AND difficulty = %s AND id NOT IN (
                SELECT question_id FROM interview_progress WHERE candidate_id = %s
            )
            ORDER BY RANDOM() LIMIT 1
            """,
            (subject, difficulty, candidate_id)
        )

        question = cursor.fetchone()
        if not question:
            return jsonify({"message": "No more questions available for this difficulty."}), 404

        question_data = {
            "id": question[0],
            "question_text": question[1],
            "difficulty": question[2],
            "correct_answer": question[3],
        }

        # Save progress
        cursor.execute(
            """
            INSERT INTO interview_progress (candidate_id, question_id, difficulty, status)
            VALUES (%s, %s, %s, 'pending')
            """,
            (candidate_id, question_data["id"], difficulty)
        )
        conn.commit()
        cursor.close()
        conn.close()

        return jsonify(question_data)
    except Exception as e:
        return jsonify({"error": str(e)}), 500
    
    
@app.route("/submit-answer", methods=["POST"])
def submit_answer():
    try:
        data = request.json
        candidate_id = data.get("candidate_id")
        question_id = data.get("question_id")
        user_answer = data.get("user_answer")

        conn = get_db_connection()
        cursor = conn.cursor()

        # Fetch the correct answer
        cursor.execute("SELECT correct_answer FROM questions WHERE id = %s", (question_id,))
        correct_answer = cursor.fetchone()
        if not correct_answer:
            return jsonify({"message": "Invalid question ID."}), 404

        correct_answer = correct_answer[0]

        # Evaluate answer (basic keyword matching for now)
        is_correct = all(keyword.lower() in user_answer.lower() for keyword in correct_answer.split())

        # Update progress status
        status = "correct" if is_correct else "incorrect"
        cursor.execute(
            """
            UPDATE interview_progress 
            SET status = %s 
            WHERE candidate_id = %s AND question_id = %s
            """,
            (status, candidate_id, question_id)
        )
        conn.commit()
        cursor.close()
        conn.close()

        return jsonify({"is_correct": is_correct, "correct_answer": correct_answer})
    except Exception as e:
        return jsonify({"error": str(e)}), 500


if __name__ == "__main__":
    app.run(debug=True)
