from flask import Blueprint, request, jsonify, session
from werkzeug.security import generate_password_hash, check_password_hash
from database import get_connection
from functools import wraps
import os
from datetime import datetime, timedelta

auth_bp = Blueprint('auth', __name__)

# Admin email configuration
ADMIN_EMAIL = "admin@example.com"  # Change this to your desired admin email

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

def login_required(f):
    @wraps(f)
    def decorated_function(*args, **kwargs):
        if 'user_id' not in session:
            return jsonify({'error': 'Neautorizat'}), 401
        
        session.permanent = True
        session.modified = True
        
        return f(*args, **kwargs)
    return decorated_function

def admin_required(f):
    @wraps(f)
    def decorated_function(*args, **kwargs):
        if 'user_id' not in session or not session.get('is_admin'):
            return jsonify({'error': 'Acces interzis. Necesită drepturi de administrator.'}), 403
        
        session.permanent = True
        session.modified = True
        
        return f(*args, **kwargs)
    return decorated_function

@auth_bp.route('/api/admin', methods=['GET'])
@login_required
@admin_required
def admin_panel():
    conn = get_connection()
    if not conn:
        return jsonify({'error': 'Eroare la conectarea la baza de date'}), 500
    
    try:
        cursor = conn.cursor(dictionary=True)
        cursor.execute("SELECT id, username, email, balance, is_admin FROM users")
        users = cursor.fetchall()
        
        return jsonify({
            'message': 'Acces la panoul de administrare reușit!',
            'users': users
        }), 200
    
    except Exception as e:
        print("Admin panel error:", str(e))  # Debug log
        return jsonify({'error': str(e)}), 500
    finally:
        cursor.close()
        conn.close()

@auth_bp.route('/api/admin/users/<int:user_id>', methods=['DELETE'])
@login_required
@admin_required
def delete_user(user_id):
    conn = get_connection()
    if not conn:
        return jsonify({'error': 'Eroare la conectarea la baza de date'}), 500
    
    try:
        cursor = conn.cursor(dictionary=True)
        
        # Check if user exists
        cursor.execute("SELECT id FROM users WHERE id = %s", (user_id,))
        if not cursor.fetchone():
            return jsonify({'error': 'Utilizatorul nu a fost găsit!'}), 404
        
        # Delete user
        cursor.execute("DELETE FROM users WHERE id = %s", (user_id,))
        conn.commit()
        
        return jsonify({
            'message': 'Utilizator șters cu succes!'
        }), 200
    
    except Exception as e:
        print("Delete user error:", str(e))  # Debug log
        conn.rollback()
        return jsonify({'error': str(e)}), 500
    finally:
        cursor.close()
        conn.close()

@auth_bp.route('/api/login', methods=['POST'])
def login():
    data = request.get_json()
    email = data.get('email')
    password = data.get('password')
    
    conn = get_connection()
    if not conn:
        return jsonify({'error': 'Eroare la conectarea la baza de date'}), 500
    
    try:
        cursor = conn.cursor(dictionary=True)
        cursor.execute("SELECT * FROM users WHERE email = %s", (email,))
        user = cursor.fetchone()
        
        if user and check_password_hash(user['password_hash'], password):
            # Check if user is admin
            is_admin = email == ADMIN_EMAIL
            
            # Update admin status in database if needed
            if is_admin and not user['is_admin']:
                cursor.execute("UPDATE users SET is_admin = TRUE WHERE email = %s", (email,))
                conn.commit()
                user['is_admin'] = True
            
            session.permanent = True
            session['user_id'] = user['id']
            session['is_admin'] = user['is_admin']
            
            cleanup_expired_sessions()
            
            return jsonify({
                'message': 'Autentificare reușită!',
                'user': {
                    'id': user['id'],
                    'username': user['username'],
                    'email': user['email'],
                    'balance': float(user['balance']),
                    'is_admin': bool(user['is_admin'])
                }
            }), 200
        
        return jsonify({'error': 'Email sau parolă incorectă!'}), 401
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500
    finally:
        cursor.close()
        conn.close()

@auth_bp.route('/api/register', methods=['POST'])
def register():
    try:
        data = request.get_json()
        print("Received registration data:", data)  # Debug log
        
        required_fields = ['username', 'email', 'password']
        for field in required_fields:
            if field not in data:
                return jsonify({'error': f'Câmpul {field} este obligatoriu!'}), 400
        
        conn = get_connection()
        if not conn:
            return jsonify({'error': 'Eroare la conectarea la baza de date'}), 500
        
        cursor = conn.cursor(dictionary=True)
        
        # Verifică dacă emailul există
        cursor.execute("SELECT id FROM users WHERE email = %s", (data['email'],))
        if cursor.fetchone():
            return jsonify({'error': 'Un utilizator cu acest email există deja!'}), 400
        
        # Check if user is admin
        is_admin = data['email'] == ADMIN_EMAIL
        
        # Creează utilizatorul nou
        hashed_password = generate_password_hash(data['password'])
        try:
            cursor.execute("""
                INSERT INTO users (username, email, password_hash, balance, is_admin)
                VALUES (%s, %s, %s, 0.00, %s)
            """, (data['username'], data['email'], hashed_password, is_admin))
            
            conn.commit()
            user_id = cursor.lastrowid
            
            return jsonify({
                'message': 'Cont creat cu succes!',
                'user': {
                    'id': user_id,
                    'username': data['username'],
                    'email': data['email'],
                    'balance': 0.00,
                    'is_admin': is_admin
                }
            }), 201
        except Exception as db_error:
            print("Database error:", str(db_error))  # Debug log
            conn.rollback()
            return jsonify({'error': f'Eroare la inserarea în baza de date: {str(db_error)}'}), 500
        
    except Exception as e:
        print("Registration error:", str(e))  # Debug log
        if conn:
            conn.rollback()
        return jsonify({'error': f'Eroare la înregistrare: {str(e)}'}), 500
    finally:
        if cursor:
            cursor.close()
        if conn:
            conn.close()

@auth_bp.route('/api/logout', methods=['POST'])
def logout():
    session.clear()
    return jsonify({'message': 'Deconectat cu succes!'}), 200

@auth_bp.route('/api/me', methods=['GET'])
@login_required
def get_current_user():
    conn = get_connection()
    if not conn:
        return jsonify({'error': 'Eroare la conectarea la baza de date'}), 500
    
    try:
        cursor = conn.cursor(dictionary=True)
        cursor.execute("SELECT * FROM users WHERE id = %s", (session['user_id'],))
        user = cursor.fetchone()
        
        if not user:
            return jsonify({'error': 'Utilizatorul nu a fost găsit!'}), 404
        
        return jsonify({
            'user': {
                'id': user['id'],
                'username': user['username'],
                'email': user['email'],
                'balance': float(user['balance']),
                'is_admin': bool(user['is_admin'])
            }
        }), 200
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500
    finally:
        cursor.close()
        conn.close() 