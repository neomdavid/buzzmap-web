import React from "react";

const PostCardSkeleton = () => {
  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-4 animate-pulse">
      {/* Header with profile and user info */}
      <div className="flex items-center gap-3 mb-4">
        <div className="skeleton w-12 h-12 rounded-full" />
        <div className="flex-1">
          <div className="skeleton h-4 w-24 mb-2" />
          <div className="skeleton h-3 w-32" />
        </div>
        <div className="skeleton w-6 h-6 rounded" />
      </div>

      {/* Post content */}
      <div className="mb-4">
        <div className="skeleton h-4 w-full mb-2" />
        <div className="skeleton h-4 w-3/4 mb-2" />
        <div className="skeleton h-4 w-1/2" />
      </div>

      {/* Image grid skeleton */}
      <div className="grid grid-cols-2 gap-1 mb-4">
        <div className="skeleton aspect-[4/3] rounded-md" />
        <div className="skeleton aspect-[4/3] rounded-md" />
      </div>

      {/* Divider */}
      <div className="skeleton h-px w-full mb-2" />

      {/* Reactions tab */}
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <div className="skeleton w-6 h-6 rounded" />
            <div className="skeleton h-4 w-8" />
          </div>
          <div className="flex items-center gap-2">
            <div className="skeleton w-6 h-6 rounded" />
            <div className="skeleton h-4 w-8" />
          </div>
        </div>
        <div className="skeleton w-6 h-6 rounded" />
      </div>
    </div>
  );
};

export default PostCardSkeleton;
