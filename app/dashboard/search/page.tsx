"use client";
import React, { useState, useEffect } from 'react';
import { Search, Calendar, Tag, Clock, DollarSign, X, PieChart } from 'lucide-react';

// Define interfaces for API data
interface PortfolioItem {
  id: number;
  title: string;
  description: string;
  projectCost: number;
  duration: number;
  category: string;
  projectDate: string;
  createdAt: string | null;
  updatedAt: string | null;
  featured: boolean;
}

interface Statistics {
  totalItems: number;
  averageCost: number | null;
  minCost: number | null;
  maxCost: number | null;
  averageDuration: number | null;
}

interface CategoryDistribution {
  category: string;
  item_count: number;
}

const PortfolioFilter = () => {
  // State
  const [data, setData] = useState<PortfolioItem[]>([]);
  const [filteredData, setFilteredData] = useState<PortfolioItem[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [stats, setStats] = useState<Statistics | null>(null);
  const [filters, setFilters] = useState({
    search: '',
    category: '',
    startDate: '',
    endDate: '',
    minCost: '',
    maxCost: '',
    minDuration: '',
    maxDuration: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [categoryDistribution, setCategoryDistribution] = useState<CategoryDistribution[]>([]);
  const [loadingCategories, setLoadingCategories] = useState(false);

  // Fetch data with filters
  const fetchFilteredData = async () => {
    try {
      setLoading(true);
      setError('');
      
      // Prepare request body - convert empty strings to null
      const requestBody = {
        search: filters.search || null,
        category: filters.category || null,
        startDate: null,
        endDate: null,
        minCost: filters.minCost ? Number(filters.minCost) : null,
        maxCost: filters.maxCost ? Number(filters.maxCost) : null,
        minDuration: filters.minDuration ? Number(filters.minDuration) : null,
        maxDuration: filters.maxDuration ? Number(filters.maxDuration) : null,
      };

      // Fetch filtered items
      const response = await fetch('/api/filter-items', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        throw new Error('Failed to fetch filtered items');
      }

      const itemsData = await response.json() as PortfolioItem[];
      setFilteredData(itemsData);
      
      // Extract unique categories if we have all data
      if (!filters.category && !filters.search && !filters.startDate && !filters.endDate && 
          !filters.minCost && !filters.maxCost && !filters.minDuration && !filters.maxDuration) {
        setData(itemsData);
        const uniqueCategories = [...new Set(itemsData.map(item => item.category))];
        setCategories(uniqueCategories);
      }

      // Fetch statistics
      const statsResponse = await fetch('/api/filter-items-statistics', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      if (!statsResponse.ok) {
        throw new Error('Failed to fetch statistics');
      }

      try {
        const statsData = await statsResponse.json();
        
        // Check if statsData has valid properties
        if (statsData && typeof statsData === 'object') {
          setStats({
            totalItems: statsData.totalItems || 0,
            averageCost: statsData.averageCost !== undefined ? statsData.averageCost : null,
            minCost: statsData.minCost !== undefined ? statsData.minCost : null,
            maxCost: statsData.maxCost !== undefined ? statsData.maxCost : null,
            averageDuration: statsData.averageDuration !== undefined ? statsData.averageDuration : null
          });
        } else {
          // If statsData is not in expected format
          setStats(null);
        }
      } catch (statsError) {
        console.error('Error parsing statistics:', statsError);
        setStats(null);
      }
      
      setLoading(false);
    } catch (err: any) {
      setError(err.message || 'An error occurred');
      setFilteredData([]);
      setStats(null);
      setLoading(false);
    }
  };

  // Fetch category distribution
  const fetchCategoryDistribution = async () => {
    try {
      setLoadingCategories(true);
      
      // Prepare request body - convert empty strings to null
      const requestBody = {
        search: filters.search || null,
        category: filters.category || null,
        startDate: null,
        endDate: null,
        minCost: filters.minCost ? Number(filters.minCost) : null,
        maxCost: filters.maxCost ? Number(filters.maxCost) : null,
        minDuration: filters.minDuration ? Number(filters.minDuration) : null,
        maxDuration: filters.maxDuration ? Number(filters.maxDuration) : null,
      };

      // Fetch category distribution
      const response = await fetch('/api/category-distribution', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        throw new Error('Failed to fetch category distribution');
      }

      const distributionData = await response.json() as CategoryDistribution[];
      setCategoryDistribution(distributionData);
      setShowCategoryModal(true);
      setLoadingCategories(false);
    } catch (err: any) {
      console.error('Error fetching category distribution:', err);
      setLoadingCategories(false);
    }
  };

  // Handle filter changes
  const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFilters(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Clear all filters
  const clearFilters = () => {
    setFilters({
      search: '',
      category: '',
      startDate: '',
      endDate: '',
      minCost: '',
      maxCost: '',
      minDuration: '',
      maxDuration: '',
    });
  };

  // Format date for display
  const formatDate = (dateString: string) => {
    const options: Intl.DateTimeFormatOptions = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  // Helper function to safely render number values
  const safeNumberDisplay = (value: number | null | undefined, decimals = 2) => {
    if (value === null || value === undefined) return 'N/A';
    return `$${value.toFixed(decimals)}`;
  };

  // Get color based on category name (for visual distinction in the category modal)
  const getCategoryColor = (category: string) => {
    // Simple hash function to generate consistent colors for each category
    let hash = 0;
    for (let i = 0; i < category.length; i++) {
      hash = category.charCodeAt(i) + ((hash << 5) - hash);
    }
    
    // Generate HSL color with fixed saturation and lightness for consistency
    const hue = hash % 360;
    return `hsl(${hue}, 70%, 60%)`;
  };

  return (
    <div className="max-w-6xl mx-auto p-6 bg-white rounded-lg shadow-lg">
      <h1 className="text-3xl font-bold text-gray-800 mb-6">Portfolio Projects</h1>
      
      {/* Filter section */}
      <div className="bg-gray-50 p-4 rounded-lg mb-6 shadow-md">
        <h2 className="text-xl font-semibold text-gray-700 mb-4">Filters</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Search filter */}
          <div className="relative">
            <input
              type="text"
              name="search"
              value={filters.search}
              onChange={handleFilterChange}
              placeholder="Search title or description"
              className="bg-white border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full pl-10 pr-10 p-2.5 shadow-sm"
            />
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
          </div>
          
          {/* Category filter */}
          <div className="relative">
            <select
              name="category"
              value={filters.category}
              onChange={handleFilterChange}
              className="bg-white border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 shadow-sm appearance-none pr-10"
            >
              <option value="">All Categories</option>
              {categories.map(category => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>
            <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
              <Tag className="h-5 w-5 text-gray-400" />
            </div>
          </div>
          
          {/* Cost range */}
          <div className="grid grid-cols-2 gap-2">
            <div className="relative">
              <input
                type="number"
                name="minCost"
                value={filters.minCost}
                onChange={handleFilterChange}
                placeholder="Min Cost"
                className="bg-white border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 shadow-sm pl-10"
              />
              <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                <DollarSign className="h-5 w-5 text-gray-400" />
              </div>
            </div>
            <div className="relative">
              <input
                type="number"
                name="maxCost"
                value={filters.maxCost}
                onChange={handleFilterChange}
                placeholder="Max Cost"
                className="bg-white border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 shadow-sm pl-10"
              />
              <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                <DollarSign className="h-5 w-5 text-gray-400" />
              </div>
            </div>
          </div>
          
          {/* Duration range */}
          <div className="grid grid-cols-2 gap-2">
            <div className="relative">
              <input
                type="number"
                name="minDuration"
                value={filters.minDuration}
                onChange={handleFilterChange}
                placeholder="Min Duration"
                className="bg-white border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 shadow-sm pl-10"
              />
              <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                <Clock className="h-5 w-5 text-gray-400" />
              </div>
            </div>
            <div className="relative">
              <input
                type="number"
                name="maxDuration"
                value={filters.maxDuration}
                onChange={handleFilterChange}
                placeholder="Max Duration"
                className="bg-white border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 shadow-sm pl-10"
              />
              <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                <Clock className="h-5 w-5 text-gray-400" />
              </div>
            </div>
          </div>
          
          {/* Action buttons */}
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={clearFilters}
              className="bg-white border border-gray-300 text-gray-500 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 shadow-sm"
            >
              Clear Filters
            </button>
            <button
              onClick={fetchFilteredData}
              className="bg-blue-500 border border-blue-500 text-white text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 shadow-sm hover:bg-blue-600"
            >
              Apply Filters
            </button>
          </div>
        </div>
      </div>
      
      {/* Results count */}
      <div className="mb-4 text-gray-600">
        {loading ? (
          <p>Loading...</p>
        ) : error ? (
          <p className="text-red-500">{error}</p>
        ) : (
          <p>Showing {filteredData.length} projects</p>
        )}
      </div>
      
      {/* Results grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {loading ? (
          <div className="col-span-full text-center py-8 text-gray-500">
            Loading portfolio items...
          </div>
        ) : error ? (
          <div className="col-span-full text-center py-8 text-red-500">
            {error}
          </div>
        ) : filteredData.length > 0 ? (
          filteredData.map(item => (
            <div key={item.id} className="bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-shadow duration-300">
              <div className="p-5">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="text-xl font-semibold text-gray-800">{item.title}</h3>
                  <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded">{item.category}</span>
                </div>
                <p className="text-gray-600 mb-4">{item.description}</p>
                <div className="flex justify-between text-sm text-gray-500">
                  <div className="flex items-center">
                    <DollarSign className="h-4 w-4 mr-1" />
                    <span>${item.projectCost.toFixed(2)}</span>
                  </div>
                  <div className="flex items-center">
                    <Clock className="h-4 w-4 mr-1" />
                    <span>{item.duration} days</span>
                  </div>
                  <div className="flex items-center">
                    <Calendar className="h-4 w-4 mr-1" />
                    <span>{formatDate(item.projectDate)}</span>
                  </div>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="col-span-full text-center py-8 text-gray-500">
            No projects found matching your criteria.
          </div>
        )}
      </div>
      
      {/* Stats section */}
      <div className="bg-gray-50 p-4 rounded-lg shadow-md">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-gray-700">Statistics</h2>
          <button
            onClick={fetchCategoryDistribution}
            disabled={loadingCategories || loading || filteredData.length === 0}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm transition-colors ${
              filteredData.length === 0
                ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                : 'bg-blue-100 text-blue-700 hover:bg-blue-200'
            }`}
          >
            <PieChart className="h-4 w-4" />
            {loadingCategories ? 'Loading...' : 'Categorical Breakdown'}
          </button>
        </div>
        {loading ? (
          <p className="text-center py-4">Loading statistics...</p>
        ) : error ? (
          <p className="text-red-500 text-center py-4">{error}</p>
        ) : filteredData.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            No statistics available for current filters.
          </div>
        ) : stats ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white p-4 rounded-lg shadow-sm">
              <div className="text-sm text-gray-500 mb-1">Average Cost</div>
              <div className="text-2xl font-bold text-blue-600">
                {safeNumberDisplay(stats.averageCost)}
              </div>
            </div>
            <div className="bg-white p-4 rounded-lg shadow-sm">
              <div className="text-sm text-gray-500 mb-1">Average Duration</div>
              <div className="text-2xl font-bold text-blue-600">
                {stats.averageDuration !== null ? `${stats.averageDuration.toFixed(1)} days` : 'N/A'}
              </div>
            </div>
            <div className="bg-white p-4 rounded-lg shadow-sm">
              <div className="text-sm text-gray-500 mb-1">Total Items / Price Range</div>
              <div className="text-2xl font-bold text-blue-600">
                {stats.totalItems || 0} / {stats.minCost !== null && stats.maxCost !== null 
                  ? `${safeNumberDisplay(stats.minCost)} - ${safeNumberDisplay(stats.maxCost)}`
                  : 'N/A'}
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">
            No statistics available.
          </div>
        )}
      </div>

      {/* Category Distribution Modal */}
      {showCategoryModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[80vh] overflow-y-auto">
            <div className="p-4 border-b flex justify-between items-center">
              <h3 className="text-lg font-semibold text-gray-800">Category Distribution</h3>
              <button 
                onClick={() => setShowCategoryModal(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="p-4">
              {categoryDistribution.length > 0 ? (
                <div className="space-y-4">
                  {/* Bar chart representation */}
                  <div className="space-y-3">
                    {categoryDistribution.map((item) => (
                      <div key={item.category} className="space-y-1">
                        <div className="flex justify-between text-sm">
                          <span className="font-medium">{item.category}</span>
                          <span className="text-gray-500">{item.item_count} item{item.item_count !== 1 ? 's' : ''}</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2.5">
                          <div 
                            className="h-2.5 rounded-full" 
                            style={{
                              width: `${(item.item_count / Math.max(...categoryDistribution.map(c => c.item_count))) * 100}%`,
                              backgroundColor: getCategoryColor(item.category)
                            }}
                          ></div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Summary */}
                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <p className="text-sm text-gray-600">
                      Total Categories: <span className="font-semibold">{categoryDistribution.length}</span>
                    </p>
                    <p className="text-sm text-gray-600">
                      Total Items: <span className="font-semibold">
                        {categoryDistribution.reduce((sum, item) => sum + item.item_count, 0)}
                      </span>
                    </p>
                  </div>
                </div>
              ) : (
                <div className="py-8 text-center text-gray-500">
                  No category data available.
                </div>
              )}
            </div>
            <div className="p-4 border-t bg-gray-50 rounded-b-lg">
              <button
                onClick={() => setShowCategoryModal(false)}
                className="w-full py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PortfolioFilter;