
interface PaginationProps {
    currentPage: number;
    totalItems: number;
    itemsPerPage: number;
    isLoading: boolean;
    hasMore: boolean;
    goToPage: (pageNumber: number) => void;
    handlePrevPage: () => void;
    handleNextPage: () => void;
}

const Pagination = ({
    currentPage,
    totalItems,
    itemsPerPage,
    isLoading,
    hasMore,
    goToPage,
    handlePrevPage,
    handleNextPage
}: PaginationProps) => {
    const totalPages = Math.ceil(totalItems / itemsPerPage);

    return (
        <div className="font-mono border border-emerald-900/50 bg-black">
            {/* Header */}
            <div className="flex items-center justify-between px-3 py-1.5 bg-emerald-900/30 border-b border-emerald-900/50">
                <div className="flex items-center gap-2 text-[10px] text-emerald-600">
                    <span>▸</span>
                    <span className="uppercase tracking-widest">Pagination</span>
                </div>
                <div className="flex items-center gap-1 text-[10px] text-emerald-500">
                    <span className="w-1.5 h-1.5 bg-emerald-500 animate-pulse"></span>
                    <span>PAGE {currentPage}/{totalPages}</span>
                </div>
            </div>

            {/* Content */}
            <div className="flex flex-col md:flex-row items-center justify-between p-3 gap-3">
                <div className="text-emerald-600 text-[10px] md:text-xs text-center md:text-left uppercase tracking-wide">
                    Showing {((currentPage - 1) * itemsPerPage) + 1}-{Math.min(currentPage * itemsPerPage, totalItems)} of {totalItems}
                </div>

                <div className="flex items-center gap-1">
                    <button
                        onClick={handlePrevPage}
                        disabled={currentPage <= 1 || isLoading}
                        className="px-2 md:px-3 py-1.5 text-[10px] md:text-xs font-bold text-emerald-400 bg-black border border-emerald-900 hover:border-emerald-500 hover:bg-emerald-500/10 disabled:opacity-30 disabled:cursor-not-allowed transition-all uppercase tracking-wide"
                    >
                        [←Prev]
                    </button>

                    <div className="flex items-center gap-0.5">
                        {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                            let pageNumber;

                            if (totalPages <= 5) {
                                pageNumber = i + 1;
                            } else if (currentPage <= 3) {
                                pageNumber = i + 1;
                            } else if (currentPage >= totalPages - 2) {
                                pageNumber = totalPages - 4 + i;
                            } else {
                                pageNumber = currentPage - 2 + i;
                            }

                            return (
                                <button
                                    key={pageNumber}
                                    onClick={() => goToPage(pageNumber)}
                                    disabled={isLoading}
                                    className={`w-7 h-7 md:w-8 md:h-8 text-[10px] md:text-xs font-bold transition-all flex items-center justify-center ${pageNumber === currentPage
                                        ? 'bg-emerald-500 text-black border border-emerald-400'
                                        : 'text-emerald-400 bg-black border border-emerald-900 hover:border-emerald-500 hover:bg-emerald-500/10'
                                        } disabled:opacity-30 disabled:cursor-not-allowed`}
                                >
                                    {String(pageNumber).padStart(2, '0')}
                                </button>
                            );
                        })}
                    </div>

                    <button
                        onClick={handleNextPage}
                        disabled={!hasMore || isLoading}
                        className="px-2 md:px-3 py-1.5 text-[10px] md:text-xs font-bold text-emerald-400 bg-black border border-emerald-900 hover:border-emerald-500 hover:bg-emerald-500/10 disabled:opacity-30 disabled:cursor-not-allowed transition-all uppercase tracking-wide"
                    >
                        [Next→]
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Pagination;