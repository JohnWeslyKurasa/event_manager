import React, { useState } from 'react';
import { Search, CheckCircle2, XCircle, AlertTriangle, Loader2, ScanLine, Clock, User, Tag } from 'lucide-react';
import { registrationsApi } from '../services/api';
import { Registration } from '../types';
import { format } from 'date-fns';

interface CheckInScannerConsoleProps {
  eventId: string;
}

type CheckInResult = {
  status: 'success' | 'error' | 'already_used' | 'invalid';
  message: string;
  registration?: Registration;
};

const CheckInScannerConsole: React.FC<CheckInScannerConsoleProps> = ({ eventId }) => {
  const [ticketCode, setTicketCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<CheckInResult | null>(null);
  const [history, setHistory] = useState<Array<CheckInResult & { timestamp: Date; code: string }>>([]);

  const handleCheckIn = async () => {
    const code = ticketCode.trim().toUpperCase();
    if (!code) return;

    setIsLoading(true);
    setResult(null);

    try {
      const response = await registrationsApi.checkIn({ ticketCode: code, eventId });

      if (response.success && response.data) {
        const successResult: CheckInResult = {
          status: 'success',
          message: response.message || 'Check-in successful!',
          registration: response.data,
        };
        setResult(successResult);
        setHistory((prev) => [{ ...successResult, timestamp: new Date(), code }, ...prev.slice(0, 19)]);
      }
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Check-in failed';

      let status: CheckInResult['status'] = 'error';
      if (errorMsg.toLowerCase().includes('already used') || errorMsg.toLowerCase().includes('already')) {
        status = 'already_used';
      } else if (errorMsg.toLowerCase().includes('not found')) {
        status = 'invalid';
      }

      const errorResult: CheckInResult = { status, message: errorMsg };
      setResult(errorResult);
      setHistory((prev) => [{ ...errorResult, timestamp: new Date(), code }, ...prev.slice(0, 19)]);
    } finally {
      setIsLoading(false);
      setTicketCode('');
    }
  };

  const ResultDisplay = () => {
    if (!result) return null;

    const config = {
      success: {
        bg: 'bg-sage-50 border-sage-200 text-sage-900',
        icon: CheckCircle2,
        iconColor: 'text-sage-700',
        title: 'Check-In Successful!',
      },
      already_used: {
        bg: 'bg-sand-50 border-sand-300 text-botanical-900',
        icon: AlertTriangle,
        iconColor: 'text-sand-600',
        title: 'Already Checked In',
      },
      error: {
        bg: 'bg-red-50 border-red-200 text-red-900',
        icon: XCircle,
        iconColor: 'text-red-600',
        title: 'Check-In Failed',
      },
      invalid: {
        bg: 'bg-red-50 border-red-200 text-red-900',
        icon: XCircle,
        iconColor: 'text-red-600',
        title: 'Invalid Ticket',
      },
    };

    const cfg = config[result.status];
    const Icon = cfg.icon;

    return (
      <div className={`p-5 rounded-natural border animate-scale-in shadow-soft ${cfg.bg}`}>
        <div className="flex items-start gap-3">
          <Icon size={22} className={cfg.iconColor} />
          <div className="flex-1">
            <p className="font-bold mb-1">{cfg.title}</p>
            <p className="text-sm opacity-90 mb-3">{result.message}</p>

            {result.registration && (
              <div className="grid grid-cols-2 gap-2.5 text-sm">
                <div className="flex items-center gap-2 text-botanical-700">
                  <User size={13} className="text-sage-700" />
                  <span>{result.registration.attendeeName}</span>
                </div>
                <div className="flex items-center gap-2 text-botanical-700">
                  <Tag size={13} className="text-sage-700" />
                  <span>{result.registration.tierName || 'General'}</span>
                </div>
                <div className="col-span-2 font-mono text-sage-800 text-xs bg-white/80 border border-cream-200 px-2.5 py-1.5 rounded-natural">
                  {result.registration.ticketCode}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6" id="check-in-scanner-console">
      {/* Scanner Header */}
      <div className="flex items-center gap-3 p-4 bg-white rounded-natural border border-cream-200 shadow-soft">
        <div className="w-10 h-10 bg-sage-600 rounded-natural flex items-center justify-center text-white shadow-soft">
          <ScanLine size={20} />
        </div>
        <div>
          <p className="font-serif font-bold text-botanical-900">Ticket Scanner Console</p>
          <p className="text-xs text-botanical-500">Enter ticket code manually or use a QR scanner</p>
        </div>
        <div className="ml-auto flex items-center gap-2">
          <div className="w-2 h-2 bg-sage-500 rounded-full animate-pulse" />
          <span className="text-xs text-sage-700 font-medium">Ready</span>
        </div>
      </div>

      {/* Input */}
      <div className="space-y-3">
        <label className="block text-xs font-semibold text-botanical-700">Ticket Code</label>
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-botanical-400" />
            <input
              id="ticket-code-input"
              type="text"
              value={ticketCode}
              onChange={(e) => setTicketCode(e.target.value.toUpperCase())}
              onKeyDown={(e) => e.key === 'Enter' && handleCheckIn()}
              placeholder="EVT-XXXX-YYYY"
              className="w-full pl-10 pr-4 py-2.5 bg-white border border-cream-200 rounded-natural text-sm text-botanical-900 placeholder-botanical-400 focus:outline-none focus:border-sage-500 font-mono tracking-widest uppercase"
              autoComplete="off"
              autoFocus
            />
          </div>
          <button
            onClick={handleCheckIn}
            disabled={isLoading || !ticketCode.trim()}
            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-natural bg-sage-600 hover:bg-sage-700 text-white text-xs font-bold shadow-soft transition-all disabled:opacity-50"
            id="check-in-submit-button"
          >
            {isLoading ? (
              <><Loader2 size={16} className="animate-spin" /> Checking...</>
            ) : (
              <><ScanLine size={16} /> Check In</>
            )}
          </button>
        </div>
      </div>

      {/* Result */}
      <ResultDisplay />

      {/* Recent Check-ins */}
      {history.length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-3">
            <Clock size={14} className="text-botanical-500" />
            <p className="text-sm font-semibold text-botanical-800">Recent Check-ins</p>
            <span className="ml-auto text-xs text-botanical-500">{history.length} this session</span>
          </div>
          <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
            {history.map((item, i) => (
              <div
                key={i}
                className={`flex items-center gap-3 p-3 rounded-natural border text-sm ${
                  item.status === 'success'
                    ? 'bg-sage-50/70 border-sage-200 text-botanical-900'
                    : 'bg-red-50/70 border-red-200 text-botanical-900'
                }`}
              >
                {item.status === 'success' ? (
                  <CheckCircle2 size={15} className="text-sage-600 flex-shrink-0" />
                ) : (
                  <XCircle size={15} className="text-red-500 flex-shrink-0" />
                )}
                <span className="font-mono font-medium flex-1 text-xs">{item.code}</span>
                {item.registration && (
                  <span className="text-botanical-600 text-xs truncate max-w-[100px]">
                    {item.registration.attendeeName}
                  </span>
                )}
                <span className="text-botanical-400 text-xs flex-shrink-0">
                  {format(item.timestamp, 'HH:mm:ss')}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default CheckInScannerConsole;
