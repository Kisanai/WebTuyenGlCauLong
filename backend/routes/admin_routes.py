from flask import Blueprint, request, jsonify
from bson import ObjectId
from utils.auth_middleware import token_required
from utils.jwt_helper import decode_token
from database.mongo import users_collection, posts_collection, bookings_collection
from datetime import datetime, timedelta

admin_bp = Blueprint('admin', __name__)

def check_admin(user_id):
    """Check if user is admin"""
    user = users_collection.find_one({"_id": ObjectId(user_id)})
    return user and user.get('role') == 'admin'

@admin_bp.route('/users', methods=['GET'])
@token_required
def get_all_users():
    token = request.headers.get('Authorization').split(' ')[1]
    payload = decode_token(token)
    user_id = payload['user_id']
    
    if not check_admin(user_id):
        return jsonify({'message': 'Unauthorized - Admin only'}), 403
    
    users = list(users_collection.find({}, {
        '_id': 1, 'name': 1, 'phone': 1, 'role': 1
    }).sort('_id', -1))
    
    result = []
    for user in users:
        # Count posts and bookings
        posts_count = posts_collection.count_documents({"userId": user['_id']})
        bookings_count = bookings_collection.count_documents({
            "$or": [
                {"requesterId": user['_id']},
                {"ownerId": user['_id']}
            ]
        })
        
        result.append({
            'id': str(user['_id']),
            'name': user['name'],
            'phone': user['phone'],
            'role': user.get('role', 'user'),
            'posts_count': posts_count,
            'bookings_count': bookings_count
        })
    
    return jsonify(result), 200

@admin_bp.route('/posts', methods=['GET'])
@token_required
def get_all_posts():
    token = request.headers.get('Authorization').split(' ')[1]
    payload = decode_token(token)
    user_id = payload['user_id']
    
    if not check_admin(user_id):
        return jsonify({'message': 'Unauthorized - Admin only'}), 403
    
    posts = list(posts_collection.find({}).sort('_id', -1))
    
    result = []
    for post in posts:
        user = users_collection.find_one({"_id": post.get('userId')})
        bookings_count = bookings_collection.count_documents({"postId": post['_id']})
        
        result.append({
            'id': str(post['_id']),
            'title': post.get('title'),
            'courtName': post.get('courtName'),
            'date': post.get('date'),
            'startTime': post.get('startTime'),
            'endTime': post.get('endTime'),
            'totalSlots': post.get('totalSlots'),
            'remainingSlots': post.get('remainingSlots'),
            'author': user.get('name') if user else 'Unknown',
            'bookings_count': bookings_count,
            'createdAt': post.get('createdAt').isoformat() if post.get('createdAt') else None
        })
    
    return jsonify(result), 200

@admin_bp.route('/stats', methods=['GET'])
@token_required
def get_stats():
    token = request.headers.get('Authorization').split(' ')[1]
    payload = decode_token(token)
    user_id = payload['user_id']
    
    if not check_admin(user_id):
        return jsonify({'message': 'Unauthorized - Admin only'}), 403
    
    # Count users
    total_users = users_collection.count_documents({})
    regular_users = users_collection.count_documents({"role": {"$ne": "admin"}})
    
    # Count posts
    total_posts = posts_collection.count_documents({})
    
    # Count bookings
    total_bookings = bookings_collection.count_documents({})
    approved_bookings = bookings_collection.count_documents({"status": "approved"})
    
    # Get popular time slots
    posts = list(posts_collection.find({}))
    time_slots = {}
    courts = {}
    
    for post in posts:
        start_time = post.get('startTime', '')
        court = post.get('courtName', 'Unknown')
        
        if start_time:
            time_slots[start_time] = time_slots.get(start_time, 0) + 1
        if court:
            courts[court] = courts.get(court, 0) + 1
    
    # Sort by frequency
    popular_times = sorted(time_slots.items(), key=lambda x: x[1], reverse=True)[:5]
    popular_courts = sorted(courts.items(), key=lambda x: x[1], reverse=True)[:5]
    
    return jsonify({
        'total_users': total_users,
        'regular_users': regular_users,
        'total_posts': total_posts,
        'total_bookings': total_bookings,
        'approved_bookings': approved_bookings,
        'popular_times': [{'time': t[0], 'count': t[1]} for t in popular_times],
        'popular_courts': [{'court': c[0], 'count': c[1]} for c in popular_courts]
    }), 200

@admin_bp.route('/posts/<post_id>', methods=['DELETE'])
@token_required
def delete_post(post_id):
    token = request.headers.get('Authorization').split(' ')[1]
    payload = decode_token(token)
    user_id = payload['user_id']
    
    if not check_admin(user_id):
        return jsonify({'message': 'Unauthorized - Admin only'}), 403
    
    post = posts_collection.find_one({"_id": ObjectId(post_id)})
    if not post:
        return jsonify({'message': 'Post not found'}), 404
    
    # Delete associated bookings
    bookings_collection.delete_many({"postId": ObjectId(post_id)})
    
    # Delete post
    posts_collection.delete_one({"_id": ObjectId(post_id)})
    
    return jsonify({'message': 'Post deleted successfully'}), 200

@admin_bp.route('/users/<user_id>', methods=['DELETE'])
@token_required
def delete_user(user_id):
    token = request.headers.get('Authorization').split(' ')[1]
    payload = decode_token(token)
    admin_id = payload['user_id']
    
    if not check_admin(admin_id):
        return jsonify({'message': 'Unauthorized - Admin only'}), 403
    
    # Cannot delete admin accounts
    user = users_collection.find_one({"_id": ObjectId(user_id)})
    if user and user.get('role') == 'admin':
        return jsonify({'message': 'Cannot delete admin accounts'}), 400
    
    if not user:
        return jsonify({'message': 'User not found'}), 404
    
    # Delete user's posts and related bookings
    user_posts = posts_collection.find({"userId": ObjectId(user_id)})
    for post in user_posts:
        bookings_collection.delete_many({"postId": post['_id']})
    
    posts_collection.delete_many({"userId": ObjectId(user_id)})
    
    # Delete user's bookings
    bookings_collection.delete_many({
        "$or": [
            {"requesterId": ObjectId(user_id)},
            {"ownerId": ObjectId(user_id)}
        ]
    })
    
    # Delete user
    users_collection.delete_one({"_id": ObjectId(user_id)})
    
    return jsonify({'message': 'User deleted successfully'}), 200
