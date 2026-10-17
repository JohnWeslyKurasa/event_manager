import React, { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Plus, Calendar, Users, DollarSign, QrCode, Sparkles,
  BarChart3, Edit3, Trash2, CheckCircle2, AlertCircle,
  ExternalLink, Search, Download, RefreshCw, Send, Copy, Check,
  Mail, Share2, Crown, Bell
} from 'lucide-react';
import { eventsApi, aiApi } from '../services/api';
import { Event, Registration } from '../types';
import { useAuth } from '../context/AuthContext';
import AnalyticsOverviewCard from '../components/AnalyticsOverviewCard';
import { format } from 'date-fns';

export const DashboardPage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Attendees Modal State
  const [selectedEventForAttendees, setSelectedEventForAttendees] = useState<Event | null>(null);
  const [attendees, setAttendees] = useState<Registration[]>([]);
  const [loadingAttendees, setLoadingAttendees] = useState(false);
  const [attendeeSearch, setAttendeeSearch] = useState('');

  // AI Marketing Copy Modal State
  const [marketingEvent, setMarketingEvent] = useState<Event | null>(null);
  const [copyType, setCopyType] = useState<'EMAIL_ANNOUNCEMENT' | 'SOCIAL_THREAD' | 'VIP_INVITE' | 'REMINDER_URGENT'>('EMAIL_ANNOUNCEMENT');
  const [targetAudience, setTargetAudience] = useState('');
  const [generatingCopy, setGeneratingCopy] = useState(false);
  const [generatedCopy, setGeneratedCopy] = useState('');
  const [copied, setCopied] = useState(false);

  // Action status state
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);

  const fetchOrganizerData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await eventsApi.getOrganizerEvents();
      if (res.data) {
        setEvents(res.data);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to fetch organizer events');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchOrganizerData();
  }, [fetchOrganizerData]);

  // Aggregate Metrics
  const totalEvents = events.length;
  const totalTicketsSold = events.reduce((acc, evt) => acc + (evt.ticketsSold || 0), 0);
  const totalGrossRevenue = events.reduce((acc, evt) => acc + (Number(evt.totalRevenue) || 0), 0);
  const publishedEvents = events.filter((e) => e.status === 'PUBLISHED').length;

  // Handlers
  const handlePublish = async (eventId: string) => {
    setActionLoadingId(eventId);
    try {
      await eventsApi.publishEvent(eventId);
      await fetchOrganizerData();
    } catch (err: any) {
      alert(err.message || 'Failed to publish event');
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleDelete = async (eventId: string, title: string) => {
    if (!window.confirm(`Are you sure you want to delete "${title}"? This cannot be undone.`)) return;
    setActionLoadingId(eventId);
    try {
      await eventsApi.deleteEvent(eventId);
      setEvents((prev) => prev.filter((e) => e.id !== eventId));
    } catch (err: any) {
      alert(err.message || 'Failed to delete event');
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleOpenAttendees = async (event: Event) => {
    setSelectedEventForAttendees(event);
    setLoadingAttendees(true);
    try {
      const res = await eventsApi.getEventAttendees(event.id);
      if (res.data) {
        setAttendees(res.data);
      }
    } catch (err) {
      console.error('Failed to load attendees', err);
    } finally {
      setLoadingAttendees(false);
    }
  };

  const exportAttendeesCSV = () => {
    if (!attendees.length || !selectedEventForAttendees) return;
    const headers = ['Ticket Code', 'Attendee Name', 'Attendee Email', 'Tier', 'Status', 'Paid Amount', 'Registered At'];
    const rows = attendees.map((att) => [
      att.ticketCode,
      `"${att.attendeeName}"`,
      att.attendeeEmail,
      `"${att.tierName || 'Standard'}"`,
      att.status,
      att.amountPaid,
      att.createdAt,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `${selectedEventForAttendees.slug}-attendees.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleGenerateMarketingCopy = async () => {
    if (!marketingEvent) return;
    setGeneratingCopy(true);
    setGeneratedCopy('');
    try {
      const res = await aiApi.generateMarketingCopy({
        eventId: marketingEvent.id,
        copyType,
        targetAudience: targetAudience || undefined,
      });
      if (res.data) {
        setGeneratedCopy(res.data.content);
      }
    } catch (err: any) {
      alert(err.message || 'Failed to generate marketing copy with AI');
    } finally {
      setGeneratingCopy(false);
    }
  };

  const handleCopyText = () => {
    navigator.clipboard.writeText(generatedCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const filteredAttendees = attendees.filter(
    (att) =>
      att.attendeeName.toLowerCase().includes(attendeeSearch.toLowerCase()) ||
      att.attendeeEmail.toLowerCase().includes(attendeeSearch.toLowerCase()) ||
      att.ticketCode.toLowerCase().includes(attendeeSearch.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-cream-50 text-botanical-700 py-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Header section */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-cream-200 pb-6">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-serif text-3xl font-bold text-botanical-900">Organizer Hub</h1>
              <span className="px-3 py-0.5 rounded-full text-xs font-semibold bg-sage-100 text-sage-800 border border-sage-200">
                PRO
              </span>
            </div>
            <p className="text-botanical-500 text-xs sm:text-sm mt-1">
              Welcome back, <span className="text-botanical-900 font-medium">{user?.fullName}</span> &bull; {user?.organizationName || 'Event Curator'}
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={fetchOrganizerData}
              disabled={loading}
              className="p-2.5 rounded-natural bg-cream-100 border border-cream-200 hover:bg-cream-200 text-botanical-700 transition-colors shadow-sm"
              title="Refresh Data"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
            <Link
              to="/events/create"
              className="btn-primary text-xs"
            >
              <Plus className="w-4 h-4" />
              <span>Create Event</span>
            </Link>
          </div>
        </div>

        {/* Metrics Overview Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-cream-100/90 border border-cream-200 rounded-natural p-5 shadow-soft-natural">
            <div className="flex items-center justify-between">
              <p className="text-xs font-semibold uppercase tracking-wider text-botanical-500">Total Events</p>
              <Calendar className="w-4 h-4 text-sage-600" />
            </div>
            <p className="font-serif text-2xl font-bold text-botanical-900 mt-2">{totalEvents}</p>
            <p className="text-xs text-sage-700 mt-1">{publishedEvents} published & live</p>
          </div>

          <div className="bg-cream-100/90 border border-cream-200 rounded-natural p-5 shadow-soft-natural">
            <div className="flex items-center justify-between">
              <p className="text-xs font-semibold uppercase tracking-wider text-botanical-500">Tickets Sold</p>
              <Users className="w-4 h-4 text-sage-600" />
            </div>
            <p className="font-serif text-2xl font-bold text-botanical-900 mt-2">{totalTicketsSold.toLocaleString()}</p>
            <p className="text-xs text-botanical-500 mt-1">Across all passes</p>
          </div>

          <div className="bg-cream-100/90 border border-cream-200 rounded-natural p-5 shadow-soft-natural">
            <div className="flex items-center justify-between">
              <p className="text-xs font-semibold uppercase tracking-wider text-botanical-500">Gross Settlements</p>
              <DollarSign className="w-4 h-4 text-sand-600" />
            </div>
            <p className="font-serif text-2xl font-bold text-botanical-900 mt-2">
              ${totalGrossRevenue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </p>
            <p className="text-xs text-botanical-500 mt-1">Simulated Net Volume</p>
          </div>

          <div className="bg-cream-100/90 border border-cream-200 rounded-natural p-5 shadow-soft-natural">
            <div className="flex items-center justify-between">
              <p className="text-xs font-semibold uppercase tracking-wider text-botanical-500">Gate Console</p>
              <QrCode className="w-4 h-4 text-sage-600" />
            </div>
            <p className="font-serif text-2xl font-bold text-sage-700 mt-2">Ready</p>
            <p className="text-xs text-botanical-500 mt-1">Real-time QR verification</p>
          </div>
        </div>

        {/* Events Table / List Section */}
        <div className="bg-cream-100/90 border border-cream-200 rounded-natural overflow-hidden shadow-soft-natural">
          <div className="p-6 border-b border-cream-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="font-serif text-xl font-bold text-botanical-900">Managed Gatherings</h2>
              <p className="text-xs text-botanical-500 mt-0.5">Control publishing, monitor attendee capacity, and trigger AI tools</p>
            </div>
            <span className="text-xs font-medium text-botanical-700 bg-cream-200/60 px-3 py-1 rounded-full border border-cream-300">
              {events.length} {events.length === 1 ? 'Event' : 'Events'} Total
            </span>
          </div>

          {error && (
            <div className="m-6 p-4 rounded-natural bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-3">
              <AlertCircle className="w-5 h-5 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {loading ? (
            <div className="p-12 text-center text-botanical-500">
              <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-sage-600" />
              <p className="text-xs">Loading event roster...</p>
            </div>
          ) : events.length === 0 ? (
            <div className="p-16 text-center">
              <Calendar className="w-12 h-12 text-botanical-400 mx-auto mb-3" />
              <h3 className="font-serif text-base font-semibold text-botanical-900">No events created yet</h3>
              <p className="text-xs text-botanical-500 mt-1 max-w-sm mx-auto mb-6">
                Start by crafting your first conference, summit or retreat using our AI builder.
              </p>
              <Link
                to="/events/create"
                className="btn-primary text-xs"
              >
                <Plus className="w-4 h-4" />
                Create First Event
              </Link>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-botanical-700">
                <thead className="uppercase bg-cream-200/60 text-botanical-500 border-b border-cream-200 text-[11px] font-semibold tracking-wider">
                  <tr>
                    <th scope="col" className="px-6 py-4">Event Details</th>
                    <th scope="col" className="px-6 py-4">Schedule</th>
                    <th scope="col" className="px-6 py-4">Status</th>
                    <th scope="col" className="px-6 py-4">Sold / Cap</th>
                    <th scope="col" className="px-6 py-4">Gross Revenue</th>
                    <th scope="col" className="px-6 py-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-cream-200/80">
                  {events.map((evt) => {
                    const isSoldOut = evt.ticketsSold >= evt.totalCapacity && evt.totalCapacity > 0;
                    return (
                      <tr key={evt.id} className="hover:bg-cream-200/40 transition-colors">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-12 h-12 rounded-natural overflow-hidden bg-cream-200 shrink-0 border border-cream-300">
                              {evt.bannerImageUrl ? (
                                <img src={evt.bannerImageUrl} alt={evt.title} className="w-full h-full object-cover" />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center text-botanical-400">
                                  <Calendar className="w-5 h-5" />
                                </div>
                              )}
                            </div>
                            <div>
                              <Link
                                to={`/events/${evt.slug || evt.id}`}
                                className="font-semibold text-botanical-900 hover:text-sage-700 transition-colors line-clamp-1"
                              >
                                {evt.title}
                              </Link>
                              <span className="text-[11px] text-botanical-500 line-clamp-1">{evt.category.replace('_', ' ')}</span>
                            </div>
                          </div>
                        </td>

                        <td className="px-6 py-4 whitespace-nowrap text-xs text-botanical-500">
                          {format(new Date(evt.startDate), 'MMM dd, yyyy')}
                          <br />
                          <span className="text-botanical-400">{format(new Date(evt.startDate), 'hh:mm a')}</span>
                        </td>

                        <td className="px-6 py-4 whitespace-nowrap">
                          <span
                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-medium border ${
                              evt.status === 'PUBLISHED'
                                ? 'bg-sage-100 text-sage-800 border-sage-200'
                                : evt.status === 'DRAFT'
                                ? 'bg-amber-50 text-amber-700 border-amber-200'
                                : 'bg-cream-200 text-botanical-600 border-cream-300'
                            }`}
                          >
                            {evt.status}
                          </span>
                        </td>

                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="space-y-1">
                            <span className="text-xs font-mono font-medium text-botanical-900">
                              {evt.ticketsSold} / {evt.totalCapacity}
                            </span>
                            <div className="w-24 h-1.5 bg-cream-200 rounded-full overflow-hidden">
                              <div
                                className={`h-full rounded-full ${isSoldOut ? 'bg-red-500' : 'bg-sage-600'}`}
                                style={{
                                  width: `${evt.totalCapacity > 0 ? Math.min(100, (evt.ticketsSold / evt.totalCapacity) * 100) : 0}%`,
                                }}
                              />
                            </div>
                          </div>
                        </td>

                        <td className="px-6 py-4 whitespace-nowrap font-mono text-xs font-semibold text-sage-700">
                          ${(Number(evt.totalRevenue) || 0).toFixed(2)}
                        </td>

                        <td className="px-6 py-4 whitespace-nowrap text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            {/* Check-in scanner button */}
                            <Link
                              to={`/check-in/${evt.id}`}
                              className="p-1.5 rounded-lg bg-cream-50 hover:bg-cream-200 text-sage-700 transition-colors border border-cream-200"
                              title="Open QR Scanner"
                            >
                              <QrCode className="w-4 h-4" />
                            </Link>

                            {/* AI Marketing Copy generator */}
                            <button
                              onClick={() => {
                                setMarketingEvent(evt);
                                setGeneratedCopy('');
                              }}
                              className="p-1.5 rounded-lg bg-cream-50 hover:bg-cream-200 text-sand-700 transition-colors border border-cream-200"
                              title="Generate AI Marketing Copy"
                            >
                              <Sparkles className="w-4 h-4" />
                            </button>

                            {/* View Attendees */}
                            <button
                              onClick={() => handleOpenAttendees(evt)}
                              className="p-1.5 rounded-lg bg-cream-50 hover:bg-cream-200 text-botanical-700 transition-colors border border-cream-200"
                              title="View Attendees"
                            >
                              <Users className="w-4 h-4" />
                            </button>

                            {/* Publish toggle */}
                            {evt.status === 'DRAFT' && (
                              <button
                                onClick={() => handlePublish(evt.id)}
                                disabled={actionLoadingId === evt.id}
                                className="px-2.5 py-1 rounded-natural bg-sage-600 hover:bg-sage-700 text-cream-50 text-xs font-semibold transition-colors shadow-sm"
                              >
                                {actionLoadingId === evt.id ? '...' : 'Publish'}
                              </button>
                            )}

                            {/* Delete */}
                            <button
                              onClick={() => handleDelete(evt.id, evt.title)}
                              disabled={actionLoadingId === evt.id}
                              className="p-1.5 rounded-lg bg-cream-50 hover:bg-red-50 text-botanical-400 hover:text-red-600 transition-colors border border-cream-200"
                              title="Delete Event"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Attendees Modal */}
      {selectedEventForAttendees && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-botanical-900/40 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-4xl bg-cream-50 border border-cream-200 rounded-natural shadow-elevated-natural overflow-hidden flex flex-col max-h-[90vh]">
            <div className="p-6 border-b border-cream-200 flex items-center justify-between bg-cream-100/50">
              <div>
                <h3 className="font-serif text-lg font-bold text-botanical-900">Attendees Roster</h3>
                <p className="text-xs text-botanical-500">{selectedEventForAttendees.title}</p>
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={exportAttendeesCSV}
                  disabled={attendees.length === 0}
                  className="btn-secondary text-xs py-1.5 px-3"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Export CSV</span>
                </button>
                <button
                  onClick={() => setSelectedEventForAttendees(null)}
                  className="p-1.5 rounded-lg hover:bg-cream-200 text-botanical-500 hover:text-botanical-900"
                >
                  ✕
                </button>
              </div>
            </div>

            <div className="p-4 border-b border-cream-200 bg-cream-50">
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-botanical-400" />
                <input
                  type="text"
                  placeholder="Search attendee by name, email or ticket code..."
                  value={attendeeSearch}
                  onChange={(e) => setAttendeeSearch(e.target.value)}
                  className="input-field pl-9 pr-4 py-2 text-xs"
                />
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-4 bg-cream-50">
              {loadingAttendees ? (
                <div className="py-12 text-center text-botanical-500">
                  <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-sage-600" />
                  <p className="text-xs">Fetching attendees...</p>
                </div>
              ) : filteredAttendees.length === 0 ? (
                <div className="py-12 text-center text-botanical-500 text-xs">
                  No attendees matching your search.
                </div>
              ) : (
                <table className="w-full text-left text-xs text-botanical-700">
                  <thead className="bg-cream-100 uppercase text-botanical-500 border-b border-cream-200 text-[10px] font-semibold">
                    <tr>
                      <th className="px-4 py-2.5">Ticket Code</th>
                      <th className="px-4 py-2.5">Attendee</th>
                      <th className="px-4 py-2.5">Tier</th>
                      <th className="px-4 py-2.5">Status</th>
                      <th className="px-4 py-2.5">Amount</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-cream-200">
                    {filteredAttendees.map((att) => (
                      <tr key={att.id} className="hover:bg-cream-100/60">
                        <td className="px-4 py-3 font-mono font-bold text-sage-700">{att.ticketCode}</td>
                        <td className="px-4 py-3">
                          <p className="font-semibold text-botanical-900">{att.attendeeName}</p>
                          <p className="text-botanical-500 text-[11px]">{att.attendeeEmail}</p>
                        </td>
                        <td className="px-4 py-3">{att.tierName || 'Standard Pass'}</td>
                        <td className="px-4 py-3">
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                              att.status === 'CHECKED_IN'
                                ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                                : 'bg-sage-100 text-sage-800 border border-sage-200'
                            }`}
                          >
                            {att.status}
                          </span>
                        </td>
                        <td className="px-4 py-3 font-mono font-semibold text-botanical-900">${att.amountPaid}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </div>
      )}

      {/* AI Marketing Copy Generator Modal */}
      {marketingEvent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-botanical-900/40 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-2xl bg-cream-50 border border-cream-200 rounded-natural shadow-elevated-natural p-6 space-y-6">
            <div className="flex items-center justify-between border-b border-cream-200 pb-4">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-full bg-sand-100 text-sand-700 flex items-center justify-center">
                  <Sparkles className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-serif text-base font-bold text-botanical-900">AI Marketing Copy Generator</h3>
                  <p className="text-xs text-botanical-500">{marketingEvent.title}</p>
                </div>
              </div>
              <button
                onClick={() => setMarketingEvent(null)}
                className="p-1 rounded-lg text-botanical-500 hover:text-botanical-900"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-botanical-700 mb-1.5">Copy Format & Channel</label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {[
                    { id: 'EMAIL_ANNOUNCEMENT', label: 'Email Announcement', icon: Mail },
                    { id: 'SOCIAL_THREAD', label: 'Social Thread', icon: Share2 },
                    { id: 'VIP_INVITE', label: 'VIP Invitation', icon: Crown },
                    { id: 'REMINDER_URGENT', label: 'Urgent Alert', icon: Bell },
                  ].map((format) => {
                    const FormatIcon = format.icon;
                    return (
                      <button
                        key={format.id}
                        type="button"
                        onClick={() => setCopyType(format.id as any)}
                        className={`p-2.5 rounded-natural border text-xs font-medium text-center transition-all flex items-center justify-center gap-1.5 ${
                          copyType === format.id
                            ? 'bg-sage-600 text-cream-50 border-sage-600 shadow-sm'
                            : 'bg-cream-100 border-cream-200 text-botanical-700 hover:bg-cream-200'
                        }`}
                      >
                        <FormatIcon className="w-3.5 h-3.5" />
                        <span>{format.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-botanical-700 mb-1.5">Target Audience / Focus Angle (Optional)</label>
                <input
                  type="text"
                  placeholder="e.g. Senior Developers, Founders, Early-bird discount buyers..."
                  value={targetAudience}
                  onChange={(e) => setTargetAudience(e.target.value)}
                  className="input-field text-xs"
                />
              </div>

              <button
                onClick={handleGenerateMarketingCopy}
                disabled={generatingCopy}
                className="btn-primary w-full text-xs shadow-soft-natural"
              >
                {generatingCopy ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Writing Copy with Gemini...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    <span>Generate Campaign Copy</span>
                  </>
                )}
              </button>

              {generatedCopy && (
                <div className="relative mt-4 p-4 rounded-natural bg-cream-100 border border-cream-200 text-xs text-botanical-800 whitespace-pre-wrap leading-relaxed max-h-60 overflow-y-auto shadow-inner">
                  <button
                    onClick={handleCopyText}
                    className="absolute top-3 right-3 p-1.5 rounded-lg bg-cream-50 hover:bg-cream-200 text-botanical-700 text-[11px] flex items-center gap-1 border border-cream-200 shadow-sm"
                  >
                    {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copied ? 'Copied!' : 'Copy'}</span>
                  </button>
                  {generatedCopy}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DashboardPage;
