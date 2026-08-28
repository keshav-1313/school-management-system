import React from 'react';

export const StatCardSkeleton = () => (
    <div className="bg-white rounded-xl border border-gray-100 p-6 shadow-sm animate-pulse">
        <div className="flex items-center justify-between">
            <div className="space-y-2 flex-1 pr-4">
                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                <div className="h-8 bg-gray-200 rounded w-3/4"></div>
                <div className="h-3 bg-gray-200 rounded w-1/3 mt-2"></div>
            </div>
            <div className="w-12 h-12 bg-gray-200 rounded-xl flex-shrink-0"></div>
        </div>
    </div>
);

export const AttendanceWidgetSkeleton = () => (
    <div className="bg-white rounded-xl border border-gray-100 p-6 shadow-sm animate-pulse">
        <div className="flex items-center justify-between mb-6">
            <div className="space-y-2">
                <div className="h-5 bg-gray-200 rounded w-40"></div>
                <div className="h-3 bg-gray-200 rounded w-60"></div>
            </div>
            <div className="h-9 bg-gray-200 rounded-lg w-32"></div>
        </div>
        <div className="space-y-4">
            <div className="h-6 bg-gray-200 rounded w-full"></div>
            <div className="grid grid-cols-3 gap-4 pt-2">
                <div className="h-16 bg-gray-200 rounded-lg"></div>
                <div className="h-16 bg-gray-200 rounded-lg"></div>
                <div className="h-16 bg-gray-200 rounded-lg"></div>
            </div>
        </div>
    </div>
);

export const ActivitySkeleton = () => (
    <div className="bg-white rounded-xl border border-gray-100 p-6 shadow-sm animate-pulse">
        <div className="h-5 bg-gray-200 rounded w-40 mb-6"></div>
        <div className="space-y-4">
            {[1, 2, 3, 4].map((i) => (
                <div key={i} className="flex items-center gap-4 py-2 border-b border-gray-50 last:border-0">
                    <div className="w-10 h-10 bg-gray-200 rounded-full flex-shrink-0"></div>
                    <div className="flex-1 space-y-2">
                        <div className="h-4 bg-gray-200 rounded w-2/3"></div>
                        <div className="h-3 bg-gray-200 rounded w-1/3"></div>
                    </div>
                    <div className="h-6 bg-gray-200 rounded w-16"></div>
                </div>
            ))}
        </div>
    </div>
);

export const DashboardSkeleton = () => (
    <div className="space-y-8">
        {/* Welcome Header Skeleton */}
        <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm animate-pulse">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="space-y-2">
                    <div className="h-7 bg-gray-200 rounded w-64"></div>
                    <div className="h-4 bg-gray-200 rounded w-48"></div>
                </div>
                <div className="h-10 bg-gray-200 rounded-xl w-36"></div>
            </div>
        </div>

        {/* Stat Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <StatCardSkeleton />
            <StatCardSkeleton />
            <StatCardSkeleton />
            <StatCardSkeleton />
        </div>

        {/* Content Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-8">
                <AttendanceWidgetSkeleton />
                <ActivitySkeleton />
            </div>
            <div className="space-y-8">
                <div className="bg-white rounded-xl border border-gray-100 p-6 shadow-sm animate-pulse h-64"></div>
                <div className="bg-white rounded-xl border border-gray-100 p-6 shadow-sm animate-pulse h-64"></div>
            </div>
        </div>
    </div>
);
