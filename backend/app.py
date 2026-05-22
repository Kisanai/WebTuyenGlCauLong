from flask import Flask
from flask_cors import CORS
from pymongo import MongoClient
import os
from dotenv import load_dotenv

load_dotenv()

app = Flask(__name__)
CORS(app)


@app.route('/')
def index():
    return {
        'status': 'ok',
        'message': 'Badminton Finder API',
        'endpoints': ['/auth', '/posts', '/bookings', '/notifications', '/users', '/admin'],
    }, 200


# Import routes
from routes.auth_routes import auth_bp
from routes.post_routes import post_bp
from routes.booking_routes import booking_bp
from routes.notification_routes import notification_bp
from routes.user_routes import user_bp
from routes.admin_routes import admin_bp

# Register blueprints
app.register_blueprint(auth_bp, url_prefix='/auth')
app.register_blueprint(post_bp, url_prefix='/posts')
app.register_blueprint(booking_bp, url_prefix='/bookings')
app.register_blueprint(notification_bp, url_prefix='/notifications')
app.register_blueprint(user_bp, url_prefix='/users')
app.register_blueprint(admin_bp, url_prefix='/admin')

# Create admin user if not exists
from models.user_model import create_admin_if_not_exists
create_admin_if_not_exists()

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)
