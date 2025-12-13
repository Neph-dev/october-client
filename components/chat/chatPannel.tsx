'use client';

import { useState, useEffect, useRef } from "react";
import ChatInput from "./chatInput";
import PromptCard from "./PromptCard";
import ChatMessageComponent from "./ChatMessage";
import Sidebar from "../sidebar";
import Tab from "../tab";
import { ChatMessage, AIQueryResponse } from '@/types';
import { chatStorage } from '@/utils/chatStorage';

const ChatPanel = () => {
    const [inputValue, setInputValue] = useState('');
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    // Load chat history from localStorage on component mount
    useEffect(() => {
        const savedMessages = chatStorage.getMessages();
        setMessages(savedMessages);
    }, []);

    // Scroll to bottom when new messages are added
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const handleSubmit = async () => {
        if (inputValue.trim() && !isLoading) {
            const userMessage: ChatMessage = {
                id: chatStorage.generateMessageId(),
                type: 'user',
                content: inputValue.trim(),
                timestamp: new Date(),
            };

            // Add user message immediately
            const updatedMessages = [...messages, userMessage];
            setMessages(updatedMessages);
            chatStorage.saveMessages(updatedMessages);
            setInputValue('');
            setIsLoading(true);

            try {
                // Call AI API
                const response = await fetch('/api/ai/query', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ question: userMessage.content }),
                });

                if (!response.ok) {
                    throw new Error('Failed to get AI response');
                }

                const aiResponse: AIQueryResponse = await response.json();

                // Create AI message
                const aiMessage: ChatMessage = {
                    id: chatStorage.generateMessageId(),
                    type: 'assistant',
                    content: aiResponse.answer,
                    timestamp: new Date(),
                    web_sources: aiResponse.web_sources,
                    companies_referenced: aiResponse.companies_referenced,
                    confidence: aiResponse.confidence,
                    processing_time: aiResponse.processing_time,
                };

                // Add AI message
                const finalMessages = [...updatedMessages, aiMessage];
                setMessages(finalMessages);
                chatStorage.saveMessages(finalMessages);
            } catch (error) {
                console.error('Error getting AI response:', error);

                // Add error message
                const errorMessage: ChatMessage = {
                    id: chatStorage.generateMessageId(),
                    type: 'assistant',
                    content: 'Sorry, I encountered an error while processing your question. Please try again.',
                    timestamp: new Date(),
                };

                const finalMessages = [...updatedMessages, errorMessage];
                setMessages(finalMessages);
                chatStorage.saveMessages(finalMessages);
            } finally {
                setIsLoading(false);
            }
        }
    };

    const clearChat = () => {
        setMessages([]);
        chatStorage.clearMessages();
    };

    const prompts = [
        {
            text: "Who is the CEO of the RTX?",
        },
        {
            text: "How did Lockheed Martin perform last quarter?",
        }
    ];

    return (
        <div className="flex h-screen bg-black text-white overflow-y-hidden font-mono">
            <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

            <div className="flex-1 overflow-y-auto h-full w-full">
                <button
                    onClick={() => setSidebarOpen(true)}
                    className="md:hidden fixed top-4 left-4 z-30 bg-black text-emerald-500 p-2 border border-emerald-900 hover:border-emerald-500 hover:bg-emerald-500/10 transition-all"
                >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                    </svg>
                </button>

                <div className="p-4 md:p-8 pt-16 md:pt-8 h-full w-full">
                    <div className="mb-6 md:mb-8">
                        <Tab active='Chat' />
                    </div>

                    <div className="flex items-center justify-center py-4 md:py-8 h-full w-full">
                        <div className={`relative w-full h-full transform transition-transform duration-300 translate flex flex-col`}>
                            <div className="flex-1 overflow-y-auto p-4 md:p-6 pt-4 md:pt-8 w-full">
                                {messages.length === 0 ? (
                                    <>
                                        {/* Header */}
                                        <div className="text-center mb-8 md:mb-10 border border-emerald-900/50 p-6 md:p-8">
                                            <div className="flex items-center justify-center gap-2 mb-4">
                                                <span className="w-2 h-2 bg-emerald-500 animate-pulse"></span>
                                                <span className="text-emerald-600 text-[10px] uppercase tracking-widest">AI Terminal Ready</span>
                                            </div>
                                            <h2 className="text-xl md:text-3xl font-bold text-emerald-100 mb-3 md:mb-4 px-2 uppercase tracking-wider">
                                                ▸ Query System
                                            </h2>
                                            <p className="text-xs md:text-sm text-emerald-600 max-w-xl mx-auto mb-4 md:mb-6 px-4">
                                                Defense & Aerospace Market Intelligence Terminal
                                            </p>
                                        </div>

                                        <div className="mb-6 md:mb-8 px-2">
                                            <div className="flex items-center gap-2 mb-3">
                                                <span className="text-emerald-600 text-[10px] uppercase tracking-widest">▸ Example Queries</span>
                                            </div>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 md:gap-3">
                                                {prompts.map((prompt, index) => (
                                                    <PromptCard
                                                        key={index}
                                                        text={prompt.text}
                                                        onClick={() => setInputValue(prompt.text)}
                                                    />
                                                ))}
                                            </div>
                                        </div>
                                    </>
                                ) : (
                                    <>
                                        {/* Chat Header with Clear Button */}
                                        <div className="flex items-center justify-between mb-4 md:mb-6 px-2 border-b border-emerald-900/50 pb-3">
                                            <div className="flex items-center gap-2">
                                                <span className="w-2 h-2 bg-emerald-500 animate-pulse"></span>
                                                <h2 className="text-sm md:text-base font-bold text-emerald-100 uppercase tracking-wider">
                                                    ▸ Session Log
                                                </h2>
                                            </div>
                                            <button
                                                onClick={clearChat}
                                                className="px-3 py-1.5 text-[10px] md:text-xs font-bold bg-red-900/50 border border-red-800 hover:border-red-500 hover:bg-red-900 text-red-400 transition-colors uppercase tracking-wide"
                                            >
                                                [Clear ×]
                                            </button>
                                        </div>

                                        {/* Messages */}
                                        <div className="space-y-2 md:space-y-3">
                                            {messages.map((message) => (
                                                <ChatMessageComponent key={message.id} message={message} />
                                            ))}
                                            {isLoading && (
                                                <div className="flex justify-start mb-4 md:mb-6 font-mono">
                                                    <div className="bg-black border border-emerald-900 px-4 py-3">
                                                        <div className="flex items-center gap-2">
                                                            <span className="w-2 h-2 bg-emerald-500 animate-pulse"></span>
                                                            <span className="w-2 h-2 bg-emerald-500 animate-pulse delay-75"></span>
                                                            <span className="w-2 h-2 bg-emerald-500 animate-pulse delay-150"></span>
                                                            <span className="text-emerald-600 text-xs uppercase tracking-widest ml-2">Processing Query...</span>
                                                        </div>
                                                    </div>
                                                </div>
                                            )}
                                            <div ref={messagesEndRef} />
                                        </div>
                                    </>
                                )}
                            </div>

                            <div className="text-center mb-2 px-4 border-t border-emerald-900/30 pt-2">
                                <p className="text-[10px] md:text-xs text-emerald-700 uppercase tracking-wide">
                                    Data sourced externally • Verify independently • Session stored locally
                                </p>
                            </div>

                            <div className="p-4 md:p-8 pt-2 md:pt-4">
                                <ChatInput
                                    value={inputValue}
                                    onChange={(e) => setInputValue(e.target.value)}
                                    onSubmit={handleSubmit}
                                    placeholder="Ask whatever you want about defense & aerospace..."
                                    disabled={isLoading}
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ChatPanel;