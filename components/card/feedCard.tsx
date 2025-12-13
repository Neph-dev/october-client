import React from 'react';

interface FeedCardProps {
    title: string;
    companies: string[];
    processed_date: string;
    index: number;
    summary: string;
    source_url?: string;
    id: string;
    onCardClick: (id: string, title: string) => void;
}

const FeedCard = ({ title, companies, processed_date, index, summary, id, onCardClick }: FeedCardProps) => {
    const handleClick = () => {
        if (onCardClick && id) {
            onCardClick(id, title);
        }
    };

    const formattedDate = new Date(processed_date).toLocaleDateString('en-US', {
        month: 'short',
        day: '2-digit',
        year: 'numeric'
    }).toUpperCase();

    const formattedTime = new Date(processed_date).toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: false
    });

    return (
        <div
            className="relative font-mono bg-black border border-emerald-900/50 hover:border-emerald-500 transition-all duration-200 cursor-pointer group overflow-hidden"
            onClick={handleClick}
        >
            {/* Top status bar */}
            <div className="flex items-center justify-between px-3 py-1.5 bg-emerald-500 text-black">
                <div className="flex items-center gap-2">
                    <span className="font-bold text-sm">{String(index + 1).padStart(3, '0')}</span>
                    <span className="text-[10px] opacity-70">▸</span>
                    <span className="text-xs font-bold uppercase tracking-wider truncate max-w-[150px] md:max-w-none">
                        {companies[0]}
                    </span>
                </div>
                <div className="flex items-center gap-2 text-[10px]">
                    <span className="opacity-70">{formattedTime}</span>
                    <span className="w-1.5 h-1.5 bg-black animate-pulse"></span>
                </div>
            </div>

            {/* Company tickers */}
            <div className="flex items-center gap-1 px-3 py-1.5 bg-emerald-900/20 border-b border-emerald-900/30">
                {companies.slice(0, 3).map((company: string, idx: number) => (
                    <span key={idx} className="px-1.5 py-0.5 text-[10px] font-bold bg-emerald-500/20 text-emerald-400 uppercase tracking-wide">
                        [{company.substring(0, 4)}]
                    </span>
                ))}
                {companies.length > 3 && (
                    <span className="text-[10px] text-emerald-600">+{companies.length - 3}</span>
                )}
            </div>

            {/* Content */}
            <div className="p-3 md:p-4">
                {/* Title */}
                <h3 className="text-emerald-100 text-sm md:text-base font-bold mb-2 line-clamp-2 group-hover:text-emerald-400 transition-colors leading-tight uppercase tracking-wide">
                    {title}
                </h3>

                {/* Summary */}
                <p className="text-emerald-100/60 text-xs md:text-sm mb-3 line-clamp-3 leading-relaxed">
                    {summary}
                </p>

                {/* Footer */}
                <div className="flex items-center justify-between pt-3 border-t border-emerald-900/30">
                    <div className="flex items-center gap-2 text-[10px] md:text-xs text-emerald-600">
                        <span>◷</span>
                        <span className="uppercase tracking-wider">{formattedDate}</span>
                    </div>

                    <div className="flex items-center gap-1 text-emerald-500 opacity-0 group-hover:opacity-100 transition-opacity text-xs">
                        <span className="uppercase tracking-wider font-bold">[Read]</span>
                        <span>→</span>
                    </div>
                </div>
            </div>

            {/* Bottom accent line */}
            <div className="h-0.5 bg-emerald-500/0 group-hover:bg-emerald-500 transition-all duration-200"></div>
        </div>
    );
};

export default FeedCard;