import React, { useEffect, useRef, useState } from 'react';
import QRCode from 'qrcode';
import { Calendar, MapPin, Download, CheckCircle2, Clock, Tag, Wifi } from 'lucide-react';
import { Registration } from '../types';
import { format } from 'date-fns';

interface QrTicketDisplayProps {
  registration: Registration;
  onClose?: () => void;
}

export const QrTicketDisplay: React.FC<QrTicketDisplayProps> = ({ registration, onClose }) => {
  const [qrDataUrl, setQrDataUrl] = useState<string>('');

  useEffect(() => {
    const generateQR = async () => {
      try {
        const qrData = JSON.stringify({
          ticketCode: registration.ticketCode,
          eventId: registration.eventId,
          attendeeEmail: registration.attendeeEmail,
        });

        const dataUrl = await QRCode.toDataURL(qrData, {
          width: 200,
          margin: 2,
          color: {
            dark: '#22211C',
            light: '#FDFBF7',
          },
          errorCorrectionLevel: 'H',
        });

        setQrDataUrl(dataUrl);
      } catch (err) {
        console.error('QR generation failed:', err);
      }
    };

    generateQR();
  }, [registration.ticketCode]);

  const handleDownload = () => {
    if (!qrDataUrl) return;
    const link = document.createElement('a');
    link.download = `pass-${registration.ticketCode}.png`;
    link.href = qrDataUrl;
    link.click();
  };

  const isCancelled = registration.status === 'CANCELLED' || registration.status === 'REFUNDED';

  return (
    <div
      className={`relative overflow-hidden rounded-natural border ${
        isCancelled
          ? 'border-red-200 opacity-70 bg-red-50/50'
          : registration.status === 'CHECKED_IN'
          ? 'border-emerald-300 bg-cream-50'
          : 'border-cream-300 bg-cream-50'
      } shadow-elevated-natural`}
      id={`ticket-${registration.id}`}
    >
      {/* Decorative top sage stripe */}
      <div
        className={`h-1.5 w-full ${
          isCancelled
            ? 'bg-red-500'
            : registration.status === 'CHECKED_IN'
            ? 'bg-emerald-600'
            : 'bg-sage-600'
        }`}
      />

      <div className="p-6">
        {/* Header */}
        <div className="flex justify-between items-start mb-4">
          <div className="flex-1 min-w-0 pr-3">
            {registration.bannerImageUrl && (
              <img
                src={registration.bannerImageUrl}
                alt={registration.eventTitle}
                className="w-full h-24 object-cover rounded-natural mb-3 border border-cream-200"
              />
            )}
            <h3 className="font-serif font-bold text-lg text-botanical-900 line-clamp-2 leading-snug">
              {registration.eventTitle}
            </h3>
            <div className="flex items-center gap-2 mt-2">
              <span className="category-pill text-xs">{registration.category?.replace('_', ' ')}</span>
              <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                registration.status === 'CHECKED_IN'
                  ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                  : 'bg-sage-100 text-sage-800 border border-sage-200'
              }`}>
                {registration.status === 'CHECKED_IN' ? 'Checked In' : 'Confirmed'}
              </span>
            </div>
          </div>

          {/* QR Code */}
          <div className="flex-shrink-0 text-center">
            <div className="w-24 h-24 rounded-natural overflow-hidden bg-cream-100 flex items-center justify-center border border-cream-300 p-1 shadow-sm">
              {qrDataUrl ? (
                <img src={qrDataUrl} alt="QR Code" className="w-full h-full rounded-lg" />
              ) : (
                <div className="w-full h-full bg-cream-200 rounded-lg animate-pulse" />
              )}
            </div>
            <p className="text-[10px] text-botanical-500 mt-1 font-mono">Gate Pass</p>
          </div>
        </div>

        {/* Divider with circles */}
        <div className="relative my-4">
          <div className="border-t border-dashed border-cream-300" />
          <div className="absolute -left-8 top-1/2 -translate-y-1/2 w-4 h-4 rounded-full bg-cream-50 border border-cream-200" />
          <div className="absolute -right-8 top-1/2 -translate-y-1/2 w-4 h-4 rounded-full bg-cream-50 border border-cream-200" />
        </div>

        {/* Ticket Details Grid */}
        <div className="grid grid-cols-2 gap-3 mb-4 text-xs">
          <div>
            <p className="text-[10px] text-botanical-500 uppercase tracking-wider mb-0.5 flex items-center gap-1">
              <Calendar size={10} className="text-sage-600" /> Schedule
            </p>
            <p className="font-semibold text-botanical-900">
              {registration.startDate ? format(new Date(registration.startDate), 'MMM d, yyyy') : 'TBD'}
            </p>
            <p className="text-botanical-500 text-[11px]">
              {registration.startDate ? format(new Date(registration.startDate), 'h:mm a') : ''}
            </p>
          </div>

          <div>
            <p className="text-[10px] text-botanical-500 uppercase tracking-wider mb-0.5 flex items-center gap-1">
              {registration.locationType === 'VIRTUAL' ? <Wifi size={10} className="text-sage-600" /> : <MapPin size={10} className="text-sage-600" />} Venue
            </p>
            <p className="font-semibold text-botanical-900 truncate">
              {registration.locationType === 'VIRTUAL' ? 'Online Event' : (registration.venueName || 'TBD')}
            </p>
            <p className="text-botanical-500 text-[11px] truncate">
              {registration.venueCity || (registration.locationType === 'VIRTUAL' ? 'Virtual' : '')}
            </p>
          </div>

          <div>
            <p className="text-[10px] text-botanical-500 uppercase tracking-wider mb-0.5 flex items-center gap-1">
              <Tag size={10} className="text-sage-600" /> Pass Type
            </p>
            <p className="font-semibold text-botanical-900">{registration.tierName || 'General Admission'}</p>
            <p className="text-botanical-500 text-[11px]">
              {registration.amountPaid === 0 ? 'Complimentary' : `$${Number(registration.amountPaid).toFixed(2)}`}
            </p>
          </div>

          <div>
            <p className="text-[10px] text-botanical-500 uppercase tracking-wider mb-0.5 flex items-center gap-1">
              <Clock size={10} className="text-sage-600" /> Issued
            </p>
            <p className="font-semibold text-botanical-900">
              {format(new Date(registration.createdAt), 'MMM d, yyyy')}
            </p>
          </div>
        </div>

        {/* Ticket Code Tag */}
        <div className="bg-cream-100 rounded-natural px-4 py-3 flex items-center justify-between border border-cream-200 mb-4 shadow-sm">
          <div>
            <p className="text-[10px] text-botanical-500 uppercase tracking-wider">Admission Code</p>
            <p className="font-mono font-bold text-sm text-sage-800 tracking-widest">
              {registration.ticketCode}
            </p>
          </div>
          <p className="text-xs text-botanical-600 font-medium">
            {registration.attendeeName}
          </p>
        </div>

        {/* Perks */}
        {registration.tierPerks && registration.tierPerks.length > 0 && (
          <div className="mb-4">
            <p className="text-[10px] uppercase font-semibold text-botanical-500 tracking-wider mb-1.5">Includes:</p>
            <div className="flex flex-wrap gap-1.5">
              {registration.tierPerks.map((perk, i) => (
                <span key={i} className="text-[11px] px-2.5 py-0.5 bg-sage-100 text-sage-800 border border-sage-200 rounded-full font-medium">
                  {perk}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-2">
          <button
            onClick={handleDownload}
            disabled={!qrDataUrl}
            className="btn-secondary text-xs py-2 gap-1.5 flex-1 shadow-sm"
            id={`download-ticket-${registration.id}`}
          >
            <Download size={13} /> Download Pass
          </button>
          {registration.locationType === 'VIRTUAL' && registration.virtualLink && (
            <a
              href={registration.virtualLink}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-primary text-xs py-2 gap-1.5 flex-1 shadow-sm"
            >
              <Wifi size={13} /> Join Online
            </a>
          )}
        </div>

        {/* Checked in banner */}
        {registration.status === 'CHECKED_IN' && registration.checkedInAt && (
          <div className="mt-3 flex items-center gap-2 text-xs text-emerald-800 bg-emerald-50 px-3 py-2 rounded-natural border border-emerald-200">
            <CheckCircle2 size={13} className="text-emerald-600" />
            Checked in at {format(new Date(registration.checkedInAt), 'h:mm a, MMM d')}
          </div>
        )}
      </div>

      {/* Watermark for cancelled */}
      {isCancelled && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <span className="text-3xl font-black text-red-500/20 rotate-[-25deg] select-none tracking-widest">
            {registration.status}
          </span>
        </div>
      )}
    </div>
  );
};

export default QrTicketDisplay;
