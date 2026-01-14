import React from 'react';
import { Construction, ArrowLeft } from 'lucide-react';

export default function ComingSoon({ title = "En Construcción", subtitle = "Estamos trabajando arduamente para traerte esta funcionalidad pronto." }) {
    return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] p-8 text-center animate-fadeIn">
            <div className="bg-indigo-50 dark:bg-indigo-900/20 p-6 rounded-full mb-6 relative overflow-hidden group">
                <div className="absolute inset-0 bg-indigo-100 dark:bg-indigo-800/30 rounded-full scale-0 group-hover:scale-110 transition-transform duration-500 ease-out"></div>
                <Construction className="w-16 h-16 text-indigo-500 dark:text-indigo-400 relative z-10" />
            </div>

            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-3">
                {title}
            </h2>

            <p className="text-gray-500 dark:text-gray-400 max-w-md text-lg">
                {subtitle}
            </p>

            <div className="mt-8 flex gap-2">
                <span className="w-2 h-2 rounded-full bg-indigo-300 dark:bg-indigo-700 animate-bounce" style={{ animationDelay: '0s' }}></span>
                <span className="w-2 h-2 rounded-full bg-indigo-400 dark:bg-indigo-600 animate-bounce" style={{ animationDelay: '0.2s' }}></span>
                <span className="w-2 h-2 rounded-full bg-indigo-500 dark:bg-indigo-500 animate-bounce" style={{ animationDelay: '0.4s' }}></span>
            </div>
        </div>
    );
}
