from motor.motor_asyncio import AsyncIOMotorClient
from pydantic import BaseModel
from bson import ObjectId
import os
from dotenv import load_dotenv
from datetime import datetime
from bson.errors import InvalidId
from fastapi import HTTPException

load_dotenv()

MONGO_URI = os.getenv("MONGODB_URI")
DATABASE_NAME = os.getenv("DATABASE_NAME")

# init MongoDB connection
class MongoDB:
    client = None

    def __init__(self):
        if not MongoDB.client:
            MongoDB.client = AsyncIOMotorClient(MONGO_URI)
        self.client = MongoDB.client
        self.database = self.client[DATABASE_NAME]
        self.conversations = self.database["conversations"]  # Collection for conversations

mongodb = MongoDB()

class Message(BaseModel):
    sender: str
    text: str

class Conversation(BaseModel):
    id: str
    title: str
    messages: list[Message]

class ConversationSummary(BaseModel):
    id: str
    title: str

def validate_object_id(id: str) -> ObjectId:
    try:
        return ObjectId(id)
    except InvalidId:
        raise HTTPException(status_code=400, detail="Invalid ID format")

async def create_conversation(user_id: str, title: str, summary: str = None) -> str:
    new_conversation = {
        "user_id": user_id,
        "title": title,
        "messages": [],
        "summary": summary,
        "created_at": datetime.utcnow()
    }
    result = await mongodb.conversations.insert_one(new_conversation)
    return str(result.inserted_id)

async def get_conversations(user_id: str) -> list[ConversationSummary]:
    cursor = mongodb.conversations.aggregate([
        {"$match": {"user_id": user_id}},  # Filter conversations by user
        {"$addFields": {
            "last_activity": {
                "$cond": {
                    "if": {"$gt": [{"$size": "$messages"}, 0]},
                    "then": {"$max": "$messages.created_at"},
                    "else": "$created_at"
                }
            }
        }},
        {"$sort": {"last_activity": -1}},  # Sort by last_activity in descending order
        {"$project": {"messages": 0}}  # Exclude messages from the result
    ])
    return [ConversationSummary(id=str(doc["_id"]), title=doc["title"]) async for doc in cursor]


async def get_conversation(conversation_id: str, user_id: str) -> Conversation:
    conversation_id = validate_object_id(conversation_id)  # Validate here
    doc = await mongodb.conversations.find_one({"_id": conversation_id, "user_id": user_id})
    if not doc:
        return None
    return Conversation(id=str(doc["_id"]), title=doc["title"], messages=doc["messages"])

async def add_message(conversation_id: str, message: Message):
    message_with_timestamp = message.model_dump()
    message_with_timestamp["created_at"] = datetime.utcnow()
    await mongodb.conversations.update_one(
        {"_id": ObjectId(conversation_id)},
        {
            "$push": {"messages": message_with_timestamp},
            "$set": {"last_activity": message_with_timestamp["created_at"]}
        }
    )

async def delete_conversation(conversation_id: str, user_id: str) -> bool:
    result = await mongodb.conversations.delete_one({"_id": ObjectId(conversation_id), "user_id": user_id})
    return result.deleted_count > 0

# async def update_conversation_title(conversation_id: str, title: str):
#     await mongodb.conversations.update_one({"_id": ObjectId(conversation_id)}, {"$set": {"title": title}})