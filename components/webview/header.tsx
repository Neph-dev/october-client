import { formatDate } from '@/utils';

interface HeaderProps {
    title: string;
    summaryData?: {
        generated_at: string;
    } | null;
    onClose: () => void;
}

const Header = ({ title, summaryData, onClose }: HeaderProps) => {
    return (
        <div className="flex items-center justify-between p-4 border-b border-gray-700">
            <div className="flex-1 min-w-0">
                <h2 className="text-white text-lg font-semibold truncate">
                    {title}
                </h2>
                {summaryData && (
                    <p className="text-gray-400 text-sm truncate mt-1">
                        AI Summary • Generated {formatDate(summaryData.generated_at)}
                    </p>
                )}
            </div>
            <button
                onClick={onClose}
                className="ml-4 text-gray-400 hover:text-white transition-colors p-2 hover:bg-gray-800 rounded-lg"
                aria-label="Close"
            >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
            </button>
        </div>
    );
};

export default Header;