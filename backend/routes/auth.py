from flask import Blueprint, request, jsonify, session
from werkzeug.security import generate_password_hash, check_password_hash
from database import db
from models.user_model import User
from functools import wraps
from sqlalchemy.exc import IntegrityError
import os
from datetime import datetime, timedelta
from flask_cors import CORS

auth_bp = Blueprint('auth', __name__)


def cleanup_expired_sessions():
    """Curăță sesiunile expirate din directorul flask_session"""
    session_dir = os.path.join(os.path.dirname(os.path.dirname(__file__)), 'flask_session')
    if not os.path.exists(session_dir):
        os.makedirs(session_dir)
        return
    
    current_time = datetime.now()
    for filename in os.listdir(session_dir):
        if filename.startswith('session_'):
            file_path = os.path.join(session_dir, filename)
            file_time = datetime.fromtimestamp(os.path.getmtime(file_path))
            if current_time - file_time > timedelta(hours=1):
                try:
                    os.remove(file_path)
                except:
                    pass

# Decorator pentru verificarea autentificării
def login_required(f):
    @wraps(f)
    def decorated_function(*args, **kwargs):
        if 'user_id' not in session:
            return jsonify({'error': 'Neautorizat'}), 401
        
        # Reînnoiește sesiunea la fiecare cerere
        session.permanent = True
        session.modified = True
        
        return f(*args, **kwargs)
    return decorated_function

@auth_bp.route('/api/login', methods=['POST', 'OPTIONS'])
def login():
    if request.method == 'OPTIONS':
        return jsonify({}), 200
    
    try:
        data = request.get_json()
        if not data:
            return jsonify({'error': 'No data provided'}), 400
            
        username = data.get('username')
        password = data.get('password')
        
        if not username or not password:
            return jsonify({'error': 'Nume utilizator și parolă sunt obligatorii!'}), 400
        
        user = User.query.filter_by(username=username).first()
        
        if user and check_password_hash(user.password_hash, password):
            session.permanent = True
            session['user_id'] = user.id
            session['is_admin'] = user.is_admin
            
            cleanup_expired_sessions()
            
            response = jsonify({
                'message': 'Autentificare reușită!',
                'user': {
                    'id': user.id,
                    'username': user.username,
                    'email': user.email,
                    'is_admin': user.is_admin,
                    'balance': float(user.balance)
                }
            })
            return response, 200
        
        return jsonify({'error': 'Nume utilizator sau parolă incorectă!'}), 401
        
    except Exception as e:
        print(f"Login error: {str(e)}")  # Log the error for debugging
        return jsonify({'error': 'A apărut o eroare la autentificare'}), 500

@auth_bp.route('/api/register', methods=['POST'])
def register():
    try:
        data = request.get_json()
        
        required_fields = ['username', 'email', 'password']
        for field in required_fields:
            if field not in data:
                return jsonify({'error': f'Câmpul {field} este obligatoriu!'}), 400
        
        if User.query.filter_by(email=data['email']).first():
            return jsonify({'error': 'Un utilizator cu acest email există deja!'}), 400
        
        if User.query.filter_by(username=data['username']).first():
            return jsonify({'error': 'Acest nume de utilizator este deja folosit!'}), 400
        
        new_user = User(
            username=data['username'],
            email=data['email'],
            password_hash=generate_password_hash(data['password']),
            balance=0.00,
            is_admin=False
        )
        
        db.session.add(new_user)
        db.session.commit()
        
        # Auto-login after registration
        session.permanent = True
        session['user_id'] = new_user.id
        session['is_admin'] = new_user.is_admin
        
        return jsonify({
            'message': 'Cont creat cu succes!',
            'user': {
                'id': new_user.id,
                'username': new_user.username,
                'email': new_user.email,
                'is_admin': new_user.is_admin,
                'balance': float(new_user.balance)
            }
        }), 201
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': 'A apărut o eroare la înregistrare!'}), 500

@auth_bp.route('/api/logout', methods=['POST'])
def logout():
    session.clear()
    return jsonify({'message': 'Deconectat cu succes!'}), 200

@auth_bp.route('/api/me', methods=['GET'])
@login_required
def get_current_user():
    user = User.query.get(session['user_id'])
    if not user:
        return jsonify({'error': 'Utilizatorul nu a fost găsit!'}), 404
        
    return jsonify({
        'user': {
            'id': user.id,
            'username': user.username,
            'email': user.email,
            'is_admin': user.is_admin,
            'balance': float(user.balance)
        }
    }), 200