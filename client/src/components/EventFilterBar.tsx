import React, { useState } from 'react';
import { Search, SlidersHorizontal, X, Grid3X3, List, ChevronDown } from 'lucide-react';
import { EVENT_CATEGORIES } from '../types';

export interface EventFilterBarProps {
  search: string;
  onSearchChange: (val: string) => void;
  category?: string;
  selectedCategory?: string | null;
  onCategoryChange?: (val: string) => void;
  onCategorySelect?: (val: string | null) => void;
  view?: 'grid' | 'list';
  viewMode?: 'grid' | 'list';
  onViewChange?: (val: 'grid' | 'list') => void;
  onViewModeChange?: (val: 'grid' | 'list') => void;
  onReset?: () => void;
  resultCount?: number;
}

export const EventFilterBar: React.FC<EventFilterBarProps> = ({
  search,
  onSearchChange,
  category,
  selectedCategory,
  onCategoryChange,
  onCategorySelect,
  view,
  viewMode,
  onViewChange,
  onViewModeChange,
  onReset,
  resultCount,
}) => {
  const currentCategory = selectedCategory !== undefined ? (selectedCategory || '') : (category || '');
  const currentView = viewMode || view || 'grid';

  const handleCategory = (val: string) => {
    if (onCategorySelect) onCategorySelect(val ? val : null);
    if (onCategoryChange) onCategoryChange(val);
  };

  const handleView = (val: 'grid' | 'list') => {
    if (onViewModeChange) onViewModeChange(val);
    if (onViewChange) onViewChange(val);
  };

  const handleClear = () => {
    onSearchChange('');
    handleCategory('');
    if (onReset) onReset();
  };

  const hasActiveFilters = Boolean(search || currentCategory);

  return (
    <div className="space-y-4">
      {/* Main Search Row */}
      <div className="flex flex-col sm:flex-row gap-3">
        {/* Search Input */}
        <div className="relative flex-1">
          <Search
            size={16}
            className="absolute left-3.5 top-1/2 -translate-y-1/2 text-botanical-400 pointer-events-none"
          />
          <input
            id="event-search-input"
            type="text"
            placeholder="Search events by title, topic, or keyword..."
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            className="input-field pl-10 pr-10 text-xs"
          />
          {search && (
            <button
              onClick={() => onSearchChange('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-botanical-400 hover:text-botanical-900 transition-colors"
            >
              <X size={14} />
            </button>
          )}
        </div>

        {/* Category Select */}
        <div className="relative min-w-[220px]">
          <select
            id="category-filter"
            value={currentCategory}
            onChange={(e) => handleCategory(e.target.value)}
            className="input-field pr-10 appearance-none cursor-pointer text-xs"
          >
            <option value="">All Categories</option>
            {EVENT_CATEGORIES.map((cat) => (
              <option key={cat.value} value={cat.value}>
                {cat.label}
              </option>
            ))}
          </select>
          <ChevronDown
            size={14}
            className="absolute right-3.5 top-1/2 -translate-y-1/2 text-botanical-400 pointer-events-none"
          />
        </div>

        {/* View Mode Toggle */}
        <div className="flex items-center bg-cream-100 rounded-natural border border-cream-200 p-1 flex-shrink-0 shadow-soft-natural">
          <button
            onClick={() => handleView('grid')}
            className={`p-2 rounded-lg transition-all ${
              currentView === 'grid'
                ? 'bg-sage-600 text-cream-50 shadow-sm'
                : 'text-botanical-500 hover:text-botanical-900'
            }`}
            title="Grid View"
          >
            <Grid3X3 size={15} />
          </button>
          <button
            onClick={() => handleView('list')}
            className={`p-2 rounded-lg transition-all ${
              currentView === 'list'
                ? 'bg-sage-600 text-cream-50 shadow-sm'
                : 'text-botanical-500 hover:text-botanical-900'
            }`}
            title="List View"
          >
            <List size={15} />
          </button>
        </div>
      </div>

      {/* Active Filter Chips */}
      {hasActiveFilters && (
        <div className="flex items-center justify-between flex-wrap gap-2 pt-1 animate-fade-in text-xs">
          <div className="flex flex-wrap gap-2 items-center">
            <span className="text-botanical-500 text-[11px] font-medium">Active filters:</span>
            {search && (
              <span className="inline-flex items-center gap-1 px-3 py-1 bg-sage-100 text-sage-800 border border-sage-200 rounded-full font-medium">
                Keyword: "{search}"
                <button onClick={() => onSearchChange('')} className="hover:text-sage-900">
                  <X size={12} />
                </button>
              </span>
            )}
            {currentCategory && (
              <span className="inline-flex items-center gap-1 px-3 py-1 bg-sand-100 text-sand-700 border border-sand-200 rounded-full font-medium">
                Category: {EVENT_CATEGORIES.find((c) => c.value === currentCategory)?.label || currentCategory}
                <button onClick={() => handleCategory('')} className="hover:text-sand-900">
                  <X size={12} />
                </button>
              </span>
            )}
          </div>

          <button
            onClick={handleClear}
            className="text-xs text-sage-700 hover:text-sage-900 font-medium underline underline-offset-4"
          >
            Clear all filters
          </button>
        </div>
      )}
    </div>
  );
};

export default EventFilterBar;
