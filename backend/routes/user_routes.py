from flask import Blueprint, jsonify
from models.user_model import find_user_by_id
from utils.auth_middleware import token_required
from utils.jwt_helper import decode_token

user_bp = Blueprint('users', __name__)

@user_bp.route('/profile', methods=['GET'])
@token_required
def get_profile():
    token = request.headers.get('Authorization').split(' ')[1]
    payload = decode_token(token)
    user_id = payload['user_id']

    user = find_user_by_id(user_id)
    if not user:
        return jsonify({'message': 'User not found'}), 404

    user['_id'] = str(user['_id'])
    user.pop('password', None)  # Remove password from response
    return jsonify(user), 200
