// ==================== src/components/common/ProgressBar.jsx ====================
import React from 'react';
import { getProgressBarColor } from '../../utils/helpers';

export default function ProgressBar({ current, total, showLabel = true }) {
    const percentage = total > 0 ? Math.min((current / total) * 100, 100) : 0;
    const colorClass = getProgressBarColor(percentage);

    return (
        <div>
            {showLabel && (
                <div className="flex justify-between items-center mb-2">
          <span className="text-sm font-medium text-gray-700">
            {current.toFixed(1)} / {total} horas
          </span>
                    <span className="text-sm font-semibold text-gray-900">
            {percentage.toFixed(1)}%
          </span>
                </div>
            )}
            <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                <div
                    className={`h-full ${colorClass} transition-all duration-500 ease-out rounded-full`}
                    style={{ width: `${percentage}%` }}
                ></div>
            </div>
        </div>
    );
}