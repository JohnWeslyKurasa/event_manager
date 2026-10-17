import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { QrCode, ArrowLeft, Calendar, Users, AlertCircle, RefreshCw, CheckCircle2 } from 'lucide-react';
import CheckInScannerConsole from '../components/CheckInScannerConsole';
import { eventsApi } from '../services/api';
import { Event } from '../types';

export const CheckInPage: React.FC = () => {
  const { eventId } = useParams<{ eventId?: string }>();

  const [organizerEvents, setOrganizerEvents] = useState<Event[]>([]);
  const [selectedEventId, setSelectedEventId] = useState<string>(eventId || '');
  const [currentEvent, setCurrentEvent] = useState<Event | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadEvents = async () => {
      setLoading(true);
      try {
        const res = await eventsApi.getOrganizerEvents();
        if (res.data) {
          setOrganizerEvents(res.data);
          if (!selectedEventId && res.data.length > 0) {
            setSelectedEventId(res.data[0].id);
          }
        }
      } catch (err) {
        console.error('Failed to load organizer events', err);
      } finally {
        setLoading(false);
      }
    };
    loadEvents();
  }, []);

  useEffect(() => {
    if (selectedEventId) {
      const match = organizerEvents.find((e) => e.id === selectedEventId);
      setCurrentEvent(match || null);
    }
  }, [selectedEventId, organizerEvents]);

  return (
    <div className="min-h-screen bg-cream-50 text-botanical-800 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        {/* Header Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-cream-200 pb-5">
          <div className="flex items-center gap-3">
            <Link
              to="/dashboard"
              className="p-2 rounded-natural bg-cream-100 border border-cream-200 hover:bg-cream-200 text-botanical-700 hover:text-botanical-900 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
            </Link>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-serif font-bold text-botanical-900">Live Check-In Scanner</h1>
                <span className="flex h-2.5 w-2.5 relative">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-sage-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-sage-600"></span>
                </span>
              </div>
              <p className="text-xs text-botanical-500 mt-0.5">High-speed QR validation console for door staff and entry gates</p>
            </div>
          </div>

          {/* Event Selector Dropdown */}
          <div className="w-full sm:w-72">
            <select
              value={selectedEventId}
              onChange={(e) => setSelectedEventId(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-white border border-cream-200 rounded-natural text-xs text-botanical-900 focus:outline-none focus:border-sage-500 font-medium"
            >
              {organizerEvents.map((evt) => (
                <option key={evt.id} value={evt.id}>
                  {evt.title} ({evt.ticketsSold} tickets)
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Selected Event Details Strip */}
        {currentEvent && (
          <div className="p-4 rounded-natural bg-white border border-cream-200 shadow-soft flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs">
            <div className="space-y-1">
              <h2 className="font-serif font-bold text-botanical-900 text-sm">{currentEvent.title}</h2>
              <p className="text-botanical-600">
                {currentEvent.venueName || currentEvent.venueAddress || currentEvent.venueCity || 'Virtual Access Stream'}
              </p>
            </div>

            <div className="flex items-center gap-6">
              <div>
                <p className="text-botanical-500 text-[10px] uppercase">Registered</p>
                <p className="font-bold font-mono text-botanical-900 text-sm">{currentEvent.ticketsSold} Attendees</p>
              </div>
              <div>
                <p className="text-botanical-500 text-[10px] uppercase">Capacity Limit</p>
                <p className="font-bold font-mono text-sage-700 text-sm">{currentEvent.totalCapacity}</p>
              </div>
            </div>
          </div>
        )}

        {/* Scanner Console Container */}
        {selectedEventId ? (
          <CheckInScannerConsole eventId={selectedEventId} />
        ) : (
          <div className="py-20 text-center bg-cream-100/50 rounded-natural border border-cream-200 p-8">
            <QrCode className="w-12 h-12 text-botanical-400 mx-auto mb-3" />
            <h3 className="text-base font-serif font-bold text-botanical-900">No Event Selected</h3>
            <p className="text-xs text-botanical-500 mt-1 max-w-sm mx-auto">
              Please create or publish an event to start scanning tickets.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default CheckInPage;
