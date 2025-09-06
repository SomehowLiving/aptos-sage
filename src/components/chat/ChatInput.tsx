'use client';

import { useState, KeyboardEvent } from 'react';
import { Button } from '@/components/ui/button';
import { Send, Mic, MicOff } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ChatInputProps {
  value: string;
  onChange: (value: string) => void;
  onSend: (message: string) => void;
  disabled?: boolean;
  placeholder?: string;
}

export function ChatInput({ 
  value, 
  onChange, 
  onSend, 
  disabled = false, 
  placeholder = "Type your message..." 
}: ChatInputProps) {
  const [isRecording, setIsRecording] = useState(false);

  const handleKeyPress = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleSend = () => {
    if (value.trim() && !disabled) {
      onSend(value.trim());
    }
  };

  const handleVoiceToggle = () => {
    // Voice input functionality would be implemented here
    setIsRecording(!isRecording);
  };

  return (
    <div className="flex items-end space-x-2">
      <div className="flex-1 relative">
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyPress={handleKeyPress}
          disabled={disabled}
          placeholder={placeholder}
          className={cn(
            "w-full px-4 py-3 pr-12 border border-gray-300 rounded-lg resize-none",
            "focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent",
            "disabled:bg-gray-50 disabled:text-gray-500 disabled:cursor-not-allowed",
            "min-h-[48px] max-h-32"
          )}
          rows={1}
          style={{
            height: 'auto',
            minHeight: '48px',
          }}
          onInput={(e) => {
            const target = e.target as HTMLTextAreaElement;
            target.style.height = 'auto';
            target.style.height = Math.min(target.scrollHeight, 128) + 'px';
          }}
        />
        
        {/* Character count */}
        {value.length > 0 && (
          <div className="absolute bottom-1 right-12 text-xs text-gray-400">
            {value.length}/1000
          </div>
        )}
      </div>

      {/* Voice input button */}
      <Button
        variant="ghost"
        size="sm"
        onClick={handleVoiceToggle}
        disabled={disabled}
        className={cn(
          "p-2",
          isRecording && "text-red-500 bg-red-50"
        )}
      >
        {isRecording ? (
          <MicOff className="w-4 h-4" />
        ) : (
          <Mic className="w-4 h-4" />
        )}
      </Button>

      {/* Send button */}
      <Button
        onClick={handleSend}
        disabled={disabled || !value.trim()}
        className="btn-animate"
      >
        <Send className="w-4 h-4" />
      </Button>
    </div>
  );
}
