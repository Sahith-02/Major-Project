import os

class Config:
   DATABASE_URI = os.getenv('DATABASE_URI', 'postgresql://postgres:Sahith%4002@localhost:5432/smart_interview_system')
   # GEMINI_API_KEY = os.getenv('GEMINI_API_KEY', 'AIzaSyAC6WBn_BSJPylP2KebXKVwA6Kjw9xY7ZM')
   GEMINI_API_KEY = os.getenv('GEMINI_API_KEY', 'AIzaSyAYjBYqqbNMOVHvbUqUYVKP9YHkPadjcsc')   
   # GEMINI_API_KEY = os.getenv('GEMINI_API_KEY', 'AIzaSyAtFq7pSIVbg-Xk8ZftMLMSkR0WvOa1Y4w') 