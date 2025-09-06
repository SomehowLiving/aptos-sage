import { NextRequest, NextResponse } from 'next/server';
import { sandboxService } from '@/lib/sandbox';

export async function POST(request: NextRequest) {
  try {
    const { code, type } = await request.json();

    if (!code || !type) {
      return NextResponse.json(
        { error: 'Code and type are required' },
        { status: 400 }
      );
    }

    // Create a temporary simulation for testing
    const simulation = await sandboxService.createSimulation(type as any, {});
    
    // Test the code
    const result = await sandboxService.testCode(simulation.id);

    return NextResponse.json({
      success: true,
      result,
      timestamp: new Date().toISOString(),
    });

  } catch (error) {
    console.error('Sandbox test error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to test code',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
