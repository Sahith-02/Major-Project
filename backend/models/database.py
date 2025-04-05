import psycopg2
from config import Config

def connect_to_db():
    try:
        connection = psycopg2.connect(Config.DATABASE_URI)
        return connection
    except Exception as e:
        print(f"Error connecting to the database: {e}")
        return None