from flask import Flask, send_from_directory
from flask_session import Session
from flask_cors import CORS
from config import Config
from routes.auth import auth_bp
from datetime import timedelta
from database import db, init_db
import os

app = Flask(
    __name__,
    template_folder="../frontend/templates",
    static_folder="../frontend/static"
)

# Configurare aplicație
app.config.from_object(Config)

app.config['SESSION_TYPE'] = 'filesystem'
app.config['SESSION_FILE_DIR'] = './flask_session'
app.config['SESSION_PERMANENT'] = True
app.config['PERMANENT_SESSION_LIFETIME'] = timedelta(hours=1)
app.config['SESSION_COOKIE_SECURE'] = False  # False dacă nu e HTTPS
app.config['SESSION_COOKIE_SAMESITE'] = 'Lax'  # Lax ca să funcționeze cu CORS
app.config['UPLOAD_FOLDER'] = './uploads'  # Exemplu, dacă folosești upload

# Creează folderele dacă nu există
if not os.path.exists(app.config['SESSION_FILE_DIR']):
    os.makedirs(app.config['SESSION_FILE_DIR'])

if not os.path.exists(app.config['UPLOAD_FOLDER']):
    os.makedirs(app.config['UPLOAD_FOLDER'])

# Inițializează DB și sesiunea
init_db(app)
Session(app)

# Configurează CORS o singură dată corect
# Replace your current CORS configuration with this:
CORS(app, 
     resources={r"/api/*": {"origins": ["http://localhost:5173", "http://127.0.0.1:5173"]}},
     supports_credentials=True)

# Înregistrează blueprint-uri
app.register_blueprint(auth_bp)

# Serve uploaded files (dacă e cazul)
@app.route('/uploads/<filename>')
def serve_uploaded_file(filename):
    return send_from_directory(app.config['UPLOAD_FOLDER'], filename)

# Debug info
print(f"Session directory: {app.config['SESSION_FILE_DIR']}")
print(f"Upload folder: {app.config['UPLOAD_FOLDER']}")

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)
