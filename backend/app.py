from flask import Flask, send_from_directory
from flask_cors import CORS
from dotenv import load_dotenv
import os

from .extensions import db, login_manager
from .models import User
from .routes.auth import auth_bp
from .routes.chat import chat_bp

load_dotenv()

def create_app():
    app = Flask(__name__, 
                static_folder='../static', # serve static files (audio)
                static_url_path='/static')
    
    app.config['SECRET_KEY'] = os.getenv('SECRET_KEY', 'dev_key')
    app.config['SQLALCHEMY_DATABASE_URI'] = os.getenv('DATABASE_URI', 'sqlite:///lawbot.db')
    app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

    # Initialize Extensions
    db.init_app(app)
    login_manager.init_app(app)
    # CORS(app) # Allow frontend to call API
    CORS(app, resources={r"/*": {"origins": ["http://localhost:5173", "http://localhost:5174"]}}, supports_credentials=True)

    # Login Manager Setup
    @login_manager.user_loader
    def load_user(user_id):
        return User.query.get(int(user_id))

    # Register Blueprints
    app.register_blueprint(auth_bp, url_prefix='/auth')
    app.register_blueprint(chat_bp, url_prefix='/api')

    # Create DB Tables
    with app.app_context():
        db.create_all()

    @app.route('/')
    def index():
        return "LAWBOT Backend is Running!"

    return app

if __name__ == '__main__':
    app = create_app()
    app.run(debug=True, port=5000)
