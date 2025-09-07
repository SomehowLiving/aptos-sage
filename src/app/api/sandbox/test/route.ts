import { NextRequest, NextResponse } from 'next/server';
import { sandboxService } from '@/lib/sandbox';

// Adjust types depending on what your sandboxService expects
type SimulationType = 'token' | 'pool' | 'vault';

export async function POST(request: NextRequest) {
  try {
    const { code, type } = await request.json();

    if (!code || !type) {
      return NextResponse.json(
        { error: 'Code and type are required' },
        { status: 400 }
      );
    }

    // Prepare default params based on type
    let params: any = {};
    switch (type as SimulationType) {
      case 'token':
        params = {
          name: 'Test Token',
          symbol: 'TST',
          decimals: 6,
          supply: 1_000_000,
        };
        break;

      case 'pool':
        params = {
          assetA: 'APT',
          assetB: 'USDC',
          fee: 0.003,
        };
        break;

      case 'vault':
        params = {
          strategy: 'default',
          depositAsset: 'APT',
        };
        break;

      default:
        return NextResponse.json(
          { error: `Unsupported simulation type: ${type}` },
          { status: 400 }
        );
    }

    // Create a temporary simulation for testing
    const simulation = await sandboxService.createSimulation(type as SimulationType, params);

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
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
