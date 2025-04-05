from flask import Blueprint, request, jsonify
from models.question_model import fetch_question_from_db
from services.gemini_service import generate_followup_questions, evaluate_answer
import random

interview_bp = Blueprint('interview', __name__)

# Global variables to track interview state
question_counter = 0
round_counter = 1  # Start with round 1
current_questions_limit = 0  # Will be randomly set for each round
current_rounds_limit = 0  # Will be randomly set for each subject
current_subject_index = 0
subjects = ['cpp', 'dbms', 'os']  # Fixed order of subjects
available_subjects = subjects.copy()  # Track available subjects
current_subject = ''  # Will be set based on user selection
completed_subjects = []  # Track completed subjects
follow_up_questions_cache = []
is_first_question_in_round = True
current_difficulty = ''  # Track the current difficulty

@interview_bp.route('/available-subjects', methods=['GET'])
def get_available_subjects():
    """Return the list of subjects that haven't been completed yet"""
    return jsonify({
        "available_subjects": available_subjects
    })

@interview_bp.route('/complete-subject', methods=['POST'])
def complete_subject():
    """Mark a subject as completed and return updated available subjects"""
    global available_subjects, completed_subjects
    
    data = request.json
    subject = data.get('subject')
    
    if subject in available_subjects:
        available_subjects.remove(subject)
        completed_subjects.append(subject)
    
    return jsonify({
        "message": f"Subject {subject} completed",
        "available_subjects": available_subjects,
        "completed_subjects": completed_subjects
    })

@interview_bp.route('/start-interview', methods=['POST'])
def start_interview():
    global question_counter, round_counter, current_questions_limit, current_rounds_limit
    global current_subject, follow_up_questions_cache, is_first_question_in_round, current_difficulty
    
    data = request.json
    subject = data.get('subject')
    difficulty = data.get('difficulty')
    asked_questions = data.get('asked_questions', [])
    
    # Check if subject or difficulty has changed from previous interview
    if subject != current_subject or difficulty != current_difficulty:
        # Reset state for new subject/difficulty
        question_counter = 0
        round_counter = 1
        current_questions_limit = 0
        current_rounds_limit = 0
        follow_up_questions_cache = []
        is_first_question_in_round = True
        current_difficulty = difficulty
    
    # Return if all subjects are completed
    if not available_subjects:
        return jsonify({
            "message": "All subjects completed",
            "complete": True
        })
    
    # If subject is provided and valid, use it
    if subject and subject in available_subjects:
        current_subject = subject
    elif not current_subject or current_subject not in available_subjects:
        # Otherwise use the first available subject
        current_subject = available_subjects[0] if available_subjects else None
        
    if not current_subject:
        return jsonify({
            "message": "No subjects available",
            "complete": True
        })
    
    # Initialize limits if this is the first question of the interview
    if current_questions_limit == 0 or current_rounds_limit == 0:
        # Set random limits for the subject
        current_rounds_limit = random.randint(2, 3)
        current_questions_limit = random.randint(2, 4)
        is_first_question_in_round = True
        print(f"Initial setup: {current_subject}, Rounds: {current_rounds_limit}, Questions per round: {current_questions_limit}")
    
    # Check if we need to move to the next round
    if question_counter >= current_questions_limit:
        # We've completed all questions in this round
        question_counter = 0
        follow_up_questions_cache = []
        is_first_question_in_round = True
        
        # Check if we need to move to the next round
        if round_counter < current_rounds_limit:
            round_counter += 1
            print(f"Moving to round {round_counter} of {current_rounds_limit}")
        else:
            # User completed all rounds for this subject
            return jsonify({
                "message": f"Subject {current_subject} completed",
                "complete_subject": True
            })
    
    # Determine if we should use a follow-up question or get from DB
    if is_first_question_in_round:
        # First question of each round comes from the database
        question = fetch_question_from_db(current_subject, difficulty, asked_questions)
        if question:
            asked_questions.append(question)
            question_counter = 1  # First question
            is_first_question_in_round = False
            return jsonify({
                "question": question,
                "subject": current_subject,
                "difficulty": difficulty,
                "asked_questions": asked_questions,
                "round_number": round_counter,
                "question_number": question_counter,
                "total_questions": current_questions_limit,
                "total_rounds": current_rounds_limit,
                "is_db_question": True,
                "interview_state": {
                    "subject": current_subject,
                    "difficulty": difficulty,
                    "asked_questions": asked_questions,
                    "current_question_index": 0,
                    "current_subject": current_subject,
                    "round_number": round_counter,
                    "question_number": question_counter,
                    "total_questions": current_questions_limit,
                    "total_rounds": current_rounds_limit,
                    "completed_subjects": completed_subjects
                }
            })
        else:
            return jsonify({
                "error": f"No questions available for {current_subject}."
            }), 404
    elif follow_up_questions_cache and question_counter < current_questions_limit:
        # Use a follow-up question from the cache
        question = follow_up_questions_cache.pop(0)
        question_counter += 1
        print(f"Using follow-up question {question_counter} of {current_questions_limit}")
        return jsonify({
            "question": question,
            "subject": current_subject,
            "difficulty": difficulty,
            "asked_questions": asked_questions,
            "round_number": round_counter,
            "question_number": question_counter,
            "total_questions": current_questions_limit,
            "total_rounds": current_rounds_limit,
            "is_db_question": False,
            "interview_state": {
                "subject": current_subject,
                "difficulty": difficulty,
                "asked_questions": asked_questions,
                "current_question_index": 0,
                "current_subject": current_subject,
                "round_number": round_counter,
                "question_number": question_counter,
                "total_questions": current_questions_limit,
                "total_rounds": current_rounds_limit,
                "completed_subjects": completed_subjects
            }
        })
    else:
        # No follow-up questions available, get a new question from DB
        question = fetch_question_from_db(current_subject, difficulty, asked_questions)
        if question:
            asked_questions.append(question)
            question_counter += 1
            return jsonify({
                "question": question,
                "subject": current_subject,
                "difficulty": difficulty,
                "asked_questions": asked_questions,
                "round_number": round_counter,
                "question_number": question_counter,
                "total_questions": current_questions_limit,
                "total_rounds": current_rounds_limit,
                "is_db_question": True,
                "interview_state": {
                    "subject": current_subject,
                    "difficulty": difficulty,
                    "asked_questions": asked_questions,
                    "current_question_index": 0,
                    "current_subject": current_subject,
                    "round_number": round_counter,
                    "question_number": question_counter,
                    "total_questions": current_questions_limit,
                    "total_rounds": current_rounds_limit,
                    "completed_subjects": completed_subjects
                }
            })
        else:
            return jsonify({
                "error": f"No more questions available for {current_subject}."
            }), 404

