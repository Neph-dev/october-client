'use client';

import { useState, useEffect } from 'react';
import Footer from './Footer';
import Header from './header';
import { formatSummary } from '@/utils/formatSummary';

interface WebViewProps {
    articleId: string;
    isOpen: boolean;
    onClose: () => void;
    title?: string;
}

interface SummaryData {
    article_id: string;
    original_title: string;
    summary: string;
    source_url: string;
    processing_time: number;
    generated_at: string;
}

const WebView = ({ articleId, isOpen, onClose, title }: WebViewProps) => {
    const [isLoading, setIsLoading] = useState(false);
    const [hasError, setHasError] = useState(false);
    const [summaryData, setSummaryData] = useState<SummaryData | null>(null);
    const [summaryCache, setSummaryCache] = useState<Record<string, SummaryData>>({});

    // Fetch AI summary when component opens with an article ID
    useEffect(() => {
        if (isOpen && articleId) {
            // Check if summary is already cached
            if (summaryCache[articleId]) {
                setSummaryData(summaryCache[articleId]);
                setHasError(false);
            } else {
                fetchSummary(articleId);
            }
        }
    }, [articleId, isOpen, summaryCache]);

    const fetchSummary = async (id: string) => {
        // Check if already cached
        if (summaryCache[id]) {
            setSummaryData(summaryCache[id]);
            setHasError(false);
            return;
        }

        setIsLoading(true);
        setHasError(false);
        setSummaryData(null);

        try {
            const response = await fetch(`/api/ai/summarise/${id}`);

            if (!response.ok) {
                throw new Error('Failed to fetch article summary');
            }

            const data = await response.json();
            setSummaryData(data);

            // Cache the summary
            setSummaryCache(prev => ({
                ...prev,
                [id]: data
            }));
        } catch (error) {
            console.error('Error fetching AI summary:', error);
            setHasError(true);
        } finally {
            setIsLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
            <div className="bg-gray-900 rounded-lg w-full max-w-4xl h-full max-h-[90vh] flex flex-col">
                {/* Header */}
                <Header summaryData={summaryData} title={title || summaryData?.original_title || 'Article Summary'} onClose={onClose} />

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-6">
                    {isLoading && (
                        <div className="flex items-center justify-center h-full">
                            <div className="text-center">
                                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-400 mx-auto mb-4"></div>
                                <p className="text-gray-400">Generating AI summary...</p>
                            </div>
                        </div>
                    )}

                    {hasError && (
                        <div className="flex items-center justify-center h-full">
                            <div className="text-center max-w-md mx-auto">
                                <div className="w-16 h-16 mx-auto mb-4 text-red-400">
                                    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.232 18.5c-.77.833.192 2.5 1.732 2.5z" />
                                    </svg>
                                </div>
                                <h3 className="text-lg font-semibold mb-2 text-white">Unable to Generate Summary</h3>
                                <p className="text-gray-400 mb-6 text-sm">
                                    Failed to generate AI summary for this article. Please try again later.
                                </p>
                                <button
                                    onClick={() => fetchSummary(articleId)}
                                    className="px-6 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg transition-colors font-medium mr-3"
                                >
                                    Retry
                                </button>
                                {summaryData?.source_url && (
                                    <button
                                        onClick={() => window.open(summaryData.source_url, '_blank')}
                                        className="px-6 py-2 bg-gray-600 hover:bg-gray-500 text-white rounded-lg transition-colors font-medium"
                                    >
                                        Read Original
                                    </button>
                                )}
                            </div>
                        </div>
                    )}

                    {summaryData && !isLoading && !hasError && (
                        <div className="prose prose-invert max-w-none">
                            <div className="mb-6">
                                {formatSummary(summaryData.summary)}
                            </div>
                        </div>
                    )}
                </div>

                {summaryData && <Footer summaryData={summaryData} onClose={onClose} />}
            </div>
        </div>
    );
};

export default WebView;