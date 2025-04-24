import os
from openai import OpenAI
from fastapi import FastAPI, HTTPException, Request
from pydantic import BaseModel
from app.data import (
    create_conversation,
    get_conversations,
    get_conversation,
    add_message,
    delete_conversation,
    Message,
    validate_object_id,
)
from fastapi.middleware.cors import CORSMiddleware
import uuid

import requests
from bs4 import BeautifulSoup

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class UserConversationRequest(BaseModel):
    user_id: str
    title: str

class NewMessageRequest(BaseModel):
    sender: str
    text: str
    conversation_id: str = None  # optional

@app.post("/api/conversations/")
async def create_new_conversation(request: UserConversationRequest):
    if not request.user_id:
        raise HTTPException(status_code=400, detail="User ID is required")
    
    conversation_id = await create_conversation(request.user_id, request.title)
    return {"id": conversation_id, "title": request.title}

@app.get("/api/conversations/")
async def list_conversations(user_id: str):
    return await get_conversations(user_id)

@app.get("/api/conversations/{conversation_id}")
async def retrieve_conversation(conversation_id: str, user_id: str):
    conversation_id = validate_object_id(conversation_id)  # Validate here at request level
    conversation = await get_conversation(conversation_id, user_id)
    if not conversation:
        raise HTTPException(status_code=404, detail="Conversation not found")
    return conversation

