import { NextResponse } from 'next/server';

export async function GET() {
    try {
        const response = await fetch('http://localhost:8080/market/tickers', {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
            // Add cache control to prevent stale data
            cache: 'no-cache',
        });

        if (!response.ok) {
            throw new Error(`Backend API error: ${response.status}`);
        }

        const data = await response.json();
        return NextResponse.json(data);
    } catch (error) {
        console.error('Market tickers API error:', error);
        return NextResponse.json(
            {
                error: 'Failed to fetch market tickers',
                tickers: [],
                count: 0,
                last_updated: new Date().toISOString()
            },
            { status: 500 }
        );
    }
}

export async function OPTIONS() {
    return new NextResponse(null, {
        status: 200,
        headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type',
        },
    });
}