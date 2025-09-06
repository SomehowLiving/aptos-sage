import { NextRequest, NextResponse } from 'next/server';
import { openRouterService } from '@/lib/openrouter';

export async function POST(request: NextRequest) {
  try {
    const { parameters } = await request.json();

    if (!parameters) {
      return NextResponse.json(
        { error: 'Token parameters are required' },
        { status: 400 }
      );
    }

    // Validate required parameters
    const requiredFields = ['name', 'symbol', 'decimals', 'totalSupply'];
    for (const field of requiredFields) {
      if (!parameters[field]) {
        return NextResponse.json(
          { error: `Missing required field: ${field}` },
          { status: 400 }
        );
      }
    }

    // Generate Move code
    const code = await openRouterService.generateTokenCode(parameters);

    return NextResponse.json({
      success: true,
      code,
      parameters,
      timestamp: new Date().toISOString(),
    });

  } catch (error) {
    console.error('Token generation error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to generate token code',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
