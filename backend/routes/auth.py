from flask import Blueprint, request, jsonify
from werkzeug.security import generate_password_hash, check_password_hash
from flask_login import login_user, logout_user, login_required, current_user
from ..models import User
from ..extensions import db

auth_bp = Blueprint('auth', __name__)

@auth_bp.route('/signup', methods=['POST'])
def signup():
    data = request.get_json()
    
    if User.query.filter_by(email=data.get('email')).first():
        return jsonify({"error": "Email already exists"}), 400
    
    hashed_password = generate_password_hash(data.get('password'), method='pbkdf2:sha256')
    
    new_user = User(
        name=data.get('name'),
        email=data.get('email'),
        password=hashed_password,
        gender=data.get('gender'),
        phone=data.get('phone'),
        city=data.get('city'),
        state=data.get('state'),
        country=data.get('country')
    )
    
    db.session.add(new_user)
    db.session.commit()
    
    return jsonify({"message": "User created successfully"}), 201

@auth_bp.route('/login', methods=['POST'])
def login():
    data = request.get_json()
    user = User.query.filter_by(email=data.get('email')).first()
    
    if not user or not check_password_hash(user.password, data.get('password')):
        return jsonify({"error": "Invalid credentials"}), 401
    
    login_user(user)
    return jsonify({"message": "Login successful", "user": user.to_dict()})

@auth_bp.route('/logout')
@login_required
def logout():
    logout_user()
    return jsonify({"message": "Logged out"})

@auth_bp.route('/me')
@login_required
def get_current_user():
    return jsonify(current_user.to_dict())
