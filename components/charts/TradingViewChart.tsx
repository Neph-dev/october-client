'use client';

import React, { useEffect, useRef, useState, useMemo } from 'react';

interface TradingViewChartProps {
    symbol: string;
    width?: string | number;
    height?: string | number;
    theme?: 'light' | 'dark';
    container_id?: string;
}

const TradingViewChart: React.FC<TradingViewChartProps> = ({
    symbol = 'NYSE:LMT',
    width = '100%',
    height = 500,
    theme = 'dark',
    container_id = 'tradingview_chart'
}) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const widgetRef = useRef<any>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Generate unique container ID to avoid conflicts - memoized to prevent hydration issues
    const uniqueContainerId = useMemo(() => {
        // Create a deterministic unique ID based on symbol and container_id
        const cleanSymbol = symbol.replace(/[^a-zA-Z0-9]/g, '');
        return `${container_id}_${cleanSymbol}`;
    }, [container_id, symbol]);

    useEffect(() => {
        const initializeWidget = () => {
            if (!containerRef.current) return;
            try {
                // Clean up any existing widget first
                if (widgetRef.current) {
                    try {
                        if (widgetRef.current.remove) {
                            widgetRef.current.remove();
                        }
                    } catch (e) {
                        console.error('Error cleaning up previous widget:', e);
                    }
                    widgetRef.current = null;
                }

                // Clear any existing content
                containerRef.current.innerHTML = '';

                // Create TradingView widget
                widgetRef.current = new (window as any).TradingView.widget({
                    autosize: true,
                    symbol: symbol,
                    interval: 'D',
                    timezone: 'Etc/UTC',
                    theme: theme,
                    style: '1',
                    locale: 'en',
                    toolbar_bg: theme === 'dark' ? '#1f2937' : '#ffffff',
                    enable_publishing: false,
                    allow_symbol_change: true,
                    container_id: uniqueContainerId,
                    height: height,
                    width: width,
                    studies: [
                        'Volume@tv-basicstudies',
                        'MASimple@tv-basicstudies',
                    ],
                    disabled_features: [
                        'use_localstorage_for_settings',
                        'volume_force_overlay',
                    ],
                    enabled_features: [
                        'study_templates',
                    ],
                    charts_storage_url: 'https://saveload.tradingview.com',
                    charts_storage_api_version: '1.1',
                    client_id: 'tradingview.com',
                    user_id: 'public_user_id',
                    loading_screen: {
                        backgroundColor: theme === 'dark' ? '#1f2937' : '#ffffff',
                        foregroundColor: theme === 'dark' ? '#ffffff' : '#000000',
                    },
                    overrides: {
                        'paneProperties.background': theme === 'dark' ? '#1f2937' : '#ffffff',
                        'paneProperties.vertGridProperties.color': theme === 'dark' ? '#374151' : '#e5e7eb',
                        'paneProperties.horzGridProperties.color': theme === 'dark' ? '#374151' : '#e5e7eb',
                        'symbolWatermarkProperties.transparency': 90,
                        'scalesProperties.textColor': theme === 'dark' ? '#d1d5db' : '#374151',
                        'mainSeriesProperties.candleStyle.upColor': '#10b981',
                        'mainSeriesProperties.candleStyle.downColor': '#ef4444',
                        'mainSeriesProperties.candleStyle.borderUpColor': '#10b981',
                        'mainSeriesProperties.candleStyle.borderDownColor': '#ef4444',
                        'mainSeriesProperties.candleStyle.wickUpColor': '#10b981',
                        'mainSeriesProperties.candleStyle.wickDownColor': '#ef4444',
                    },
                    studies_overrides: {
                        'volume.volume.color.0': '#ef4444',
                        'volume.volume.color.1': '#10b981',
                        'volume.volume.transparency': 70,
                    },
                });

                setIsLoading(false);
                setError(null);
            } catch (err) {
                console.error('Error initializing TradingView widget:', err);
                setError('Failed to load chart');
                setIsLoading(false);
            }
        };

        // Load TradingView script if not already loaded
        if (!(window as any).TradingView) {
            const script = document.createElement('script');
            script.src = 'https://s3.tradingview.com/tv.js';
            script.async = true;
            script.onload = initializeWidget;
            script.onerror = () => {
                setError('Failed to load TradingView library');
                setIsLoading(false);
            };
            document.head.appendChild(script);
        } else {
            initializeWidget();
        }

        return () => {
            if (widgetRef.current) {
                try {
                    // Check if the container still exists before removing
                    if (containerRef.current && widgetRef.current.remove) {
                        widgetRef.current.remove();
                    } else if (widgetRef.current.destroy) {
                        // Alternative cleanup method
                        widgetRef.current.destroy();
                    }
                    // Clear the container content as fallback
                    if (containerRef.current) {
                        containerRef.current.innerHTML = '';
                    }
                } catch (e) {
                    console.error('Error removing TradingView widget:', e);
                    // Force clear the container if widget removal fails
                    if (containerRef.current) {
                        containerRef.current.innerHTML = '';
                    }
                }
                widgetRef.current = null;
            }
        };
    }, [symbol, theme, height, width, uniqueContainerId]);

    if (error) {
        return (
            <div className="flex items-center justify-center h-96 bg-gray-900 rounded-lg">
                <div className="text-center">
                    <div className="text-red-400 mb-2">
                        <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.232 18.5c-.77.833.192 2.5 1.732 2.5z" />
                        </svg>
                    </div>
                    <p className="text-white text-lg font-medium">{error}</p>
                    <p className="text-gray-400 text-sm mt-2">Please refresh the page to try again</p>
                </div>
            </div>
        );
    }

    return (
        <div className="relative bg-gray-900 rounded-lg overflow-hidden">
            {isLoading && (
                <div className="absolute inset-0 flex items-center justify-center bg-gray-900 z-10">
                    <div className="text-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-400 mx-auto mb-4"></div>
                        <p className="text-white">Loading chart...</p>
                    </div>
                </div>
            )}
            <div
                ref={containerRef}
                id={uniqueContainerId}
                style={{ width, height }}
                className="tradingview-widget-container"
            />
        </div>
    );
};

export default TradingViewChart;