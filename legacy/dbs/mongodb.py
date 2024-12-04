# from motor.motor_asyncio import AsyncIOMotorClient
# import os
# import logging

# # Initialize MongoDB client
# try:
#     client = AsyncIOMotorClient(os.getenv("MONGODB_URI"))
#     # db = client.chatbot_db  # Use the correct database name here

#     db = client.get_default_database()
#     pong = db.command("ping")
#     if int(pong["ok"]) != 1:
#         raise Exception("Cluster connection is not okay!")
    
#     # conversation_collection = db.conversations  # Ensure the collection name is correct
#     conversation_collection = db.get_collection("conversations")
# except Exception as e:
#     logging.error(f"Failed to connect to MongoDB: {e}")

from motor.motor_asyncio import AsyncIOMotorClient
from pymongo.database import Database
from dotenv import load_dotenv
import os

load_dotenv

MONGODB_URI = os.getenv("MONGODB_URI")
DB_NAME = "lanceaigeneral"  # Replace with your actual database name

class MongoDB:
    def __init__(self):
        self.client = AsyncIOMotorClient(MONGODB_URI)
        self.database = self.client[DB_NAME]  # Access the database here

db = MongoDB()

async def connect_to_mongo():
    db.client = AsyncIOMotorClient(MONGODB_URI)
    db.database = db.client[DB_NAME]
    print("Connected to MongoDB!")

async def close_mongo_connection():
    db.client.close()
    print("Closed MongoDB connection.")
