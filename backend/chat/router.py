from fastapi import APIRouter, Depends

from auth.dependencies import get_current_user
from chat.schemas import ChatRequest, ChatResponse, ConversationDetail, ConversationSummary
from chat.service import (
    clear_all_conversations,
    create_conversation,
    get_conversation_messages,
    list_conversations,
    send_chat_message,
)

router = APIRouter(prefix="/api/chat", tags=["chat"])


@router.post("", response_model=ChatResponse)
async def chat(payload: ChatRequest, current_user: dict = Depends(get_current_user)):
    return await send_chat_message(
        user_id=current_user["id"],
        query=payload.query,
        language=payload.language,
        conversation_id=payload.conversation_id,
    )


@router.get("/conversations", response_model=list[ConversationSummary])
async def get_conversations(current_user: dict = Depends(get_current_user)):
    return await list_conversations(current_user["id"])


@router.get("/conversations/{conversation_id}", response_model=ConversationDetail)
async def get_conversation(conversation_id: str, current_user: dict = Depends(get_current_user)):
    return await get_conversation_messages(current_user["id"], conversation_id)


@router.post("/conversations", response_model=ConversationSummary)
async def start_conversation(
    language: str = "en",
    current_user: dict = Depends(get_current_user),
):
    return await create_conversation(current_user["id"], language)


@router.delete("/conversations", status_code=204)
async def delete_all_conversations(current_user: dict = Depends(get_current_user)):
    await clear_all_conversations(current_user["id"])
    return None
