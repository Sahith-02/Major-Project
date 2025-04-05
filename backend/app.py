from flask import Flask, request, jsonify, redirect
from flask_cors import CORS
from flask_jwt_extended import JWTManager, create_access_token, get_jwt_identity, jwt_required
from flask_bcrypt import Bcrypt
from google.oauth2 import id_token
from google.auth.transport import requests as google_requests

from routes.interview import interview_bp
from routes.evaluation import evaluation_bp
from models.user_model import create_user, get_user_by_email, get_user_by_id,get_user_by_username
import secrets
import time
from datetime import datetime, timedelta

app = Flask(__name__)
app.config['JWT_SECRET_KEY'] = secrets.token_hex(32)  # Use a strong, unique secret
app.config['GOOGLE_CLIENT_ID'] = '824084385888-siql0qspburqgcdvl03lb0dv2g9nshso.apps.googleusercontent.com'  # Replace with your actual Google Client ID


app.config['JWT_ACCESS_TOKEN_EXPIRES'] = timedelta(hours=1)  # 1 hour expiration
app.config['JWT_REFRESH_TOKEN_EXPIRES'] = timedelta(days=30)  # 30 days for refresh
app.config['JWT_TOKEN_LOCATION'] = ['headers', 'cookies']  # Accept tokens from both
jwt = JWTManager(app)
bcrypt = Bcrypt(app)
CORS(app)

app.register_blueprint(interview_bp)
app.register_blueprint(evaluation_bp)

# In your Flask app
CORS(app, resources={
    r"/*": {
        "origins": "http://localhost:3000",
        "methods": ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
        "allow_headers": ["Content-Type", "Authorization"],
        "supports_credentials": True 
    }
})

app.config['JWT_COOKIE_SECURE'] = True
app.config['JWT_COOKIE_CSRF_PROTECT'] = True
app.config['JWT_CSRF_CHECK_FORM'] = True

@app.before_request
def fix_time_issues():
    # Get the current time from a reliable NTP server
    try:
        import ntplib
        client = ntplib.NTPClient()
        response = client.request('pool.ntp.org', version=3)
        # Apply the offset to adjust for any clock skew
        app.config['TIME_OFFSET'] = response.offset
    except:
        # If NTP request fails, use a conservative default offset
        app.config['TIME_OFFSET'] = 0
        

@app.route('/auth/google', methods=['POST'])
def google_login():
    app.logger.info("Google login attempt received")
    try:
        # Get the ID token from the request
        app.logger.info(f"Request type: {request.json.get('type', 'login')}")
        token = request.json.get('credential')
        if not token:
            app.logger.error("No credential provided in request")
            return jsonify({"error": "No credential provided"}), 400
          
        app.logger.info("Google token received, attempting verification")  
        request_type = request.json.get('type', 'login')
        
        # Verify the token with clock skew tolerance
        try:
            # Add clock_skew_in_seconds parameter to handle time synchronization issues
            id_info = id_token.verify_oauth2_token(
                token, 
                google_requests.Request(), 
                app.config['GOOGLE_CLIENT_ID'],
                clock_skew_in_seconds=10  # Allow for up to 10 seconds of clock skew
            )
        except Exception as e:
            app.logger.error(f"Token verification error: {str(e)}")
            return jsonify({"error": "Failed to verify Google token"}), 401
        
        # Extract user information
        email = id_info.get('email')
        if not email:
            return jsonify({"error": "Email not provided in token"}), 400
            
        name = id_info.get('name', '')
        
        # Check if user exists
        existing_user = get_user_by_email(email)
        
        if request_type == 'register':
            # Registration flow
            if existing_user:
                return jsonify({"error": "Email already registered"}), 400
            
            # Generate a unique username based on email
            base_username = email.split('@')[0]
            username = base_username
            counter = 1
            
            # Ensure username is unique
            while get_user_by_username(username):
                username = f"{base_username}_{counter}"
                counter += 1
            
            # Create user with Google email
            password_hash = bcrypt.generate_password_hash(secrets.token_hex(16)).decode('utf-8')
            user_id = create_user(
                username, 
                email, 
                password_hash
            )
            
            # Create JWT token for the new user
            access_token = create_access_token(identity=user_id)
            
            return jsonify({
                "message": "Registration successful", 
                "access_token": access_token,
                "user": {
                    "id": user_id,
                    "email": email,
                    "username": username
                }
            }), 201
        
        else:  # Login flow
            if not existing_user:
                # Auto-register users who login with Google
                base_username = email.split('@')[0]
                username = base_username
                counter = 1
                
                while get_user_by_username(username):
                    username = f"{base_username}_{counter}"
                    counter += 1
                
                password_hash = bcrypt.generate_password_hash(secrets.token_hex(16)).decode('utf-8')
                user_id = create_user(username, email, password_hash)
                access_token = create_access_token(identity=user_id)
                
                return jsonify({
                    "message": "Auto-registration successful", 
                    "access_token": access_token,
                    "user": {
                        "id": user_id,
                        "email": email,
                        "username": username
                    }
                }), 201
            
            # Create JWT access token
            access_token = create_access_token(identity=existing_user[0])
            
            return jsonify({
                "message": "Google login successful", 
                "access_token": access_token,
                "user": {
                    "id": existing_user[0],
                    "email": email,
                    "username": existing_user[1]
                }
            }), 200
    
    except ValueError as e:
        # Invalid token
        app.logger.error(f"Value error: {str(e)}")
        return jsonify({"error": "Invalid Google token"}), 401
    except Exception as e:
        app.logger.error(f"General error in Google auth: {str(e)}")
        return jsonify({"error": str(e)}), 500
    
    
@app.route('/register', methods=['POST'])
def register():
    data = request.json
    username = data.get('username')
    email = data.get('email')
    password = data.get('password')

    if not username or not email or not password:
        return jsonify({"error": "Missing required fields"}), 400

    user_id = create_user(username, email, password)
    if user_id:
        return jsonify({"message": "User registered successfully", "user_id": user_id}), 201
    else:
        return jsonify({"error": "Failed to register user"}), 500

@app.route('/login', methods=['POST'])
def login():
    data = request.json
    username = data.get('username')
    password = data.get('password')

    if not username or not password:
        return jsonify({"error": "Missing username or password"}), 400

    user = get_user_by_username(username)
    if user and bcrypt.check_password_hash(user[3], password):
        access_token = create_access_token(identity=user[0])
        return jsonify({"message": "Login successful", "access_token": access_token}), 200
    else:
        # print(password)
        return jsonify({"error": "Invalid username or password"}), 401


@app.route('/api/verify-token', methods=['GET'])
@jwt_required()
def verify_token():
    current_user_id = get_jwt_identity()
    user = get_user_by_id(current_user_id)  # You'll need to implement this function
    if not user:
        return jsonify({"error": "User not found"}), 404
    
    return jsonify({
        "user": {
            "id": user[0],
            "username": user[1],
            "email": user[2]
        }
    }), 200
  
  
@app.route('/api/refresh-token', methods=['POST'])
@jwt_required(refresh=True)
def refresh_token():
    current_user = get_jwt_identity()
    new_token = create_access_token(identity=current_user)
    return jsonify(access_token=new_token), 200  

if __name__ == "__main__":
    app.run(debug=True)
    
    