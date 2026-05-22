from datetime import datetime
from bson import ObjectId
from database.mongo import notifications_collection


def create_notification(user_id, message, type_, data=None):
    notification = {
        "userId": ObjectId(user_id),
        "message": message,
        "type": type_,  # booking_request|booking_approved|booking_rejected|...
        "data": data or {},
        "isRead": False,
        "createdAt": datetime.utcnow(),
    }
    result = notifications_collection.insert_one(notification)
    return str(result.inserted_id)


def get_notifications_by_user(user_id, unread_only=False):
    query = {"userId": ObjectId(user_id)}
    if unread_only:
        query["isRead"] = False
    return list(notifications_collection.find(query).sort("createdAt", -1))


def mark_notification_read(notification_id, user_id):
    notifications_collection.update_one(
        {"_id": ObjectId(notification_id), "userId": ObjectId(user_id)},
        {"$set": {"isRead": True}},
    )