@app.post("/api/messages/")
async def post_message(request: NewMessageRequest):
    if not request.text:
        raise HTTPException(status_code=400, detail="Message text is required")
    
    conversation_id = request.conversation_id

    if not conversation_id:
        # Use the dynamic title function
        try:
            client = OpenAI(api_key=os.environ.get("OPENAI_API_KEY"))
            responsefortitle = client.chat.completions.create(
                model="gpt-4o-mini",
                messages=[
                    {"role": "system", "content": "You are a helpful assistant."},
                    {"role": "user", "content": "Summarize the user's message and create a title for this conversation based on the summary of the user's message in 5 words or less. Do not include 'Title:' or anything else but the title itself in the response."},
                    {"role": "user", "content": request.text}
                ]
            )
            conversation_title = responsefortitle.choices[0].message.content.strip()
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Error generating conversation title: {str(e)}")
        
        try:
            conversation_id = await create_conversation(user_id=request.sender, title=conversation_title)
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Error creating new conversation: {str(e)}")

    try:
        # no memory

        # validate_object_id(conversation_id)
        # user_message = Message(sender=request.sender, text=request.text)
        # await add_message(conversation_id, user_message)

        # # Bot Response
        # client = OpenAI(api_key=os.environ.get("OPENAI_API_KEY"))
        # response = client.chat.completions.create(
        #     model="gpt-4o-mini",
        #     messages=[
        #         {"role": "system", "content": "You are a helpful assistant."},
        #         {"role": "user", "content": request.text}
        #     ]
        # )

        # with memory

        # Retrieve the conversation history
        conversation = await get_conversation(conversation_id, request.sender)
        if not conversation:
            raise HTTPException(status_code=404, detail="Conversation not found")

        # Format the conversation history
        formatted_history = [
            {"role": "user", "content": msg.text} if msg.sender != "bot" else {"role": "assistant", "content": msg.text}
            for msg in conversation.messages
        ]

        # Add the new user message to the history
        formatted_history.append({"role": "user", "content": request.text})

        # Store the user's message in the database
        user_message = Message(sender=request.sender, text=request.text)
        await add_message(conversation_id, user_message)

        # Call the model with the formatted history
        client = OpenAI(api_key=os.environ.get("OPENAI_API_KEY"))
        response = client.chat.completions.create(
            model="gpt-4o-mini",
            messages=formatted_history
        )

        bot_reply = response.choices[0].message.content
        
        # Add Bot's Message
        bot_message = Message(sender="bot", text=bot_reply)
        await add_message(conversation_id, bot_message)

        return {
        "status": "ok",
        "bot_response": bot_reply,
        "conversation_id": conversation_id,
        "conversation_title": conversation_title if not request.conversation_id else None
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error communicating with OpenAI: {str(e)}")

@app.delete("/api/conversations/{conversation_id}")
async def remove_conversation(conversation_id: str, user_id: str):
    success = await delete_conversation(conversation_id, user_id)
    if not success:
        raise HTTPException(status_code=404, detail="Conversation not found")
    return {"status": "Conversation deleted"}

class DemoMessageRequest(BaseModel):
    sender: str
    text: str
    conversation_id: str

# Temporary in-memory storage for demo conversations
demo_conversations = {}

@app.post("/api/demo/messages/")
async def post_demo_message(request: Request):
    # Get message data from request
    data = await request.json()
    sender = data["sender"]
    text = data["text"]

    # Generate a temporary conversation ID for demo users
    if sender == "demo-user":
        conversation_id = str(uuid.uuid4())  # unique temp ID

        # temporarily store conversation in memory
        if conversation_id not in demo_conversations:
            demo_conversations[conversation_id] = []
        demo_conversations[conversation_id].append({"sender": sender, "text": text})

        client = OpenAI(api_key=os.environ.get("OPENAI_API_KEY"))
        try:
            response = client.chat.completions.create(
                model="gpt-4o-mini",
                messages=[
                    {"role": "system", "content": "You are a helpful assistant."},
                    {"role": "user", "content": text}
                ]
            )
            bot_reply = response.choices[0].message.content

        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Error with OpenAI API: {str(e)}")

        return {
            "status": "ok",
            "bot_response": bot_reply,
            "conversation_id": conversation_id,
            "conversation_title": "Demo Conversation",
        }
    
class SummarizeRequest(BaseModel):
    url: str
    sender: str

def download_url(url):
    headers = {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537.3'
    }
    try:
        response = requests.get(url, headers=headers)
        response.raise_for_status()  # Raise an exception for 4xx and 5xx status codes
        return response.text
    except requests.exceptions.RequestException as e:
        print(f"An error occurred while downloading the URL: {e}")
        return None

def extract_visible_text(html_content):
    try:
        soup = BeautifulSoup(html_content, 'html.parser')
        visible_text = soup.get_text()
        return visible_text
    except Exception as e:
        print(f"An error occurred while extracting text: {e}")
        return None
    
def summarize_text(text):
    client = OpenAI(api_key=os.environ.get("OPENAI_API_KEY"))
    prompt = f"Summarize the following text in 3 to 5 sentences using simple language that anyone can understand in English:\n{text}"
    
    try:
        response = client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[{"role": "user", "content": prompt}]
        )
        return response.choices[0].message.content.strip()
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error communicating with OpenAI: {str(e)}")

@app.post("/api/summarize/")
async def summarize(request: SummarizeRequest):
    html_content = download_url(request.url)
    if not html_content:
        raise HTTPException(status_code=400, detail="Failed to download content from the URL")

    text = extract_visible_text(html_content)
    summary = summarize_text(text)

    client = OpenAI(api_key=os.environ.get("OPENAI_API_KEY"))
    responsefortitle = client.chat.completions.create(
        model="gpt-4o-mini",
        messages=[
            {"role": "system", "content": "You are a helpful assistant."},
            {"role": "user", "content": "Create a title for this new conversation based on the summary of the article in 5 words or less. Do not include 'Title:' or anything else but the title itself in the response."},
            {"role": "user", "content": summary}
        ]
    )
    conversation_title = responsefortitle.choices[0].message.content.strip()
    
    # Create a new conversation in database
    conversation_id = await create_conversation(
        user_id=request.sender,
        title=conversation_title,
        summary=summary  # can store summary separately if needed
    )

    # Add the summary as the first message in the messages array
    await add_message(conversation_id, Message(sender="bot", text=summary))

    return {"conversation_id": conversation_id, "summary": summary, "conversation_title": conversation_title}

@app.get("/api/health/")
async def health_check():
    return {"status": "OK"}
