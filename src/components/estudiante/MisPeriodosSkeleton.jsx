import React from 'react';

const MisPeriodosSkeleton = () => {
    return (
        <div className="space-y-6 animate-pulse">
            {/* Header Skeleton */}
            <div className="space-y-2">
                <div className="h-8 bg-gray-200 rounded-md w-1/4"></div>
                <div className="h-4 bg-gray-200 rounded-md w-1/3"></div>
            </div>

            {/* Table Skeleton */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="p-6 border-b border-gray-100">
                    <div className="h-6 bg-gray-200 rounded w-1/4"></div>
                </div>
                <div className="divide-y divide-gray-100">
                    {[...Array(5)].map((_, i) => (
                        <div key={i} className="p-4 flex items-center justify-between">
                            <div className="space-y-2 w-1/3">
                                <div className="h-5 bg-gray-200 rounded w-3/4"></div>
                                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                            </div>
                            <div className="hidden md:block w-1/4">
                                <div className="h-4 bg-gray-200 rounded w-full"></div>
                            </div>
                            <div className="w-24 h-8 bg-gray-200 rounded-full"></div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default MisPeriodosSkeleton;
