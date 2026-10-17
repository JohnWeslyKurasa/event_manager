import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  Calendar, MapPin, Users, ArrowRight, Clock, ExternalLink,
  Share2, Wifi, Tag, ChevronLeft, AlertCircle, Loader2,
  Building2, Globe, Sparkles
} from 'lucide-react';
import { eventsApi } from '../services/api';
import { Event, EVENT_CATEGORIES } from '../types';
import TicketTierSelector from '../components/TicketTierSelector';
import AiConciergeWidget from '../components/AiConciergeWidget';
import { useAuth } from '../context/AuthContext';
import { format } from 'date-fns';

export const EventDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [event, setEvent] = useState<Event | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedTierId, setSelectedTierId] = useState<string | null>(null);
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchEvent = async () => {
      if (!id) return;
      setIsLoading(true);
      try {
        const response = await eventsApi.getEventById(id);
        if (response.success && response.data) {
          setEvent(response.data);
        } else {
          setError('Event not found.');
        }
      } catch {
        setError('Failed to load event details.');
      } finally {
        setIsLoading(false);
      }
    };
    fetchEvent();
  }, [id]);

  const handleRegister = () => {
    if (!event || !selectedTierId) return;
    if (!isAuthenticated) {
      navigate(`/login?redirect=/events/${event.id}`);
      return;
    }
    navigate(`/events/${event.id}/checkout?tierId=${selectedTierId}`);
  };

  const handleShare = () => {
    navigator.share?.({ title: event?.title, url: window.location.href })
      .catch(() => navigator.clipboard.writeText(window.location.href));
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-cream-50 pt-24 flex items-center justify-center">
        <div className="flex items-center gap-3 text-botanical-500 text-sm">
          <Loader2 size={20} className="animate-spin text-sage-600" />
          Loading event details...
        </div>
      </div>
    );
  }

  if (error || !event) {
    return (
      <div className="min-h-screen bg-cream-50 pt-24 flex items-center justify-center p-4">
        <div className="text-center bg-cream-100 p-8 rounded-natural border border-cream-200 shadow-soft-natural max-w-md">
          <AlertCircle size={40} className="text-red-500 mx-auto mb-3" />
          <h2 className="font-serif text-xl font-bold text-botanical-900 mb-2">Event Not Found</h2>
          <p className="text-xs text-botanical-500 mb-6">{error || 'This event may have been removed or cancelled.'}</p>
          <Link to="/events" className="btn-primary text-xs">Browse Events</Link>
        </div>
      </div>
    );
  }

  const categoryLabel = EVENT_CATEGORIES.find((c) => c.value === event.category)?.label || event.category;
  const selectedTier = event.ticketTiers?.find((t) => t.id === selectedTierId);
  const isEventActive = event.status === 'PUBLISHED';

  return (
    <div className="min-h-screen bg-cream-50 text-botanical-700 pb-20">
      {/* Hero Banner */}
      <div className="relative w-full h-72 md:h-96 overflow-hidden bg-cream-200">
        {event.bannerImageUrl ? (
          <img
            src={event.bannerImageUrl}
            alt={event.title}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-tr from-sage-200 via-cream-200 to-sand-200" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-cream-50 via-cream-50/60 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-8">
          <Link
            to="/events"
            className="inline-flex items-center gap-1.5 text-botanical-500 hover:text-sage-700 text-xs mb-4 transition-colors font-medium"
          >
            <ChevronLeft size={14} /> Back to Events
          </Link>
          <div className="flex flex-wrap gap-2 mb-3">
            <span className="category-pill text-xs">{categoryLabel.replace('_', ' ')}</span>
            <span className="badge-published text-xs">
              {event.status.replace('_', ' ')}
            </span>
            {event.locationType === 'VIRTUAL' && (
              <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold bg-sage-100 text-sage-800 border border-sage-200">
                <Wifi size={10} /> Virtual Access
              </span>
            )}
          </div>
          <h1 className="font-serif text-3xl md:text-5xl font-bold text-botanical-900 leading-tight max-w-3xl">
            {event.title}
          </h1>
          {event.tagline && (
            <p className="text-base sm:text-lg text-sage-800 mt-2 max-w-2xl font-serif italic">{event.tagline}</p>
          )}
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column: Event Info */}
          <div className="lg:col-span-2 space-y-6">
            {/* Quick Meta Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="bg-cream-100/90 border border-cream-200 rounded-natural p-4 flex items-center gap-3 shadow-soft-natural">
                <div className="w-10 h-10 bg-sage-100 text-sage-700 rounded-natural flex items-center justify-center">
                  <Calendar size={18} />
                </div>
                <div>
                  <p className="text-[10px] text-botanical-500 uppercase tracking-wider">Starts</p>
                  <p className="text-xs font-semibold text-botanical-900">{format(new Date(event.startDate), 'MMM d, yyyy')}</p>
                  <p className="text-[11px] text-botanical-500">{format(new Date(event.startDate), 'h:mm a')}</p>
                </div>
              </div>

              <div className="bg-cream-100/90 border border-cream-200 rounded-natural p-4 flex items-center gap-3 shadow-soft-natural">
                <div className="w-10 h-10 bg-sand-100 text-sand-700 rounded-natural flex items-center justify-center">
                  {event.locationType === 'VIRTUAL' ? <Globe size={18} /> : <MapPin size={18} />}
                </div>
                <div>
                  <p className="text-[10px] text-botanical-500 uppercase tracking-wider">{event.locationType === 'VIRTUAL' ? 'Format' : 'Venue'}</p>
                  <p className="text-xs font-semibold text-botanical-900 truncate">
                    {event.locationType === 'VIRTUAL' ? 'Online Event' : (event.venueName || 'TBD')}
                  </p>
                  <p className="text-[11px] text-botanical-500 truncate">{event.venueCity || (event.locationType === 'VIRTUAL' ? 'Virtual' : '')}</p>
                </div>
              </div>

              <div className="bg-cream-100/90 border border-cream-200 rounded-natural p-4 flex items-center gap-3 shadow-soft-natural">
                <div className="w-10 h-10 bg-sage-100 text-sage-700 rounded-natural flex items-center justify-center">
                  <Users size={18} />
                </div>
                <div>
                  <p className="text-[10px] text-botanical-500 uppercase tracking-wider">Capacity</p>
                  <p className="text-xs font-semibold text-botanical-900">{event.totalCapacity.toLocaleString()} seats</p>
                  <p className="text-[11px] text-sage-600 font-medium">{Math.max(0, event.totalCapacity - event.ticketsSold)} remaining</p>
                </div>
              </div>
            </div>

            {/* Description Section */}
            <div className="bg-cream-100/90 border border-cream-200 rounded-natural p-6 shadow-soft-natural space-y-3">
              <h2 className="font-serif text-xl font-bold text-botanical-900">About This Gathering</h2>
              <div className="text-xs text-botanical-700 leading-relaxed whitespace-pre-wrap">
                {event.description}
              </div>
            </div>

            {/* Organizer Info */}
            <div className="bg-cream-100/90 border border-cream-200 rounded-natural p-6 shadow-soft-natural">
              <h2 className="font-serif text-xl font-bold text-botanical-900 mb-4">Curated By</h2>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-sage-600 text-cream-50 rounded-full flex items-center justify-center text-base font-bold shadow-soft-natural">
                  {event.organizerName?.charAt(0) || 'O'}
                </div>
                <div>
                  <p className="font-semibold text-botanical-900 text-sm">{event.organizerName}</p>
                  {event.organizationName && (
                    <p className="text-xs text-botanical-500 flex items-center gap-1 mt-0.5">
                      <Building2 size={12} /> {event.organizationName}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Venue Details */}
            {event.locationType !== 'VIRTUAL' && event.venueAddress && (
              <div className="bg-cream-100/90 border border-cream-200 rounded-natural p-6 shadow-soft-natural space-y-3">
                <h2 className="font-serif text-xl font-bold text-botanical-900 flex items-center gap-2">
                  <MapPin size={18} className="text-sage-600" /> Location Details
                </h2>
                <div className="text-xs text-botanical-700 space-y-1">
                  {event.venueName && <p className="font-semibold text-botanical-900">{event.venueName}</p>}
                  {event.venueAddress && <p>{event.venueAddress}</p>}
                  {event.venueCity && <p>{event.venueCity}</p>}
                </div>
                <a
                  href={`https://maps.google.com/?q=${encodeURIComponent([event.venueAddress, event.venueCity].filter(Boolean).join(', '))}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-secondary text-xs inline-flex py-2 mt-2"
                >
                  <ExternalLink size={13} /> View on Google Maps
                </a>
              </div>
            )}
          </div>

          {/* Right Column: Ticket Sidebar */}
          <div className="lg:col-span-1">
            <div className="sticky top-24 space-y-4">
              <div className="bg-cream-100/90 border border-cream-200 rounded-natural p-6 shadow-elevated-natural">
                <div className="flex items-center justify-between mb-5">
                  <h3 className="font-serif font-bold text-lg text-botanical-900 flex items-center gap-1.5">
                    <Tag size={16} className="text-sage-600" /> Select Pass
                  </h3>
                  <button
                    onClick={handleShare}
                    className="p-2 rounded-lg text-botanical-500 hover:text-botanical-900 hover:bg-cream-200 transition-colors"
                    title="Share event"
                  >
                    <Share2 size={16} />
                  </button>
                </div>

                <TicketTierSelector
                  tiers={event.ticketTiers || []}
                  selectedTierId={selectedTierId}
                  onSelect={setSelectedTierId}
                  disabled={!isEventActive}
                />

                <div className="mt-5 space-y-3">
                  {isEventActive ? (
                    <button
                      onClick={handleRegister}
                      disabled={!selectedTierId}
                      className="btn-primary w-full py-3.5 text-sm"
                      id="register-button"
                    >
                      {selectedTier ? (
                        <>
                          Register — {selectedTier.price === 0 ? 'Free' : `$${Number(selectedTier.price).toFixed(2)}`}
                          <ArrowRight size={16} />
                        </>
                      ) : (
                        'Select a Ticket Tier'
                      )}
                    </button>
                  ) : (
                    <div className="text-center py-4 bg-cream-200/50 rounded-natural border border-cream-300">
                      <p className="text-xs text-botanical-700 font-semibold">
                        {event.status === 'SOLD_OUT' ? 'Event is Sold Out' : `Event is ${event.status}`}
                      </p>
                    </div>
                  )}

                  {!isAuthenticated && isEventActive && (
                    <p className="text-center text-[11px] text-botanical-500">
                      <Link to="/login" className="text-sage-700 font-medium underline">Sign in</Link> to secure your tickets
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* AI Concierge Widget */}
      {event && <AiConciergeWidget eventId={event.id} eventTitle={event.title} />}
    </div>
  );
};

export default EventDetailPage;
