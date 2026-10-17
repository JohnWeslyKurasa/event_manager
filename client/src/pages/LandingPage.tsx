import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Sparkles, Calendar, ArrowRight, ShieldCheck, QrCode,
  Users, BarChart3, Bot, CheckCircle2, Search, TrendingUp,
  Cpu, Briefcase, Palette, Music, Heart, BookOpen, UserCheck, Star
} from 'lucide-react';
import { eventsApi } from '../services/api';
import { Event, EVENT_CATEGORIES } from '../types';
import EventCard from '../components/EventCard';

const categoryIcons: Record<string, React.FC<{ className?: string }>> = {
  TECHNOLOGY_INNOVATION: Cpu,
  BUSINESS_ENTREPRENEURSHIP: Briefcase,
  ARTS_CULTURE: Palette,
  MUSIC_CONCERTS: Music,
  HEALTH_WELLNESS: Heart,
  EDUCATION_ACADEMICS: BookOpen,
  COMMUNITY_NETWORKING: UserCheck,
};

export const LandingPage: React.FC = () => {
  const [featuredEvents, setFeaturedEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFeatured = async () => {
      try {
        const res = await eventsApi.getEvents({ limit: 6, status: 'PUBLISHED' });
        if (res.data) setFeaturedEvents(res.data);
      } catch (err) {
        console.error('Failed to load featured events', err);
      } finally {
        setLoading(false);
      }
    };
    fetchFeatured();
  }, []);

  return (
    <div className="min-h-screen bg-cream-50">

      {/* ── HERO ── */}
      <section className="relative overflow-hidden pt-20 pb-28 lg:pt-28 lg:pb-36 bg-botanical-hero">
        {/* Decorative orbs */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[900px] h-[500px] bg-gradient-radial from-sage-200/30 via-cream-200/20 to-transparent rounded-full blur-3xl pointer-events-none -z-10" />
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-gradient-radial from-sand-200/20 to-transparent rounded-full blur-3xl pointer-events-none -z-10" />
        <div className="absolute top-32 left-8 w-64 h-64 bg-gradient-radial from-sage-100/30 to-transparent rounded-full blur-2xl pointer-events-none -z-10" />

        {/* Subtle grain texture overlay */}
        <div className="absolute inset-0 opacity-[0.018] pointer-events-none -z-10"
          style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 512 512\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'n\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.75\' numOctaves=\'4\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23n)\' opacity=\'1\'/%3E%3C/svg%3E")', backgroundSize: '256px' }} />

        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Eyebrow label */}
          <div className="flex justify-center mb-8 animate-fade-in">
            <div className="section-label">
              <Sparkles className="w-3 h-3 text-sage-600" />
              <span>Elegantly Curated · AI-Orchestrated</span>
            </div>
          </div>

          {/* Main headline */}
          <div className="text-center space-y-6 max-w-4xl mx-auto">
            <h1 className="font-display text-5xl sm:text-6xl lg:text-7xl font-bold tracking-display text-botanical-900 leading-none animate-fade-in-up delay-100">
              Create & Experience{' '}
              <span className="block mt-2 italic font-light text-sage-600">
                Exceptional Events
              </span>
            </h1>

            <p className="text-base sm:text-lg text-botanical-500 leading-relaxed max-w-2xl mx-auto font-light animate-fade-in-up delay-200">
              The elegant platform where AI crafts agendas, attendees discover remarkable gatherings, and every check-in is seamless.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2 animate-fade-in-up delay-300">
              <Link
                to="/events"
                className="btn-primary group text-sm px-8 py-3.5"
              >
                <Search className="w-4 h-4" />
                <span>Discover Events</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-200" />
              </Link>
              <Link
                to="/register"
                className="btn-secondary text-sm px-8 py-3.5"
              >
                <Sparkles className="w-4 h-4 text-sage-600" />
                <span>Start Organising Free</span>
              </Link>
            </div>

            {/* Social proof strip */}
            <div className="flex items-center justify-center gap-2 pt-6 animate-fade-in delay-400">
              <div className="flex -space-x-2">
                {['#647D64', '#839A83', '#A4B5A4', '#4E644E'].map((c, i) => (
                  <div key={i} className="w-7 h-7 rounded-full border-2 border-cream-50 flex items-center justify-center text-white text-[9px] font-bold" style={{ backgroundColor: c }}>
                    {['AK','MR','JP','SL'][i]}
                  </div>
                ))}
              </div>
              <div className="flex items-center gap-1">
                {[1,2,3,4,5].map(s => <Star key={s} className="w-3 h-3 fill-sand-400 text-sand-400" />)}
              </div>
              <span className="text-[11px] text-botanical-500 font-medium">Trusted by <strong className="text-botanical-700">2,400+</strong> organisers</span>
            </div>
          </div>

          {/* Metric tiles */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-20 animate-fade-in-up delay-500">
            {[
              { value: '99.9%',    label: 'Check-in Uptime',      color: 'text-botanical-900' },
              { value: '10x',      label: 'Faster AI Planning',   color: 'text-sage-700' },
              { value: 'Instant',  label: 'QR Pass Delivery',     color: 'text-sage-600' },
              { value: 'Live',     label: 'Real-time Analytics',  color: 'text-sand-600' },
            ].map((m, i) => (
              <div key={i} className="natural-card p-5 text-left">
                <p className={`font-display text-2xl font-bold ${m.color}`}>{m.value}</p>
                <p className="text-[11px] text-botanical-500 mt-1 font-medium">{m.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CATEGORY EXPLORER ── */}
      <section className="py-16 bg-cream-100/70 border-y border-cream-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-10">
            <div>
              <p className="section-label mb-3">
                <span>Browse by Interest</span>
              </p>
              <h2 className="font-display text-2xl sm:text-3xl font-bold text-botanical-900 tracking-display">
                Explore Categories
              </h2>
              <p className="text-xs text-botanical-500 mt-1.5 font-light">
                Find events tailored to your passions and craft
              </p>
            </div>
            <Link
              to="/events"
              className="text-xs font-semibold text-sage-700 hover:text-sage-800 inline-flex items-center gap-1.5 link-underline shrink-0"
            >
              View all events <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
            {EVENT_CATEGORIES.map((cat, idx) => {
              const Icon = categoryIcons[cat.value] || Sparkles;
              return (
                <Link
                  key={cat.value}
                  to={`/events?category=${cat.value}`}
                  className="group flex flex-col items-center justify-center p-4 pt-5 rounded-natural-lg bg-cream-50 hover:bg-white border border-cream-200 hover:border-sage-200 hover:shadow-card transition-all duration-300 text-center"
                  style={{ animationDelay: `${idx * 50}ms` }}
                >
                  <div className="w-10 h-10 rounded-full bg-sage-100 group-hover:bg-sage-200 text-sage-700 flex items-center justify-center mb-3 group-hover:scale-110 transition-all duration-300">
                    <Icon className="w-4 h-4" />
                  </div>
                  <span className="text-[11px] font-semibold text-botanical-700 group-hover:text-botanical-900 leading-tight">
                    {cat.label.split(' ').slice(0, 2).join(' ')}
                  </span>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── FEATURED EVENTS ── */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-end justify-between mb-12">
            <div>
              <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest text-sage-600 mb-3">
                <TrendingUp className="w-3.5 h-3.5" />
                <span>Handpicked for You</span>
              </div>
              <h2 className="font-display text-3xl sm:text-4xl font-bold text-botanical-900 tracking-display">
                Featured Experiences
              </h2>
            </div>
            <Link
              to="/events"
              className="hidden sm:inline-flex items-center gap-1.5 px-5 py-2.5 rounded-natural bg-cream-100 hover:bg-cream-200 border border-cream-200 text-xs font-semibold text-botanical-800 transition-colors shadow-soft"
            >
              See All <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-7">
              {[1, 2, 3].map((n) => (
                <div key={n} className="h-96 rounded-natural-lg bg-cream-100 border border-cream-200 shimmer" />
              ))}
            </div>
          ) : featuredEvents.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-7">
              {featuredEvents.map((evt) => (
                <EventCard key={evt.id} event={evt} />
              ))}
            </div>
          ) : (
            <div className="text-center py-20 bg-cream-100/60 rounded-natural-xl border border-cream-200 p-8 shadow-soft">
              <div className="w-16 h-16 bg-sage-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Calendar className="w-7 h-7 text-sage-600" />
              </div>
              <h3 className="font-display text-xl font-semibold text-botanical-900 mb-2">No events published yet</h3>
              <p className="text-sm text-botanical-500 max-w-sm mx-auto mb-8">
                Be the first organiser to create an extraordinary event with our AI assistant.
              </p>
              <Link
                to="/events/create"
                className="btn-primary text-sm"
              >
                <Sparkles className="w-4 h-4" />
                Create First Event
              </Link>
            </div>
          )}
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section className="py-20 bg-cream-100/50 border-y border-cream-200 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-72 h-72 bg-gradient-radial from-sage-100/50 to-transparent rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <p className="section-label mb-4 mx-auto w-fit">How it works</p>
            <h2 className="font-display text-3xl sm:text-4xl font-bold text-botanical-900 tracking-display">
              Three Steps to a Perfect Event
            </h2>
            <p className="text-botanical-500 text-sm mt-3 max-w-xl mx-auto font-light leading-relaxed">
              From concept to check-in, EventPulse handles the complexity so you can focus on the experience.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
            {/* Connector line */}
            <div className="hidden md:block absolute top-10 left-1/3 right-1/3 h-px bg-gradient-to-r from-cream-300 via-sage-200 to-cream-300" />

            {[
              {
                step: '01',
                icon: Sparkles,
                title: 'Describe Your Vision',
                body: 'Tell our AI your event concept, audience, and duration. Gemini crafts a complete agenda, session tracks, and ticket tiers instantly.',
                color: 'bg-sage-100 text-sage-700',
              },
              {
                step: '02',
                icon: Users,
                title: 'Publish & Sell Tickets',
                body: 'Customise your event page, set pricing, and publish. Attendees register with a seamless checkout in under 60 seconds.',
                color: 'bg-sand-100 text-sand-700',
              },
              {
                step: '03',
                icon: QrCode,
                title: 'Check In Attendees Live',
                body: 'Scan QR tickets at the gate with real-time validation. Monitor attendance, capacity, and analytics from the organiser dashboard.',
                color: 'bg-sage-100 text-sage-700',
              },
            ].map((step, i) => (
              <div key={i} className="relative flex flex-col items-center text-center p-8 rounded-natural-xl bg-cream-50 border border-cream-200 shadow-soft hover:shadow-card transition-all duration-300 hover:-translate-y-1">
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 w-8 h-8 rounded-full bg-sage-600 text-cream-50 text-xs font-bold flex items-center justify-center shadow-button-sage">
                  {step.step}
                </div>
                <div className={`w-14 h-14 rounded-2xl ${step.color} flex items-center justify-center mb-5 mt-2 shadow-soft`}>
                  <step.icon className="w-6 h-6" />
                </div>
                <h3 className="font-display text-lg font-semibold text-botanical-900 mb-2">{step.title}</h3>
                <p className="text-sm text-botanical-500 leading-relaxed font-light">{step.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── AI FEATURES ── */}
      <section className="py-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <p className="section-label mb-4 mx-auto w-fit">
              <Bot className="w-3.5 h-3.5 text-sage-600" />
              <span>Powered by Google Gemini AI</span>
            </p>
            <h2 className="font-display text-3xl sm:text-4xl font-bold text-botanical-900 tracking-display">
              Intelligence at Every Step
            </h2>
            <p className="text-botanical-500 text-sm mt-3 leading-relaxed font-light">
              Turn a topic into a fully-planned, beautifully-marketed, AI-supported event in minutes.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                icon: Sparkles,
                iconBg: 'bg-sage-100 text-sage-700',
                title: 'Instant Event Blueprints',
                body: 'Provide a concept and Gemini builds complete schedules, speaker tracks, sessions, FAQs, and optimised ticket pricing — instantly.',
                features: ['Timed session agendas', 'Multi-tier ticket pricing', 'FAQ generation'],
              },
              {
                icon: Bot,
                iconBg: 'bg-sage-100 text-sage-700',
                title: '24/7 AI Concierge',
                body: 'Every event page gets an intelligent attendee assistant answering venue, schedule, dress code, and ticket questions around the clock.',
                features: ['Context-aware answers', 'Conversation history', 'Reduces support load'],
              },
              {
                icon: BarChart3,
                iconBg: 'bg-sand-100 text-sand-700',
                title: 'Marketing Copy Engine',
                body: 'Generate high-converting email campaigns, Twitter/LinkedIn announcements, and press releases with a single click.',
                features: ['Multiple tone options', 'Platform-optimised copy', 'One-click export'],
              },
            ].map((f, i) => (
              <div key={i} className="natural-card-hover p-8">
                <div className={`w-12 h-12 rounded-2xl ${f.iconBg} flex items-center justify-center mb-6 shadow-soft`}>
                  <f.icon className="w-5 h-5" />
                </div>
                <h3 className="font-display text-xl font-semibold text-botanical-900 mb-3">{f.title}</h3>
                <p className="text-sm text-botanical-500 leading-relaxed mb-5 font-light">{f.body}</p>
                <ul className="space-y-2">
                  {f.features.map((feat, j) => (
                    <li key={j} className="flex items-center gap-2 text-xs text-botanical-700 font-medium">
                      <CheckCircle2 className="w-3.5 h-3.5 text-sage-600 shrink-0" />
                      <span>{feat}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── TESTIMONIAL ── */}
      <section className="py-16 bg-cream-100/60 border-y border-cream-200">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                quote: 'EventPulse cut our planning time by 80%. The AI agenda feature is extraordinary.',
                name: 'Amara Kofi',
                role: 'Conference Director, TechSummit Africa',
              },
              {
                quote: 'The QR check-in console handled 600 guests in 20 minutes without a single issue.',
                name: 'Mei Rashid',
                role: 'Events Lead, Startup Collab',
              },
              {
                quote: 'Sage & clean, beautiful design. Our attendees keep complimenting the ticket experience.',
                name: 'James Patel',
                role: 'Founder, The Wellness Retreat',
              },
            ].map((t, i) => (
              <div key={i} className="p-6 rounded-natural-xl bg-cream-50 border border-cream-200 shadow-soft">
                <div className="flex mb-3">
                  {[1,2,3,4,5].map(s => <Star key={s} className="w-3.5 h-3.5 fill-sand-400 text-sand-400" />)}
                </div>
                <p className="text-sm text-botanical-700 leading-relaxed italic mb-4 font-light">
                  "{t.quote}"
                </p>
                <div className="botanical-divider my-4" />
                <p className="text-xs font-semibold text-botanical-900">{t.name}</p>
                <p className="text-[11px] text-botanical-500 mt-0.5">{t.role}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA SECTION ── */}
      <section className="py-24 relative overflow-hidden">
        <div className="absolute inset-0 bg-hero-botanical pointer-events-none" />
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative">
          <div className="p-12 sm:p-16 rounded-natural-2xl border border-cream-300 shadow-elevated-natural relative overflow-hidden"
            style={{ background: 'linear-gradient(145deg, rgba(253,251,247,0.97) 0%, rgba(239,234,225,0.9) 100%)' }}
          >
            {/* Corner botanical accents */}
            <div className="absolute top-0 right-0 w-48 h-48 bg-gradient-radial from-sage-100/60 to-transparent rounded-full blur-2xl" />
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-gradient-radial from-sand-100/50 to-transparent rounded-full blur-2xl" />

            <div className="relative z-10 space-y-6">
              <p className="section-label mx-auto w-fit">Ready to begin?</p>
              <h2 className="font-display text-3xl sm:text-5xl font-bold text-botanical-900 tracking-display">
                Host Your Next<br />
                <span className="italic text-sage-600 font-light">Extraordinary Gathering</span>
              </h2>
              <p className="text-botanical-500 max-w-lg mx-auto text-sm leading-relaxed font-light">
                Join curators crafting memorable in-person conferences and virtual summits powered by Google Gemini AI.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
                <Link
                  to="/register"
                  className="btn-primary text-sm px-10 py-3.5"
                >
                  Get Started Free
                </Link>
                <Link
                  to="/events"
                  className="btn-secondary text-sm px-8 py-3.5"
                >
                  Explore Events
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default LandingPage;
