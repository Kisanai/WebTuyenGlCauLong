from flask import Blueprint, jsonify, request
from bson import ObjectId
from utils.auth_middleware import token_required
from utils.jwt_helper import decode_token
from models.notification_model import get_notifications_by_user, mark_notification_read
from database.mongo import users_collection, posts_collection

notification_bp = Blueprint('notifications', __name__)


@notification_bp.route('/', methods=['GET'])
@token_required
def list_notifications():
    token = request.headers.get('Authorization').split(' ')[1]
    payload = decode_token(token)
    user_id = payload['user_id']
    unread_only = request.args.get('unread') == '1'

    items = get_notifications_by_user(user_id, unread_only=unread_only)
    for n in items:
        # Enrich booking_request so UI can show requester + court/time even for older notifications
        try:
            if n.get("type") == "booking_request":
                data = n.get("data") or {}

                requester_id = data.get("requesterId")
                if requester_id and (not data.get("requesterName") or not data.get("requesterPhone")):
                    try:
                        rid = ObjectId(requester_id) if isinstance(requester_id, str) else requester_id
                        requester = users_collection.find_one({"_id": rid}, {"name": 1, "phone": 1})
                        if requester:
                            data["requesterName"] = data.get("requesterName") or requester.get("name")
                            data["requesterPhone"] = data.get("requesterPhone") or requester.get("phone")
                    except Exception:
                        pass

                post_id = data.get("postId")
                if post_id and (not data.get("courtName") or not data.get("date") or not data.get("startTime")):
                    try:
                        pid = ObjectId(post_id) if isinstance(post_id, str) else post_id
                        post = posts_collection.find_one(
                            {"_id": pid},
                            {"title": 1, "courtName": 1, "date": 1, "startTime": 1, "endTime": 1},
                        )
                        if post:
                            data["postTitle"] = data.get("postTitle") or post.get("title")
                            data["courtName"] = data.get("courtName") or post.get("courtName")
                            data["date"] = data.get("date") or post.get("date")
                            data["startTime"] = data.get("startTime") or post.get("startTime")
                            data["endTime"] = data.get("endTime") or post.get("endTime")
                    except Exception:
                        pass

                n["data"] = data
        except Exception:
            pass

        n['_id'] = str(n['_id'])
        n['userId'] = str(n['userId'])
        if n.get('createdAt'):
            n['createdAt'] = n['createdAt'].isoformat()
    return jsonify(items), 200


@notification_bp.route('/<notification_id>/read', methods=['POST'])
@token_required
def read_notification(notification_id):
    token = request.headers.get('Authorization').split(' ')[1]
    payload = decode_token(token)
    user_id = payload['user_id']
    mark_notification_read(notification_id, user_id)
    return jsonify({'message': 'OK'}), 200
