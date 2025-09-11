import React from "react";

const TableSkeleton = ({ rows = 5, columns = 4 }) => {
  return (
    <div className="w-full h-full">
      {/* Table Header Skeleton */}
      <div className="flex border-b border-gray-200 bg-gray-50">
        {Array.from({ length: columns }).map((_, colIndex) => (
          <div key={colIndex} className="flex-1 p-3">
            <div className="skeleton h-4 w-24" />
          </div>
        ))}
      </div>

      {/* Table Rows Skeleton */}
      <div className="divide-y divide-gray-200">
        {Array.from({ length: rows }).map((_, rowIndex) => (
          <div key={rowIndex} className="flex hover:bg-gray-50">
            {Array.from({ length: columns }).map((_, colIndex) => (
              <div key={colIndex} className="flex-1 p-3 flex items-center">
                <div className="skeleton h-4 w-20" />
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
};

export default TableSkeleton;
