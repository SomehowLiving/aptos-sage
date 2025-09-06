import { NextRequest, NextResponse } from 'next/server';
import { openRouterService } from '@/lib/openrouter';

export async function POST(request: NextRequest) {
  try {
    const { parameters } = await request.json();

    if (!parameters) {
      return NextResponse.json(
        { error: 'Pool parameters are required' },
        { status: 400 }
      );
    }

    // Validate required parameters
    const requiredFields = ['name', 'tokenA', 'tokenB', 'fee', 'initialLiquidityA', 'initialLiquidityB'];
    for (const field of requiredFields) {
      if (!parameters[field]) {
        return NextResponse.json(
          { error: `Missing required field: ${field}` },
          { status: 400 }
        );
      }
    }

    // Generate Move code
    const code = await openRouterService.generatePoolCode(parameters);

    return NextResponse.json({
      success: true,
      code,
      parameters,
      timestamp: new Date().toISOString(),
    });

  } catch (error) {
    console.error('Pool generation error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to generate pool code',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
