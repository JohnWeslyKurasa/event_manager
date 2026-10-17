import React, { useState, useEffect } from 'react';
import { useParams, useSearchParams, useNavigate, Link } from 'react-router-dom';
import {
  ArrowLeft, CreditCard, CheckCircle2, Loader2, AlertCircle,
  Calendar, MapPin, Tag, User, Mail, Lock, ShieldCheck, Sparkles
} from 'lucide-react';
import { eventsApi, registrationsApi } from '../services/api';
import { Event, TicketTier } from '../types';
import { useAuth } from '../context/AuthContext';
import { format } from 'date-fns';

export const CheckoutPage: React.FC = () => {
  const { id: eventId } = useParams<{ id: string }>();
  const [searchParams] = useSearchParams();
  const tierId = searchParams.get('tierId');
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();

  const [event, setEvent] = useState<Event | null>(null);
  const [selectedTier, setSelectedTier] = useState<TicketTier | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<{ ticketCode: string; eventTitle: string } | null>(null);

  const [form, setForm] = useState({
    attendeeName: user?.fullName || '',
    attendeeEmail: user?.email || '',
    cardNumber: '4242 4242 4242 4242',
    cardExpiry: '12/28',
    cardCvc: '123',
  });

  useEffect(() => {
    if (!isAuthenticated) {
      navigate(`/login?redirect=/events/${eventId}/checkout`);
      return;
    }
    const fetchEvent = async () => {
      if (!eventId) return;
      try {
        const response = await eventsApi.getEventById(eventId);
        if (response.success && response.data) {
          setEvent(response.data);
          const tier = response.data.ticketTiers?.find((t) => t.id === tierId);
          setSelectedTier(tier || response.data.ticketTiers?.[0] || null);
        }
      } catch {
        setError('Failed to load event details.');
      } finally {
        setIsLoading(false);
      }
    };
    fetchEvent();
  }, [eventId, tierId, isAuthenticated, navigate]);

  useEffect(() => {
    if (user) {
      setForm((prev) => ({
        ...prev,
        attendeeName: prev.attendeeName || user.fullName,
        attendeeEmail: prev.attendeeEmail || user.email,
      }));
    }
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!event || !selectedTier || !user) return;

    setIsSubmitting(true);
    setError(null);

    try {
      const response = await registrationsApi.checkout({
        eventId: event.id,
        ticketTierId: selectedTier.id,
        attendeeName: form.attendeeName,
        attendeeEmail: form.attendeeEmail,
      });

      if (response.success && response.data) {
        setSuccess({
          ticketCode: response.data.ticketCode,
          eventTitle: event.title,
        });
      }
    } catch (err: any) {
      setError(err instanceof Error ? err.message : 'Checkout failed. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-cream-50 pt-24 flex items-center justify-center">
        <Loader2 size={24} className="animate-spin text-sage-600" />
      </div>
    );
  }

  // SUCCESS CONFIRMATION
  if (success) {
    return (
      <div className="min-h-screen bg-cream-50 pt-24 flex items-center justify-center px-4">
        <div className="text-center max-w-md animate-scale-in bg-cream-100 p-8 rounded-natural border border-cream-200 shadow-elevated-natural">
          <div className="w-16 h-16 bg-sage-100 text-sage-700 rounded-full flex items-center justify-center mx-auto mb-5 shadow-soft-natural">
            <CheckCircle2 size={36} />
          </div>
          <h1 className="font-serif text-2xl font-bold text-botanical-900 mb-2">Registration Confirmed</h1>
          <p className="text-xs text-botanical-500 mb-5">
            Your pass for <strong className="text-botanical-900">{success.eventTitle}</strong> has been secured.
          </p>
          <div className="bg-cream-50 border border-cream-300 rounded-natural p-4 mb-6 shadow-sm">
            <p className="text-[10px] text-botanical-500 uppercase tracking-wider mb-1">Your Admission Pass Code</p>
            <p className="font-mono font-bold text-xl text-sage-800 tracking-widest">{success.ticketCode}</p>
          </div>
          <div className="flex gap-3 justify-center">
            <Link to="/my-tickets" className="btn-primary text-xs">View My Passes</Link>
            <Link to="/events" className="btn-secondary text-xs">Explore More</Link>
          </div>
        </div>
      </div>
    );
  }

  if (!event || !selectedTier) {
    return (
      <div className="min-h-screen bg-cream-50 pt-24 flex items-center justify-center px-4">
        <div className="text-center bg-cream-100 p-8 rounded-natural border border-cream-200 shadow-soft-natural max-w-md">
          <AlertCircle size={40} className="text-red-500 mx-auto mb-3" />
          <p className="font-serif text-lg font-bold text-botanical-900 mb-2">Checkout Error</p>
          <p className="text-xs text-botanical-500 mb-5">{error || 'Could not load checkout details.'}</p>
          <Link to="/events" className="btn-primary text-xs">Back to Directory</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-cream-50 text-botanical-700 pt-16 pb-20">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8 border-b border-cream-200 pb-6">
          <Link
            to={`/events/${eventId}`}
            className="inline-flex items-center gap-1.5 text-botanical-500 hover:text-sage-700 text-xs mb-3 transition-colors font-medium"
          >
            <ArrowLeft size={14} /> Back to Gathering Details
          </Link>
          <h1 className="font-serif text-3xl font-bold text-botanical-900">Confirm Reservation</h1>
          <p className="text-xs text-botanical-500 mt-0.5">Finalize your attendee information and pass delivery</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
          {/* Checkout Form */}
          <div className="lg:col-span-3">
            <form onSubmit={handleSubmit} className="space-y-6">
              {error && (
                <div className="flex items-start gap-2.5 p-4 bg-red-50 border border-red-200 rounded-natural animate-fade-in text-red-700 text-xs">
                  <AlertCircle size={16} className="flex-shrink-0 mt-0.5" />
                  <p>{error}</p>
                </div>
              )}

              {/* Attendee Info */}
              <div className="bg-cream-100/90 border border-cream-200 rounded-natural p-6 shadow-soft-natural space-y-4">
                <h2 className="font-serif font-bold text-base text-botanical-900 flex items-center gap-2">
                  <User size={16} className="text-sage-600" /> Attendee Information
                </h2>
                <div className="space-y-3 text-xs">
                  <div>
                    <label htmlFor="checkout-name" className="input-label">Full Name *</label>
                    <input
                      id="checkout-name"
                      type="text"
                      value={form.attendeeName}
                      onChange={(e) => setForm((p) => ({ ...p, attendeeName: e.target.value }))}
                      placeholder="Your full name"
                      className="input-field text-xs"
                      required
                    />
                  </div>
                  <div>
                    <label htmlFor="checkout-email" className="input-label">Email Address *</label>
                    <input
                      id="checkout-email"
                      type="email"
                      value={form.attendeeEmail}
                      onChange={(e) => setForm((p) => ({ ...p, attendeeEmail: e.target.value }))}
                      placeholder="your@email.com"
                      className="input-field text-xs"
                      required
                    />
                    <p className="text-[11px] text-botanical-500 mt-1">Your cryptographic QR admission pass will be delivered here.</p>
                  </div>
                </div>
              </div>

              {/* Payment Simulation */}
              <div className="bg-cream-100/90 border border-cream-200 rounded-natural p-6 shadow-soft-natural space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="font-serif font-bold text-base text-botanical-900 flex items-center gap-2">
                    <CreditCard size={16} className="text-sage-600" /> Settlement Method
                  </h2>
                  <span className="text-[11px] text-botanical-500 flex items-center gap-1">
                    <Lock size={10} /> Test Environment
                  </span>
                </div>

                {selectedTier.price === 0 ? (
                  <div className="text-center py-5 bg-cream-50 rounded-natural border border-cream-200">
                    <p className="text-sage-800 font-semibold text-sm font-serif">Complimentary Admission</p>
                    <p className="text-botanical-500 text-xs mt-0.5">No charges apply to this ticket tier.</p>
                  </div>
                ) : (
                  <div className="space-y-3 text-xs">
                    <div>
                      <label htmlFor="card-number" className="input-label">Card Number</label>
                      <input
                        id="card-number"
                        type="text"
                        value={form.cardNumber}
                        onChange={(e) => setForm((p) => ({ ...p, cardNumber: e.target.value }))}
                        className="input-field font-mono text-xs"
                        maxLength={19}
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label htmlFor="card-expiry" className="input-label">Expiry Date</label>
                        <input
                          id="card-expiry"
                          type="text"
                          value={form.cardExpiry}
                          onChange={(e) => setForm((p) => ({ ...p, cardExpiry: e.target.value }))}
                          placeholder="MM/YY"
                          className="input-field text-xs"
                        />
                      </div>
                      <div>
                        <label htmlFor="card-cvc" className="input-label">CVC</label>
                        <input
                          id="card-cvc"
                          type="text"
                          value={form.cardCvc}
                          onChange={(e) => setForm((p) => ({ ...p, cardCvc: e.target.value }))}
                          placeholder="123"
                          className="input-field text-xs"
                          maxLength={4}
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="btn-primary w-full py-3.5 text-xs shadow-soft-natural"
                id="complete-checkout-button"
              >
                {isSubmitting ? (
                  <><Loader2 size={16} className="animate-spin" /> Confirming Reservation...</>
                ) : (
                  <>
                    <ShieldCheck size={16} />
                    {selectedTier.price === 0 ? 'Complete Complimentary Registration' : `Authorize $${Number(selectedTier.price).toFixed(2)} & Reserve Pass`}
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Order Summary Sidebar */}
          <div className="lg:col-span-2">
            <div className="bg-cream-100/90 border border-cream-200 rounded-natural p-6 shadow-elevated-natural sticky top-24 space-y-4">
              <h3 className="font-serif font-bold text-base text-botanical-900">Reservation Summary</h3>

              {event.bannerImageUrl && (
                <img
                  src={event.bannerImageUrl}
                  alt={event.title}
                  className="w-full h-32 object-cover rounded-natural border border-cream-200"
                />
              )}

              <h4 className="font-serif font-bold text-botanical-900 text-sm leading-snug">{event.title}</h4>

              <div className="space-y-2 text-xs text-botanical-600">
                <div className="flex items-center gap-2">
                  <Calendar size={13} className="text-sage-600" />
                  <span>{format(new Date(event.startDate), 'EEE, MMM d, yyyy · h:mm a')}</span>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin size={13} className="text-sage-600" />
                  <span>{event.locationType === 'VIRTUAL' ? 'Virtual Online Stream' : (event.venueCity || event.venueName || 'Venue TBA')}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Tag size={13} className="text-sage-600" />
                  <span className="font-semibold text-botanical-900">{selectedTier.name}</span>
                </div>
              </div>

              <div className="border-t border-cream-200 pt-4 space-y-2 text-xs text-botanical-600">
                <div className="flex justify-between">
                  <span>{selectedTier.name} × 1</span>
                  <span className="font-medium text-botanical-900">
                    {selectedTier.price === 0 ? 'Free' : `$${Number(selectedTier.price).toFixed(2)}`}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Processing & Gate Validation</span>
                  <span className="text-sage-700 font-medium">$0.00</span>
                </div>
                <div className="flex justify-between font-serif font-bold text-botanical-900 text-base pt-2 border-t border-cream-200">
                  <span>Total</span>
                  <span className="text-sage-800">
                    {selectedTier.price === 0 ? 'Free' : `$${Number(selectedTier.price).toFixed(2)}`}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CheckoutPage;
