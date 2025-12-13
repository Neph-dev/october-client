'use client';

import { useState, useEffect } from 'react';
import Sidebar from '../../components/sidebar';
import Tab from '../../components/tab';
import TradingViewChart from '../../components/charts/TradingViewChart';
import StockQuotes from '../../components/charts/StockQuotes';
import { useCompany } from '../../components/context/CompanyContext';
import { Ticker, TickersResponse } from '@/types';

interface MarketStatus {
    exchange: string;
    status: 'open' | 'closed' | 'pre_market' | 'after_hours';
    next_open?: string;
    next_close?: string;
    timezone: string;
    current_time: string;
}

const ChartsPage = () => {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [selectedTicker, setSelectedTicker] = useState('NYSE:LMT');
    const [availableTickers, setAvailableTickers] = useState<string[]>([]);
    const [tickersData, setTickersData] = useState<Ticker[]>([]);
    const [isLoadingTickers, setIsLoadingTickers] = useState(true);
    const [useTradingView] = useState(true);
    const [marketStatus, setMarketStatus] = useState<MarketStatus | null>(null);
    const [isLoadingMarketStatus, setIsLoadingMarketStatus] = useState(true);
    const { selectedCompany } = useCompany();

    useEffect(() => {
        const fetchTickers = async () => {
            try {
                setIsLoadingTickers(true);
                const response = await fetch('/api/market/tickers');
                if (!response.ok) {
                    throw new Error('Failed to fetch tickers');
                }

                const data: TickersResponse = await response.json();
                setTickersData(data.tickers);
                const tickers = data.tickers.map(ticker => ticker.ticker);
                setAvailableTickers(tickers);

                // Set default ticker to first available ticker
                if (tickers.length > 0) {
                    setSelectedTicker(`NYSE:${tickers[0]}`);
                }
            } catch (error) {
                console.error('Error fetching tickers:', error);
                // Fallback to default tickers if API fails
                setAvailableTickers(['LMT', 'RTX']);
                setTickersData([
                    { company_name: 'Lockheed Martin', ticker: 'LMT', stock_exchange: 'NYSE', industry: 'Defense', country: 'United States' },
                    { company_name: 'Raytheon Technologies', ticker: 'RTX', stock_exchange: 'NYSE', industry: 'Aerospace', country: 'United States' }
                ]);
            } finally {
                setIsLoadingTickers(false);
            }
        };

        const fetchMarketStatus = async () => {
            try {
                setIsLoadingMarketStatus(true);
                const response = await fetch('/api/market/status/US');
                if (!response.ok) {
                    throw new Error('Failed to fetch market status');
                }

                const data: MarketStatus = await response.json();
                setMarketStatus(data);
            } catch (error) {
                console.error('Error fetching market status:', error);
                // Fallback market status
                setMarketStatus({
                    exchange: 'US',
                    status: 'closed',
                    timezone: 'America/New_York',
                    current_time: new Date().toISOString()
                });
            } finally {
                setIsLoadingMarketStatus(false);
            }
        };

        fetchTickers();
        fetchMarketStatus();

        // Refresh market status every 60 seconds
        const statusInterval = setInterval(fetchMarketStatus, 60000);

        return () => {
            clearInterval(statusInterval);
        };
    }, []);

    const getTickerFromCompany = (companyName: string): string => {
        // Find ticker by company name from the fetched data
        const foundTicker = tickersData.find(ticker =>
            ticker.company_name.toLowerCase().includes(companyName.toLowerCase()) ||
            companyName.toLowerCase().includes(ticker.company_name.toLowerCase())
        );

        return foundTicker ? `NYSE:${foundTicker.ticker}` : (availableTickers.length > 0 ? `NYSE:${availableTickers[0]}` : 'NYSE:LMT');
    };

    useEffect(() => {
        if (selectedCompany && selectedCompany !== 'All Companies') {
            const ticker = getTickerFromCompany(selectedCompany);
            setSelectedTicker(ticker);
        }
    }, [selectedCompany]);

    const handleTickerSelect = (ticker: string) => {
        const formattedTicker = ticker.includes(':') ? ticker : `NYSE:${ticker}`;
        setSelectedTicker(formattedTicker);
    };

    const getCurrentTickerSymbol = () => {
        return selectedTicker.split(':')[1] || selectedTicker;
    };

    const getMarketStatusDisplay = () => {
        if (!marketStatus) return { text: 'Loading...', color: 'text-gray-400', dotColor: 'bg-gray-400' };

        switch (marketStatus.status) {
            case 'open':
                return {
                    text: 'Market Open',
                    color: 'text-green-400',
                    dotColor: 'bg-green-400 animate-pulse'
                };
            case 'pre_market':
                return {
                    text: 'Pre-Market',
                    color: 'text-yellow-400',
                    dotColor: 'bg-yellow-400 animate-pulse'
                };
            case 'after_hours':
                return {
                    text: 'After Hours',
                    color: 'text-blue-400',
                    dotColor: 'bg-blue-400 animate-pulse'
                };
            case 'closed':
                return {
                    text: 'Market Closed',
                    color: 'text-red-400',
                    dotColor: 'bg-red-400'
                };
            default:
                return {
                    text: 'Unknown',
                    color: 'text-gray-400',
                    dotColor: 'bg-gray-400'
                };
        }
    };

    return (
        <div className="flex h-screen bg-black text-white font-mono">
            <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

            <div className="flex-1 overflow-y-auto">
                <button
                    onClick={() => setSidebarOpen(true)}
                    className="md:hidden fixed top-4 left-4 z-30 bg-black text-emerald-500 p-2 border border-emerald-900 hover:border-emerald-500 hover:bg-emerald-500/10 transition-all"
                >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                    </svg>
                </button>

                <div className="p-4 md:p-8 pt-16 md:pt-8">
                    <div className="mb-6 md:mb-8">
                        <Tab active="Charts" />
                    </div>

                    {/* Header Section */}
                    <div className="mb-6 md:mb-8 border-b border-emerald-900/50 pb-4">
                        <div className="flex items-center gap-2 mb-2">
                            <span className="w-2 h-2 bg-emerald-500 animate-pulse"></span>
                            <span className="text-emerald-600 text-[10px] uppercase tracking-widest">Live Market Data</span>
                        </div>
                        <h2 className="text-2xl md:text-4xl font-bold uppercase tracking-wider text-emerald-100">▸ Trading Charts</h2>
                        <p className="text-emerald-600 text-xs md:text-sm mt-2 uppercase tracking-wide">
                            Defense & Aerospace Market Terminal
                        </p>
                        {selectedCompany !== 'All Companies' && (
                            <p className="text-emerald-700 text-xs mt-2 uppercase tracking-wide">
                                Filter: <span className="text-emerald-400 font-bold">[{selectedCompany}]</span>
                            </p>
                        )}
                    </div>

                    <div className="grid grid-cols-1 xl:grid-cols-4 gap-4 md:gap-8">
                        {/* Stock Quotes Sidebar */}
                        <div className="xl:col-span-1 order-2 xl:order-1">
                            {isLoadingTickers ? (
                                <div className="bg-black border border-emerald-900 p-4">
                                    <div className="flex items-center gap-2 mb-4">
                                        <span className="w-2 h-2 bg-emerald-500 animate-pulse"></span>
                                        <span className="w-2 h-2 bg-emerald-500 animate-pulse delay-75"></span>
                                        <span className="w-2 h-2 bg-emerald-500 animate-pulse delay-150"></span>
                                        <span className="text-emerald-600 text-xs uppercase tracking-widest ml-2">Loading Tickers...</span>
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
                            ) : (
                                <StockQuotes
                                    tickers={availableTickers}
                                    onTickerSelect={handleTickerSelect}
                                    selectedTicker={getCurrentTickerSymbol()}
                                    tickersData={tickersData}
                                    useTradingView={useTradingView}
                                />
                            )}
                        </div>

                        {/* Main Chart Area */}
                        <div className="xl:col-span-3 order-1 xl:order-2">
                            <div className="bg-black border border-emerald-900 w-full">
                                {/* Chart header */}
                                <div className="flex items-center justify-between px-3 py-2 bg-emerald-900/30 border-b border-emerald-900/50">
                                    <div className="flex items-center gap-3">
                                        <div className="flex items-center gap-2">
                                            <span className="w-2 h-2 bg-emerald-500 animate-pulse"></span>
                                            <span className="text-emerald-400 font-bold text-sm md:text-base uppercase">
                                                [{getCurrentTickerSymbol()}]
                                            </span>
                                        </div>
                                        <span className="text-emerald-700 text-[10px] uppercase tracking-widest hidden md:inline">
                                            TradingView Terminal
                                        </span>
                                    </div>

                                    <select
                                        value={selectedTicker}
                                        onChange={(e) => setSelectedTicker(e.target.value)}
                                        className="bg-black text-emerald-400 border border-emerald-900 px-2 py-1 text-xs focus:outline-none focus:border-emerald-500 font-mono uppercase"
                                    >
                                        {tickersData.map((tickerData) => (
                                            <option key={tickerData.ticker} value={`NYSE:${tickerData.ticker}`}>
                                                [{tickerData.ticker}] {tickerData.company_name}
                                            </option>
                                        ))}
                                        {tickersData.length === 0 && availableTickers.map((ticker) => (
                                            <option key={ticker} value={`NYSE:${ticker}`}>
                                                [{ticker}]
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div className="p-2 md:p-4">

                                    <div className="h-[400px] md:h-[600px] w-full">
                                        <TradingViewChart
                                            symbol={selectedTicker}
                                            height={600}
                                            theme="dark"
                                            container_id={`tradingview_${getCurrentTickerSymbol()}`}
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Market Summary Cards */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-2 md:gap-4 mt-4 md:mt-6">
                                <div className="bg-black border border-emerald-900">
                                    <div className="px-3 py-1 bg-emerald-900/30 border-b border-emerald-900/50">
                                        <span className="text-[10px] text-emerald-600 uppercase tracking-widest">▸ Market Status</span>
                                    </div>
                                    <div className="p-3">
                                        <div className="flex items-center justify-between">
                                            <div className="flex-1 min-w-0">
                                                {isLoadingMarketStatus ? (
                                                    <div className="flex items-center gap-2">
                                                        <span className="w-2 h-2 bg-emerald-500 animate-pulse"></span>
                                                        <span className="text-emerald-600 text-xs">Loading...</span>
                                                    </div>
                                                ) : (
                                                    <p className={`font-bold text-sm uppercase tracking-wide ${getMarketStatusDisplay().color}`}>
                                                        [{getMarketStatusDisplay().text}]
                                                    </p>
                                                )}
                                                {marketStatus && marketStatus.next_open && (
                                                    <p className="text-emerald-700 text-[10px] mt-1 truncate uppercase">
                                                        Next: {new Date(marketStatus.next_open).toLocaleDateString('en-US', {
                                                            weekday: 'short',
                                                            month: 'short',
                                                            day: 'numeric',
                                                            hour: 'numeric',
                                                            minute: '2-digit',
                                                            timeZone: 'America/New_York'
                                                        })} ET
                                                    </p>
                                                )}
                                            </div>
                                            <div className={`w-2 h-2 shrink-0 ml-2 ${isLoadingMarketStatus ? 'bg-emerald-900' : getMarketStatusDisplay().dotColor}`}></div>
                                        </div>
                                    </div>
                                </div>

                                <div className="bg-black border border-emerald-900">
                                    <div className="px-3 py-1 bg-emerald-900/30 border-b border-emerald-900/50">
                                        <span className="text-[10px] text-emerald-600 uppercase tracking-widest">▸ Exchange</span>
                                    </div>
                                    <div className="p-3">
                                        <p className="text-emerald-400 font-bold text-sm uppercase tracking-wide">
                                            [NYSE]
                                        </p>
                                        <p className="text-emerald-700 text-[10px] mt-1 uppercase">
                                            New York Stock Exchange
                                        </p>
                                    </div>
                                </div>

                                <div className="bg-black border border-emerald-900">
                                    <div className="px-3 py-1 bg-emerald-900/30 border-b border-emerald-900/50">
                                        <span className="text-[10px] text-emerald-600 uppercase tracking-widest">▸ Timezone</span>
                                    </div>
                                    <div className="p-3">
                                        <p className="text-emerald-400 font-bold text-sm uppercase tracking-wide">
                                            [Eastern Time]
                                        </p>
                                        {marketStatus && (
                                            <div className="text-emerald-700 text-[10px] mt-1 space-y-0.5 uppercase">
                                                <p className="truncate">
                                                    {new Date(marketStatus.current_time).toLocaleTimeString('en-US', {
                                                        timeZone: 'America/New_York',
                                                        hour: 'numeric',
                                                        minute: '2-digit',
                                                        second: '2-digit'
                                                    })} ET
                                                </p>
                                                <p className="truncate">
                                                    Local: {new Date(marketStatus.current_time).toLocaleString('en-US', {
                                                        hour: 'numeric',
                                                        minute: '2-digit',
                                                        second: '2-digit'
                                                    })}
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ChartsPage;