from models.database import connect_to_db
from flask_bcrypt import Bcrypt

bcrypt = Bcrypt()

def create_user(username, email, password):
    connection = connect_to_db()
    if not connection:
        return None

    try:
        with connection.cursor() as cursor:
            password_hash = bcrypt.generate_password_hash(password).decode('utf-8')
            query = """
            INSERT INTO users (username, email, password_hash)
            VALUES (%s, %s, %s)
            RETURNING id;
            """
            cursor.execute(query, (username, email, password_hash))
            user_id = cursor.fetchone()[0]
            connection.commit()
            return user_id
    except Exception as e:
        print(f"Error creating user: {e}")
        return None
    finally:
        connection.close()

def get_user_by_username(username):
    connection = connect_to_db()
    if not connection:
        return None

    try:
        with connection.cursor() as cursor:
            query = """
            SELECT id, username, email, password_hash
            FROM users
            WHERE username = %s;
            """
            cursor.execute(query, (username,))
            user = cursor.fetchone()
            return user
    except Exception as e:
        print(f"Error fetching user: {e}")
        return None
    finally:
        connection.close()

def get_user_by_email(email):
    connection = connect_to_db()
    if not connection:
        return None

    try:
        with connection.cursor() as cursor:
            query = """
            SELECT id, username, email, password_hash
            FROM users
            WHERE email = %s;
            """
            cursor.execute(query, (email,))
            user = cursor.fetchone()
            return user
    except Exception as e:
        print(f"Error fetching user by email: {e}")
        return None
    finally:
        connection.close()

def create_or_get_google_user(email, username, google_id):
    # Check if user already exists
    existing_user = get_user_by_email(email)
    if existing_user:
        return existing_user

    # If user doesn't exist, create a new user
    connection = connect_to_db()
    if not connection:
        return None

    try:
        with connection.cursor() as cursor:
            # You might want to generate a random password or use google_id
            # This is just a placeholder method
            query = """
            INSERT INTO users (username, email, google_id, is_google_user)
            VALUES (%s, %s, %s, TRUE)
            RETURNING id, username, email;
            """
            cursor.execute(query, (username, email, google_id))
            new_user = cursor.fetchone()
            connection.commit()
            return new_user
    except Exception as e:
        print(f"Error creating Google user: {e}")
        return None
    finally:
        connection.close()
        

def get_user_by_id(user_id):
    connection = connect_to_db()
    if not connection:
        return None

    try:
        with connection.cursor() as cursor:
            query = """
            SELECT id, username, email, password_hash
            FROM users
            WHERE id = %s;
            """
            cursor.execute(query, (user_id,))
            user = cursor.fetchone()
            return user
    except Exception as e:
        print(f"Error fetching user by ID: {e}")
        return None
    finally:
        connection.close()