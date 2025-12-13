import { formatProcessingTime } from '@/utils';
import React from 'react';

interface FooterProps {
    summaryData: {
        processing_time: number;
        article_id: string;
        source_url: string;
    };
    onClose: () => void;
}

const Footer = ({
    summaryData,
    onClose,
}: FooterProps) => {
    return (
        <div className="font-mono border-t border-emerald-900/50 bg-emerald-900/20">
            {/* Status bar */}
            <div className="flex items-center justify-between px-3 py-1 border-b border-emerald-900/30 text-[10px] text-emerald-700">
                <span className="uppercase tracking-widest">▸ Article Metadata</span>
                <span className="flex items-center gap-1">
                    <span className="w-1.5 h-1.5 bg-emerald-500 animate-pulse"></span>
                    Ready
                </span>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-3">
                <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 text-[10px] md:text-xs text-emerald-600">
                    <span className="uppercase tracking-wide">Time: {formatProcessingTime(summaryData.processing_time)}</span>
                    <span className="hidden sm:inline text-emerald-800">|</span>
                    <span className="uppercase tracking-wide">ID: [{summaryData.article_id.substring(0, 8)}...]</span>
                </div>

                <div className="flex items-center gap-2">
                    <button
                        onClick={() => window.open(summaryData.source_url, '_blank')}
                        className="px-3 py-1.5 text-[10px] md:text-xs font-bold text-emerald-400 bg-black border border-emerald-900 hover:border-emerald-500 hover:bg-emerald-500/10 transition-all uppercase tracking-wide flex-1 sm:flex-none"
                    >
                        [Source ↗]
                    </button>

                    <button
                        onClick={onClose}
                        className="px-3 py-1.5 text-[10px] md:text-xs font-bold bg-emerald-500 hover:bg-emerald-400 text-black transition-colors uppercase tracking-wide flex-1 sm:flex-none"
                    >
                        [Close ×]
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Footer;