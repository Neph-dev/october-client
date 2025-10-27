import { NextResponse } from 'next/server';

interface TradingViewQuote {
    symbol: string;
    price: number;
    change: number;
    change_percent: number;
    volume: number;
    high: number;
    low: number;
    open: number;
    previous_close: number;
    market_status: string;
    last_update: string;
}

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const symbols = searchParams.get('symbols') || 'NYSE:LMT,NYSE:RTX';

        const tradingViewUrl = `https://scanner.tradingview.com/symbol`;

        const symbolList = symbols.split(',').map(s => s.trim());
        const quotes: TradingViewQuote[] = [];

        for (const symbol of symbolList) {
            try {
                const response = await fetch(`${tradingViewUrl}?symbol=${encodeURIComponent(symbol)}&fields=name,close,change,change_percent,volume,high,low,open,premarket_close,market_status,last_update`, {
                    method: 'GET',
                    headers: {
                        'Accept': 'application/json',
                        'Referer': 'https://www.tradingview.com/',
                    },
                });

                if (response.ok) {
                    const data = await response.json();

                    quotes.push({
                        symbol: symbol,
                        price: data.close || 0,
                        change: data.change || 0,
                        change_percent: data.change_percent || 0,
                        volume: data.volume || 0,
                        high: data.high || 0,
                        low: data.low || 0,
                        open: data.open || 0,
                        previous_close: data.premarket_close || data.close || 0,
                        market_status: data.market_status || 'closed',
                        last_update: data.last_update || new Date().toISOString(),
                    });
                }
            } catch (symbolError) {
                console.error(`Error fetching data for ${symbol}:`, symbolError);
                // Add placeholder data for failed symbols
                quotes.push({
                    symbol: symbol,
                    price: 0,
                    change: 0,
                    change_percent: 0,
                    volume: 0,
                    high: 0,
                    low: 0,
                    open: 0,
                    previous_close: 0,
                    market_status: 'error',
                    last_update: new Date().toISOString(),
                });
            }
        }

        return NextResponse.json({
            quotes,
            count: quotes.length,
            source: 'TradingView',
            last_updated: new Date().toISOString(),
        });

    } catch (error) {
        console.error('TradingView quotes API error:', error);

        return NextResponse.json(
            {
                error: 'Failed to fetch quotes from TradingView and backend',
                quotes: [],
                count: 0,
                source: 'Error',
                last_updated: new Date().toISOString(),
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