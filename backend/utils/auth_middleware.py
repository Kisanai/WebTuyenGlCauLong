from flask import request, jsonify
from utils.jwt_helper import decode_token

def token_required(f):
    def decorated(*args, **kwargs):
        token = request.headers.get('Authorization')
        if not token:
            return jsonify({'message': 'Token is missing'}), 401
        try:
            token = token.split(' ')[1]  # Bearer token
            payload = decode_token(token)
            if not payload:
                return jsonify({'message': 'Token is invalid'}), 401
        except:
            return jsonify({'message': 'Token is invalid'}), 401
        return f(*args, **kwargs)
    decorated.__name__ = f.__name__
    return decorated
