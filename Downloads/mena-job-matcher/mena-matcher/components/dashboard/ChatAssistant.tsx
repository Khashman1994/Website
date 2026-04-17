'use client';
// components/dashboard/ChatAssistant.tsx
import React, { useState, useRef, useEffect } from 'react';
import { UserProfile } from '@/lib/types';
import { Send, Bot, User, Loader2, Sparkles, RefreshCw } from 'lucide-react';
import { useLang } from '@/lib/i18n/LanguageContext';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  type?: 'message' | 'profile_update' | 'keyword_suggestion';
}

interface ChatAssistantProps {
  profile: UserProfile;
  onProfileUpdate: (updated: UserProfile) => void;
  onKeywordSuggestion?: (keywords: string[]) => void;
}

export function ChatAssistant({ profile, onProfileUpdate, onKeywordSuggestion }: ChatAssistantProps) {
  const { lang } = useLang();
  const isAr = lang === 'ar';

  const firstName = profile.name?.split(' ')[0] ?? '';
  const location  = profile.location ?? (isAr ? 'المنطقة' : 'the region');

  // Personalised welcome — knows name and location
  const buildWelcome = (): Message => ({
    role: 'assistant',
    content: isAr
      ? `مرحباً ${firstName ? firstName + '،' : ''} لقد راجعت ملفك الشخصي 📋\nكيف يمكنني مساعدتك في بحثك عن وظيفة${location ? ' في ' + location : ''}؟`
      : `Hi ${firstName ? firstName + ',' : ''} I've reviewed your profile 📋\nHow can I help you with your job search${location ? ' in ' + location : ''}?`,
    type: 'message',
  });

  const [messages,  setMessages]  = useState<Message[]>([buildWelcome()]);
  const [input,     setInput]     = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [history,   setHistory]   = useState<{ role: 'user' | 'assistant'; content: string }[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Rebuild welcome on language switch
  useEffect(() => {
    setMessages([buildWelcome()]);
    setHistory([]);
  }, [lang]);

  // Quick-action chips
  const quickActions = isAr
    ? [
        { label: '📈 كيف أحسّن ملفي؟',        text: 'كيف يمكنني تحسين ملفي الشخصي للحصول على المزيد من الوظائف؟' },
        { label: '💰 الرواتب في السعودية',       text: 'ما هي الرواتب المعتادة في مجالي في المملكة العربية السعودية؟' },
        { label: '🎯 حضّرني لمقابلة',             text: 'ساعدني في التحضير لمقابلة عمل في مجالي' },
      ]
    : [
        { label: '📈 Improve my profile',         text: 'How can I improve my profile to get more job matches?' },
        { label: '💰 Salaries in Saudi Arabia',   text: 'What are typical salaries in my field in Saudi Arabia?' },
        { label: '🎯 Prep me for an interview',   text: 'Help me prepare for a job interview in my field' },
      ];

  const handleSend = async (text?: string) => {
    const msg = (text ?? input).trim();
    if (!msg || isLoading) return;

    const userMsg: Message = { role: 'user', content: msg };
    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    // Build history for this request
    const currentHistory = [...history, { role: 'user' as const, content: msg }];

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          profile,
          instruction: msg,
          lang,
          conversationHistory: history,
        }),
      });

      if (!res.ok) throw new Error();
      const data = await res.json();

      let assistantContent = data.message ?? '';

      if (data.type === 'profile_update' && data.profile) {
        onProfileUpdate(data.profile);
      }

      if (data.type === 'keyword_suggestion' && data.keywords) {
        onKeywordSuggestion?.(data.keywords);
      }

      const assistantMsg: Message = {
        role: 'assistant',
        content: assistantContent,
        type: data.type,
      };

      setMessages((prev) => [...prev, assistantMsg]);
      setHistory([...currentHistory, { role: 'assistant', content: assistantContent }]);

    } catch {
      setMessages((prev) => [...prev, {
        role: 'assistant',
        content: isAr
          ? 'عذراً، حدث خطأ. يرجى المحاولة مجدداً.'
          : 'Sorry, something went wrong. Please try again.',
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); }
  };

  const resetChat = () => {
    setMessages([buildWelcome()]);
    setHistory([]);
  };

  return (
    <div className="bg-white rounded-2xl border border-neutral-200 shadow-card overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 bg-secondary-900">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-full bg-primary-500 flex items-center justify-center flex-shrink-0">
            <Sparkles className="w-3.5 h-3.5 text-white" />
          </div>
          <div>
            <p className="text-white text-sm font-semibold leading-none">
              {isAr ? 'MENA Matcher Coach' : 'MENA Matcher Coach'}
            </p>
            <p className="text-white/50 text-[10px] mt-0.5">
              {isAr ? 'مدرّبك المهني الشخصي' : 'Your personal career coach'}
            </p>
          </div>
        </div>
        <button
          onClick={resetChat}
          className="p-1.5 text-white/40 hover:text-white/80 hover:bg-white/10 rounded-lg transition-colors"
          title={isAr ? 'محادثة جديدة' : 'New chat'}
        >
          <RefreshCw className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Messages */}
      <div className="h-60 overflow-y-auto p-4 space-y-3 bg-neutral-50">
        {messages.map((msg, idx) => {
          const isUser = msg.role === 'user';
          return (
            <div
              key={idx}
              className={`flex gap-2 items-end ${
                isUser
                  ? isAr ? 'flex-row' : 'flex-row-reverse'
                  : isAr ? 'flex-row-reverse' : 'flex-row'
              }`}
            >
              {/* Avatar */}
              <div className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 mb-0.5 ${
                isUser ? 'bg-primary-100' : 'bg-secondary-900'
              }`}>
                {isUser
                  ? <User className="w-3 h-3 text-primary-600" />
                  : <Bot className="w-3 h-3 text-white" />}
              </div>

              {/* Bubble */}
              <div className={`max-w-[78%] px-3 py-2 rounded-2xl text-sm leading-relaxed whitespace-pre-wrap ${
                isUser
                  ? 'bg-primary-500 text-white rounded-br-sm'
                  : 'bg-white text-neutral-800 border border-neutral-200 rounded-bl-sm shadow-sm'
              }`}>
                {msg.content}
                {msg.type === 'profile_update' && (
                  <span className="block mt-1 text-xs opacity-70">✓ {isAr ? 'تم الحفظ' : 'Saved'}</span>
                )}
              </div>
            </div>
          );
        })}

        {/* Typing indicator */}
        {isLoading && (
          <div className={`flex gap-2 items-end ${isAr ? 'flex-row-reverse' : 'flex-row'}`}>
            <div className="w-6 h-6 rounded-full bg-secondary-900 flex items-center justify-center flex-shrink-0">
              <Bot className="w-3 h-3 text-white" />
            </div>
            <div className="px-3 py-2 bg-white border border-neutral-200 rounded-2xl rounded-bl-sm shadow-sm">
              <div className="flex gap-1 items-center h-4">
                <span className="w-1.5 h-1.5 bg-neutral-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                <span className="w-1.5 h-1.5 bg-neutral-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                <span className="w-1.5 h-1.5 bg-neutral-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Quick actions */}
      <div className={`px-3 pt-2 pb-1 flex flex-wrap gap-1.5 ${isAr ? 'flex-row-reverse' : ''}`}>
        {quickActions.map((qa) => (
          <button
            key={qa.label}
            onClick={() => handleSend(qa.text)}
            disabled={isLoading}
            className="px-2.5 py-1 text-[11px] bg-neutral-100 hover:bg-primary-50 hover:text-primary-700 text-neutral-600 rounded-full transition-colors disabled:opacity-40 font-medium"
          >
            {qa.label}
          </button>
        ))}
      </div>

      {/* Input */}
      <div className="border-t border-neutral-100 p-3 flex gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={isAr ? 'اسألني أي شيء...' : 'Ask me anything...'}
          disabled={isLoading}
          dir={isAr ? 'rtl' : 'ltr'}
          className="flex-1 px-3 py-2 bg-neutral-100 border-0 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all disabled:opacity-50 placeholder:text-neutral-400"
        />
        <button
          onClick={() => handleSend()}
          disabled={!input.trim() || isLoading}
          className="w-9 h-9 bg-primary-500 hover:bg-primary-600 disabled:opacity-40 disabled:cursor-not-allowed text-white rounded-xl flex items-center justify-center transition-colors flex-shrink-0"
        >
          {isLoading
            ? <Loader2 className="w-4 h-4 animate-spin" />
            : <Send className={`w-4 h-4 ${isAr ? 'rotate-180' : ''}`} />}
        </button>
      </div>
    </div>
  );
}