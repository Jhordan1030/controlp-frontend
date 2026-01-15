import React from 'react';
import { CheckCircle, AlertCircle, Info, X } from 'lucide-react';

export default function Alert({ type = 'info', message, onClose, className = '' }) {
    const types = {
        success: {
            bg: 'bg-green-50',
            border: 'border-green-200',
            text: 'text-green-800',
            icon: CheckCircle
        },
        error: {
            bg: 'bg-red-50',
            border: 'border-red-200',
            text: 'text-red-800',
            icon: AlertCircle
        },
        warning: {
            bg: 'bg-yellow-50',
            border: 'border-yellow-200',
            text: 'text-yellow-800',
            icon: AlertCircle
        },
        info: {
            bg: 'bg-blue-50',
            border: 'border-blue-200',
            text: 'text-blue-800',
            icon: Info
        }
    };

    const config = types[type];
    const Icon = config.icon;

    return (
        <div className={`shadow-lg min-w-[300px] max-w-sm animate-in slide-in-from-right-5 fade-in duration-300 ${config.bg} border ${config.border} rounded-lg p-3 flex items-center justify-between ${className || 'fixed top-4 right-4 z-50'}`}>
            <div className="flex items-center gap-3">
                <Icon className={`w-5 h-5 ${config.text}`} />
                <span className={`text-sm font-medium ${config.text}`}>{message}</span>
            </div>
            {onClose && (
                <button
                    onClick={onClose}
                    className={`p-1 hover:bg-white/50 rounded ${config.text}`}
                >
                    <X className="w-4 h-4" />
                </button>
            )}
        </div>
    );
}