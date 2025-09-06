'use client';

import { useState, useRef, useEffect } from 'react';
import { useAppStore } from '@/store/useAppStore';
import { openRouterService } from '@/lib/openrouter';
import { ChatMessageList } from './ChatMessageList';
import { ChatInput } from './ChatInput';
import { ChatHeader } from './ChatHeader';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { useToast } from '@/components/ui/toaster';

export function ChatInterface() {
  const { 
    currentSession, 
    addMessage, 
    setCurrentSession, 
    wallet,
    setLoading,
    setError 
  } = useAppStore();
  
  const [isTyping, setIsTyping] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { success, error: showError } = useToast();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [currentSession?.messages]);

  const handleSendMessage = async (message: string) => {
    if (!message.trim() || isTyping) return;

    // Add user message
    const userMessage = {
      id: `msg_${Date.now()}`,
      role: 'user' as const,
      content: message,
      timestamp: new Date(),
    };

    addMessage(userMessage);
    setInputValue('');
    setIsTyping(true);
    setLoading(true);

    try {
      // Get conversation history for context
      const conversationHistory = currentSession?.messages.map(msg => ({
        role: msg.role,
        content: msg.content,
      })) || [];

      // Get AI response
      const aiResponse = await openRouterService.chatWithAssistant(message, conversationHistory);

      // Add AI response
      const assistantMessage = {
        id: `msg_${Date.now() + 1}`,
        role: 'assistant' as const,
        content: aiResponse,
        timestamp: new Date(),
      };

      addMessage(assistantMessage);
      success('AI Response', 'Assistant replied successfully');

    } catch (error) {
      console.error('Error getting AI response:', error);
      const errorMessage = {
        id: `msg_${Date.now() + 1}`,
        role: 'assistant' as const,
        content: 'Sorry, I encountered an error while processing your request. Please try again.',
        timestamp: new Date(),
      };

      addMessage(errorMessage);
      showError('AI Error', 'Failed to get response from AI assistant');
      setError(error instanceof Error ? error.message : 'Unknown error occurred');
    } finally {
      setIsTyping(false);
      setLoading(false);
    }
  };

  const handleQuickAction = (action: string) => {
    const quickMessages = {
      'create_token': 'I want to create a new token',
      'create_pool': 'I want to create a liquidity pool',
      'create_vault': 'I want to create a yield vault',
      'help': 'How can you help me with DeFi on Aptos?',
      'portfolio': 'Show me my portfolio overview',
    };

    const message = quickMessages[action as keyof typeof quickMessages] || action;
    handleSendMessage(message);
  };

  return (
    <div className="flex flex-col h-full bg-white">
      {/* Chat Header */}
      <ChatHeader 
        walletConnected={wallet.connected}
        onQuickAction={handleQuickAction}
      />

      {/* Messages Area */}
      <div className="flex-1 overflow-hidden">
        {currentSession?.messages.length === 0 ? (
          <div className="h-full flex items-center justify-center">
            <div className="text-center max-w-md mx-auto px-6">
              <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-white text-2xl font-bold">AA</span>
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Welcome to Aptos Assistant
              </h2>
              <p className="text-gray-600 mb-6">
                I'm your AI-powered DeFi assistant. I can help you create tokens, 
                liquidity pools, and yield vaults on the Aptos blockchain.
              </p>
              
              {!wallet.connected && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
                  <p className="text-yellow-800 text-sm">
                    <strong>Connect your wallet</strong> to start creating DeFi products
                  </p>
                </div>
              )}

              <div className="grid grid-cols-1 gap-3">
                <button
                  onClick={() => handleQuickAction('create_token')}
                  className="p-4 text-left border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <div className="font-medium text-gray-900">Create Token</div>
                  <div className="text-sm text-gray-500">Launch your own cryptocurrency</div>
                </button>
                
                <button
                  onClick={() => handleQuickAction('create_pool')}
                  className="p-4 text-left border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <div className="font-medium text-gray-900">Create Pool</div>
                  <div className="text-sm text-gray-500">Set up liquidity for trading</div>
                </button>
                
                <button
                  onClick={() => handleQuickAction('help')}
                  className="p-4 text-left border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <div className="font-medium text-gray-900">Get Help</div>
                  <div className="text-sm text-gray-500">Learn how to use the platform</div>
                </button>
              </div>
            </div>
          </div>
        ) : (
          <ChatMessageList 
            messages={currentSession?.messages || []}
            isTyping={isTyping}
          />
        )}
      </div>

      {/* Input Area */}
      <div className="border-t border-gray-200 p-4">
        <ChatInput
          value={inputValue}
          onChange={setInputValue}
          onSend={handleSendMessage}
          disabled={isTyping || !wallet.connected}
          placeholder={wallet.connected ? "Ask me anything about DeFi..." : "Connect your wallet to start chatting"}
        />
      </div>

      {/* Scroll anchor */}
      <div ref={messagesEndRef} />
    </div>
  );
}
