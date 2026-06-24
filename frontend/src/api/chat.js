import { apiFetch } from './client';

export function sendMessage(query, language, conversationId = null) {
  return apiFetch('/api/chat', {
    method: 'POST',
    body: JSON.stringify({
      query,
      language,
      conversation_id: conversationId,
    }),
  });
}

export function getConversations() {
  return apiFetch('/api/chat/conversations');
}

export function getConversation(conversationId) {
  return apiFetch(`/api/chat/conversations/${conversationId}`);
}

export function createConversation(language) {
  return apiFetch(`/api/chat/conversations?language=${encodeURIComponent(language)}`, {
    method: 'POST',
  });
}

export function clearAllConversations() {
  return apiFetch('/api/chat/conversations', { method: 'DELETE' });
}
