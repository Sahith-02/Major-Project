from flask import Blueprint, request, jsonify
from flask_jwt_extended import get_jwt_identity, jwt_required
from services.gemini_service import evaluate_answer, generate_followup_questions
from models.database import connect_to_db
from config import Config
import psycopg2
from flask import Blueprint, request, jsonify
from datetime import datetime
from models.database import connect_to_db
from datetime import datetime
from flask import jsonify

evaluation_bp = Blueprint('evaluation', __name__,url_prefix='/api') 



@evaluation_bp.route('/user-evaluations', methods=['GET'])
def get_user_evaluations():
    if request.method == 'OPTIONS':
        return jsonify({}), 200
    
    try:
        user_id = request.args.get('user_id')
        if not user_id:
            return jsonify({"error": "User ID is required"}), 400

        connection = connect_to_db()
        if not connection:
            return jsonify({"error": "Database connection failed"}), 500

        with connection.cursor() as cursor:
            query = """
            SELECT * FROM user_evaluations 
            WHERE user_id = %s
            ORDER BY evaluation_date DESC
            """
            cursor.execute(query, (user_id,))
            evaluations = cursor.fetchall()

            # Convert to list of dictionaries
            evaluations_list = []
            for eval in evaluations:
                 evaluations_list.append({
                    'id': eval[0],
                    'user_id': eval[1],
                    'subject': eval[2],
                    'difficulty': eval[3],
                    'score': eval[4],
                    'feedback': eval[5],
                    'weak_areas': eval[6],
                    'strong_areas': eval[7],
                    'evaluation_date': eval[8].isoformat() if eval[8] else None,
                    'question': eval[10]  # Make sure this is included
                })

        return jsonify({    
            "success": True,
            "evaluations": evaluations_list
        }), 200

    except Exception as e:
        print(f"Error fetching evaluations: {str(e)}")
        return jsonify({"error": str(e)}), 500
    finally:
        if connection:
            connection.close()
            
            
@evaluation_bp.route('/submit-answer', methods=['POST'])
def handle_submit_answer():
    if request.method == 'OPTIONS':
        return jsonify({}), 200
    
    data = request.get_json()
    if not data:
        return jsonify({"error": "No data provided"}), 400

    try:
        user_id = data.get('user_id')
        if not user_id:
            return jsonify({"error": "User ID is required"}), 400

        required_fields = ['answer', 'question', 'difficulty', 'subject', 'interview_state']
        for field in required_fields:
            if field not in data:
                return jsonify({"error": f"Missing required field: {field}"}), 400

        evaluation = evaluate_answer(data['answer'], data['question'], data['difficulty'])
        
        print("Evaluation result:", evaluation)
        
        if 'weak_areas' not in evaluation or not isinstance(evaluation['weak_areas'], list):
            evaluation['weak_areas'] = []
        if 'strong_areas' not in evaluation or not isinstance(evaluation['strong_areas'], list):
            evaluation['strong_areas'] = []
            
        evaluation_id = store_evaluation(
            user_id=user_id,
            subject=data['subject'],
            difficulty=data['difficulty'],
            score=evaluation['score'],
            feedback=evaluation['feedback'],
            weak_areas=evaluation['weak_areas'],
            strong_areas=evaluation['strong_areas'],
            question=data['question'] 
        )
        
        if not evaluation_id:
            return jsonify({"error": "Failed to store evaluation"}), 500

        followup_questions = generate_followup_questions(data['question'], data['answer'])
        
        interview_state = data['interview_state']
        interview_state['asked_questions'].append(data['question'])
        interview_state['current_question_index'] += 1

        return jsonify({
            "success": True,
            "evaluation": {
                "score": evaluation['score'],
                "feedback": evaluation['feedback'],
                "weak_areas": evaluation['weak_areas'],
                "strong_areas": evaluation['strong_areas']
            },
            "followup_questions": followup_questions,
            "interview_state": interview_state,
            "subject": data['subject'],
            "difficulty": data['difficulty'],
            "round_number": interview_state.get('round_number', 1),
            "question_number": interview_state.get('question_number', 1),
            "total_questions": interview_state.get('total_questions', 0),
            "total_rounds": interview_state.get('total_rounds', 0)
        }), 200

    except Exception as e:
        print(f"Error in submit_answer: {str(e)}")
        return jsonify({"error": str(e)}), 500

