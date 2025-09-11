import React from 'react';
import { MagnifyingGlass } from "phosphor-react";

const BarangaySearch = ({
  searchQuery,
  handleSearch,
  filteredBarangays,
  handleBarangaySelect,
  setSearchQuery,
  setFilteredBarangays
}) => {
  return (
    <div className="relative">
      <input
        type="text"
        placeholder="Search barangay..."
        value={searchQuery}
        onChange={(e) => handleSearch(e.target.value)}
        className="w-full md:w-[300px] pl-10 pr-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
      />
      <MagnifyingGlass
        size={18}
        className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
      />
      {/* Search Results Dropdown */}
      {searchQuery && filteredBarangays.length > 0 && (
        <div className="absolute z-50 w-full mt-1 bg-white rounded-lg shadow-lg border border-gray-200 max-h-60 overflow-y-auto">
          {filteredBarangays.map((barangay) => (
            <div
              key={barangay._id}
              onClick={() => {
                handleBarangaySelect(barangay);
                setSearchQuery("");
                setFilteredBarangays([]);
              }}
              className="px-4 py-2 hover:bg-gray-100 cursor-pointer text-primary"
            >
              {barangay.displayName || barangay.name}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default BarangaySearch;
