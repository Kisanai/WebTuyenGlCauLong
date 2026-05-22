from datetime import datetime
from bson import ObjectId
from database.mongo import bookings_collection


def create_booking_request(post_id, requester_id, owner_id, requested_slots):
    doc = {
        "postId": ObjectId(post_id),
        "requesterId": ObjectId(requester_id),
        "ownerId": ObjectId(owner_id),
        "requestedSlots": int(requested_slots),
        "status": "pending",  # pending|approved|rejected
        "createdAt": datetime.utcnow(),
        "decidedAt": None,
    }
    result = bookings_collection.insert_one(doc)
    return str(result.inserted_id)


def get_booking_by_id(booking_id):
    return bookings_collection.find_one({"_id": ObjectId(booking_id)})


def get_pending_booking_for_post(post_id, requester_id):
    return bookings_collection.find_one(
        {
            "postId": ObjectId(post_id),
            "requesterId": ObjectId(requester_id),
            "status": "pending",
        }
    )


def get_bookings_by_user(user_id):
    return list(
        bookings_collection.find(
            {"$or": [{"requesterId": ObjectId(user_id)}, {"ownerId": ObjectId(user_id)}]}
        )
    )


def get_pending_bookings_by_post(post_id, exclude_booking_id=None):
    query = {"postId": ObjectId(post_id), "status": "pending"}
    if exclude_booking_id:
        query["_id"] = {"$ne": ObjectId(exclude_booking_id)}
    return list(bookings_collection.find(query))


def reject_pending_bookings_by_post(post_id, exclude_booking_id=None):
    query = {"postId": ObjectId(post_id), "status": "pending"}
    if exclude_booking_id:
        query["_id"] = {"$ne": ObjectId(exclude_booking_id)}
    bookings_collection.update_many(
        query,
        {"$set": {"status": "rejected", "decidedAt": datetime.utcnow()}},
    )


def set_booking_status(booking_id, status):
    bookings_collection.update_one(
        {"_id": ObjectId(booking_id)},
        {"$set": {"status": status, "decidedAt": datetime.utcnow()}},
    )
