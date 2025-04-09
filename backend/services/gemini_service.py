import google.generativeai as genai
from config import Config
from google.api_core import exceptions as google_exceptions  # Import Google API exceptions

# Configure Gemini API
genai.configure(api_key=Config.GEMINI_API_KEY)

def generate_followup_questions(user_response, context_question, previous_followups=None, num_questions=3):
    followup_questions = []
    attempts = 0
    previous_followups = previous_followups or []

    while len(followup_questions) < num_questions and attempts < num_questions * 5:
        try:
            # Use a supported model
            model = genai.GenerativeModel("gemini-1.5-pro-latest")

            prompt = f"""
            Based on the user's response: '{user_response}' 
            to the question: '{context_question}', 

            generate {num_questions} concise and specific follow-up questions 
            to delve deeper into their understanding. 

            **Guidelines:**

            * Avoid generic questions like "Why?" or "Tell me more."
            * Ensure the questions are:
                * Relevant to the context.
                * Grammatically correct.
                * Unique and not previously asked: {', '.join(previous_followups) if previous_followups else 'None'}

            **Generate the {num_questions} follow-up questions:** 
            """

            # Generate follow-up questions
            response = model.generate_content(prompt)

            if response.text:
                new_questions = response.text.strip().split('\n')
                for new_question in new_questions:
                    if new_question and new_question not in followup_questions and new_question not in previous_followups:
                        followup_questions.append(new_question)
            else:
                print("Gemini returned an empty response.")

        except google_exceptions.NotFound as e:
            print(f"Gemini API Error: {e}")
            if "content filter" in str(e).lower():
                print("The generated content was likely blocked by the content filter. Trying again with a different prompt strategy.")
            else:
                print("A Gemini API error occurred. Skipping follow-up question generation.")
                break

        except Exception as e:
            print(f"Other Error generating follow-up question: {e}")
            break

    return followup_questions



def evaluate_answer(user_response, question, difficulty):
    try:
        model = genai.GenerativeModel("gemini-1.5-pro-latest")

        prompt = f"""
        You MUST follow these steps EXACTLY:

        1. FIRST provide a COMPLETE model answer to this question that would score 10/10.
        2. THEN evaluate the user's answer against this model answer.

        **Question:** {question}
        **Difficulty:** {difficulty}
        **User Answer:** {user_response}

        --- REQUIRED OUTPUT FORMAT ---
        
        MODEL ANSWER: [Your complete model answer here. This MUST be at least 3-5 sentences demonstrating perfect understanding.]

        SCORE: [X/10] 
        (X must be between 1-10 based on how close the user answer is to the model answer)

        FEEDBACK: [Specific feedback comparing user answer to model answer]

        STRONG AREAS:
        - [Area 1]
        - [Area 2]

        WEAK AREAS:
        - [Area 1]
        - [Area 2]

        --- END FORMAT ---

        Important Rules:
        - You MUST include the MODEL ANSWER section
        - The model answer MUST be comprehensive
        - If any section is missing, I'll ask you to regenerate
        """

        response = model.generate_content(prompt)
        feedback = response.text

        # Parse the response with strict requirements
        evaluation = {
            "model_answer": "",
            "score": "N/A",
            "feedback": "",
            "strong_areas": [],
            "weak_areas": []
        }

        # Extract model answer - this is now mandatory
        if "MODEL ANSWER:" in feedback:
            model_part = feedback.split("MODEL ANSWER:")[1].split("SCORE:")[0].strip()
            evaluation["model_answer"] = model_part
        else:
            raise ValueError("Model answer section is missing from Gemini response")

        # Rest of parsing remains the same...
        if "SCORE:" in feedback:
            score_part = feedback.split("SCORE:")[1].split("\n")[0].strip()
            evaluation["score"] = score_part

        if "FEEDBACK:" in feedback:
            feedback_part = feedback.split("FEEDBACK:")[1].split("STRONG AREAS:")[0].strip()
            evaluation["feedback"] = feedback_part

        # Parse strong and weak areas
        if "STRONG AREAS:" in feedback:
            strong_part = feedback.split("STRONG AREAS:")[1].split("WEAK AREAS:")[0].strip()
            evaluation["strong_areas"] = [line[2:].strip() for line in strong_part.split("\n") if line.startswith("-")]

        if "WEAK AREAS:" in feedback:
            weak_part = feedback.split("WEAK AREAS:")[1].strip()
            evaluation["weak_areas"] = [line[2:].strip() for line in weak_part.split("\n") if line.startswith("-")]

        return evaluation

    except Exception as e:
        print(f"Error in evaluation: {str(e)}")
        # Retry once if model answer is missing
        try:
            print("Retrying evaluation...")
            response = model.generate_content(prompt)
            feedback = response.text
            # Parse again...
        except Exception as retry_e:
            print(f"Retry failed: {str(retry_e)}")
            return {
                "model_answer": "Error: Could not generate model answer",
                "score": "N/A",
                "feedback": "Evaluation failed. Please try again.",
                "strong_areas": [],
                "weak_areas": []
            }
    try:
        model = genai.GenerativeModel("gemini-1.5-pro-latest")

        # Adjust evaluation criteria based on difficulty
        if difficulty == "easy":
            criteria = """
            - Relevance to the question (1-10)
            - Basic understanding (1-10)
            - Clarity and simplicity (1-10)
            """
        elif difficulty == "medium":
            criteria = """
            - Relevance to the question (1-10)
            - Depth of understanding (1-10)
            - Clarity and logical flow (1-10)
            """
        elif difficulty == "hard":
            criteria = """
            - Relevance to the question (1-10)
            - Depth of understanding (1-10)
            - Clarity, logical flow, and critical thinking (1-10)
            """
        else:
            criteria = """
            - Relevance to the question (1-10)
            - Depth of understanding (1-10)
            - Clarity and conciseness (1-10)
            """

        # prompt = f"""
        # First, provide a model answer to this question that would score 10/10. Then evaluate the user's answer against this model answer.

        # **Difficulty Level:** {difficulty.capitalize()}
        # **Question:** {question}

        # **Step 1: Model Answer**
        # Provide a comprehensive, ideal answer to the question that demonstrates complete understanding.

        # **Step 2: User Answer Evaluation**
        # Evaluate this user answer: {user_response}

        # **Evaluation Criteria:**
        # {criteria}

        # **Output Format:**
        # - Model Answer: [The ideal answer to the question]
        # - Score: [Overall Score]/10
        # - Feedback: [Concise feedback comparing user answer to model answer]
        # - Strong Areas: [List at least 1-3 strong points about the answer]
        # - Weak Areas: [List at least 1-3 areas that need improvement]
        # """

