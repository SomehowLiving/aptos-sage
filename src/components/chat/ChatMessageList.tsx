'use client';

import { ChatMessage } from '@/types';
import { ChatMessageBubble } from './ChatMessageBubble';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';

interface ChatMessageListProps {
  messages: ChatMessage[];
  isTyping: boolean;
}

export function ChatMessageList({ messages, isTyping }: ChatMessageListProps) {
  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-4">
      {messages.map((message) => (
        <ChatMessageBubble key={message.id} message={message} />
      ))}
      
      {isTyping && (
        <div className="flex items-center space-x-2 text-gray-500">
          <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
            <span className="text-white text-xs font-bold">AA</span>
          </div>
          <div className="flex items-center space-x-1">
            <LoadingSpinner size="sm" />
            <span className="text-sm">AI is thinking...</span>
          </div>
        </div>
      )}
    </div>
  );
}
