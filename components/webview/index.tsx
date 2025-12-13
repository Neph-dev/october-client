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
        <div className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-2 md:p-4 font-mono">
            <div className="bg-black border border-emerald-900 w-full max-w-4xl h-full max-h-[95vh] flex flex-col">
                {/* Header */}
                <Header summaryData={summaryData} title={title || summaryData?.original_title || 'Article Summary'} onClose={onClose} />

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-4 md:p-6 border-t border-emerald-900/50">
                    {isLoading && (
                        <div className="flex items-center justify-center h-full border border-emerald-900/30">
                            <div className="text-center p-8">
                                <div className="flex items-center gap-2 mb-4 justify-center">
                                    <span className="w-2 h-2 bg-emerald-500 animate-pulse"></span>
                                    <span className="w-2 h-2 bg-emerald-500 animate-pulse delay-75"></span>
                                    <span className="w-2 h-2 bg-emerald-500 animate-pulse delay-150"></span>
                                </div>
                                <p className="text-emerald-600 text-xs uppercase tracking-widest">Processing AI Summary...</p>
                            </div>
                        </div>
                    )}

                    {hasError && (
                        <div className="flex items-center justify-center h-full">
                            <div className="text-center max-w-md mx-auto border border-red-900/50 p-6">
                                <div className="text-red-500 text-4xl mb-4">⚠</div>
                                <h3 className="text-sm font-bold mb-2 text-red-400 uppercase tracking-wider">Error: Summary Failed</h3>
                                <p className="text-red-600/70 mb-6 text-xs">
                                    Unable to generate AI summary. Retry or view original source.
                                </p>
                                <div className="flex gap-2 justify-center">
                                    <button
                                        onClick={() => fetchSummary(articleId)}
                                        className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-black text-xs font-bold uppercase tracking-wide transition-colors"
                                    >
                                        [Retry]
                                    </button>
                                    {summaryData?.source_url && (
                                        <button
                                            onClick={() => window.open(summaryData.source_url, '_blank')}
                                            className="px-4 py-2 bg-black border border-emerald-900 hover:border-emerald-500 text-emerald-400 text-xs font-bold uppercase tracking-wide transition-colors"
                                        >
                                            [Source]
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}

                    {summaryData && !isLoading && !hasError && (
                        <div className="prose prose-invert max-w-none">
                            <div className="mb-6 text-emerald-100/80 text-sm leading-relaxed">
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