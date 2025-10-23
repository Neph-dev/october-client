
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
    return (
        <div className="flex items-center justify-between py-8 border-t border-gray-800">
            <div className="text-gray-400 text-sm">
                Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, totalItems)} of {totalItems} results
            </div>

            <div className="flex items-center space-x-2">
                <button
                    onClick={handlePrevPage}
                    disabled={currentPage <= 1 || isLoading}
                    className="px-4 py-2 text-sm font-medium text-gray-400 bg-gray-800 border border-gray-700 rounded-lg hover:bg-gray-700 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                    Previous
                </button>

                <div className="flex items-center space-x-1">
                    {Array.from({ length: Math.min(5, Math.ceil(totalItems / itemsPerPage)) }, (_, i) => {
                        const totalPages = Math.ceil(totalItems / itemsPerPage);
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
                                className={`px-3 py-2 text-sm font-medium border rounded-lg transition-colors ${pageNumber === currentPage
                                    ? 'bg-emerald-600 text-white border-emerald-600'
                                    : 'text-gray-400 bg-gray-800 border-gray-700 hover:bg-gray-700 hover:text-white'
                                    } disabled:opacity-50 disabled:cursor-not-allowed`}
                            >
                                {pageNumber}
                            </button>
                        );
                    })}
                </div>

                <button
                    onClick={handleNextPage}
                    disabled={!hasMore || isLoading}
                    className="px-4 py-2 text-sm font-medium text-gray-400 bg-gray-800 border border-gray-700 rounded-lg hover:bg-gray-700 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                    Next
                </button>
            </div>
        </div>
    );
};

export default Pagination;