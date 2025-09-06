'use client';

import { ChatMessage } from '@/types';
import { cn } from '@/lib/utils';
import { formatDistanceToNow } from 'date-fns';
import { User, Bot } from 'lucide-react';

interface ChatMessageBubbleProps {
  message: ChatMessage;
}

export function ChatMessageBubble({ message }: ChatMessageBubbleProps) {
  const isUser = message.role === 'user';
  const isAssistant = message.role === 'assistant';

  return (
    <div className={cn(
      "flex items-start space-x-3 chat-message",
      isUser && "flex-row-reverse space-x-reverse"
    )}>
      {/* Avatar */}
      <div className={cn(
        "w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0",
        isUser 
          ? "bg-gray-100" 
          : "bg-gradient-to-r from-blue-500 to-purple-600"
      )}>
        {isUser ? (
          <User className="w-4 h-4 text-gray-600" />
        ) : (
          <Bot className="w-4 h-4 text-white" />
        )}
      </div>

      {/* Message Content */}
      <div className={cn(
        "max-w-xs lg:max-w-md xl:max-w-lg",
        isUser && "flex flex-col items-end"
      )}>
        <div className={cn(
          "px-4 py-2 rounded-lg",
          isUser 
            ? "bg-blue-500 text-white" 
            : "bg-gray-100 text-gray-900"
        )}>
          <div className="text-sm whitespace-pre-wrap break-words">
            {message.content}
          </div>
        </div>
        
        {/* Timestamp */}
        <div className={cn(
          "text-xs text-gray-500 mt-1",
          isUser && "text-right"
        )}>
          {formatDistanceToNow(message.timestamp, { addSuffix: true })}
        </div>

        {/* Action Buttons for Assistant Messages */}
        {isAssistant && message.metadata?.action && (
          <div className="mt-2 flex space-x-2">
            {message.metadata.action === 'create_token' && (
              <button className="text-xs bg-blue-50 text-blue-600 px-2 py-1 rounded hover:bg-blue-100 transition-colors">
                Create Token
              </button>
            )}
            {message.metadata.action === 'create_pool' && (
              <button className="text-xs bg-green-50 text-green-600 px-2 py-1 rounded hover:bg-green-100 transition-colors">
                Create Pool
              </button>
            )}
            {message.metadata.action === 'create_vault' && (
              <button className="text-xs bg-purple-50 text-purple-600 px-2 py-1 rounded hover:bg-purple-100 transition-colors">
                Create Vault
              </button>
            )}
          </div>
        )}

        {/* Transaction Hash */}
        {message.metadata?.transactionHash && (
          <div className="mt-2">
            <a
              href={`https://explorer.aptoslabs.com/txn/${message.metadata.transactionHash}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-blue-600 hover:text-blue-700 underline"
            >
              View Transaction
            </a>
          </div>
        )}
      </div>
    </div>
  );
}
