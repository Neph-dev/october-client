'use client';

import React from 'react';
import { ChatMessage, WebSource } from '@/types';
import { formatProcessingTime } from '@/utils/chatStorage';

interface ChatMessageComponentProps {
    message: ChatMessage;
}

const ChatMessageComponent = ({ message }: ChatMessageComponentProps) => {
    const formatMessageContent = (content: string) => {
        // Convert **text** to bold
        const parts = content.split(/(\*\*[^*]+\*\*)/);
        return parts.map((part, index) => {
            if (part.startsWith('**') && part.endsWith('**')) {
                return (
                    <span key={index} className="font-semibold">
                        {part.replace(/\*\*/g, '')}
                    </span>
                );
            }
            return part;
        });
    };

    if (message.type === 'user') {
        return (
            <div className="flex justify-end mb-6">
                <div className="max-w-3xl bg-purple-600 text-white rounded-2xl rounded-tr-md px-6 py-4">
                    <p className="text-sm opacity-90">{formatMessageContent(message.content)}</p>
                    <p className="text-xs opacity-60 mt-2">
                        {message.timestamp.toLocaleTimeString()}
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="flex justify-start mb-8">
            <div className="max-w-4xl bg-gray-800 text-white rounded-2xl rounded-tl-md px-6 py-5">
                <div className="prose prose-invert max-w-none">
                    <p className="text-gray-200 leading-relaxed mb-4">
                        {formatMessageContent(message.content)}
                    </p>
                </div>

                {/* Sources Section */}
                {message.web_sources && message.web_sources.length > 0 && (
                    <div className="mt-4 pt-4 border-t border-gray-700">
                        <h4 className="text-sm font-semibold text-gray-300 mb-3">Sources:</h4>
                        <div className="space-y-2">
                            {message.web_sources.slice(0, 3).map((source: WebSource, index: number) => (
                                <div key={index} className="text-xs bg-gray-900 rounded-lg p-3">
                                    <a
                                        href={source.url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-emerald-400 hover:text-emerald-300 font-medium block mb-1"
                                    >
                                        {source.title}
                                    </a>
                                    <p className="text-gray-400 line-clamp-2">
                                        {source.snippet}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Companies Referenced */}
                {message.companies_referenced && message.companies_referenced.length > 0 && (
                    <div className="mt-3">
                        <div className="flex flex-wrap gap-2">
                            {message.companies_referenced.map((company, index) => (
                                <span
                                    key={index}
                                    className="text-xs bg-emerald-600 text-white px-2 py-1 rounded-full"
                                >
                                    {company}
                                </span>
                            ))}
                        </div>
                    </div>
                )}

                {/* Metadata */}
                <div className="flex items-center justify-between mt-4 pt-3 border-t border-gray-700 text-xs text-gray-400">
                    <span>{message.timestamp.toLocaleString()}</span>
                    <div className="flex items-center space-x-4">
                        {message.confidence && (
                            <span>Confidence: {Math.round(message.confidence * 100)}%</span>
                        )}
                        {message.processing_time && (
                            <span>Processing: {formatProcessingTime(message.processing_time)}</span>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ChatMessageComponent;