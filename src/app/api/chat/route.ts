import { NextRequest, NextResponse } from 'next/server';
import { openRouterService } from '@/lib/openrouter';

export async function POST(request: NextRequest) {
  try {
    const { message, conversationHistory } = await request.json();

    if (!message) {
      return NextResponse.json(
        { error: 'Message is required' },
        { status: 400 }
      );
    }

    // Get AI response
    const response = await openRouterService.chatWithAssistant(
      message,
      conversationHistory || []
    );

    return NextResponse.json({
      success: true,
      response,
      timestamp: new Date().toISOString(),
    });

  } catch (error) {
    console.error('Chat API error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to process chat message',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
