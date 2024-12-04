from pydantic import BaseModel
from typing import List, Optional

class Message(BaseModel):
    sender: str
    text: str

class Conversation(BaseModel):
    id: Optional[str]
    title: str
    messages: List[Message]
    