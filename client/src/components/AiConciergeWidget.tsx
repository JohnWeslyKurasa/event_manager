import React, { useState } from 'react';
import { Sparkles, Send, Bot, X, Loader2 } from 'lucide-react';
import { aiApi } from '../services/api';

interface Message {
  sender: 'user' | 'ai';
  text: string;
}

interface AiConciergeWidgetProps {
  eventTitle?: string;
  eventId?: string;
}

export const AiConciergeWidget: React.FC<AiConciergeWidgetProps> = ({
  eventTitle = 'this Event',
  eventId,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      sender: 'ai',
      text: `Greetings! I am your EventPulse Concierge for ${eventTitle}. How may I assist you with schedule details, tickets, or venue logistics?`,
    },
  ]);

  const handleSend = async () => {
    if (!input.trim() || loading) return;
    const userMsg = input.trim();
    setMessages((prev) => [...prev, { sender: 'user', text: userMsg }]);
    setInput('');
    setLoading(true);

    try {
      if (eventId) {
        const history = messages.map((m) => ({
          role: m.sender === 'user' ? 'user' : 'model',
          content: m.text,
        }));
        const res = await aiApi.conciergeQuery({
          eventId,
          question: userMsg,
          conversationHistory: history,
        });
        if (res.data?.answer) {
          setMessages((prev) => [
            ...prev,
            { sender: 'ai', text: res.data!.answer },
          ]);
          setLoading(false);
          return;
        }
      }

      // Simulated natural fallback
      setTimeout(() => {
        setMessages((prev) => [
          ...prev,
          {
            sender: 'ai',
            text: `Regarding "${userMsg}", all verified schedules and tier details are available on this event page. Let me know if you need specific accommodation or parking instructions!`,
          },
        ]);
        setLoading(false);
      }, 700);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          sender: 'ai',
          text: `Thank you for your question regarding "${userMsg}". Please check the event agenda or contact the organizer directly.`,
        },
      ]);
      setLoading(false);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {!isOpen ? (
        <button
          onClick={() => setIsOpen(true)}
          className="flex items-center space-x-2 bg-sage-600 hover:bg-sage-700 text-cream-50 px-5 py-3.5 rounded-full shadow-elevated-natural transition-all duration-300 hover:scale-105"
        >
          <Sparkles className="w-5 h-5 text-cream-100" />
          <span className="font-medium text-sm">Ask Event AI</span>
        </button>
      ) : (
        <div className="w-96 max-w-[calc(100vw-2rem)] bg-cream-50 border border-cream-200 rounded-natural shadow-elevated-natural overflow-hidden flex flex-col h-[500px] animate-scale-in">
          {/* Header */}
          <div className="bg-sage-600 p-4 text-cream-50 flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Bot className="w-5 h-5 text-cream-100" />
              <div>
                <h4 className="font-serif text-sm font-medium">EventPulse Concierge</h4>
                <p className="text-[11px] text-sage-200">Natural & Intelligent Assistant</p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="text-cream-200 hover:text-cream-50 transition-colors p-1"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 p-4 overflow-y-auto space-y-3 bg-cream-100/50">
            {messages.map((m, i) => (
              <div
                key={i}
                className={`flex ${m.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[85%] px-4 py-2.5 rounded-natural text-xs leading-relaxed ${
                    m.sender === 'user'
                      ? 'bg-sage-600 text-cream-50 rounded-br-none'
                      : 'bg-cream-50 text-botanical-800 border border-cream-200 shadow-soft-natural rounded-bl-none'
                  }`}
                >
                  {m.text}
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex justify-start">
                <div className="px-4 py-2.5 rounded-natural text-xs bg-cream-50 text-botanical-500 border border-cream-200 shadow-soft-natural flex items-center gap-2">
                  <Loader2 className="w-3.5 h-3.5 animate-spin text-sage-600" />
                  <span>Thinking...</span>
                </div>
              </div>
            )}
          </div>

          {/* Input Box */}
          <div className="p-3 bg-cream-50 border-t border-cream-200 flex items-center space-x-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              placeholder="Ask a question about this event..."
              className="flex-1 text-xs bg-cream-100 border border-cream-200 rounded-natural px-3 py-2 text-botanical-800 placeholder-botanical-500 focus:outline-none focus:ring-1 focus:ring-sage-500"
            />
            <button
              onClick={handleSend}
              disabled={loading || !input.trim()}
              className="p-2 bg-sage-600 hover:bg-sage-700 text-cream-50 rounded-natural transition-colors disabled:opacity-50"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AiConciergeWidget;