#         prompt = f"""
# First, provide a model answer to this question that would score 10/10. Then evaluate the user's answer against this model answer.

# **Question:** {question}

# **Step 1: Model Answer**
# Provide a comprehensive, ideal answer to the question that demonstrates complete understanding.

# **Step 2: User Answer Evaluation**
# Evaluate this user answer: {user_response}

# **Output Format:**
# - Model Answer: [The ideal answer to the question]
# - Score: [Overall Score]/10
# - Feedback: [Concise feedback comparing user answer to model answer]
# - Strong Areas: [List strong points]
# - Weak Areas: [List areas needing improvement]
# """
                 
        response = model.generate_content(prompt)
        feedback = response.text

        # Initialize the return structure with default values
        evaluation = {
            "model_answer": "",
            "score": "N/A",
            "feedback": "An error occurred while parsing the evaluation.",
            "strong_areas": [],
            "weak_areas": []
        }

        # Extract model answer if available
        if "Model Answer:" in feedback:
            model_answer_part = feedback.split("Model Answer:")[1].split("\n")[0].strip()
            evaluation["model_answer"] = model_answer_part

        # Extract score if available
        if "Score:" in feedback:
            score_part = feedback.split("Score:")[1].split("\n")[0].strip()
            if "/10" in score_part:
                evaluation["score"] = score_part.split("/10")[0].strip() + "/10"
            else:
                evaluation["score"] = score_part

        # Extract feedback if available
        if "Feedback:" in feedback:
            feedback_parts = feedback.split("Feedback:")[1].split("Strong Areas:" if "Strong Areas:" in feedback else "Weak Areas:" if "Weak Areas:" in feedback else "")
            if len(feedback_parts) > 0:
                evaluation["feedback"] = feedback_parts[0].strip()

        # Extract strong areas if available
        if "Strong Areas:" in feedback:
            strong_parts = feedback.split("Strong Areas:")[1].split("Weak Areas:" if "Weak Areas:" in feedback else "")
            if len(strong_parts) > 0:
                strong_text = strong_parts[0].strip()
                strong_areas = [area.strip()[2:].strip() if area.strip().startswith("-") else area.strip() 
                               for area in strong_text.split("\n") if area.strip()]
                evaluation["strong_areas"] = strong_areas

        # Extract weak areas if available
        if "Weak Areas:" in feedback:
            weak_parts = feedback.split("Weak Areas:")[1].strip()
            weak_areas = [area.strip()[2:].strip() if area.strip().startswith("-") else area.strip() 
                         for area in weak_parts.split("\n") if area.strip()]
            evaluation["weak_areas"] = weak_areas

        return evaluation

    except google_exceptions.NotFound as e:
        print(f"Gemini API Error: {e}")
        return {
            "model_answer": "Model answer not available",
            "score": "N/A",
            "feedback": "An error occurred while evaluating your answer.",
            "strong_areas": [],
            "weak_areas": []
        }
    except Exception as e:
        print(f"Error evaluating answer: {e}")
        return {
            "model_answer": "Model answer not available",
            "score": "N/A",
            "feedback": "An error occurred while evaluating your answer.",
            "strong_areas": [],
            "weak_areas": []
        }
        
