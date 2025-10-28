'use client';

import React, { useState, useEffect } from 'react';

interface Quote {
    ticker: string;
    current_price: number;
    change_percent: number;
    updated_at: string;
    company_name?: string;
    volume?: number;
    change?: number;
}

interface StockQuotesProps {
    tickers: string[];
    onTickerSelect?: (ticker: string) => void;
    selectedTicker?: string;
    tickersData?: Array<{
        company_name: string;
        ticker: string;
        stock_exchange: string;
        industry: string;
        country: string;
    }>;
    useTradingView?: boolean; // Option to use TradingView data
}

const StockQuotes: React.FC<StockQuotesProps> = ({
    tickers,
    onTickerSelect,
    selectedTicker,
    tickersData = [],
    useTradingView = true,
}) => {
    const [quotes, setQuotes] = useState<Quote[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchQuotes = async () => {
            if (!tickers.length) return;

            setIsLoading(true);
            setError(null);

            try {
                let response, data;

                const symbols = tickers.map(ticker => `NYSE:${ticker}`).join(',');
                response = await fetch(`/api/market/tradingview-quotes?symbols=${encodeURIComponent(symbols)}`);
                if (!response.ok) {
                    throw new Error('Failed to fetch quotes');
                }

                data = await response.json();

                let processedQuotes;



                processedQuotes = data.quotes.map((quote: any) => {
                    const ticker = quote.symbol.replace('NYSE:', '').replace('NASDAQ:', '');
                    const tickerInfo = tickersData.find(t => t.ticker === ticker);
                    return {
                        ticker: ticker,
                        current_price: quote.price,
                        change: quote.change,
                        change_percent: quote.change_percent,
                        volume: quote.volume,
                        updated_at: quote.last_update,
                        company_name: tickerInfo?.company_name || ticker
                    };
                });

                setQuotes(processedQuotes);
            } catch (err) {
                console.error('Error fetching quotes:', err);
                setError('Failed to load market data');
            } finally {
                setIsLoading(false);
            }
        };

        fetchQuotes();

        // Refresh quotes every 30 seconds
        const interval = setInterval(fetchQuotes, 30000);
        return () => clearInterval(interval);
    }, [tickers.join(',')]);

    // Update quotes with company names when tickersData changes (for non-real-time mode)
    useEffect(() => {
        if (tickersData.length > 0 && quotes.length > 0) {
            const updatedQuotes = quotes.map((quote) => {
                const tickerInfo = tickersData.find(t => t.ticker === quote.ticker);
                return {
                    ...quote,
                    company_name: tickerInfo?.company_name || quote.company_name || quote.ticker
                };
            });
            setQuotes(updatedQuotes);
        }
    }, [tickersData.length]); // Only depend on the length to avoid object reference issues

    const formatPrice = (price: number) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
        }).format(price);
    };

    const formatPercent = (percent: number) => {
        const sign = percent >= 0 ? '+' : '';
        return `${sign}${percent.toFixed(2)}%`;
    };

    const formatVolume = (volume: number) => {
        if (volume >= 1_000_000_000) {
            return (volume / 1_000_000_000).toFixed(2) + 'B';
        } else if (volume >= 1_000_000) {
            return (volume / 1_000_000).toFixed(2) + 'M';
        } else if (volume >= 1_000) {
            return (volume / 1_000).toFixed(2) + 'K';
        } else {
            return volume.toString();
        }
    };

    if (isLoading) {
        return (
            <div className="bg-gray-900 rounded-lg p-6">
                <div className="animate-pulse">
                    <div className="flex justify-between items-center mb-4">
                        <div className="h-6 bg-gray-700 rounded w-32"></div>
                        <div className="h-4 bg-gray-700 rounded w-24"></div>
                    </div>
                    {[...Array(3)].map((_, i) => (
                        <div key={i} className="flex justify-between items-center py-3 border-b border-gray-700 last:border-b-0">
                            <div className="space-y-2">
                                <div className="h-4 bg-gray-700 rounded w-16"></div>
                                <div className="h-3 bg-gray-700 rounded w-24"></div>
                            </div>
                            <div className="text-right space-y-2">
                                <div className="h-4 bg-gray-700 rounded w-20"></div>
                                <div className="h-3 bg-gray-700 rounded w-16"></div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="bg-gray-900 rounded-lg p-6">
                <div className="text-center">
                    <div className="text-red-400 mb-2">
                        <svg className="w-8 h-8 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01" />
                        </svg>
                    </div>
                    <p className="text-white font-medium">{error}</p>
                    <p className="text-gray-400 text-sm mt-1">Please try refreshing the page</p>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-gray-900 rounded-lg p-3 flex flex-col max-h-[80vh]">
            <div className="flex justify-between items-center mb-6 flex-shrink-0">
                <h3 className="text-lg font-semibold text-white">Market Data</h3>
                <div className="flex items-center text-xs text-gray-400">
                    <div className="w-2 h-2 bg-green-400 rounded-full mr-2 animate-pulse"></div>
                    {useTradingView ? 'TradingView' : 'Live Data'}
                </div>
            </div>

            <div className="overflow-y-auto flex-1">
                {quotes.map((quote) => (
                    <div
                        key={quote.ticker}
                        onClick={() => onTickerSelect?.(quote.ticker)}
                        className={`flex justify-between m-1 items-center p-2 rounded-lg cursor-pointer transition-all hover:bg-gray-800 ${selectedTicker === quote.ticker ? 'bg-gray-800 ring-1 ring-emerald-500' : ''
                            }`}
                    >
                        <div className="flex-1">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-linear-to-r from-emerald-500 to-teal-500 rounded-full flex items-center justify-center text-white font-bold text-sm">
                                    {quote.ticker.substring(0, 2)}
                                </div>
                                <div>
                                    <div className="font-medium text-white">{quote.ticker}</div>
                                    {quote.company_name && (
                                        <div className="text-xs text-gray-400 truncate max-w-[200px]">
                                            {quote.company_name}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        <div className="text-right">
                            <div className="font-semibold text-white">
                                {formatPrice(quote.current_price)}
                            </div>
                            <div className={`text-sm font-medium ${Number(quote.change) >= 0 ? 'text-green-400' : 'text-red-400'
                                }`}>
                                {formatPercent(Number(quote.change))}
                            </div>
                            <div>
                                <div className="text-xs text-gray-400">
                                    Vol: {formatVolume(Number(quote.volume)) || 'N/A'}
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            <div className="mt-4 pt-4 border-t border-gray-700 shrink-0">
                <div className="text-xs text-gray-400">
                    Last updated: {new Date().toLocaleTimeString()}
                </div>
            </div>
        </div>
    );
};

export default StockQuotes;