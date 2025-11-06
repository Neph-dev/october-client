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
        <div className="flex h-screen bg-black text-white">
            <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

            <div className="flex-1 overflow-y-auto">
                <button
                    onClick={() => setSidebarOpen(true)}
                    className="md:hidden fixed top-4 left-4 z-30 bg-gray-900 text-white p-2 rounded-lg hover:bg-gray-800"
                >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                    </svg>
                </button>

                <div className="p-8 pt-16 md:pt-8">
                    <div className="mb-12">
                        <Tab active="Charts" />
                    </div>

                    <div className="mb-8">
                        <div className="flex justify-between items-start mb-4">
                            <div>
                                <h2 className="text-5xl font-bold mb-2">Trading Charts</h2>
                                <p className="text-gray-400 text-lg">
                                    Real-time market data and advanced charting for defense & aerospace stocks
                                </p>
                                {selectedCompany !== 'All Companies' && (
                                    <p className="text-gray-400 text-sm mt-2">
                                        Currently viewing: <span className="text-emerald-400 font-medium">{selectedCompany}</span>
                                    </p>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 xl:grid-cols-4 gap-8">
                        {/* Stock Quotes Sidebar */}
                        <div className="xl:col-span-1">
                            {isLoadingTickers ? (
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
                        <div className="xl:col-span-3">
                            <div className="md:bg-gray-900 bg-transparent rounded-lg  md:p-6 p-0 w-full">
                                <div className="md:flex justify-between items-center mb-6">
                                    <div>
                                        <h3 className="text-xl font-semibold text-white">
                                            {getCurrentTickerSymbol()} Chart
                                        </h3>
                                        <p className="text-gray-400 text-sm">
                                            Advanced charting powered by TradingView
                                        </p>
                                    </div>

                                    <div className="flex items-center space-x-2">
                                        <select
                                            value={selectedTicker}
                                            onChange={(e) => setSelectedTicker(e.target.value)}
                                            className="bg-gray-800 text-white border border-gray-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                                        >
                                            {tickersData.map((tickerData) => (
                                                <option key={tickerData.ticker} value={`NYSE:${tickerData.ticker}`}>
                                                    {tickerData.ticker} - {tickerData.company_name}
                                                </option>
                                            ))}
                                            {/* Fallback if tickersData is empty but availableTickers has data */}
                                            {tickersData.length === 0 && availableTickers.map((ticker) => (
                                                <option key={ticker} value={`NYSE:${ticker}`}>
                                                    {ticker}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                </div>

                                <div className="h-[600px] w-full">
                                    <TradingViewChart
                                        symbol={selectedTicker}
                                        height={600}
                                        theme="dark"
                                        container_id={`tradingview_${getCurrentTickerSymbol()}`}
                                    />
                                </div>
                            </div>

                            {/* Market Summary Cards */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
                                <div className="bg-gray-900 rounded-lg p-6">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-gray-400 text-sm">Market Status</p>
                                            {isLoadingMarketStatus ? (
                                                <div className="animate-pulse">
                                                    <div className="h-5 bg-gray-700 rounded w-24 mt-1"></div>
                                                </div>
                                            ) : (
                                                <p className={`font-semibold ${getMarketStatusDisplay().color}`}>
                                                    {getMarketStatusDisplay().text}
                                                </p>
                                            )}
                                            {marketStatus && marketStatus.next_open && (
                                                <p className="text-gray-500 text-xs mt-1">
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
                                        <div className={`w-3 h-3 rounded-full ${isLoadingMarketStatus ? 'bg-gray-400' : getMarketStatusDisplay().dotColor}`}></div>
                                    </div>
                                </div>

                                <div className="bg-gray-900 rounded-lg p-6">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-gray-400 text-sm">Exchange</p>
                                            <p className="text-white font-semibold">
                                                NYSE
                                            </p>
                                            <p className="text-gray-500 text-xs mt-1">
                                                New York Stock Exchange
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                <div className="bg-gray-900 rounded-lg p-6">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-gray-400 text-sm">Timezone</p>
                                            <p className="text-white font-semibold">
                                                Eastern Time
                                            </p>
                                            {marketStatus && (
                                                <div className="text-gray-500 text-xs mt-1 space-y-1">
                                                    <p>
                                                        {new Date(marketStatus.current_time).toLocaleTimeString('en-US', {
                                                            timeZone: 'America/New_York',
                                                            hour: 'numeric',
                                                            minute: '2-digit',
                                                            second: '2-digit'
                                                        })} ET
                                                    </p>
                                                    <p>
                                                        Local time: {new Date(marketStatus.current_time).toLocaleString('en-US', {
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
        </div>
    );
};

export default ChartsPage;