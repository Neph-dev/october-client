/**
 * TradingView Quote Fetcher
 * Uses TradingView's public endpoints for stock quotes
 */

interface TradingViewQuoteResponse {
    symbol: string;
    price: number;
    change: number;
    change_percent: number;
    volume: number;
    market_cap?: number;
    pe_ratio?: number;
    high_52w?: number;
    low_52w?: number;
    last_update: string;
}

/**
 * Fetch quotes directly from TradingView
 */
export async function fetchTradingViewQuotes(symbols: string[]): Promise<TradingViewQuoteResponse[]> {
    const quotes: TradingViewQuoteResponse[] = [];

    try {
        // TradingView Scanner API endpoint
        const scannerUrl = 'https://scanner.tradingview.com/america/scan';

        const requestBody = {
            filter: [
                {
                    left: 'name',
                    operation: 'in_range',
                    right: symbols
                }
            ],
            columns: [
                'name',
                'close',
                'change',
                'change_percent',
                'volume',
                'market_cap_basic',
                'price_earnings_ttm',
                'high_52_week',
                'low_52_week',
                'last_update'
            ],
            sort: {
                sortBy: 'name',
                sortOrder: 'asc'
            },
            range: [0, symbols.length]
        };

        const response = await fetch(scannerUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
                'Accept': 'application/json',
                'Origin': 'https://www.tradingview.com',
                'Referer': 'https://www.tradingview.com/',
            },
            body: JSON.stringify(requestBody),
        });

        if (response.ok) {
            const data = await response.json();

            if (data.data && Array.isArray(data.data)) {
                for (const item of data.data) {
                    const [
                        symbol,
                        price,
                        change,
                        change_percent,
                        volume,
                        market_cap,
                        pe_ratio,
                        high_52w,
                        low_52w,
                        last_update
                    ] = item.d;

                    quotes.push({
                        symbol: symbol || '',
                        price: price || 0,
                        change: change || 0,
                        change_percent: change_percent || 0,
                        volume: volume || 0,
                        market_cap: market_cap || undefined,
                        pe_ratio: pe_ratio || undefined,
                        high_52w: high_52w || undefined,
                        low_52w: low_52w || undefined,
                        last_update: last_update || new Date().toISOString(),
                    });
                }
            }
        }

        return quotes;
    } catch (error) {
        console.error('Error fetching TradingView quotes:', error);
        return [];
    }
}

/**
 * Alternative method using TradingView's symbol info API
 */
export async function fetchTradingViewSymbolInfo(symbol: string): Promise<TradingViewQuoteResponse | null> {
    try {
        const symbolUrl = `https://symbol-search.tradingview.com/symbol_search/?text=${encodeURIComponent(symbol)}&hl=1&exchange=&lang=en&search_type=stocks&domain=production`;

        const response = await fetch(symbolUrl, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
                'Accept': 'application/json',
                'Referer': 'https://www.tradingview.com/',
            },
        });

        if (response.ok) {
            const data = await response.json();

            if (data.symbols && data.symbols.length > 0) {
                const symbolInfo = data.symbols[0];

                // Get detailed quote data
                const quoteUrl = `https://scanner.tradingview.com/symbol?symbol=${encodeURIComponent(symbolInfo.symbol)}&fields=name,close,change,change_percent,volume,market_cap_basic,price_earnings_ttm,high_52_week,low_52_week`;

                const quoteResponse = await fetch(quoteUrl, {
                    headers: {
                        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
                        'Accept': 'application/json',
                        'Referer': 'https://www.tradingview.com/',
                    },
                });

                if (quoteResponse.ok) {
                    const quoteData = await quoteResponse.json();

                    return {
                        symbol: symbolInfo.symbol,
                        price: quoteData.close || 0,
                        change: quoteData.change || 0,
                        change_percent: quoteData.change_percent || 0,
                        volume: quoteData.volume || 0,
                        market_cap: quoteData.market_cap_basic || undefined,
                        pe_ratio: quoteData.price_earnings_ttm || undefined,
                        high_52w: quoteData.high_52_week || undefined,
                        low_52w: quoteData.low_52_week || undefined,
                        last_update: new Date().toISOString(),
                    };
                }
            }
        }

        return null;
    } catch (error) {
        console.error(`Error fetching TradingView symbol info for ${symbol}:`, error);
        return null;
    }
}

/**
 * Batch fetch quotes for multiple symbols
 */
export async function batchFetchTradingViewQuotes(symbols: string[]): Promise<TradingViewQuoteResponse[]> {
    const batchSize = 5; // Process in batches to avoid rate limiting
    const results: TradingViewQuoteResponse[] = [];

    for (let i = 0; i < symbols.length; i += batchSize) {
        const batch = symbols.slice(i, i + batchSize);
        const batchPromises = batch.map(symbol => fetchTradingViewSymbolInfo(symbol));

        const batchResults = await Promise.allSettled(batchPromises);

        for (const result of batchResults) {
            if (result.status === 'fulfilled' && result.value) {
                results.push(result.value);
            }
        }

        // Add delay between batches to respect rate limits
        if (i + batchSize < symbols.length) {
            await new Promise(resolve => setTimeout(resolve, 1000));
        }
    }

    return results;
}

export type { TradingViewQuoteResponse };