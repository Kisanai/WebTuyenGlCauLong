
from pymongo import MongoClient
from config import Config

client = MongoClient(Config.MONGO_URI)
db = client[Config.DB_NAME]

users_collection = db["users"]
posts_collection = db["posts"]
bookings_collection = db["booking_requests"]
notifications_collection = db["notifications"]

