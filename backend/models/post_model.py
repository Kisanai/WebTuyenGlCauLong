from database.mongo import posts_collection, users_collection
from datetime import datetime
from bson import ObjectId
from datetime import datetime as dt

def _attach_user_phone(post: dict) -> dict:
    if not post:
        return post

    try:
        if post.get("userPhone"):
            return post

        user_id = post.get("userId")
        if not user_id:
            return post

        if isinstance(user_id, str):
            user_id = ObjectId(user_id)

        user = users_collection.find_one({"_id": user_id}, {"phone": 1})
        post["userPhone"] = user.get("phone") if user else None
        return post
    except Exception:
        post["userPhone"] = None
        return post

def create_post(user_id, title, description, total_slots, date, start_time, end_time, court_name, court_address, skill_level, price):
    user = users_collection.find_one({"_id": ObjectId(user_id)}, {"phone": 1})
    post = {
        'userId': ObjectId(user_id),
        'userPhone': user.get('phone') if user else None,
        'title': title,
        'description': description,
        'totalSlots': total_slots,
        'remainingSlots': total_slots,
        'date': date,
        'startTime': start_time,
        'endTime': end_time,
        'courtName': court_name,
        'courtAddress': court_address,
        'skillLevel': skill_level,
        'price': price,
        'status': 'active',
        'createdAt': datetime.utcnow()
    }
    result = posts_collection.insert_one(post)
    return str(result.inserted_id)

def _expire_post_if_needed(post: dict) -> dict:
    if not post:
        return post
    try:
        if post.get("status") != "active":
            return post
        date_str = post.get("date")
        start_time = post.get("startTime")
        if not date_str or not start_time:
            return post
        start_dt = dt.fromisoformat(f"{date_str}T{start_time}")
        if dt.now() >= start_dt:
            posts_collection.update_one({"_id": post["_id"]}, {"$set": {"status": "expired"}})
            post["status"] = "expired"
        return post
    except Exception:
        return post

def get_all_posts():
    posts = list(posts_collection.find({'status': 'active'}))
    result = []
    for p in posts:
        p = _expire_post_if_needed(p)
        if p and p.get("status") == "active":
            result.append(_attach_user_phone(p))
    return result

def get_post_by_id(post_id):
    post = posts_collection.find_one({'_id': ObjectId(post_id), 'status': 'active'})
    post = _expire_post_if_needed(post)
    if not post or post.get("status") != "active":
        return None
    return _attach_user_phone(post)

def get_post_by_id_any(post_id):
    post = posts_collection.find_one({'_id': ObjectId(post_id)})
    post = _expire_post_if_needed(post)
    return _attach_user_phone(post) if post else None

def update_post(post_id, updates):
    posts_collection.update_one({'_id': ObjectId(post_id)}, {'$set': updates})

def delete_post(post_id):
    posts_collection.update_one({'_id': ObjectId(post_id)}, {'$set': {'status': 'deleted'}})

def get_posts_by_user(user_id):
    posts = list(posts_collection.find({'userId': ObjectId(user_id), 'status': 'active'}))
    result = []
    for p in posts:
        p = _expire_post_if_needed(p)
        if p and p.get("status") == "active":
            result.append(_attach_user_phone(p))
    return result


def get_posts_by_user_all(user_id):
    posts = list(posts_collection.find({'userId': ObjectId(user_id)}).sort("createdAt", -1))
    result = []
    for p in posts:
        p = _expire_post_if_needed(p)
        if p:
            result.append(_attach_user_phone(p))
    return result


def decrement_remaining_slots(post_id, slots):
    slots = int(slots)
    if slots <= 0:
        return False
    res = posts_collection.update_one(
        {"_id": ObjectId(post_id), "status": "active", "remainingSlots": {"$gte": slots}},
        {"$inc": {"remainingSlots": -slots}},
    )
    return res.modified_count == 1
