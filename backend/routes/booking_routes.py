from flask import Blueprint, request, jsonify
from bson import ObjectId
from utils.auth_middleware import token_required
from utils.jwt_helper import decode_token
from models.post_model import get_post_by_id, decrement_remaining_slots
from models.booking_model import (
    create_booking_request,
    get_booking_by_id,
    get_pending_bookings_by_post,
    get_pending_booking_for_post,
    reject_pending_bookings_by_post,
    set_booking_status,
)
from models.notification_model import create_notification
from database.mongo import users_collection
from database.mongo import posts_collection

booking_bp = Blueprint('bookings', __name__)


@booking_bp.route('/request', methods=['POST'])
@token_required
def request_booking():
    token = request.headers.get('Authorization').split(' ')[1]
    payload = decode_token(token)
    requester_id = payload['user_id']

    data = request.get_json() or {}
    post_id = data.get('postId')
    requested_slots = int(data.get('requestedSlots') or 1)

    if not post_id:
        return jsonify({'message': 'postId is required'}), 400
    if requested_slots <= 0:
        return jsonify({'message': 'requestedSlots must be > 0'}), 400

    post = get_post_by_id(post_id)
    if not post:
        return jsonify({'message': 'Post not found'}), 404

    if str(post.get('userId')) == str(requester_id):
        return jsonify({'message': 'Không thể đăng ký slot bài của chính mình'}), 400

    remaining = int(post.get('remainingSlots') or 0)
    if requested_slots > remaining:
        return jsonify({'message': 'Không đủ slot còn lại'}), 400

    existing = get_pending_booking_for_post(post_id, requester_id)
    if existing:
        return jsonify({'message': 'Bạn đã có yêu cầu đang chờ duyệt cho bài này'}), 400

    owner_id = str(post.get('userId'))
    booking_id = create_booking_request(post_id, requester_id, owner_id, requested_slots)

    requester = users_collection.find_one({"_id": ObjectId(requester_id)}, {"name": 1, "phone": 1})
    create_notification(
        owner_id,
        f"Có yêu cầu đăng ký {requested_slots} slot cho bài: {post.get('title', '')}",
        "booking_request",
        data={
            "bookingId": booking_id,
            "postId": str(post.get('_id')),
            "requestedSlots": requested_slots,
            "requesterId": requester_id,
            "requesterName": requester.get("name") if requester else None,
            "requesterPhone": requester.get("phone") if requester else None,
            "postTitle": post.get("title"),
            "courtName": post.get("courtName"),
            "date": post.get("date"),
            "startTime": post.get("startTime"),
            "endTime": post.get("endTime"),
        },
    )

    return jsonify({'message': 'Đã gửi yêu cầu đăng ký', 'bookingId': booking_id}), 201


@booking_bp.route('/<booking_id>/approve', methods=['POST'])
@token_required
def approve_booking(booking_id):
    token = request.headers.get('Authorization').split(' ')[1]
    payload = decode_token(token)
    user_id = payload['user_id']

    booking = get_booking_by_id(booking_id)
    if not booking:
        return jsonify({'message': 'Booking not found'}), 404
    if str(booking.get('ownerId')) != str(user_id):
        return jsonify({'message': 'Unauthorized'}), 403
    if booking.get('status') != 'pending':
        return jsonify({'message': 'Booking is not pending'}), 400

    post_id = str(booking.get('postId'))
    requested_slots = int(booking.get('requestedSlots') or 0)
    ok = decrement_remaining_slots(post_id, requested_slots)
    if not ok:
        set_booking_status(booking_id, 'rejected')
        create_notification(
            str(booking.get('requesterId')),
            "Yêu cầu đăng ký slot bị từ chối (hết slot).",
            "booking_rejected",
            data={"bookingId": booking_id, "postId": post_id},
        )
        return jsonify({'message': 'Không đủ slot (đã từ chối)'}), 400

    set_booking_status(booking_id, 'approved')
    create_notification(
        str(booking.get('requesterId')),
        "Yêu cầu đăng ký slot đã được chấp nhận.",
        "booking_approved",
        data={"bookingId": booking_id, "postId": post_id, "requestedSlots": requested_slots},
    )

    # If slots are now exhausted, reject all other pending requests and notify requesters
    try:
        post = posts_collection.find_one({"_id": ObjectId(post_id)}, {"remainingSlots": 1, "title": 1})
        remaining = int((post or {}).get("remainingSlots") or 0)
        if remaining <= 0:
            others = get_pending_bookings_by_post(post_id, exclude_booking_id=booking_id)
            reject_pending_bookings_by_post(post_id, exclude_booking_id=booking_id)
            for b in others:
                create_notification(
                    str(b.get("requesterId")),
                    f"Bài đăng đã hết slot: {(post or {}).get('title', '')}".strip(),
                    "booking_rejected",
                    data={"bookingId": str(b.get("_id")), "postId": post_id, "reason": "sold_out"},
                )
    except Exception:
        pass

    return jsonify({'message': 'Approved'}), 200


