import React from 'react';
import { Info } from 'lucide-react';

interface InfoTooltipProps {
    text: string;
}

export const InfoTooltip: React.FC<InfoTooltipProps> = ({ text }) => {
    return (
        <div className="group relative inline-block ml-2 align-middle">
            <Info size={16} className="text-slate-400 hover:text-indigo-500 dark:text-slate-500 dark:hover:text-indigo-400 cursor-help transition-colors" />
            <div className="invisible opacity-0 group-hover:visible group-hover:opacity-100 transition-all duration-200 absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 w-64 p-3 bg-slate-800 dark:bg-slate-700 text-xs text-white rounded-lg shadow-xl z-50 pointer-events-none text-center leading-relaxed">
                {text}
                <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-slate-800 dark:border-t-slate-700"></div>
            </div>
        </div>
    );
};