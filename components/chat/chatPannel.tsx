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
            text: "How did the company perform last quarter?",
        }
    ];

    return (
        <div className="flex h-screen bg-black text-white overflow-y-hidden">
            <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

            <div className="flex-1 overflow-y-auto h-full w-full">
                <button
                    onClick={() => setSidebarOpen(true)}
                    className="md:hidden fixed top-4 left-4 z-30 bg-gray-900 text-white p-2 rounded-lg hover:bg-gray-800"
                >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                    </svg>
                </button>

                <div className="p-8 pt-16 md:pt-8 h-full w-full">
                    <div className="mb-12">
                        <Tab active='Chat' />
                    </div>

                    <div className="flex items-center justify-center py-12 h-full w-full">
                        <div className={`relative w-full h-full bg-gradient-to-br transform transition-transform duration-300 translate flex flex-col`}>
                            <div className="flex-1 overflow-y-auto p-8 pt-20 w-full">
                                {messages.length === 0 ? (
                                    <>
                                        {/* Header */}
                                        <div className="text-center mb-12">
                                            <h2 className="text-4xl font-bold text-white mb-6">
                                                What would you like to know?
                                            </h2>
                                            <p className="text-gray-400 max-w-xl mx-auto mb-8">
                                                Ask any question related to defense & aerospace market intelligence.
                                                This chat is designed to help you with insights and data.
                                            </p>
                                            <p className="text-sm text-gray-400">
                                                Please note that the responses are generated based on available data and may not always be accurate.
                                            </p>
                                        </div>

                                        <div className="mb-8">
                                            <p className="text-sm font-semibold text-gray-400 mb-4 uppercase tracking-wide">
                                                Common Prompts
                                            </p>
                                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
                                        <div className="flex items-center justify-between mb-8">
                                            <h2 className="text-2xl font-bold text-white">
                                                Chat History
                                            </h2>
                                            <button
                                                onClick={clearChat}
                                                className="px-4 py-2 bg-red-600 hover:bg-red-500 text-white rounded-lg transition-colors text-sm"
                                            >
                                                Clear Chat
                                            </button>
                                        </div>

                                        {/* Messages */}
                                        <div className="space-y-4">
                                            {messages.map((message) => (
                                                <ChatMessageComponent key={message.id} message={message} />
                                            ))}
                                            {isLoading && (
                                                <div className="flex justify-start mb-6">
                                                    <div className="bg-gray-800 rounded-2xl rounded-tl-md px-6 py-4">
                                                        <div className="flex items-center space-x-2">
                                                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-emerald-400"></div>
                                                            <span className="text-gray-400 text-sm">AI is thinking...</span>
                                                        </div>
                                                    </div>
                                                </div>
                                            )}
                                            <div ref={messagesEndRef} />
                                        </div>
                                    </>
                                )}
                            </div>

                            <div className="p-8 pt-4">
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