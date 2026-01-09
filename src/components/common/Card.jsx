// ==================== src/components/common/Card.jsx ====================
import React from 'react';

export default function Card({ title, children, className = '', icon: Icon }) {
    return (
        <div className={`bg-white rounded-xl shadow-lg p-6 ${className}`}>
            {title && (
                <div className="flex items-center gap-3 mb-4 pb-3 border-b border-gray-200">
                    {Icon && <Icon className="w-6 h-6 text-indigo-600" />}
                    <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
                </div>
            )}
            {children}
        </div>
    );
}