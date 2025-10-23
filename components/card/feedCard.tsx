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
            className="flex gap-6 p-6 bg-gray-900 rounded-2xl hover:bg-gray-800 transition-all cursor-pointer group"
            onClick={handleClick}
        >
            <div className="text-6xl font-bold text-gray-800 self-start">{index + 1}</div>

            <div className="flex-1 flex flex-col justify-between">
                <h3 className="text-white text-md font-semibold mb-4 line-clamp-2">
                    {title}
                </h3>

                <div className="text-gray-400 text-sm font-semibold mb-4 line-clamp-2">
                    {summary}
                </div>

                <div className="space-y-3">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-linear-to-br from-emerald-400 to-teal-500 flex items-center justify-center text-white text-sm font-bold">
                            {companies[0].charAt(0)}
                        </div>
                        <div>
                            <div className="flex items-center gap-2">
                                <span className="text-white text-xs font-medium">{companies.join(', ')}</span>
                            </div>
                            <div className="text-gray-400 text-xs">
                                {new Date(processed_date).toLocaleString('en-GB', {
                                    day: '2-digit',
                                    month: '2-digit',
                                    year: 'numeric',
                                    hour: '2-digit',
                                    minute: '2-digit',
                                    hour12: false
                                }).replace(',', '')}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default FeedCard;