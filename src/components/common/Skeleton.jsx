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

export const CardSkeleton = ({ count = 6 }) => {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(count)].map((_, i) => (
                <div key={i} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 animate-pulse">
                    <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3 flex-1">
                            <div className="w-12 h-12 bg-gray-200 rounded-lg"></div>
                            <div className="space-y-2 flex-1">
                                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                                <div className="h-3 bg-gray-200 rounded w-1/3"></div>
                            </div>
                        </div>
                        <div className="w-8 h-8 bg-gray-200 rounded-lg ml-4"></div>
                    </div>
                </div>
            ))}
        </div>
    );
};
