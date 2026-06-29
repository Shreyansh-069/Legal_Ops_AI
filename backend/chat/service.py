import asyncio
from datetime import datetime, timezone

from bson import ObjectId
from bson.errors import InvalidId
from fastapi import HTTPException, status

from agents.graph import legal_ops_graph
from database.mongodb import get_database


def _conversation_title(query: str) -> str:
    cleaned = query.strip()
    if len(cleaned) <= 80:
        return cleaned
    return cleaned[:77] + "..."


async def _get_owned_conversation(conversation_id: str, user_id: str) -> dict:
    db = await get_database()
    try:
        oid = ObjectId(conversation_id)
    except InvalidId:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Conversation not found.")

    conversation = await db.conversations.find_one({"_id": oid, "user_id": user_id})
    if not conversation:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Conversation not found.")

    return conversation


async def send_chat_message(user_id: str, query: str, language: str, conversation_id: str | None) -> dict:
    db = await get_database()
    now = datetime.now(timezone.utc)

    if conversation_id:
        conversation = await _get_owned_conversation(conversation_id, user_id)
        conv_oid = conversation["_id"]
    else:
        conv_doc = {
            "user_id": user_id,
            "language": language,
            "title": _conversation_title(query),
            "created_at": now,
            "updated_at": now,
        }
        result = await db.conversations.insert_one(conv_doc)
        conv_oid = result.inserted_id
        conversation = {**conv_doc, "_id": conv_oid}

    await db.messages.insert_one({
        "conversation_id": conv_oid,
        "role": "user",
        "content": query.strip(),
        "created_at": now,
    })

    execution_input = {
        "raw_query": query.strip(),
        "language": language or conversation.get("language", "en"),
        "constitutional_data": "",
        "web_data": "",
        "compiled_english_advice": "",
        "final_localized_response": "",
    }

    try:
        output = await legal_ops_graph.ainvoke(execution_input)
    except Exception as exc:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(exc))

    response_text = output.get("final_localized_response", "")
    response_language = output.get("language", language)

    assistant_result = await db.messages.insert_one({
        "conversation_id": conv_oid,
        "role": "assistant",
        "content": response_text,
        "created_at": datetime.now(timezone.utc),
    })

    await db.conversations.update_one(
        {"_id": conv_oid},
        {"$set": {"updated_at": datetime.now(timezone.utc), "language": response_language}},
    )

    return {
        "response": response_text,
        "language": response_language,
        "conversation_id": str(conv_oid),
        "message_id": str(assistant_result.inserted_id),
    }


async def list_conversations(user_id: str) -> list[dict]:
    db = await get_database()
    cursor = db.conversations.find({"user_id": user_id}).sort("updated_at", -1)
    conversations = []
    async for doc in cursor:
        conversations.append({
            "id": str(doc["_id"]),
            "title": doc.get("title", "Untitled chat"),
            "language": doc.get("language", "en"),
            "updated_at": doc.get("updated_at"),
        })
    return conversations


async def get_conversation_messages(user_id: str, conversation_id: str) -> dict:
    conversation = await _get_owned_conversation(conversation_id, user_id)
    db = await get_database()

    cursor = db.messages.find({"conversation_id": conversation["_id"]}).sort("created_at", 1)
    messages = []
    async for doc in cursor:
        messages.append({
            "id": str(doc["_id"]),
            "role": doc["role"],
            "content": doc["content"],
            "created_at": doc.get("created_at"),
        })

    return {
        "id": str(conversation["_id"]),
        "title": conversation.get("title", "Untitled chat"),
        "language": conversation.get("language", "en"),
        "messages": messages,
    }


async def create_conversation(user_id: str, language: str) -> dict:
    db = await get_database()
    now = datetime.now(timezone.utc)
    doc = {
        "user_id": user_id,
        "language": language,
        "title": "New chat",
        "created_at": now,
        "updated_at": now,
    }
    result = await db.conversations.insert_one(doc)
    return {
        "id": str(result.inserted_id),
        "title": doc["title"],
        "language": language,
        "updated_at": now,
    }


async def clear_all_conversations(user_id: str) -> int:
    db = await get_database()
    conv_ids = []
    async for doc in db.conversations.find({"user_id": user_id}, {"_id": 1}):
        conv_ids.append(doc["_id"])

    if not conv_ids:
        return 0

    await db.messages.delete_many({"conversation_id": {"$in": conv_ids}})
    result = await db.conversations.delete_many({"user_id": user_id})
    return result.deleted_count
