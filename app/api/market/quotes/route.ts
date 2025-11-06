import { API_URL } from '@/config/env';
import { DefaultTickers } from '@/types/tickers';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        let tickers = searchParams.get('tickers');

        // Default to defense & aerospace stocks if no tickers specified
        if (!tickers) {
            tickers = Object.values(DefaultTickers).join(',');
        }

        const response = await fetch(`${API_URL}/market/quotes?tickers=${encodeURIComponent(tickers)}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
        });

        if (!response.ok) {
            throw new Error(`Backend API error: ${response.status}`);
        }

        const data = await response.json();
        return NextResponse.json(data);
    } catch (error) {
        console.error('Market quotes API error:', error);
        return NextResponse.json(
            { error: 'Failed to fetch market quotes' },
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