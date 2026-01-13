import React from 'react';

const StudentDashboardSkeleton = () => {
    return (
        <div className="space-y-6 animate-pulse">
            {/* Header Skeleton */}
            <div className="space-y-2">
                <div className="h-8 bg-gray-200 rounded-md w-1/3"></div>
                <div className="h-4 bg-gray-200 rounded-md w-1/4"></div>
            </div>

            {/* Stats Grid Skeleton */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {[...Array(4)].map((_, i) => (
                    <div key={i} className="bg-white rounded-xl p-6 border border-gray-100 shadow-sm">
                        <div className="flex justify-between items-start">
                            <div className="space-y-3 flex-1">
                                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                                <div className="h-8 bg-gray-200 rounded w-3/4"></div>
                            </div>
                            <div className="h-12 w-12 bg-gray-200 rounded-lg"></div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Progress Section Skeleton */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
                <div className="flex items-center gap-2 mb-6">
                    <div className="h-6 w-6 bg-gray-200 rounded"></div>
                    <div className="h-6 bg-gray-200 rounded w-48"></div>
                </div>
                <div className="space-y-4">
                    <div className="h-4 bg-gray-200 rounded w-full"></div>
                    <div className="h-20 bg-gray-50 rounded-lg p-4"></div>
                </div>
            </div>

            {/* Recent Records Skeleton */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
                <div className="flex items-center gap-2 mb-6">
                    <div className="h-6 w-6 bg-gray-200 rounded"></div>
                    <div className="h-6 bg-gray-200 rounded w-48"></div>
                </div>
                <div className="space-y-3">
                    {[...Array(3)].map((_, i) => (
                        <div key={i} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                            <div className="space-y-2 w-1/2">
                                <div className="h-4 bg-gray-200 rounded w-1/3"></div>
                                <div className="h-3 bg-gray-200 rounded w-3/4"></div>
                            </div>
                            <div className="h-6 bg-gray-200 rounded w-16"></div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default StudentDashboardSkeleton;
