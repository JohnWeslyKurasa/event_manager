import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Ticket, Calendar, MapPin, QrCode, Download,
  ExternalLink, Clock, AlertCircle, RefreshCw,
  CheckCircle2, XCircle, ChevronRight, Wifi
} from 'lucide-react';
import { registrationsApi } from '../services/api';
import { Registration } from '../types';
import { useAuth } from '../context/AuthContext';
import QrTicketDisplay from '../components/QrTicketDisplay';
import { format } from 'date-fns';

export const MyTicketsPage: React.FC = () => {
  const { user } = useAuth();
  const [tickets, setTickets] = useState<Registration[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Active modal for viewing QR pass
  const [selectedTicket, setSelectedTicket] = useState<Registration | null>(null);
  const [cancellingId, setCancellingId] = useState<string | null>(null);

  const fetchTickets = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await registrationsApi.getMyTickets();
      if (res.data) {
        setTickets(res.data);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to retrieve your tickets.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTickets();
  }, []);

  const handleCancelTicket = async (registrationId: string) => {
    if (!window.confirm('Are you sure you want to cancel this ticket registration?')) return;
    setCancellingId(registrationId);
    try {
      await registrationsApi.cancelRegistration(registrationId);
      setTickets((prev) =>
        prev.map((t) => (t.id === registrationId ? { ...t, status: 'CANCELLED' as const } : t))
      );
      if (selectedTicket?.id === registrationId) {
        setSelectedTicket((prev) => (prev ? { ...prev, status: 'CANCELLED' as const } : null));
      }
    } catch (err: any) {
      alert(err.message || 'Failed to cancel ticket');
    } finally {
      setCancellingId(null);
    }
  };

  const activeTickets = tickets.filter((t) => t.status !== 'CANCELLED');
  const pastOrCancelledTickets = tickets.filter((t) => t.status === 'CANCELLED');

  return (
    <div className="min-h-screen bg-cream-50 text-botanical-700 py-10">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-cream-200 pb-6">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-serif text-3xl font-bold text-botanical-900">My Digital Passes</h1>
              <span className="px-3 py-0.5 rounded-full text-xs font-semibold bg-sage-100 text-sage-800 border border-sage-200">
                {activeTickets.length} Active
              </span>
            </div>
            <p className="text-botanical-500 text-xs sm:text-sm mt-1">
              Access your cryptographic QR admission passes, event schedules, and venue directions
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={fetchTickets}
              disabled={loading}
              className="p-2.5 rounded-natural bg-cream-100 border border-cream-200 hover:bg-cream-200 text-botanical-700 transition-colors shadow-sm"
              title="Refresh Passes"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
            <Link
              to="/events"
              className="btn-primary text-xs"
            >
              Explore Gatherings
            </Link>
          </div>
        </div>

        {error && (
          <div className="p-4 rounded-natural bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-3">
            <AlertCircle className="w-5 h-5 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {loading ? (
          <div className="py-20 text-center text-botanical-500">
            <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-3 text-sage-600" />
            <p className="text-xs">Fetching your digital passes...</p>
          </div>
        ) : tickets.length === 0 ? (
          <div className="py-20 text-center bg-cream-100/60 border border-cream-200 rounded-natural p-8 shadow-soft-natural">
            <Ticket className="w-12 h-12 text-botanical-400 mx-auto mb-3" />
            <h3 className="font-serif text-base font-semibold text-botanical-900">No Passes Yet</h3>
            <p className="text-xs text-botanical-500 mt-1 max-w-sm mx-auto mb-6">
              You haven't registered for any events yet. Explore upcoming summits, workshops, and concerts.
            </p>
            <Link
              to="/events"
              className="btn-primary text-xs"
            >
              Browse Event Directory
            </Link>
          </div>
        ) : (
          <div className="space-y-8">
            {/* Active Passes Grid */}
            <div>
              <h2 className="font-serif text-lg font-bold text-botanical-900 mb-4 flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-sage-600" />
                <span>Upcoming & Active Passes</span>
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {activeTickets.map((ticket) => {
                  const isCheckedIn = ticket.status === 'CHECKED_IN';
                  return (
                    <div
                      key={ticket.id}
                      className="group bg-cream-100/90 border border-cream-200 hover:border-sage-300 rounded-natural overflow-hidden shadow-soft-natural hover:shadow-elevated-natural transition-all duration-300 flex flex-col justify-between"
                    >
                      <div>
                        {/* Card Header with Banner / Category */}
                        <div className="relative h-36 bg-cream-200 overflow-hidden">
                          {ticket.bannerImageUrl ? (
                            <img
                              src={ticket.bannerImageUrl}
                              alt={ticket.eventTitle || 'Event'}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                            />
                          ) : (
                            <div className="w-full h-full bg-gradient-to-tr from-sage-200 to-cream-200 flex items-center justify-center">
                              <Ticket className="w-10 h-10 text-sage-600" />
                            </div>
                          )}
                          <div className="absolute inset-0 bg-gradient-to-t from-cream-100 via-cream-100/40 to-transparent" />

                          {/* Status Badge */}
                          <div className="absolute top-3 right-3">
                            <span
                              className={`px-3 py-1 rounded-full text-xs font-semibold backdrop-blur-md shadow-sm ${
                                isCheckedIn
                                  ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                                  : 'bg-cream-50 text-sage-800 border border-cream-200'
                              }`}
                            >
                              {isCheckedIn ? 'Checked In' : 'Confirmed Pass'}
                            </span>
                          </div>

                          <div className="absolute bottom-3 left-4 right-4">
                            <span className="text-[10px] font-bold uppercase tracking-wider text-sage-800 bg-cream-50/90 px-2 py-0.5 rounded-full border border-cream-200">
                              {ticket.tierName || 'Standard Admission'}
                            </span>
                            <h3 className="font-serif text-lg font-bold text-botanical-900 mt-1 line-clamp-1">
                              {ticket.eventTitle || 'Event Pass'}
                            </h3>
                          </div>
                        </div>

                        {/* Card Content */}
                        <div className="p-5 space-y-3 text-xs text-botanical-700">
                          {ticket.startDate && (
                            <div className="flex items-center gap-2 text-botanical-600">
                              <Calendar className="w-4 h-4 text-sage-600 shrink-0" />
                              <span>{format(new Date(ticket.startDate), 'EEEE, MMMM d, yyyy')}</span>
                              <span className="text-botanical-400">&bull;</span>
                              <Clock className="w-3.5 h-3.5 text-botanical-400" />
                              <span>{format(new Date(ticket.startDate), 'hh:mm a')}</span>
                            </div>
                          )}

                          <div className="flex items-start gap-2 text-botanical-500">
                            {ticket.locationType === 'VIRTUAL' ? (
                              <>
                                <Wifi className="w-4 h-4 text-sage-600 shrink-0 mt-0.5" />
                                <span className="line-clamp-1">Virtual Online Access</span>
                              </>
                            ) : (
                              <>
                                <MapPin className="w-4 h-4 text-sage-600 shrink-0 mt-0.5" />
                                <span className="line-clamp-1">
                                  {ticket.venueName || ticket.venueAddress || ticket.venueCity || 'Venue TBA'}
                                </span>
                              </>
                            )}
                          </div>

                          {/* Ticket Code Tag */}
                          <div className="p-3 rounded-natural bg-cream-50 border border-cream-200 flex items-center justify-between shadow-sm">
                            <div>
                              <p className="text-[10px] text-botanical-500 uppercase font-mono tracking-wider">Admission Code</p>
                              <p className="text-sm font-mono font-bold text-sage-700 tracking-wider">
                                {ticket.ticketCode}
                              </p>
                            </div>
                            <button
                              onClick={() => setSelectedTicket(ticket)}
                              className="p-2 rounded-natural bg-cream-100 border border-cream-200 hover:bg-cream-200 text-botanical-700 transition-colors flex items-center gap-1.5 text-xs font-medium"
                            >
                              <QrCode className="w-4 h-4 text-sage-600" />
                              <span>View QR</span>
                            </button>
                          </div>
                        </div>
                      </div>

                      {/* Card Footer Actions */}
                      <div className="p-4 border-t border-cream-200 bg-cream-50 flex items-center justify-between text-xs">
                        <Link
                          to={`/events/${ticket.eventSlug || ticket.eventId}`}
                          className="text-botanical-600 hover:text-sage-700 font-medium inline-flex items-center gap-1 transition-colors"
                        >
                          <span>Event Details</span>
                          <ExternalLink className="w-3 h-3" />
                        </Link>

                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => setSelectedTicket(ticket)}
                            className="btn-primary text-xs py-1.5 px-3"
                          >
                            Digital Pass
                          </button>
                          {!isCheckedIn && (
                            <button
                              onClick={() => handleCancelTicket(ticket.id)}
                              disabled={cancellingId === ticket.id}
                              className="text-botanical-400 hover:text-red-600 p-1.5 transition-colors text-[11px]"
                              title="Cancel Ticket"
                            >
                              Cancel
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Cancelled Passes (if any) */}
            {pastOrCancelledTickets.length > 0 && (
              <div className="pt-6 border-t border-cream-200">
                <h3 className="text-xs font-semibold text-botanical-500 mb-3 uppercase tracking-wider">
                  Cancelled / Inactive Passes
                </h3>
                <div className="space-y-2">
                  {pastOrCancelledTickets.map((t) => (
                    <div
                      key={t.id}
                      className="p-3 rounded-natural bg-cream-100/40 border border-cream-200 flex items-center justify-between text-xs text-botanical-500"
                    >
                      <div className="flex items-center gap-2">
                        <XCircle className="w-4 h-4 text-botanical-400" />
                        <span className="text-botanical-700 font-medium">{t.eventTitle || 'Event'}</span>
                        <span>&bull;</span>
                        <span className="font-mono text-botanical-400">{t.ticketCode}</span>
                      </div>
                      <span className="text-[10px] font-semibold bg-red-50 text-red-700 border border-red-200 px-2 py-0.5 rounded-full">
                        CANCELLED
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* QR Ticket Modal */}
      {selectedTicket && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-botanical-900/40 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-lg relative">
            <button
              onClick={() => setSelectedTicket(null)}
              className="absolute -top-3 -right-3 z-10 p-2 rounded-full bg-cream-50 hover:bg-cream-200 text-botanical-700 shadow-elevated-natural border border-cream-200"
            >
              ✕
            </button>
            <QrTicketDisplay
              registration={selectedTicket}
              onClose={() => setSelectedTicket(null)}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default MyTicketsPage;
