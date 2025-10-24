import { ArrowRight } from 'lucide-react';
import React from 'react';

interface ChatInputProps {
    value: string;
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    onSubmit: () => void;
    placeholder?: string;
    disabled?: boolean;
}

const ChatInput = ({ value, onChange, onSubmit, placeholder, disabled = false }: ChatInputProps) => (
    <div className="relative">
        <input
            type="text"
            value={value}
            onChange={onChange}
            onKeyPress={(e) => e.key === 'Enter' && !disabled && onSubmit()}
            placeholder={placeholder}
            disabled={disabled}
            className="w-full bg-white bg-opacity-50 backdrop-blur-sm rounded-full pl-6 pr-14 py-4 text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        />
        <button
            onClick={onSubmit}
            disabled={disabled}
            className="absolute right-2 top-1/2 -translate-y-1/2 bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-full p-3 hover:scale-110 transition-transform disabled:opacity-50 disabled:hover:scale-100 disabled:cursor-not-allowed"
        >
            <ArrowRight size={20} />
        </button>
    </div>
);

export default ChatInput;