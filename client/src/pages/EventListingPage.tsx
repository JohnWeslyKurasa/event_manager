import React, { useState, useEffect, useCallback } from 'react';
import { eventsApi } from '../services/api';
import { Event, PaginationMeta } from '../types';
import EventCard from '../components/EventCard';
import EventFilterBar from '../components/EventFilterBar';
import { Calendar, RefreshCw, AlertCircle } from 'lucide-react';
import { useSearchParams } from 'react-router-dom';

export const EventListingPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState<PaginationMeta>({
    page: 1,
    limit: 9,
    totalCount: 0,
    totalPages: 1,
    hasNext: false,
    hasPrev: false,
  });

  const [search, setSearch] = useState(searchParams.get('search') || '');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(searchParams.get('category'));
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  const fetchEvents = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await eventsApi.getEvents({
        page: pagination.page,
        limit: pagination.limit,
        search: search || undefined,
        category: selectedCategory || undefined,
        status: 'PUBLISHED',
      });
      if (res.data) {
        setEvents(res.data);
      }
      if (res.pagination) {
        setPagination(res.pagination);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to load events');
    } finally {
      setLoading(false);
    }
  }, [pagination.page, pagination.limit, search, selectedCategory]);

  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  const handleSearchChange = (val: string) => {
    setSearch(val);
    setPagination((prev) => ({ ...prev, page: 1 }));
    if (val) {
      searchParams.set('search', val);
    } else {
      searchParams.delete('search');
    }
    setSearchParams(searchParams);
  };

  const handleCategorySelect = (cat: string | null) => {
    setSelectedCategory(cat);
    setPagination((prev) => ({ ...prev, page: 1 }));
    if (cat) {
      searchParams.set('category', cat);
    } else {
      searchParams.delete('category');
    }
    setSearchParams(searchParams);
  };

  return (
    <div className="min-h-screen bg-cream-50 text-botanical-700 py-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Header */}
        <div className="border-b border-cream-200 pb-6">
          <span className="text-xs font-semibold uppercase tracking-wider text-sage-600">Curated Directory</span>
          <h1 className="font-serif text-3xl sm:text-4xl font-bold text-botanical-900 mt-1">
            Discover Events & Gatherings
          </h1>
          <p className="text-xs sm:text-sm text-botanical-500 mt-1">
            Explore handpicked summits, intimate workshops, and thought leadership forums
          </p>
        </div>

        {/* Filter Bar */}
        <EventFilterBar
          search={search}
          onSearchChange={handleSearchChange}
          selectedCategory={selectedCategory}
          onCategorySelect={handleCategorySelect}
          viewMode={viewMode}
          onViewModeChange={setViewMode}
        />

        {error && (
          <div className="p-4 rounded-natural bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-3">
            <AlertCircle className="w-5 h-5 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Event List / Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((n) => (
              <div key={n} className="h-80 rounded-natural bg-cream-100 border border-cream-200 animate-pulse" />
            ))}
          </div>
        ) : events.length === 0 ? (
          <div className="py-20 text-center bg-cream-100/60 rounded-natural border border-cream-200 p-8 shadow-soft-natural">
            <Calendar className="w-12 h-12 text-botanical-400 mx-auto mb-3" />
            <h3 className="font-serif text-base font-semibold text-botanical-900">No events found</h3>
            <p className="text-xs text-botanical-500 mt-1 max-w-sm mx-auto">
              Try adjusting your search keywords or clearing selected category filters.
            </p>
          </div>
        ) : (
          <div
            className={
              viewMode === 'grid'
                ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'
                : 'space-y-4'
            }
          >
            {events.map((evt) => (
              <EventCard key={evt.id} event={evt} />
            ))}
          </div>
        )}

        {/* Pagination */}
        {pagination.totalPages > 1 && (
          <div className="flex items-center justify-center gap-3 pt-6 border-t border-cream-200">
            <button
              onClick={() => setPagination((prev) => ({ ...prev, page: Math.max(1, prev.page - 1) }))}
              disabled={!pagination.hasPrev}
              className="px-4 py-2 rounded-natural bg-cream-100 border border-cream-200 text-xs font-medium text-botanical-800 disabled:opacity-40 hover:bg-cream-200"
            >
              Previous
            </button>
            <span className="text-xs text-botanical-500 font-medium">
              Page {pagination.page} of {pagination.totalPages}
            </span>
            <button
              onClick={() => setPagination((prev) => ({ ...prev, page: Math.min(prev.totalPages, prev.page + 1) }))}
              disabled={!pagination.hasNext}
              className="px-4 py-2 rounded-natural bg-cream-100 border border-cream-200 text-xs font-medium text-botanical-800 disabled:opacity-40 hover:bg-cream-200"
            >
              Next
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default EventListingPage;
