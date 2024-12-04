from fastapi.testclient import TestClient
from app.main import app
import pytest
import os
from motor.motor_asyncio import AsyncIOMotorClient

client = TestClient(app)

@pytest.fixture
def mongodb_test_client():
    # Set up a connection to a test database
    test_client = AsyncIOMotorClient(os.getenv("MONGODB_URI"))
    return test_client

def test_create_conversation(mongodb_test_client):
    # Send a request to save a conversation
    response = client.post("/chat", json={"messages": [{"role": "user", "content": "Test message"}]})
    assert response.status_code == 200
    conversation_id = response.json()["conversation_id"]["id"]

    # Check if the conversation is actually saved in MongoDB
    conversation = mongodb_test_client.chatbot_db.conversations.find_one({"_id": conversation_id})
    assert conversation is not None
    assert conversation["messages"][0]["content"] == "Test message"

def test_get_conversation(mongodb_test_client):
    # Insert a test conversation
    conversation = {"messages": [{"role": "user", "content": "Test fetch message"}]}
    insert_result = mongodb_test_client.chatbot_db.conversations.insert_one(conversation)
    conversation_id = str(insert_result.inserted_id)

    # Fetch the inserted conversation
    response = client.get(f"/conversations/{conversation_id}")
    assert response.status_code == 200
    fetched_conversation = response.json()
    assert fetched_conversation["messages"][0]["content"] == "Test fetch message"


# from pymongo.mongo_client import MongoClient
# from pymongo.server_api import ServerApi

# # Replace <db_password> with your actual database password
# uri = "mongodb+srv://lancesudo:forsaken@lanceaigeneral.xdo05.mongodb.net/?retryWrites=true&w=majority&appName=lanceaigeneral"

# # Create a new client and connect to the server
# client = MongoClient(uri, server_api=ServerApi('1'))

# # Send a ping to confirm a successful connection
# try:
#     client.admin.command('ping')
#     print("Pinged your deployment. You successfully connected to MongoDB!")
# except Exception as e:
#     print("Error:", e)
