const API_BASE_URL = '/api';

export interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export const sendMessageToMistral = async (messages: ChatMessage[]) => {
  try {
    const response = await fetch(`${API_BASE_URL}/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ messages }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error("Failed to send message:", error);
    throw error;
  }
};
