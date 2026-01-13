import React from 'react';

export const TableSkeleton = ({ rows = 5 }) => {
    return (
        <div className="animate-pulse w-full">
            {/* Header Fake */}
            <div className="h-10 bg-gray-200 rounded-md mb-4 w-full"></div>

            {/* Rows */}
            <div className="space-y-3">
                {[...Array(rows)].map((_, i) => (
                    <div key={i} className="flex items-center space-x-4 p-4 bg-white border border-gray-100 rounded-md">
                        <div className="h-10 w-10 bg-gray-200 rounded-full"></div>
                        <div className="flex-1 space-y-2">
                            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                            <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                        </div>
                        <div className="h-8 w-20 bg-gray-200 rounded"></div>
                    </div>
                ))}
            </div>
        </div>
    );
};
