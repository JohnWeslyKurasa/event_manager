import React from 'react';
import { Link } from 'react-router-dom';
import { Calendar, MapPin, ArrowUpRight } from 'lucide-react';
import { Event } from '../types';

export interface EventCardProps {
  event?: Event;
  id?: string;
  title?: string;
  category?: string;
  tagline?: string;
  bannerImageUrl?: string;
  startDate?: string;
  venueCity?: string;
  startingPrice?: number;
  locationType?: 'VENUE_IN_PERSON' | 'VIRTUAL' | 'HYBRID';
  onClick?: () => void;
}

const categoryColorMap: Record<string, { pill: string; dot: string }> = {
  TECHNOLOGY_INNOVATION:    { pill: 'bg-sage-100 text-sage-800 border-sage-200',       dot: 'bg-sage-500' },
  BUSINESS_ENTREPRENEURSHIP:{ pill: 'bg-sand-100 text-sand-700 border-sand-200',        dot: 'bg-sand-500' },
  ARTS_CULTURE:             { pill: 'bg-cream-200 text-botanical-700 border-cream-300', dot: 'bg-botanical-500' },
  MUSIC_CONCERTS:           { pill: 'bg-cream-200 text-botanical-700 border-cream-300', dot: 'bg-botanical-400' },
  HEALTH_WELLNESS:          { pill: 'bg-sage-50 text-sage-700 border-sage-200',         dot: 'bg-sage-400' },
  EDUCATION_ACADEMICS:      { pill: 'bg-cream-100 text-botanical-700 border-cream-200', dot: 'bg-cream-500' },
  COMMUNITY_NETWORKING:     { pill: 'bg-sage-100 text-sage-800 border-sage-200',        dot: 'bg-sage-600' },
};

const defaultColors = { pill: 'bg-cream-100 text-botanical-700 border-cream-200', dot: 'bg-sage-400' };

export const EventCard: React.FC<EventCardProps> = ({
  event,
  id: propId,
  title: propTitle,
  category: propCategory,
  tagline: propTagline,
  bannerImageUrl: propBannerImageUrl,
  startDate: propStartDate,
  venueCity: propVenueCity,
  startingPrice: propStartingPrice,
  locationType: propLocationType,
  onClick,
}) => {
  const id = propId || event?.id || '';
  const slug = event?.slug || id;
  const title = propTitle || event?.title || 'Untitled Event';
  const category = propCategory || event?.category || 'COMMUNITY_NETWORKING';
  const tagline = propTagline !== undefined ? propTagline : event?.tagline;
  const bannerImageUrl = propBannerImageUrl || event?.bannerImageUrl ||
    'https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=800&q=80';
  const startDate = propStartDate || event?.startDate || new Date().toISOString();
  const venueCity = propVenueCity !== undefined ? propVenueCity : (event?.venueCity || event?.venueName);
  const locationType = propLocationType || event?.locationType || 'VENUE_IN_PERSON';

  let startingPrice = propStartingPrice;
  if (startingPrice === undefined && event?.ticketTiers && event.ticketTiers.length > 0) {
    startingPrice = Math.min(...event.ticketTiers.map((t) => Number(t.price) || 0));
  }
  if (startingPrice === undefined) startingPrice = 0;

  const formattedDate = new Date(startDate).toLocaleDateString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric',
  });

  const colors = categoryColorMap[category] || defaultColors;
  const categoryLabel = category.replace(/_/g, ' ').replace(/\b\w/g, c => c);

  const cardContent = (
    <div
      onClick={onClick}
      className="group relative bg-cream-50 border border-cream-200 rounded-natural-xl overflow-hidden shadow-soft hover:shadow-card-hover transition-all duration-500 flex flex-col h-full cursor-pointer hover:-translate-y-1.5"
    >
      {/* Banner Image */}
      <div className="relative h-52 overflow-hidden bg-cream-200 shrink-0">
        <img
          src={bannerImageUrl}
          alt={title}
          loading="lazy"
          className="w-full h-full object-cover transition-transform duration-700 ease-[cubic-bezier(0.25,0.46,0.45,0.94)] group-hover:scale-108"
          onError={(e) => {
            (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=800&q=80';
          }}
        />
        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-botanical-900/30 via-transparent to-transparent" />

        {/* Category pill */}
        <div className="absolute top-3 left-3">
          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-semibold border backdrop-blur-md bg-cream-50/90 text-botanical-800 border-cream-200 shadow-soft`}>
            <span className={`w-1.5 h-1.5 rounded-full ${colors.dot} shrink-0`} />
            {categoryLabel.split(' ').slice(0, 2).join(' ')}
          </span>
        </div>

        {/* Price badge top-right */}
        <div className="absolute top-3 right-3">
          <span className="inline-flex items-baseline gap-0.5 px-2.5 py-1 rounded-full bg-sage-600/90 text-cream-50 text-[11px] font-bold backdrop-blur-md shadow-soft">
            {startingPrice === 0 ? 'Free' : `$${Number(startingPrice).toFixed(0)}+`}
          </span>
        </div>

        {/* Arrow icon on hover */}
        <div className="absolute bottom-3 right-3 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-y-2 group-hover:translate-y-0">
          <div className="w-8 h-8 rounded-full bg-cream-50/90 backdrop-blur-md flex items-center justify-center shadow-soft">
            <ArrowUpRight className="w-4 h-4 text-sage-700" />
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-5 flex flex-col flex-1 gap-3">
        {/* Date + type row */}
        <div className="flex items-center justify-between text-[11px] font-medium text-sage-600">
          <span className="flex items-center gap-1.5">
            <Calendar className="w-3 h-3 shrink-0" />
            {formattedDate}
          </span>
          <span className="text-botanical-400 capitalize text-[10px] tracking-wide">
            {locationType.toLowerCase().replace('_', ' ')}
          </span>
        </div>

        {/* Title */}
        <h3 className="font-display text-lg font-semibold text-botanical-900 group-hover:text-sage-700 transition-colors duration-300 line-clamp-2 leading-snug">
          {title}
        </h3>

        {/* Tagline */}
        {tagline && (
          <p className="text-xs text-botanical-500 line-clamp-2 leading-relaxed font-light flex-1">
            {tagline}
          </p>
        )}

        {/* Footer */}
        <div className="pt-3 mt-auto border-t border-cream-200/70 flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-[11px] text-botanical-400">
            <MapPin className="w-3 h-3 shrink-0 text-sage-400" />
            <span className="truncate max-w-[120px] font-medium">{venueCity || 'Virtual'}</span>
          </div>

          <div className="text-right">
            <span className="text-[9px] uppercase tracking-widest text-botanical-400 block">From</span>
            <span className="font-display text-base font-bold text-sage-700 leading-none">
              {startingPrice === 0 ? 'Free' : `$${Number(startingPrice).toFixed(2)}`}
            </span>
          </div>
        </div>
      </div>
    </div>
  );

  if (onClick) return cardContent;

  return (
    <Link to={`/events/${slug}`} className="block h-full">
      {cardContent}
    </Link>
  );
};

export default EventCard;
