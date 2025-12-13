import React from 'react';

interface ChatInputProps {
    value: string;
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    onSubmit: () => void;
    placeholder?: string;
    disabled?: boolean;
}

const ChatInput = ({ value, onChange, onSubmit, placeholder, disabled = false }: ChatInputProps) => (
    <div className="font-mono border border-emerald-900 bg-black">
        {/* Input header */}
        <div className="flex items-center justify-between px-3 py-1 bg-emerald-900/30 border-b border-emerald-900/50">
            <div className="flex items-center gap-2 text-[10px] text-emerald-600">
                <span>▸</span>
                <span className="uppercase tracking-widest">Query Input</span>
            </div>
            <div className="flex items-center gap-1 text-[10px] text-emerald-500">
                <span className={`w-1.5 h-1.5 ${disabled ? 'bg-amber-500' : 'bg-emerald-500'} animate-pulse`}></span>
                <span>{disabled ? 'Processing' : 'Ready'}</span>
            </div>
        </div>

        <div className="flex items-center">
            <span className="text-emerald-500 pl-3 text-sm">{'>'}</span>
            <input
                type="text"
                value={value}
                onChange={onChange}
                onKeyPress={(e) => e.key === 'Enter' && !disabled && onSubmit()}
                placeholder={placeholder}
                disabled={disabled}
                className="flex-1 bg-transparent px-2 py-3 text-emerald-100 placeholder-emerald-700 focus:outline-none text-sm font-mono disabled:opacity-50 disabled:cursor-not-allowed"
            />
            <button
                onClick={onSubmit}
                disabled={disabled}
                className="px-4 py-3 bg-emerald-500 hover:bg-emerald-400 text-black font-bold text-xs uppercase tracking-wider transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
                [Send →]
            </button>
        </div>
    </div>
);

export default ChatInput;