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

            // Use the Next.js API route instead of direct backend call
            const response = await fetch(url);

            if (!response.ok) {
                throw new Error('Failed to fetch feeds');
            }

            const data = await response.json();

            // Assuming the API returns { items: [], total: number }
            // Adjust this based on your actual API response structure
            if (data.articles || Array.isArray(data)) {
                const items = data.articles || data;
                const total = data.total || items.length;

                setFeedData(items);
                setTotalItems(total);
                setHasMore(offset + items.length < total);
            }
        } catch (error) {
            console.error('Error fetching feeds:', error);
            // Fallback behavior on error
            setFeedData([]);
            setTotalItems(0);
            setHasMore(false);
        } finally {
            setIsLoading(false);
        }
    };

    // Load feeds when component mounts or page changes
    useEffect(() => {
        fetchFeeds(currentPage, selectedCompany);
    }, [currentPage, selectedCompany]);

    // Reset to page 1 when company changes
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
                        <Tab />
                    </div>

                    <div className="mb-8">
                        <h2 className="text-5xl font-bold mb-2">Feeds</h2>
                        {selectedCompany !== 'All Companies' && (
                            <p className="text-gray-400 text-lg">
                                Showing feeds for: <span className="text-emerald-400 font-medium">{selectedCompany}</span>
                            </p>
                        )}
                    </div>

                    {isLoading ? (
                        <div className="flex items-center justify-center py-12">
                            <div className="text-center">
                                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-400 mx-auto mb-4"></div>
                                <p className="text-gray-400">Loading feeds...</p>
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