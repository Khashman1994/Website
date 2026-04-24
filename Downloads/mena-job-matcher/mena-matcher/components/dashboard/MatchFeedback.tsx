'use client';
import { useState } from 'react';

interface Props {
  jobId:   string;
  aiScore: number;
}

export function MatchFeedback({ jobId, aiScore }: Props) {
  const [state, setState] = useState<'idle' | 'up' | 'down' | 'loading'>('idle');

  const handleFeedback = async (vote: 'up' | 'down') => {
    setState('loading');
    try {
      const { createClient } = await import('@/lib/supabase');
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { setState('idle'); return; }

      await supabase.from('match_feedback').upsert({
        user_id:  user.id,
        job_id:   jobId,
        ai_score: aiScore,
        feedback: vote,
      }, { onConflict: 'user_id,job_id' });

      setState(vote);
    } catch {
      setState('idle');
    }
  };

  if (state === 'up') {
    return (
      <p className="text-xs text-emerald-600 font-medium mt-3">
        ✅ Thanks! We will look for more jobs like this.
      </p>
    );
  }

  if (state === 'down') {
    return (
      <p className="text-xs text-orange-600 mt-3 leading-relaxed">
        💡 Thanks for the feedback! Pro tip: The more specific your CV and search terms are, the better our AI can match you. Try updating your profile for better results!
      </p>
    );
  }

  return (
    <div className="flex items-center gap-2 mt-3">
      <span className="text-xs text-slate-400">How accurate is this match?</span>
      <button
        onClick={() => handleFeedback('up')}
        disabled={state === 'loading'}
        className="text-sm hover:scale-125 transition-transform disabled:opacity-40"
      >
        👍
      </button>
      <button
        onClick={() => handleFeedback('down')}
        disabled={state === 'loading'}
        className="text-sm hover:scale-125 transition-transform disabled:opacity-40"
      >
        👎
      </button>
    </div>
  );
}
