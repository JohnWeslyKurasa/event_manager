import React, { useState } from 'react';
import { X, Sparkles, Loader2, AlertCircle, ChevronRight, Wand2, Calendar, Tag } from 'lucide-react';
import { AiEventBlueprint, EVENT_CATEGORIES } from '../types';
import { aiApi } from '../services/api';

interface AiEventGeneratorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApply: (blueprint: AiEventBlueprint) => void;
}

const AiEventGeneratorModal: React.FC<AiEventGeneratorModalProps> = ({ isOpen, onClose, onApply }) => {
  const [topic, setTopic] = useState('');
  const [category, setCategory] = useState('');
  const [duration, setDuration] = useState('1 day');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [blueprint, setBlueprint] = useState<AiEventBlueprint | null>(null);

  const handleGenerate = async () => {
    if (!topic.trim() || !category) {
      setError('Please enter a topic and select a category.');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await aiApi.generateEvent({ topic, category, duration });
      if (response.success && response.data) {
        setBlueprint(response.data);
      } else {
        setError('Failed to generate event. Please try again.');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Generation failed.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleApply = () => {
    if (blueprint) {
      onApply(blueprint);
      onClose();
    }
  };

  const handleClose = () => {
    setTopic('');
    setCategory('');
    setBlueprint(null);
    setError(null);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" id="ai-generator-modal">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-botanical-950/40 backdrop-blur-sm" onClick={handleClose} />

      {/* Modal Container */}
      <div className="relative w-full max-w-2xl max-h-[90vh] bg-cream-50 border border-cream-200 rounded-natural shadow-card flex flex-col animate-scale-in overflow-hidden text-botanical-800">
        {/* Header */}
        <div className="flex items-center justify-between p-6 bg-cream-100 border-b border-cream-200 flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-sage-600 rounded-natural flex items-center justify-center shadow-soft">
              <Sparkles size={20} className="text-white" />
            </div>
            <div>
              <h2 className="font-serif font-bold text-lg text-botanical-900">EventPulse AI Generator</h2>
              <p className="text-xs text-botanical-500">Powered by Google Gemini 2.5 AI</p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="p-2 rounded-natural text-botanical-500 hover:text-botanical-900 hover:bg-cream-200 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Content */}
        <div className="overflow-y-auto flex-1 p-6 space-y-5">
          {!blueprint ? (
            <>
              {/* Input Form */}
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-botanical-700 mb-1.5">
                    Event Topic / Concept <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="ai-topic-input"
                    type="text"
                    value={topic}
                    onChange={(e) => setTopic(e.target.value)}
                    placeholder="e.g., AI Developer Summit 2026 in San Francisco"
                    className="w-full px-4 py-2.5 bg-white border border-cream-200 rounded-natural text-sm text-botanical-900 placeholder-botanical-400 focus:outline-none focus:border-sage-500"
                    onKeyDown={(e) => e.key === 'Enter' && handleGenerate()}
                  />
                  <p className="text-xs text-botanical-500 mt-1.5">Be specific — include audience, location, and key theme.</p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-botanical-700 mb-1.5">
                      Category <span className="text-red-500">*</span>
                    </label>
                    <select
                      id="ai-category-select"
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                      className="w-full px-4 py-2.5 bg-white border border-cream-200 rounded-natural text-sm text-botanical-900 focus:outline-none focus:border-sage-500"
                    >
                      <option value="">Select category...</option>
                      {EVENT_CATEGORIES.map((c) => (
                        <option key={c.value} value={c.value}>{c.label}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-botanical-700 mb-1.5">Duration</label>
                    <select
                      id="ai-duration-select"
                      value={duration}
                      onChange={(e) => setDuration(e.target.value)}
                      className="w-full px-4 py-2.5 bg-white border border-cream-200 rounded-natural text-sm text-botanical-900 focus:outline-none focus:border-sage-500"
                    >
                      <option value="2 hours">2 hours</option>
                      <option value="half day">Half day</option>
                      <option value="1 day">1 day</option>
                      <option value="2 days">2 days</option>
                      <option value="3 days">3 days</option>
                      <option value="1 week">1 week</option>
                    </select>
                  </div>
                </div>

                {error && (
                  <div className="flex items-start gap-2.5 p-3.5 bg-red-50 border border-red-200 rounded-natural text-sm text-red-700">
                    <AlertCircle size={16} className="flex-shrink-0 mt-0.5 text-red-500" />
                    <span>{error}</span>
                  </div>
                )}

                {/* Example prompts */}
                <div>
                  <p className="text-xs text-botanical-500 mb-2">Try these examples:</p>
                  <div className="flex flex-wrap gap-2">
                    {[
                      'AI Developer Summit 2026 in San Francisco',
                      'Web3 & Crypto Startup Pitch Competition',
                      'Mindfulness & Wellness Retreat Weekend',
                      'Jazz & Soul Music Festival NYC',
                    ].map((example) => (
                      <button
                        key={example}
                        type="button"
                        onClick={() => setTopic(example)}
                        className="px-3 py-1.5 text-xs bg-cream-100 hover:bg-cream-200 border border-cream-200 rounded-natural text-botanical-700 hover:text-botanical-900 transition-all"
                      >
                        {example}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </>
          ) : (
            /* Blueprint Preview */
            <div className="space-y-5 animate-fade-in">
              <div className="flex items-center gap-2 text-sage-800 text-sm font-semibold">
                <Sparkles size={16} className="text-sage-600" />
                <span>Blueprint Generated Successfully</span>
              </div>

              {/* Title & Tagline */}
              <div className="bg-cream-100 p-4 rounded-natural border border-cream-200">
                <h3 className="font-serif font-bold text-lg text-botanical-900 mb-1">{blueprint.title}</h3>
                <p className="text-sage-700 text-sm italic">{blueprint.tagline}</p>
              </div>

              {/* Description */}
              <div>
                <p className="text-xs font-semibold text-botanical-500 uppercase tracking-wider mb-2">Description Preview</p>
                <p className="text-botanical-700 text-sm leading-relaxed line-clamp-4">{blueprint.description}</p>
              </div>

              {/* Agenda */}
              {blueprint.agendaSchedule && blueprint.agendaSchedule.length > 0 && (
                <div>
                  <p className="text-xs font-semibold text-botanical-500 uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
                    <Calendar size={12} className="text-sage-600" /> Agenda ({blueprint.agendaSchedule.length} sessions)
                  </p>
                  <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                    {blueprint.agendaSchedule.map((item, i) => (
                      <div key={i} className="flex gap-3 p-3 bg-white border border-cream-200 rounded-natural">
                        <span className="text-sage-700 text-xs font-mono font-bold w-16 flex-shrink-0 pt-0.5">{item.time}</span>
                        <div>
                          <p className="text-botanical-900 text-sm font-medium">{item.sessionTitle}</p>
                          {item.speakerRole && (
                            <p className="text-botanical-500 text-xs">{item.speakerRole}</p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Ticket Tiers */}
              {blueprint.ticketTiers && blueprint.ticketTiers.length > 0 && (
                <div>
                  <p className="text-xs font-semibold text-botanical-500 uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
                    <Tag size={12} className="text-sage-600" /> Suggested Ticket Tiers
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {blueprint.ticketTiers.map((tier, i) => (
                      <div key={i} className="bg-white p-3.5 rounded-natural border border-cream-200 shadow-soft">
                        <div className="flex justify-between items-start mb-1.5">
                          <span className="font-semibold text-botanical-900 text-sm">{tier.name}</span>
                          <span className="text-sage-700 font-bold text-sm font-mono">
                            {tier.price === 0 ? 'Free' : `$${tier.price}`}
                          </span>
                        </div>
                        <p className="text-botanical-600 text-xs mb-2">{tier.description}</p>
                        <div className="flex flex-wrap gap-1">
                          {tier.perks && tier.perks.slice(0, 3).map((perk, j) => (
                            <span key={j} className="text-[11px] px-2 py-0.5 bg-sage-50 text-sage-800 border border-sage-200 rounded-full font-medium">
                              {perk}
                            </span>
                          ))}
                          {tier.perks && tier.perks.length > 3 && (
                            <span className="text-xs text-botanical-500">+{tier.perks.length - 3} more</span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 bg-cream-100 border-t border-cream-200 flex items-center justify-between flex-shrink-0">
          {!blueprint ? (
            <>
              <button
                type="button"
                onClick={handleClose}
                className="px-5 py-2.5 rounded-natural bg-cream-200 hover:bg-cream-300 text-botanical-800 text-xs font-semibold transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleGenerate}
                disabled={isLoading || !topic.trim() || !category}
                className="inline-flex items-center gap-2 px-6 py-2.5 rounded-natural bg-sage-600 hover:bg-sage-700 text-white text-xs font-bold shadow-soft transition-all disabled:opacity-50"
                id="ai-generate-button"
              >
                {isLoading ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    <span>Generating with AI...</span>
                  </>
                ) : (
                  <>
                    <Wand2 size={16} />
                    <span>Generate Blueprint</span>
                  </>
                )}
              </button>
            </>
          ) : (
            <>
              <button
                type="button"
                onClick={() => setBlueprint(null)}
                className="px-5 py-2.5 rounded-natural bg-cream-200 hover:bg-cream-300 text-botanical-800 text-xs font-semibold transition-colors"
              >
                Try Again
              </button>
              <button
                type="button"
                onClick={handleApply}
                className="inline-flex items-center gap-2 px-6 py-2.5 rounded-natural bg-sage-600 hover:bg-sage-700 text-white text-xs font-bold shadow-soft transition-all"
                id="ai-apply-button"
              >
                <span>Apply to Form</span>
                <ChevronRight size={16} />
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default AiEventGeneratorModal;