@interview_bp.route('/submit-answer', methods=['POST'])
def submit_answer():
    global follow_up_questions_cache

    data = request.json
    user_response = data.get('answer')
    question = data.get('question')
    difficulty = data.get('difficulty')
    interview_state = data.get('interview_state')

    # Validate required fields
    if not user_response or not question or not difficulty or not interview_state:
        return jsonify({"error": "Missing required fields"}), 400

    try:
        # Evaluate the answer
        evaluation = evaluate_answer(user_response, question, difficulty)
    except Exception as e:
        print(f"Error evaluating answer: {e}")
        # Provide a default evaluation if Gemini fails
        evaluation = {
            "score": 5,
            "feedback": "Your answer has been recorded. Due to high demand, detailed feedback is not available at this moment."
        }

    try:
        # Generate follow-up questions
        followup_questions = generate_followup_questions(user_response, question)
        # Store in cache for future use
        follow_up_questions_cache = followup_questions.copy() if followup_questions else []
    except Exception as e:
        print(f"Error generating follow-up questions: {e}")
        # Create simple follow-up questions if Gemini fails
        topic_words = question.split()[:3]
        topic = " ".join(topic_words)
        followup_questions = [
            f"Can you explain more about {topic}?",
            f"What are the key challenges in implementing {topic}?",
            f"How would you optimize solutions related to {topic}?"
        ]
        follow_up_questions_cache = followup_questions.copy()

    # Update interview_state
    interview_state["last_question"] = question
    interview_state["last_answer"] = user_response
    interview_state["current_subject"] = current_subject
    interview_state["round_number"] = round_counter
    interview_state["question_number"] = question_counter
    interview_state["total_questions"] = current_questions_limit
    interview_state["total_rounds"] = current_rounds_limit
    interview_state["available_subjects"] = available_subjects
    interview_state["completed_subjects"] = completed_subjects

    return jsonify({
        "evaluation": evaluation,
        "followup_questions": followup_questions,
        "interview_state": interview_state,
        "round_number": round_counter,
        "question_number": question_counter,
        "total_questions": current_questions_limit,
        "total_rounds": current_rounds_limit,
        "subject": current_subject
    })

@interview_bp.route('/reset-interview', methods=['POST'])
def reset_interview():
    """Reset the interview system for a new user session"""
    global question_counter, round_counter, current_questions_limit, current_rounds_limit
    global current_subject, available_subjects, completed_subjects, follow_up_questions_cache
    global is_first_question_in_round, current_difficulty
    
    # Reset all interview state variables
    question_counter = 0
    round_counter = 1
    current_questions_limit = 0
    current_rounds_limit = 0
    current_subject = ''
    current_difficulty = ''
    available_subjects = subjects.copy()
    completed_subjects = []
    follow_up_questions_cache = []
    is_first_question_in_round = True
    
    return jsonify({
        "message": "Interview reset successfully",
        "available_subjects": available_subjects
    })
    
