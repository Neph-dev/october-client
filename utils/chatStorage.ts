import { ChatMessage } from '@/types';

const CHAT_STORAGE_KEY = 'october-chat-history';

export const chatStorage = {
    // Get all chat messages from localStorage
    getMessages(): ChatMessage[] {
        if (typeof window === 'undefined') return [];

        try {
            const stored = localStorage.getItem(CHAT_STORAGE_KEY);
            if (!stored) return [];

            const messages = JSON.parse(stored);
            // Convert timestamp strings back to Date objects
            return messages.map((msg: any) => ({
                ...msg,
                timestamp: new Date(msg.timestamp)
            }));
        } catch (error) {
            console.error('Error loading chat history:', error);
            return [];
        }
    },

    // Save messages to localStorage
    saveMessages(messages: ChatMessage[]): void {
        if (typeof window === 'undefined') return;

        try {
            localStorage.setItem(CHAT_STORAGE_KEY, JSON.stringify(messages));
        } catch (error) {
            console.error('Error saving chat history:', error);
        }
    },

    // Add a new message
    addMessage(message: ChatMessage): void {
        const messages = this.getMessages();
        messages.push(message);
        this.saveMessages(messages);
    },

    // Clear all messages
    clearMessages(): void {
        if (typeof window === 'undefined') return;
        localStorage.removeItem(CHAT_STORAGE_KEY);
    },

    // Generate a unique ID for messages
    generateMessageId(): string {
        return `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }
};

export const formatProcessingTime = (nanoseconds: number): string => {
    const seconds = nanoseconds / 1e9;
    return seconds < 1 ? `${Math.round(seconds * 1000)}ms` : `${seconds.toFixed(1)}s`;
};