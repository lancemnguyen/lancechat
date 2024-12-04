# from dbs.mongodb import conversation_collection
# from bson import ObjectId

# async def create_conversation(data: dict) -> dict:
#     result = await conversation_collection.insert_one(data)
#     return {"id": str(result.inserted_id)}

# async def get_conversation(conversation_id: str) -> dict:
#     conversation = await conversation_collection.find_one({"_id": ObjectId(conversation_id)})
#     if conversation:
#         return conversation
#     return None

from bson import ObjectId
from motor.motor_asyncio import AsyncIOMotorCollection
from models.conversation import Conversation, Message
from dbs.mongodb import db

class ConversationCRUD:
    def __init__(self, collection: AsyncIOMotorCollection):
        self.collection = collection

    async def create_conversation(self, title: str) -> str:
        new_conversation = {
            "title": title,
            "messages": []
        }
        result = await self.collection.insert_one(new_conversation)
        return str(result.inserted_id)

    async def add_message(self, conversation_id: str, message: Message):
        await self.collection.update_one(
            {"_id": ObjectId(conversation_id)},
            {"$push": {"messages": message.dict()}}
        )

    async def get_conversation(self, conversation_id: str) -> Conversation:
        doc = await self.collection.find_one({"_id": ObjectId(conversation_id)})
        return Conversation(**doc)

conversation_crud = ConversationCRUD(db.database["conversations"])
