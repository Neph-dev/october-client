
interface PromptCardProps {
    text: string;
    onClick: () => void;
}

const PromptCard = ({ text, onClick }: PromptCardProps) => (
    <button
        onClick={onClick}
        className="bg-white bg-opacity-50 backdrop-blur-sm cursor-pointer rounded-2xl p-3 text-left hover:bg-opacity-70 transition-all hover:scale-105 hover:shadow-lg group"
    >
        <p className="text-gray-700 text-sm leading-relaxed">{text}</p>
    </button>
);

export default PromptCard;