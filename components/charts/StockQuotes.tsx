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
            <div className="font-mono bg-black border border-emerald-900">
                <div className="flex items-center justify-between px-3 py-2 bg-emerald-900/30 border-b border-emerald-900/50">
                    <div className="flex items-center gap-2">
                        <span className="text-[10px] text-emerald-600 uppercase tracking-widest">▸ Stock Quotes</span>
                    </div>
                </div>
                <div className="p-4">
                    <div className="flex items-center gap-2 mb-4">
                        <span className="w-2 h-2 bg-emerald-500 animate-pulse"></span>
                        <span className="w-2 h-2 bg-emerald-500 animate-pulse delay-75"></span>
                        <span className="w-2 h-2 bg-emerald-500 animate-pulse delay-150"></span>
                        <span className="text-emerald-600 text-xs uppercase tracking-widest ml-2">Loading Market Data...</span>
                    </div>
                    {[...Array(3)].map((_, i) => (
                        <div key={i} className="flex justify-between items-center py-2 border-b border-emerald-900/30 last:border-b-0">
                            <div className="space-y-1">
                                <div className="h-3 bg-emerald-900/50 w-16"></div>
                                <div className="h-2 bg-emerald-900/30 w-24"></div>
                            </div>
                            <div className="text-right space-y-1">
                                <div className="h-3 bg-emerald-900/50 w-16"></div>
                                <div className="h-2 bg-emerald-900/30 w-12"></div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="font-mono bg-black border border-red-900">
                <div className="flex items-center justify-between px-3 py-2 bg-red-900/30 border-b border-red-900/50">
                    <div className="flex items-center gap-2">
                        <span className="text-[10px] text-red-500 uppercase tracking-widest">⚠ Error</span>
                    </div>
                </div>
                <div className="p-4 text-center">
                    <p className="text-red-400 font-bold text-sm uppercase tracking-wide">[{error}]</p>
                    <p className="text-red-700 text-xs mt-2 uppercase">Refresh to retry</p>
                </div>
            </div>
        );
    }

    return (
        <div className="font-mono bg-black border border-emerald-900 flex flex-col max-h-[80vh]">
            {/* Header */}
            <div className="flex items-center justify-between px-3 py-2 bg-emerald-900/30 border-b border-emerald-900/50 shrink-0">
                <div className="flex items-center gap-2">
                    <span className="text-[10px] text-emerald-600 uppercase tracking-widest">▸ Market Data</span>
                </div>
                <div className="flex items-center gap-1 text-[10px] text-emerald-500">
                    <span className="w-1.5 h-1.5 bg-emerald-500 animate-pulse"></span>
                    <span className="uppercase">{useTradingView ? 'Trading View' : 'Live'}</span>
                </div>
            </div>

            {/* Quotes list */}
            <div className="overflow-y-auto flex-1">
                {quotes.map((quote, index) => (
                    <div
                        key={quote.ticker}
                        onClick={() => onTickerSelect?.(quote.ticker)}
                        className={`flex justify-between items-center px-3 py-2 cursor-pointer transition-all border-b border-emerald-900/30 last:border-b-0 ${selectedTicker === quote.ticker
                            ? 'bg-emerald-500 text-black'
                            : 'hover:bg-emerald-500/10 hover:border-l-2 hover:border-l-emerald-500'
                            }`}
                    >
                        <div className="flex-1">
                            <div className="flex items-center gap-2">
                                <span className={`text-xs font-bold ${selectedTicker === quote.ticker ? 'text-black' : 'text-emerald-400'}`}>
                                    [{quote.ticker}]
                                </span>
                                <span className={`text-[10px] ${selectedTicker === quote.ticker ? 'text-black/70' : 'text-emerald-700'}`}>
                                    {String(index + 1).padStart(2, '0')}
                                </span>
                            </div>
                            {quote.company_name && (
                                <div className={`text-[10px] truncate max-w-[140px] ${selectedTicker === quote.ticker ? 'text-black/70' : 'text-emerald-600'}`}>
                                    {quote.company_name}
                                </div>
                            )}
                        </div>

                        <div className="text-right">
                            <div className={`font-bold text-sm ${selectedTicker === quote.ticker ? 'text-black' : 'text-emerald-100'}`}>
                                {formatPrice(quote.current_price)}
                            </div>
                            <div className={`text-[10px] font-bold ${selectedTicker === quote.ticker
                                ? (Number(quote.change) >= 0 ? 'text-black/80' : 'text-red-900')
                                : (Number(quote.change) >= 0 ? 'text-green-400' : 'text-red-400')
                                }`}>
                                {formatPercent(Number(quote.change))}
                            </div>
                            <div className={`text-[10px] ${selectedTicker === quote.ticker ? 'text-black/60' : 'text-emerald-700'}`}>
                                Vol: {formatVolume(Number(quote.volume)) || 'N/A'}
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Footer */}
            <div className="px-3 py-2 border-t border-emerald-900/50 bg-emerald-900/20 shrink-0">
                <div className="flex items-center justify-between text-[10px] text-emerald-700">
                    <span className="uppercase tracking-wide">{quotes.length} Symbols</span>
                    <span className="uppercase tracking-wide">Updated: {new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}</span>
                </div>
            </div>
        </div>
    );
};

export default StockQuotes;