@evaluation_bp.route('/complete-subject', methods=['POST'])
def complete_subject():
    data = request.get_json()
    subject = data.get('subject')
    
    if not subject:
        return jsonify({"error": "Subject is required"}), 400
    
    return jsonify({
        "success": True,
        "message": f"Subject {subject} marked as complete"
    }), 200
        
@evaluation_bp.route('/evaluate', methods=['POST'])
def evaluate():
    data = request.json
    user_response = data.get('answer')
    question = data.get('question')
    evaluation = evaluate_answer(user_response, question)
    return jsonify({"evaluation": evaluation})


@evaluation_bp.route('/store-evaluation', methods=['POST'])
def handle_store_evaluation():
    # Add CORS headers
    if request.method == 'OPTIONS':
        return jsonify({}), 200
    
    data = request.get_json()
    if not data:
        return jsonify({"error": "No data provided"}), 400

    try:
        connection = connect_to_db()
        if not connection:
            return jsonify({"error": "Database connection failed"}), 500
            
        with connection.cursor() as cursor:
            query = """
            INSERT INTO user_evaluations 
            (user_id, subject, difficulty, score, feedback, weak_areas, strong_areas, evaluation_date)
            VALUES (%s, %s, %s, %s, %s, %s, %s, NOW())
            RETURNING id;
            """
            cursor.execute(query, (
                data.get('user_id'),
                data.get('subject'),
                data.get('difficulty'),
                data.get('score'),
                data.get('feedback'),
                data.get('weak_areas', []),
                data.get('strong_areas', [])
            ))
            evaluation_id = cursor.fetchone()[0]
            connection.commit()
        
        return jsonify({
            "success": True,
            "evaluation_id": evaluation_id
        }), 200
        
    except Exception as e:
        print(f"Error storing evaluation: {e}")
        return jsonify({"error": str(e)}), 500
    finally:
        if connection:
            connection.close()
    
def store_evaluation(user_id, subject, difficulty, score, feedback, weak_areas, strong_areas,question):
    connection = connect_to_db()
    if not connection:
        return None

    try:
        print(f"Storing evaluation with weak_areas: {weak_areas}, strong_areas: {strong_areas}")
        
        if not isinstance(weak_areas, list):
            weak_areas = []
        if not isinstance(strong_areas, list):
            strong_areas = []
            
        with connection.cursor() as cursor:
            query = """
            INSERT INTO user_evaluations 
            (user_id, subject, difficulty, score, feedback, weak_areas, strong_areas, evaluation_date,question)
            VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s)
            RETURNING id;
            """
            
            cursor.execute(query, (
                user_id,
                subject,
                difficulty,
                score,
                feedback,
                weak_areas,
                strong_areas,
                datetime.now(),
                question
            ))
            evaluation_id = cursor.fetchone()[0]
            connection.commit()
            print(f"Successfully stored evaluation with ID: {evaluation_id}")
            return evaluation_id
    except Exception as e:
        print(f"Error storing evaluation: {e}")
        return None
    finally:
        connection.close()
                
def extract_score(score_str):
    # Convert "8/10" to 80
    if '/' in score_str:
        parts = score_str.split('/')
        return int((float(parts[0]) / float(parts[1]))) * 100
    # Handle other score formats if needed
    return int(score_str)

def identify_weak_areas(evaluation):
    # Implement your logic to identify weak areas from feedback
    # Example: look for keywords in feedback
    weak_keywords = ["improve", "weak", "better", "not clear"]
    return [area for area in weak_keywords if area in evaluation['feedback'].lower()]

def identify_strong_areas(evaluation):
    # Implement your logic to identify strong areas from feedback
    strong_keywords = ["excellent", "good", "strong", "well"]
    return [area for area in strong_keywords if area in evaluation['feedback'].lower()]