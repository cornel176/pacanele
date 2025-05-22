from sqlalchemy import func
from database import db
class User(db.Model):
    __tablename__ = 'users'

    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    username = db.Column(db.String(50), unique=True, nullable=False)
    password_hash = db.Column(db.String(255), nullable=False)
    email = db.Column(db.String(100), unique=True)
    balance = db.Column(db.Numeric(10, 2), default=0.00)
    is_admin = db.Column(db.Boolean, default=False)
    created_at = db.Column(db.TIMESTAMP, server_default=func.now())