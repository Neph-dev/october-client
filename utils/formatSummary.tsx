export const formatSummary = (summary: string) => {
    // Helper function to convert inline bold text
    const formatInlineBold = (text: string) => {
        const parts = text.split(/(\*\*[^*]+\*\*)/);
        return parts.map((part, index) => {
            if (part.startsWith('**') && part.endsWith('**')) {
                return (
                    <span key={index} className="font-semibold text-white">
                        {part.replace(/\*\*/g, '')}
                    </span>
                );
            }
            return part;
        });
    };

    // Convert markdown-style formatting to JSX
    return summary
        .split('\n')
        .map((line, index) => {
            if (line.startsWith('**') && line.endsWith('**')) {
                // Bold headers
                return (
                    <h3 key={index} className="text-lg font-semibold text-white mt-4 mb-2">
                        {line.replace(/\*\*/g, '')}
                    </h3>
                );
            } else if (line.startsWith('- **') && line.includes('**:')) {
                // Bold bullet points
                const parts = line.split('**');
                return (
                    <div key={index} className="mb-2">
                        <span className="text-emerald-400 font-medium">• {parts[1]}:</span>
                        <span className="text-gray-300 ml-1">{formatInlineBold(parts[2])}</span>
                    </div>
                );
            } else if (line.startsWith('- ')) {
                // Regular bullet points
                const bulletText = line.substring(2);
                return (
                    <div key={index} className="mb-2 text-gray-300">
                        <span className="text-emerald-400">•</span>
                        <span className="ml-2">{formatInlineBold(bulletText)}</span>
                    </div>
                );
            } else if (line.trim() === '') {
                // Empty lines
                return <div key={index} className="h-2" />;
            } else {
                // Regular paragraphs with inline bold formatting
                return (
                    <p key={index} className="text-gray-300 mb-3 leading-relaxed">
                        {formatInlineBold(line)}
                    </p>
                );
            }
        });
};
