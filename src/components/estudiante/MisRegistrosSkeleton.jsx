import React from 'react';

const MisRegistrosSkeleton = () => {
    return (
        <div className="space-y-6 animate-pulse">
            {/* Header Skeleton */}
            <div className="space-y-2">
                <div className="h-8 bg-gray-200 rounded-md w-1/4"></div>
                <div className="h-4 bg-gray-200 rounded-md w-1/3"></div>
            </div>

            {/* Summary Cards Skeleton */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {[...Array(3)].map((_, i) => (
                    <div key={i} className="bg-white rounded-xl shadow-md p-6 border border-gray-100">
                        <div className="flex items-center justify-between">
                            <div className="space-y-3 w-1/2">
                                <div className="h-3 bg-gray-200 rounded w-full"></div>
                                <div className="h-8 bg-gray-200 rounded w-3/4"></div>
                            </div>
                            <div className="h-10 w-10 bg-gray-200 rounded-lg"></div>
                        </div>
                    </div>
                ))}
            </div>

            {/* List Skeleton */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <div className="space-y-4">
                    {[...Array(5)].map((_, i) => (
                        <div key={i} className="p-4 bg-gray-50 rounded-lg border border-gray-100">
                            <div className="flex items-start justify-between">
                                <div className="flex-1 space-y-3">
                                    <div className="flex items-center gap-3">
                                        <div className="h-5 w-5 bg-gray-200 rounded"></div>
                                        <div className="h-5 bg-gray-200 rounded w-24"></div>
                                        <div className="h-6 bg-gray-200 rounded-full w-16"></div>
                                    </div>
                                    <div className="h-4 bg-gray-200 rounded w-3/4 ml-8"></div>
                                    <div className="h-3 bg-gray-200 rounded w-1/4 ml-8"></div>
                                </div>
                                <div className="h-9 w-9 bg-gray-200 rounded-lg"></div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default MisRegistrosSkeleton;
