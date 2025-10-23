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
        <div className="p-4 border-t border-gray-700">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 text-sm text-gray-400">
                    <span>Processing time: {formatProcessingTime(summaryData.processing_time)}</span>
                    <span className="hidden sm:inline">•</span>
                    <span>Article ID: {summaryData.article_id}</span>
                </div>

                <div className="flex items-center gap-2">
                    <button
                        onClick={() => window.open(summaryData.source_url, '_blank')}
                        className="text-emerald-400 hover:text-emerald-300 text-sm font-medium flex items-center gap-2 flex-1 sm:flex-none justify-center sm:justify-start"
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                        </svg>
                        <span>Read Original</span>
                    </button>

                    <button
                        onClick={onClose}
                        className="px-4 py-2 bg-gray-800 hover:bg-gray-700 text-white rounded-lg transition-colors flex-1 sm:flex-none"
                    >
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Footer;