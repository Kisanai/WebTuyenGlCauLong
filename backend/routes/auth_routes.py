
from flask import Blueprint, request, jsonify
from database.mongo import users_collection
from utils.jwt_helper import generate_token
from werkzeug.security import generate_password_hash, check_password_hash

auth_bp = Blueprint('auth', __name__)

@auth_bp.route('/register', methods=['POST'])
def register():
    data = request.json

    name = data.get('name')
    phone = data.get('phone')
    password = data.get('password')

    if not name or not phone or not password:
        return jsonify({'message': 'Missing required fields'}), 400

    existing_user = users_collection.find_one({'phone': phone})

    if existing_user:
        return jsonify({'message': 'Phone already exists'}), 400

    hashed_password = generate_password_hash(password)

    result = users_collection.insert_one({
        'name': name,
        'phone': phone,
        'password': hashed_password
    })

    token = generate_token(result.inserted_id)

    return jsonify({
        'message': 'Register successful',
        'token': token
    }), 201


@auth_bp.route('/login', methods=['POST'])
def login():
    data = request.json

    phone = data.get('phone')
    password = data.get('password')

    if not phone or not password:
        return jsonify({'message': 'Missing phone or password'}), 400

    user = users_collection.find_one({'phone': phone})

    if not user:
        return jsonify({'message': 'User not found'}), 404

    if not check_password_hash(user['password'], password):
        return jsonify({'message': 'Wrong password'}), 401

    token = generate_token(user['_id'])

    return jsonify({
        'message': 'Login successful',
        'token': token,
        'user': {
            'id': str(user['_id']),
            'name': user['name'],
            'phone': user['phone'],
            'role': user.get('role', 'user')
        }
    }), 200

