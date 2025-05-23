from flask import Flask, session
from database import get_connection, test_connection
import os
from datetime import timedelta
from routes.auth import auth_bp
from flask_cors import CORS

app = Flask(__name__)

# Session configuration
app.secret_key = os.urandom(24)  # Generates a random secret key
app.permanent_session_lifetime = timedelta(days=7)  # Sessions will last for 7 days

# CORS configuration
CORS(app, resources={
    r"/api/*": {
        "origins": ["http://localhost:5173", "http://127.0.0.1:5173"],  # Frontend URLs
        "methods": ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
        "allow_headers": ["Content-Type", "Authorization"],
        "supports_credentials": True,  # Important for cookies/sessions
        "expose_headers": ["Content-Type", "Authorization"],
        "max_age": 3600
    }
}, supports_credentials=True)

# Register blueprints
app.register_blueprint(auth_bp)

# Test database connection on startup
if not test_connection():
    raise Exception("Nu s-a putut conecta la baza de date!")

@app.route('/')
def home():
    return "Serverul rulează!"

# Example of how to use sessions
@app.route('/set-session/<value>')
def set_session(value):
    session['test_value'] = value
    return f"Session value set to: {value}"

@app.route('/get-session')
def get_session():
    return f"Current session value: {session.get('test_value', 'Not set')}"

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000) 