from datetime import datetime

from pydantic import BaseModel, Field


class ChatRequest(BaseModel):
    query: str = Field(min_length=1)
    language: str = "en"
    conversation_id: str | None = None


class ChatResponse(BaseModel):
    response: str
    language: str
    conversation_id: str
    message_id: str


class ConversationSummary(BaseModel):
    id: str
    title: str
    language: str
    updated_at: datetime


class MessageItem(BaseModel):
    id: str
    role: str
    content: str
    created_at: datetime


class ConversationDetail(BaseModel):
    id: str
    title: str
    language: str
    messages: list[MessageItem]
