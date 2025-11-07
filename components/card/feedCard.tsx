import React from 'react';

interface FeedCardProps {
    number: number;
    title: string;
    author: string;
    timeAgo: string;
    onCardClick?: (articleId: string, title: string) => void;
}

const FeedCard = ({ title, companies, processed_date, index, summary, source_url, id, onCardClick }: any) => {
    const handleClick = () => {
        if (onCardClick && id) {
            onCardClick(id, title);
        }
    };

    return (
        <div
            className="relative flex flex-col p-5 md:p-6 bg-linear-to-br from-gray-900 to-gray-950 rounded-xl border border-gray-800 hover:border-emerald-500/50 transition-all duration-300 cursor-pointer group overflow-hidden"
            onClick={handleClick}
        >
            <div className="absolute inset-0 bg-linear-to-br from-emerald-500/0 to-teal-500/0 group-hover:from-emerald-500/5 group-hover:to-teal-500/5 transition-all duration-300 pointer-events-none" />

            <div className="relative flex flex-col h-full">
                <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl bg-linear-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-white text-lg md:text-xl font-bold shadow-lg shadow-emerald-500/20 group-hover:shadow-emerald-500/40 transition-shadow">
                            {index + 1}
                        </div>
                        <div className="flex flex-wrap gap-1.5">
                            {companies.slice(0, 2).map((company: string, idx: number) => (
                                <span key={idx} className="px-2.5 py-1 text-[10px] md:text-xs font-medium bg-emerald-500/10 text-emerald-400 rounded-full border border-emerald-500/20">
                                    {company}
                                </span>
                            ))}
                            {companies.length > 2 && (
                                <span className="px-2.5 py-1 text-[10px] md:text-xs font-medium bg-gray-800 text-gray-400 rounded-full border border-gray-700">
                                    +{companies.length - 2}
                                </span>
                            )}
                        </div>
                    </div>
                </div>

                <h3 className="text-white text-base md:text-lg font-semibold mb-3 line-clamp-2 group-hover:text-emerald-400 transition-colors leading-tight">
                    {title}
                </h3>

                <p className="text-gray-400 text-sm md:text-sm mb-4 line-clamp-3 flex-1 leading-relaxed">
                    {summary}
                </p>

                <div className="flex items-center justify-between pt-4 border-t border-gray-800 mt-auto">
                    <div className="flex items-center gap-2">
                        <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <span className="text-gray-500 text-xs md:text-sm">
                            {new Date(processed_date).toLocaleDateString('en-US', {
                                month: 'short',
                                day: 'numeric',
                                year: 'numeric'
                            })}
                        </span>
                    </div>

                    <div className="flex items-center gap-1.5 text-emerald-400 opacity-0 group-hover:opacity-100 transition-opacity">
                        <span className="text-xs md:text-sm font-medium">Read more</span>
                        <svg className="w-4 h-4 transform group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default FeedCard;