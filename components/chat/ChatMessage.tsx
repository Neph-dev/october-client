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
            <div className="flex justify-end mb-4 font-mono">
                <div className="max-w-3xl bg-emerald-500 text-black border border-emerald-400">
                    <div className="flex items-center justify-between px-3 py-1 bg-emerald-600 border-b border-emerald-400">
                        <span className="text-[10px] font-bold uppercase tracking-wider">User Query</span>
                        <span className="text-[10px] opacity-70">{message.timestamp.toLocaleTimeString()}</span>
                    </div>
                    <div className="px-3 py-2">
                        <p className="text-sm font-medium">{formatMessageContent(message.content)}</p>
                    </div>
                </div>
            </div>
        );
    }

    const isRestrictionMessage = message.content.includes("I can only provide information about defense and aerospace companies and related topics.");
    const borderColor = isRestrictionMessage ? "border-amber-700" : "border-emerald-900";
    const headerBg = isRestrictionMessage ? "bg-amber-900/50" : "bg-emerald-900/30";
    const headerText = isRestrictionMessage ? "text-amber-500" : "text-emerald-600";

    return (
        <div className="flex justify-start mb-6 font-mono">
            <div className={`max-w-4xl bg-black border ${borderColor}`}>
                {/* Message header */}
                <div className={`flex items-center justify-between px-3 py-1 ${headerBg} border-b ${borderColor}`}>
                    <div className="flex items-center gap-2">
                        <span className={`w-1.5 h-1.5 ${isRestrictionMessage ? 'bg-amber-500' : 'bg-emerald-500'} animate-pulse`}></span>
                        <span className={`text-[10px] font-bold uppercase tracking-widest ${headerText}`}>
                            {isRestrictionMessage ? '⚠ System Notice' : '▸ AI Response'}
                        </span>
                    </div>
                    <span className="text-[10px] text-emerald-700">{message.timestamp.toLocaleTimeString()}</span>
                </div>

                <div className="p-4">
                    <p className={`text-sm leading-relaxed mb-4 ${isRestrictionMessage ? 'text-amber-100/80' : 'text-emerald-100/80'}`}>
                        {formatMessageContent(message.content)}
                    </p>

                    {/* Sources Section */}
                    {message.web_sources && message.web_sources.length > 0 && (
                        <div className="mt-4 pt-3 border-t border-emerald-900/50">
                            <div className="flex items-center gap-2 mb-2">
                                <span className="text-[10px] text-emerald-600 uppercase tracking-widest">▸ Sources</span>
                            </div>
                            <div className="space-y-1">
                                {message.web_sources.slice(0, 3).map((source: WebSource, index: number) => (
                                    <div key={index} className="text-xs border border-emerald-900/30 p-2 hover:border-emerald-500/50 transition-colors">
                                        <a
                                            href={source.url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="text-emerald-400 hover:text-emerald-300 font-bold block mb-1 uppercase tracking-wide text-[10px]"
                                        >
                                            [{String(index + 1).padStart(2, '0')}] {source.title}
                                        </a>
                                        <p className="text-emerald-100/50 line-clamp-2 text-[10px]">
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
                            <div className="flex flex-wrap gap-1">
                                {message.companies_referenced.map((company, index) => (
                                    <span
                                        key={index}
                                        className="text-[10px] bg-emerald-500/20 text-emerald-400 px-2 py-0.5 font-bold uppercase tracking-wide border border-emerald-500/30"
                                    >
                                        [{company}]
                                    </span>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Metadata */}
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between mt-4 pt-2 border-t border-emerald-900/50 text-[10px] text-emerald-700 gap-2">
                        <span className="uppercase tracking-wide">{message.timestamp.toLocaleString()}</span>
                        <div className="flex items-center gap-3">
                            {message.confidence && (
                                <span className="uppercase tracking-wide">Conf: {Math.round(message.confidence * 100)}%</span>
                            )}
                            {message.processing_time && (
                                <span className="uppercase tracking-wide">Time: {formatProcessingTime(message.processing_time)}</span>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ChatMessageComponent;