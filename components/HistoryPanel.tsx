import React from 'react';

interface ImageHistoryItem {
  id: string;
  prompt: string;
  aspectRatio: string;
  imageSize: string;
  imageUrl: string;
}

interface HistoryPanelProps {
  history: ImageHistoryItem[];
  onSelect: (item: ImageHistoryItem) => void;
}

const HistoryIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className}>
        <path fillRule="evenodd" d="M12 1.5a.75.75 0 01.75.75v4.5a.75.75 0 01-1.5 0V3a9 9 0 105.694 8.046a.75.75 0 111.106-1.02A10.5 10.5 0 1112 1.5z" clipRule="evenodd" />
        <path fillRule="evenodd" d="M12 6.75a.75.75 0 01.75.75v5.25a.75.75 0 01-.22.53l-2.25 2.25a.75.75 0 11-1.06-1.06L11.25 12V7.5a.75.75 0 01.75-.75z" clipRule="evenodd" />
    </svg>
);


export const HistoryPanel: React.FC<HistoryPanelProps> = ({ history, onSelect }) => {
    return (
        <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 shadow-2xl border border-gray-700">
            <h2 className="text-lg font-semibold text-gray-200 mb-4 flex items-center">
                <HistoryIcon className="w-6 h-6 mr-3 text-gray-400" />
                Generation History
            </h2>
            {history.length === 0 ? (
                <div className="text-center text-gray-500 py-8">
                    <p>Your generated images will appear here.</p>
                </div>
            ) : (
                <div className="max-h-96 overflow-y-auto pr-2 -mr-2">
                    <ul className="space-y-3">
                        {history.map((item) => (
                            <li key={item.id}>
                                <button
                                    onClick={() => onSelect(item)}
                                    className="w-full flex items-center p-2 rounded-lg bg-gray-700/50 hover:bg-gray-600/70 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-indigo-500"
                                >
                                    <img 
                                        src={item.imageUrl} 
                                        alt={item.prompt} 
                                        className="w-16 h-16 rounded-md object-cover mr-4 flex-shrink-0"
                                    />
                                    <div className="text-left overflow-hidden">
                                        <p className="text-sm font-medium text-gray-200 truncate">{item.prompt}</p>
                                        <p className="text-xs text-gray-400">Ratio: {item.aspectRatio} &bull; Size: {item.imageSize}</p>
                                    </div>
                                </button>
                            </li>
                        ))}
                    </ul>
                </div>
            )}
        </div>
    );
};
