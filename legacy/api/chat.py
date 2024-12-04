# from fastapi import APIRouter, HTTPException
# from crud import conversation

# router = APIRouter()

# @router.post("/conversations")
# async def save_conversation(conversation_data: dict):
#     conversation_id = await conversation.create_conversation(conversation_data)
#     return {"conversation_id": conversation_id}

# @router.get("/conversations/{conversation_id}")
# async def get_conversation(conversation_id: str):
#     conversation = await conversation.get_conversation(conversation_id)
#     if not conversation:
#         raise HTTPException(status_code=404, detail="Conversation not found")
#     return conversation

from fastapi import APIRouter, HTTPException
from models.conversation import Message
from crud.conversation import conversation_crud

router = APIRouter()

@router.post("/chatbot/{conversation_id}")
async def chat(conversation_id: str, message: Message):
    try:
        await conversation_crud.add_message(conversation_id, message)
        # Handle AI response here
        # Mock response:
        ai_response = Message(sender="ai", text="AI response to your message")
        await conversation_crud.add_message(conversation_id, ai_response)
        return {"response": ai_response.text}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
