import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Sparkles, Plus, Trash2, Calendar, MapPin, Globe,
  DollarSign, Tag, Image, Clock, Info, Check, Loader2,
  AlertCircle, ArrowLeft
} from 'lucide-react';
import { eventsApi } from '../services/api';
import { EVENT_CATEGORIES, AiEventBlueprint } from '../types';
import AiEventGeneratorModal from '../components/AiEventGeneratorModal';

interface TicketTierInput {
  name: string;
  price: number;
  capacity: number;
  description: string;
  perks: string[];
}

export const EventCreatePage: React.FC = () => {
  const navigate = useNavigate();

  // Form State
  const [title, setTitle] = useState('');
  const [tagline, setTagline] = useState('');
  const [category, setCategory] = useState<string>(EVENT_CATEGORIES[0].value);
  const [description, setDescription] = useState('');
  const [locationType, setLocationType] = useState<'VENUE_IN_PERSON' | 'VIRTUAL' | 'HYBRID'>('VENUE_IN_PERSON');
  const [venueName, setVenueName] = useState('');
  const [venueAddress, setVenueAddress] = useState('');
  const [venueCity, setVenueCity] = useState('');
  const [virtualLink, setVirtualLink] = useState('');
  const [bannerImageUrl, setBannerImageUrl] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  // Ticket Tiers State
  const [ticketTiers, setTicketTiers] = useState<TicketTierInput[]>([
    {
      name: 'General Admission',
      price: 0,
      capacity: 100,
      description: 'Standard event access and keynote entry',
      perks: ['Full Session Access', 'Digital Certificate'],
    },
  ]);

  // AI Modal & Form Submission State
  const [showAiModal, setShowAiModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Add & Remove Ticket Tier
  const handleAddTier = () => {
    setTicketTiers((prev) => [
      ...prev,
      {
        name: 'VIP All-Access',
        price: 99,
        capacity: 50,
        description: 'Priority seating and private networking reception',
        perks: ['VIP Lounge Access', 'Exclusive Q&A Session', 'Gift Bag'],
      },
    ]);
  };

  const handleRemoveTier = (index: number) => {
    if (ticketTiers.length === 1) {
      alert('You must have at least one ticket tier.');
      return;
    }
    setTicketTiers((prev) => prev.filter((_, i) => i !== index));
  };

  const handleUpdateTier = (index: number, field: keyof TicketTierInput, value: any) => {
    setTicketTiers((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      return updated;
    });
  };

  const handleUpdateTierPerk = (tierIndex: number, perkIndex: number, val: string) => {
    setTicketTiers((prev) => {
      const updated = [...prev];
      const perks = [...updated[tierIndex].perks];
      perks[perkIndex] = val;
      updated[tierIndex] = { ...updated[tierIndex], perks };
      return updated;
    });
  };

  const handleAddTierPerk = (tierIndex: number) => {
    setTicketTiers((prev) => {
      const updated = [...prev];
      updated[tierIndex] = {
        ...updated[tierIndex],
        perks: [...updated[tierIndex].perks, 'New Perk'],
      };
      return updated;
    });
  };

  const handleRemoveTierPerk = (tierIndex: number, perkIndex: number) => {
    setTicketTiers((prev) => {
      const updated = [...prev];
      updated[tierIndex] = {
        ...updated[tierIndex],
        perks: updated[tierIndex].perks.filter((_, i) => i !== perkIndex),
      };
      return updated;
    });
  };

  // AI Blueprint Injection Callback
  const handleApplyAiBlueprint = (blueprint: AiEventBlueprint) => {
    if (blueprint.title) setTitle(blueprint.title);
    if (blueprint.tagline) setTagline(blueprint.tagline);
    if (blueprint.description) setDescription(blueprint.description);
    if (blueprint.suggestedCategories && blueprint.suggestedCategories.length > 0) {
      const match = EVENT_CATEGORIES.find((c) =>
        c.value.toLowerCase().includes(blueprint.suggestedCategories![0].toLowerCase())
      );
      if (match) setCategory(match.value);
    }
    if (blueprint.ticketTiers && blueprint.ticketTiers.length > 0) {
      setTicketTiers(
        blueprint.ticketTiers.map((t) => ({
          name: t.name,
          price: t.price || 0,
          capacity: t.capacity || 100,
          description: t.description || '',
          perks: t.perks && t.perks.length > 0 ? t.perks : ['General Admission'],
        }))
      );
    }
    setShowAiModal(false);
  };

  // Form Submit Handler
  const handleSubmit = async (e: React.FormEvent, publishImmediately: boolean = false) => {
    e.preventDefault();
    setError(null);

    if (!title.trim()) {
      setError('Event title is required.');
      return;
    }
    if (!description.trim()) {
      setError('Event description is required.');
      return;
    }
    if (!startDate || !endDate) {
      setError('Start date and End date are required.');
      return;
    }
    if (new Date(endDate) <= new Date(startDate)) {
      setError('End date must be after the start date.');
      return;
    }
    if (ticketTiers.length === 0) {
      setError('At least one ticket tier is required.');
      return;
    }

    setSubmitting(true);
    try {
      const totalCapacity = ticketTiers.reduce((acc, t) => acc + (Number(t.capacity) || 0), 0);
      const payload = {
        title,
        tagline: tagline || undefined,
        category,
        description,
        locationType,
        venueName: venueName || undefined,
        venueAddress: venueAddress || undefined,
        venueCity: venueCity || undefined,
        virtualLink: virtualLink || undefined,
        bannerImageUrl: bannerImageUrl || undefined,
        startDate: new Date(startDate).toISOString(),
        endDate: new Date(endDate).toISOString(),
        totalCapacity,
        status: publishImmediately ? 'PUBLISHED' : 'DRAFT',
        ticketTiers: ticketTiers.map((t) => ({
          name: t.name,
          price: Number(t.price) || 0,
          capacity: Number(t.capacity) || 100,
          description: t.description,
          perks: t.perks.filter((p) => p.trim().length > 0),
        })),
      };

      const res = await eventsApi.createEvent(payload);
      if (res.data) {
        navigate(`/dashboard`);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to create event.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-cream-50 text-botanical-800 py-10">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Top Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-cream-200 pb-6">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="p-2 rounded-natural bg-cream-100 border border-cream-200 hover:bg-cream-200 text-botanical-700 hover:text-botanical-900 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
            <div>
              <h1 className="text-2xl sm:text-3xl font-serif font-bold text-botanical-900">Create New Event</h1>
              <p className="text-xs text-botanical-500 mt-0.5">Design a thoughtful experience with automated AI assistance</p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setShowAiModal(true)}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-natural bg-sage-600 hover:bg-sage-700 text-white font-semibold text-xs shadow-soft transition-all group"
          >
            <Sparkles className="w-4 h-4" />
            <span>Generate with AI Assistant</span>
          </button>
        </div>

        {error && (
          <div className="p-4 rounded-natural bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-3 animate-shake">
            <AlertCircle className="w-5 h-5 shrink-0 text-red-500" />
            <span>{error}</span>
          </div>
        )}

        {/* Form Body */}
        <form onSubmit={(e) => handleSubmit(e, false)} className="space-y-8">
          {/* Section 1: Basic Info */}
          <div className="p-6 rounded-natural bg-white border border-cream-200 shadow-soft space-y-4">
            <h2 className="text-base font-serif font-bold text-botanical-900 flex items-center gap-2">
              <Info className="w-4 h-4 text-sage-600" />
              <span>Event Overview</span>
            </h2>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-botanical-700 mb-1.5">
                  Event Title <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. NextGen AI Summit 2026"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-4 py-2.5 bg-cream-50 border border-cream-200 rounded-natural text-sm text-botanical-900 placeholder-botanical-400 focus:outline-none focus:border-sage-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-botanical-700 mb-1.5">Tagline / Short Hook</label>
                  <input
                    type="text"
                    placeholder="e.g. Exploring the frontiers of autonomous intelligence"
                    value={tagline}
                    onChange={(e) => setTagline(e.target.value)}
                    className="w-full px-4 py-2.5 bg-cream-50 border border-cream-200 rounded-natural text-sm text-botanical-900 placeholder-botanical-400 focus:outline-none focus:border-sage-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-botanical-700 mb-1.5">Category</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full px-4 py-2.5 bg-cream-50 border border-cream-200 rounded-natural text-sm text-botanical-900 focus:outline-none focus:border-sage-500"
                  >
                    {EVENT_CATEGORIES.map((c) => (
                      <option key={c.value} value={c.value}>
                        {c.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-botanical-700 mb-1.5">
                  Full Description & Agenda Details <span className="text-red-500">*</span>
                </label>
                <textarea
                  rows={5}
                  required
                  placeholder="Describe your event, speakers, key takeaways, and prerequisites..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-4 py-3 bg-cream-50 border border-cream-200 rounded-natural text-sm text-botanical-900 placeholder-botanical-400 focus:outline-none focus:border-sage-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-botanical-700 mb-1.5">Banner Image URL (Unsplash or direct URL)</label>
                <input
                  type="url"
                  placeholder="https://images.unsplash.com/photo-1540575467063-178a50c2df87"
                  value={bannerImageUrl}
                  onChange={(e) => setBannerImageUrl(e.target.value)}
                  className="w-full px-4 py-2.5 bg-cream-50 border border-cream-200 rounded-natural text-sm text-botanical-900 placeholder-botanical-400 focus:outline-none focus:border-sage-500"
                />
              </div>
            </div>
          </div>

          {/* Section 2: Date & Location */}
          <div className="p-6 rounded-natural bg-white border border-cream-200 shadow-soft space-y-4">
            <h2 className="text-base font-serif font-bold text-botanical-900 flex items-center gap-2">
              <Calendar className="w-4 h-4 text-sage-600" />
              <span>Schedule & Location</span>
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-botanical-700 mb-1.5">Start Date & Time *</label>
                <input
                  type="datetime-local"
                  required
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full px-4 py-2.5 bg-cream-50 border border-cream-200 rounded-natural text-sm text-botanical-900 focus:outline-none focus:border-sage-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-botanical-700 mb-1.5">End Date & Time *</label>
                <input
                  type="datetime-local"
                  required
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-full px-4 py-2.5 bg-cream-50 border border-cream-200 rounded-natural text-sm text-botanical-900 focus:outline-none focus:border-sage-500"
                />
              </div>
            </div>

            <div className="space-y-3 pt-2">
              <label className="block text-xs font-semibold text-botanical-700">Format</label>
              <div className="grid grid-cols-3 gap-3">
                {[
                  { id: 'VENUE_IN_PERSON', label: 'In-Person Venue' },
                  { id: 'VIRTUAL', label: 'Virtual Streaming' },
                  { id: 'HYBRID', label: 'Hybrid' },
                ].map((fmt) => (
                  <button
                    key={fmt.id}
                    type="button"
                    onClick={() => setLocationType(fmt.id as any)}
                    className={`py-2.5 px-3 rounded-natural border text-xs font-medium text-center transition-all ${
                      locationType === fmt.id
                        ? 'bg-sage-100 border-sage-500 text-sage-800 font-semibold'
                        : 'bg-cream-50 border-cream-200 text-botanical-600 hover:border-cream-300'
                    }`}
                  >
                    {fmt.label}
                  </button>
                ))}
              </div>
            </div>

            {(locationType === 'VENUE_IN_PERSON' || locationType === 'HYBRID') && (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 animate-fade-in">
                <div>
                  <label className="block text-xs font-semibold text-botanical-600 mb-1">Venue Name</label>
                  <input
                    type="text"
                    placeholder="e.g. Moscone Center"
                    value={venueName}
                    onChange={(e) => setVenueName(e.target.value)}
                    className="w-full px-3.5 py-2 bg-cream-50 border border-cream-200 rounded-natural text-xs text-botanical-900 focus:outline-none focus:border-sage-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-botanical-600 mb-1">Street Address</label>
                  <input
                    type="text"
                    placeholder="e.g. 747 Howard St"
                    value={venueAddress}
                    onChange={(e) => setVenueAddress(e.target.value)}
                    className="w-full px-3.5 py-2 bg-cream-50 border border-cream-200 rounded-natural text-xs text-botanical-900 focus:outline-none focus:border-sage-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-botanical-600 mb-1">City / Region</label>
                  <input
                    type="text"
                    placeholder="e.g. San Francisco, CA"
                    value={venueCity}
                    onChange={(e) => setVenueCity(e.target.value)}
                    className="w-full px-3.5 py-2 bg-cream-50 border border-cream-200 rounded-natural text-xs text-botanical-900 focus:outline-none focus:border-sage-500"
                  />
                </div>
              </div>
            )}

            {(locationType === 'VIRTUAL' || locationType === 'HYBRID') && (
              <div className="pt-2 animate-fade-in">
                <label className="block text-xs font-semibold text-botanical-600 mb-1">Virtual Stream / Meet Link</label>
                <input
                  type="url"
                  placeholder="https://meet.google.com/xyz-abcd-efg"
                  value={virtualLink}
                  onChange={(e) => setVirtualLink(e.target.value)}
                  className="w-full px-3.5 py-2 bg-cream-50 border border-cream-200 rounded-natural text-xs text-botanical-900 focus:outline-none focus:border-sage-500"
                />
              </div>
            )}
          </div>

          {/* Section 3: Ticket Tiers Manager */}
          <div className="p-6 rounded-natural bg-white border border-cream-200 shadow-soft space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-base font-serif font-bold text-botanical-900 flex items-center gap-2">
                  <DollarSign className="w-4 h-4 text-sage-600" />
                  <span>Ticket Tiers & Pricing</span>
                </h2>
                <p className="text-xs text-botanical-500">Configure free or paid access passes and custom perks</p>
              </div>

              <button
                type="button"
                onClick={handleAddTier}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-natural bg-cream-100 hover:bg-cream-200 text-xs font-medium text-botanical-800 border border-cream-200 transition-colors"
              >
                <Plus className="w-3.5 h-3.5 text-sage-600" />
                <span>Add Tier</span>
              </button>
            </div>

            <div className="space-y-4">
              {ticketTiers.map((tier, tierIdx) => (
                <div
                  key={tierIdx}
                  className="p-4 rounded-natural bg-cream-50/80 border border-cream-200 space-y-3 relative group"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono text-sage-700 font-semibold">Tier #{tierIdx + 1}</span>
                    {ticketTiers.length > 1 && (
                      <button
                        type="button"
                        onClick={() => handleRemoveTier(tierIdx)}
                        className="text-botanical-400 hover:text-red-600 p-1 rounded transition-colors"
                        title="Delete Tier"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="block text-[11px] font-medium text-botanical-600 mb-1">Tier Name</label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. VIP Pass"
                        value={tier.name}
                        onChange={(e) => handleUpdateTier(tierIdx, 'name', e.target.value)}
                        className="w-full px-3 py-1.5 bg-white border border-cream-200 rounded-natural text-xs text-botanical-900 focus:outline-none focus:border-sage-500"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-medium text-botanical-600 mb-1">Price (USD)</label>
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        required
                        value={tier.price}
                        onChange={(e) => handleUpdateTier(tierIdx, 'price', Number(e.target.value))}
                        className="w-full px-3 py-1.5 bg-white border border-cream-200 rounded-natural text-xs text-botanical-900 focus:outline-none focus:border-sage-500"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-medium text-botanical-600 mb-1">Capacity</label>
                      <input
                        type="number"
                        min="1"
                        required
                        value={tier.capacity}
                        onChange={(e) => handleUpdateTier(tierIdx, 'capacity', Number(e.target.value))}
                        className="w-full px-3 py-1.5 bg-white border border-cream-200 rounded-natural text-xs text-botanical-900 focus:outline-none focus:border-sage-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-medium text-botanical-600 mb-1">Tier Description</label>
                    <input
                      type="text"
                      placeholder="Brief note on what this tier grants"
                      value={tier.description}
                      onChange={(e) => handleUpdateTier(tierIdx, 'description', e.target.value)}
                      className="w-full px-3 py-1.5 bg-white border border-cream-200 rounded-natural text-xs text-botanical-900 focus:outline-none focus:border-sage-500"
                    />
                  </div>

                  {/* Perks list */}
                  <div className="space-y-1.5 pt-1">
                    <div className="flex items-center justify-between">
                      <label className="block text-[11px] font-medium text-botanical-600">Included Perks</label>
                      <button
                        type="button"
                        onClick={() => handleAddTierPerk(tierIdx)}
                        className="text-[10px] text-sage-700 hover:text-sage-800 font-semibold"
                      >
                        + Add Perk
                      </button>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {tier.perks.map((perk, pIdx) => (
                        <div
                          key={pIdx}
                          className="flex items-center gap-1.5 px-2.5 py-1 rounded-natural bg-white border border-cream-200 text-xs text-botanical-800 shadow-soft"
                        >
                          <input
                            type="text"
                            value={perk}
                            onChange={(e) => handleUpdateTierPerk(tierIdx, pIdx, e.target.value)}
                            className="bg-transparent border-none focus:outline-none text-xs text-botanical-800 w-28"
                          />
                          <button
                            type="button"
                            onClick={() => handleRemoveTierPerk(tierIdx, pIdx)}
                            className="text-botanical-400 hover:text-red-600 text-xs ml-1"
                          >
                            ✕
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Form Actions Footer */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-cream-200">
            <button
              type="button"
              onClick={() => navigate('/dashboard')}
              className="px-5 py-2.5 rounded-natural bg-cream-100 hover:bg-cream-200 border border-cream-200 text-botanical-700 text-xs font-semibold transition-colors"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={submitting}
              className="px-6 py-2.5 rounded-natural bg-cream-200 hover:bg-cream-300 text-botanical-800 border border-cream-300 text-xs font-semibold transition-colors disabled:opacity-50"
            >
              Save as Draft
            </button>

            <button
              type="button"
              onClick={(e) => handleSubmit(e, true)}
              disabled={submitting}
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-natural bg-sage-600 hover:bg-sage-700 text-white text-xs font-bold shadow-soft transition-all disabled:opacity-50"
            >
              {submitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Publishing...</span>
                </>
              ) : (
                <>
                  <Check className="w-4 h-4" />
                  <span>Publish Event</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* AI Event Generator Modal */}
      <AiEventGeneratorModal
        isOpen={showAiModal}
        onClose={() => setShowAiModal(false)}
        onApply={handleApplyAiBlueprint}
      />
    </div>
  );
};

export default EventCreatePage;
