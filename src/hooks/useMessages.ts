import { useEffect, useState } from 'react';

import { subscribeMessages } from '../services/chatService';
import { Message } from '../types/models';

export function useMessages(chatId: string) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setMessages([]);
    setLoading(true);
    const unsubscribe = subscribeMessages(chatId, next => {
      setMessages(next);
      setLoading(false);
    });
    return unsubscribe;
  }, [chatId]);

  return { messages, loading };
}
