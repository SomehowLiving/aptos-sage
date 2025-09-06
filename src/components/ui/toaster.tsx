'use client';

import { useEffect, useState } from 'react';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Toast {
  id: string;
  title?: string;
  description?: string;
  type?: 'success' | 'error' | 'warning' | 'info';
  duration?: number;
}

interface ToasterProps {
  toasts?: Toast[];
  onRemove?: (id: string) => void;
}

export function Toaster({ toasts = [], onRemove }: ToasterProps) {
  const [localToasts, setLocalToasts] = useState<Toast[]>([]);

  useEffect(() => {
    if (toasts.length > 0) {
      setLocalToasts(toasts);
    }
  }, [toasts]);

  const removeToast = (id: string) => {
    setLocalToasts(prev => prev.filter(toast => toast.id !== id));
    onRemove?.(id);
  };

  const getToastStyles = (type: Toast['type'] = 'info') => {
    switch (type) {
      case 'success':
        return 'bg-green-50 border-green-200 text-green-800';
      case 'error':
        return 'bg-red-50 border-red-200 text-red-800';
      case 'warning':
        return 'bg-yellow-50 border-yellow-200 text-yellow-800';
      default:
        return 'bg-blue-50 border-blue-200 text-blue-800';
    }
  };

  const getIcon = (type: Toast['type'] = 'info') => {
    switch (type) {
      case 'success':
        return '✓';
      case 'error':
        return '✕';
      case 'warning':
        return '⚠';
      default:
        return 'ℹ';
    }
  };

  if (localToasts.length === 0) return null;

  return (
    <div className="fixed top-4 right-4 z-50 space-y-2">
      {localToasts.map((toast) => (
        <div
          key={toast.id}
          className={cn(
            'flex items-start space-x-3 p-4 rounded-lg border shadow-lg max-w-sm animate-fade-in',
            getToastStyles(toast.type)
          )}
        >
          <div className="flex-shrink-0 w-5 h-5 flex items-center justify-center rounded-full bg-current text-white text-xs font-bold">
            {getIcon(toast.type)}
          </div>
          <div className="flex-1 min-w-0">
            {toast.title && (
              <p className="text-sm font-medium">{toast.title}</p>
            )}
            {toast.description && (
              <p className="text-sm opacity-90 mt-1">{toast.description}</p>
            )}
          </div>
          <button
            onClick={() => removeToast(toast.id)}
            className="flex-shrink-0 text-current opacity-70 hover:opacity-100 transition-opacity"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      ))}
    </div>
  );
}

// Hook for managing toasts
export function useToast() {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const addToast = (toast: Omit<Toast, 'id'>) => {
    const id = Math.random().toString(36).substr(2, 9);
    const newToast = { ...toast, id };
    
    setToasts(prev => [...prev, newToast]);

    // Auto remove after duration
    const duration = toast.duration || 5000;
    setTimeout(() => {
      removeToast(id);
    }, duration);

    return id;
  };

  const removeToast = (id: string) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  };

  const success = (title: string, description?: string) => 
    addToast({ title, description, type: 'success' });
  
  const error = (title: string, description?: string) => 
    addToast({ title, description, type: 'error' });
  
  const warning = (title: string, description?: string) => 
    addToast({ title, description, type: 'warning' });
  
  const info = (title: string, description?: string) => 
    addToast({ title, description, type: 'info' });

  return {
    toasts,
    addToast,
    removeToast,
    success,
    error,
    warning,
    info,
  };
}
