from flask_sqlalchemy import SQLAlchemy 

db = SQLAlchemy()

class Question(db.Model):
    __tablename__ = 'questions'  # Specify the table name explicitly

    id = db.Column(db.Integer, primary_key=True)
    question_text = db.Column(db.Text, nullable=False)  # Use Text for potentially long questions
    subject = db.Column(db.String(50), nullable=False)
    difficulty = db.Column(db.String(10), nullable=False)  # 'easy', 'medium', 'hard'
    correct_answer = db.Column(db.Text, nullable=False)  # Store answers as text for keyword matching

    def __repr__(self):
        return f"<Question {self.id} - {self.subject} - {self.difficulty}>"
