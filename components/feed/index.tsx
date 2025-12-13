'use client';

import { useState, useEffect } from 'react';
import FeedCard from '../card/feedCard';
import Sidebar from '../sidebar';
import Tab from '../tab';
import WebView from '../webview';
import { useCompany } from '../context/CompanyContext';
import Pagination from '../pagination';

const FeedView = () => {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [webViewOpen, setWebViewOpen] = useState(false);
    const [currentArticleId, setCurrentArticleId] = useState('');
    const [currentTitle, setCurrentTitle] = useState('');
    const [feedData, setFeedData] = useState<any[]>([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [isLoading, setIsLoading] = useState(false);
    const [hasMore, setHasMore] = useState(true);
    const [totalItems, setTotalItems] = useState(0);
    const { selectedCompany } = useCompany();

    const itemsPerPage = 9;

    const fetchFeeds = async (page: number, company?: string) => {
        setIsLoading(true);
        try {
            const offset = (page - 1) * itemsPerPage;
            let url = `/api/news?limit=${itemsPerPage}&offset=${offset}`;

            // Add company filter if not "All Companies"
            if (company && company !== 'All Companies') {
                url += `&company=${encodeURIComponent(company)}`;
            }

            const response = await fetch(url);

            if (!response.ok) {
                throw new Error('Failed to fetch feeds');
            }

            const data = await response.json();

            if (data.articles || Array.isArray(data)) {
                const items = data.articles || data;
                const total = data.total || items.length;

                setFeedData(items);
                setTotalItems(total);
                setHasMore(offset + items.length < total);
            }
        } catch (error) {
            console.error('Error fetching feeds:', error);
            setFeedData([]);
            setTotalItems(0);
            setHasMore(false);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchFeeds(currentPage, selectedCompany);
    }, [currentPage, selectedCompany]);

    useEffect(() => {
        setCurrentPage(1);
    }, [selectedCompany]);

    const handleNextPage = () => {
        if (hasMore && !isLoading) {
            setCurrentPage(prev => prev + 1);
        }
    };

    const handlePrevPage = () => {
        if (currentPage > 1 && !isLoading) {
            setCurrentPage(prev => prev - 1);
        }
    };

    const goToPage = (page: number) => {
        if (page >= 1 && page <= Math.ceil(totalItems / itemsPerPage) && !isLoading) {
            setCurrentPage(page);
        }
    };

    const handleCardClick = (articleId: string, title: string) => {
        setCurrentArticleId(articleId);
        setCurrentTitle(title);
        setWebViewOpen(true);
    };

    const closeWebView = () => {
        setWebViewOpen(false);
        setCurrentArticleId('');
        setCurrentTitle('');
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
                        <Tab active="News Feed" />
                    </div>

                    {/* Header Section */}
                    <div className="mb-6 md:mb-8 border-b border-emerald-900/50 pb-4">
                        <div className="flex items-center gap-2 mb-2">
                            <span className="w-2 h-2 bg-emerald-500 animate-pulse"></span>
                            <span className="text-emerald-600 text-[10px] uppercase tracking-widest">Live Feed</span>
                        </div>
                        <h2 className="text-2xl md:text-4xl font-bold uppercase tracking-wider text-emerald-100">▸ News Feed</h2>

                        {selectedCompany !== 'All Companies' && (
                            <p className="text-emerald-600 text-sm mt-2 uppercase tracking-wide">
                                Filter: <span className="text-emerald-400 font-bold">[{selectedCompany}]</span>
                            </p>
                        )}
                    </div>

                    {isLoading ? (
                        <div className="flex items-center justify-center py-12 border border-emerald-900/50">
                            <div className="text-center">
                                <div className="flex items-center gap-2 mb-4 justify-center">
                                    <span className="w-2 h-2 bg-emerald-500 animate-pulse"></span>
                                    <span className="w-2 h-2 bg-emerald-500 animate-pulse delay-75"></span>
                                    <span className="w-2 h-2 bg-emerald-500 animate-pulse delay-150"></span>
                                </div>
                                <p className="text-emerald-600 text-xs uppercase tracking-widest">Loading Data...</p>
                            </div>
                        </div>
                    ) : (
                        <>
                            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-2 gap-6 w-full mb-8">
                                {feedData.map((feed, index) =>
                                    <FeedCard
                                        key={feed._id || index}
                                        {...feed}
                                        index={((currentPage - 1) * itemsPerPage) + index}
                                        onCardClick={handleCardClick}
                                    />
                                )}
                            </div>

                            {totalItems > 0 &&
                                <Pagination
                                    currentPage={currentPage}
                                    totalItems={totalItems}
                                    itemsPerPage={itemsPerPage}
                                    isLoading={isLoading}
                                    hasMore={hasMore}
                                    goToPage={goToPage}
                                    handlePrevPage={handlePrevPage}
                                    handleNextPage={handleNextPage}
                                />}
                        </>
                    )}
                </div>
            </div>

            <WebView
                articleId={currentArticleId}
                isOpen={webViewOpen}
                onClose={closeWebView}
                title={currentTitle}
            />
        </div>
    );
};

export default FeedView;