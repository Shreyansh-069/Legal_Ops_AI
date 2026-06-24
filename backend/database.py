import os
from pymongo import MongoClient

# Fallback to local if no environment variable is provided
MONGO_URI = os.getenv("MONGO_URI", "mongodb://localhost:27017")
client = MongoClient(MONGO_URI)

# Single database instance
db = client["legalops_db"]

# Collections
users_collection = db["users"]
chats_collection = db["chats"]