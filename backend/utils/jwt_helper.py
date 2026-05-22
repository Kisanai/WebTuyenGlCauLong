import jwt
from datetime import datetime, timedelta
from config import Config

def generate_token(user_id):
    payload = {
        'user_id': str(user_id),
        'exp': datetime.utcnow() + timedelta(hours=1)
    }
    token = jwt.encode(payload, Config.JWT_SECRET, algorithm='HS256')
    return token

def decode_token(token):
    try:
        payload = jwt.decode(token, Config.JWT_SECRET, algorithms=['HS256'])
        return payload
    except jwt.ExpiredSignatureError:
        return None
    except jwt.InvalidTokenError:
        return None
