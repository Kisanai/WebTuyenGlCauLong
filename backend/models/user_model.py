
from database.mongo import users_collection
from bson import ObjectId
from werkzeug.security import generate_password_hash, check_password_hash

def create_user(name, phone, password, role='user'):
    hashed_password = generate_password_hash(password)

    user = {
        "name": name,
        "phone": phone,
        "password": hashed_password,
        "role": role
    }

    return users_collection.insert_one(user)

def find_user_by_phone(phone):
    return users_collection.find_one({"phone": phone})

def find_user_by_id(user_id):
    return users_collection.find_one({"_id": ObjectId(user_id)})

def verify_password(stored_password, password):
    return check_password_hash(stored_password, password)

def create_admin_if_not_exists():
    """Create default admin account if it doesn't exist"""
    admin = users_collection.find_one({"phone": "admin"})
    if not admin:
        create_user("Admin", "admin", "admin", role="admin")
        print("✓ Admin account created: phone=admin, password=admin")
    elif admin.get("role") != "admin":
        users_collection.update_one({"phone": "admin"}, {"$set": {"role": "admin"}})
        print("✓ Admin role restored for phone=admin")