@booking_bp.route('/<booking_id>/reject', methods=['POST'])
@token_required
def reject_booking(booking_id):
    token = request.headers.get('Authorization').split(' ')[1]
    payload = decode_token(token)
    user_id = payload['user_id']

    booking = get_booking_by_id(booking_id)
    if not booking:
        return jsonify({'message': 'Booking not found'}), 404
    if str(booking.get('ownerId')) != str(user_id):
        return jsonify({'message': 'Unauthorized'}), 403
    if booking.get('status') != 'pending':
        return jsonify({'message': 'Booking is not pending'}), 400

    set_booking_status(booking_id, 'rejected')
    create_notification(
        str(booking.get('requesterId')),
        "Yêu cầu đăng ký slot đã bị từ chối.",
        "booking_rejected",
        data={"bookingId": booking_id, "postId": str(booking.get('postId'))},
    )
    return jsonify({'message': 'Rejected'}), 200


@booking_bp.route('/my-bookings', methods=['GET'])
@token_required
def get_my_bookings():
    token = request.headers.get('Authorization').split(' ')[1]
    payload = decode_token(token)
    user_id = payload['user_id']

    from models.booking_model import get_bookings_by_user
    bookings = get_bookings_by_user(user_id)
    
    result = []
    for booking in bookings:
        post = posts_collection.find_one({"_id": booking.get('postId')})
        result.append({
            'id': str(booking.get('_id')),
            'status': booking.get('status'),
            'requestedSlots': booking.get('requestedSlots'),
            'postId': str(booking.get('postId')),
            'requesterId': str(booking.get('requesterId')),
            'ownerId': str(booking.get('ownerId')),
            'createdAt': booking.get('createdAt').isoformat() if booking.get('createdAt') else None,
            'post': {
                'title': post.get('title') if post else None,
                'courtName': post.get('courtName') if post else None,
                'date': post.get('date') if post else None,
                'startTime': post.get('startTime') if post else None,
                'endTime': post.get('endTime') if post else None,
            } if post else None,
        })
    
    return jsonify(result), 200


@booking_bp.route('/<booking_id>/cancel', methods=['POST'])
@token_required
def cancel_booking(booking_id):
    token = request.headers.get('Authorization').split(' ')[1]
    payload = decode_token(token)
    user_id = payload['user_id']

    booking = get_booking_by_id(booking_id)
    if not booking:
        return jsonify({'message': 'Booking not found'}), 404
    
    # Only requester can cancel their own booking
    if str(booking.get('requesterId')) != str(user_id):
        return jsonify({'message': 'Unauthorized'}), 403
    
    if booking.get('status') not in ['pending', 'approved']:
        return jsonify({'message': 'Chỉ có thể hủy các đăng ký đang chờ duyệt hoặc đã duyệt'}), 400

    # For approved bookings, check if within 12 hours of match start
    if booking.get('status') == 'approved':
        post = posts_collection.find_one({"_id": booking.get('postId')})
        if post and post.get('startTime') and post.get('date'):
            from datetime import datetime
            try:
                match_time = datetime.strptime(f"{post.get('date')} {post.get('startTime')}", "%Y-%m-%d %H:%M")
                now = datetime.utcnow()
                hours_until_match = (match_time - now).total_seconds() / 3600
                
                if hours_until_match <= 12:
                    return jsonify({'message': f'Không thể hủy - trận đấu sắp bắt đầu trong {int(hours_until_match)} giờ (cần hủy trước 12h)'}), 400
            except Exception as e:
                print(f"Error checking time: {e}")

    set_booking_status(booking_id, 'cancelled')
    
    # Notify the post owner about cancellation
    post = posts_collection.find_one({"_id": booking.get('postId')})
    requester = users_collection.find_one({"_id": ObjectId(user_id)}, {"name": 1})
    
    create_notification(
        str(booking.get('ownerId')),
        f"{requester.get('name', 'Người dùng') if requester else 'Người dùng'} đã hủy đăng ký {booking.get('requestedSlots')} slot cho bài: {post.get('title', '') if post else ''}",
        "booking_cancelled",
        data={
            "bookingId": booking_id,
            "postId": str(booking.get('postId')),
            "requestedSlots": booking.get('requestedSlots'),
            "requesterId": str(booking.get('requesterId')),
        },
    )

    return jsonify({'message': 'Đã hủy đăng ký'}), 200
