// ==================== src/components/common/LoadingSpinner.jsx ====================
import React from 'react';

export default function LoadingSpinner({ size = 'md', fullScreen = false }) {
    const sizes = {
        sm: 'h-8 w-8',
        md: 'h-12 w-12',
        lg: 'h-16 w-16'
    };

    const spinner = (
        <div className={`animate-spin rounded-full border-b-2 border-indigo-600 ${sizes[size]}`}></div>
    );

    if (fullScreen) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
                {spinner}
            </div>
        );
    }

    return <div className="flex justify-center items-center p-4">{spinner}</div>;
}