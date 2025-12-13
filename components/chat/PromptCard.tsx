
interface PromptCardProps {
    text: string;
    onClick: () => void;
}

const PromptCard = ({ text, onClick }: PromptCardProps) => (
    <button
        onClick={onClick}
        className="font-mono bg-black border border-emerald-900 hover:border-emerald-500 cursor-pointer p-3 text-left transition-all group"
    >
        <div className="flex items-start gap-2">
            <span className="text-emerald-500 text-xs">▸</span>
            <p className="text-emerald-100/80 text-xs leading-relaxed group-hover:text-emerald-400 transition-colors">{text}</p>
        </div>
        <div className="h-0.5 bg-emerald-500/0 group-hover:bg-emerald-500 transition-all duration-200 mt-2"></div>
    </button>
);

export default PromptCard;