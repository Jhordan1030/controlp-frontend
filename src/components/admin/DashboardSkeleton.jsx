import React from 'react';

const DashboardSkeleton = () => {
    return (
        <div className="space-y-8 animate-pulse">
            {/* Header Skeleton */}
            <div className="space-y-3">
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
                                <div className="h-3 bg-gray-200 rounded w-1/3"></div>
                            </div>
                            <div className="h-12 w-12 bg-gray-200 rounded-lg"></div>
                        </div>
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Quick Actions Skeleton (Left Column) */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden h-full">
                        <div className="p-6 border-b border-gray-100">
                            <div className="h-6 bg-gray-200 rounded w-48"></div>
                        </div>
                        <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                            {[...Array(4)].map((_, i) => (
                                <div key={i} className="flex items-start p-4 rounded-xl border border-gray-100">
                                    <div className="h-12 w-12 bg-gray-200 rounded-lg mr-4"></div>
                                    <div className="flex-1 space-y-2">
                                        <div className="h-5 bg-gray-200 rounded w-3/4"></div>
                                        <div className="h-4 bg-gray-200 rounded w-full"></div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Recent Activity Skeleton (Right Column) */}
                <div className="lg:col-span-1">
                    <div className="bg-white rounded-xl border border-gray-200 shadow-sm h-full">
                        <div className="p-6 border-b border-gray-100 flex justify-between items-center">
                            <div className="h-6 bg-gray-200 rounded w-40"></div>
                            <div className="h-4 bg-gray-200 rounded w-16"></div>
                        </div>
                        <div className="divide-y divide-gray-100">
                            {[...Array(5)].map((_, i) => (
                                <div key={i} className="p-4">
                                    <div className="flex items-start gap-3">
                                        <div className="h-6 w-6 bg-gray-200 rounded-full flex-shrink-0"></div>
                                        <div className="flex-1 space-y-2">
                                            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                                            <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DashboardSkeleton;
