from flask import Blueprint, request, jsonify
from models.post_model import (
    create_post as create_post_model,
    get_all_posts,
    get_post_by_id,
    get_post_by_id_any,
    update_post,
    delete_post,
    get_posts_by_user,
    get_posts_by_user_all,
)
from utils.auth_middleware import token_required
from utils.jwt_helper import decode_token

post_bp = Blueprint('posts', __name__)

@post_bp.route('/', methods=['GET'])
def get_posts():
    posts = get_all_posts()
    for post in posts:
        post['_id'] = str(post['_id'])
        post['userId'] = str(post['userId'])
    return jsonify(posts), 200

@post_bp.route('/', methods=['POST'])
@token_required
def create_post():
    token = request.headers.get('Authorization').split(' ')[1]
    payload = decode_token(token)
    user_id = payload['user_id']

    data = request.get_json()
    title = data.get('title')
    description = data.get('description')
    total_slots = data.get('totalSlots')
    date = data.get('date')
    start_time = data.get('startTime')
    end_time = data.get('endTime')
    court_name = data.get('courtName')
    court_address = data.get('courtAddress')
    skill_level = data.get('skillLevel')
    price = data.get('price')

    if not all([title, description, total_slots, date, start_time, end_time, court_name, court_address, skill_level, price]):
        return jsonify({'message': 'All fields are required'}), 400

    post_id = create_post_model(user_id, title, description, total_slots, date, start_time, end_time, court_name, court_address, skill_level, price)
    return jsonify({'message': 'Post created successfully', 'postId': post_id}), 201

@post_bp.route('/<post_id>', methods=['GET'])
def get_post(post_id):
    post = get_post_by_id(post_id)
    if not post:
        return jsonify({'message': 'Post not found'}), 404
    post['_id'] = str(post['_id'])
    post['userId'] = str(post['userId'])
    return jsonify(post), 200

@post_bp.route('/<post_id>', methods=['PUT'])
@token_required
def update_post_route(post_id):
    token = request.headers.get('Authorization').split(' ')[1]
    payload = decode_token(token)
    user_id = payload['user_id']

    post = get_post_by_id_any(post_id)
    if not post or str(post['userId']) != user_id:
        return jsonify({'message': 'Unauthorized'}), 403
    if post.get("status") != "active":
        return jsonify({'message': 'Post is not active'}), 400

    data = request.get_json()
    update_post(post_id, data)
    return jsonify({'message': 'Post updated successfully'}), 200

@post_bp.route('/<post_id>', methods=['DELETE'])
@token_required
def delete_post_route(post_id):
    token = request.headers.get('Authorization').split(' ')[1]
    payload = decode_token(token)
    user_id = payload['user_id']

    post = get_post_by_id_any(post_id)
    if not post or str(post['userId']) != user_id:
        return jsonify({'message': 'Unauthorized'}), 403

    delete_post(post_id)
    return jsonify({'message': 'Post deleted successfully'}), 200

@post_bp.route('/my-posts', methods=['GET'])
@token_required
def get_my_posts():
    token = request.headers.get('Authorization').split(' ')[1]
    payload = decode_token(token)
    user_id = payload['user_id']

    posts = get_posts_by_user_all(user_id)
    for post in posts:
        post['_id'] = str(post['_id'])
        post['userId'] = str(post['userId'])
    return jsonify(posts), 200
