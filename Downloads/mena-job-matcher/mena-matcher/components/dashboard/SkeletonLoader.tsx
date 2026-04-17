// components/dashboard/SkeletonLoader.tsx
'use client';

// Single pulsing bar
function Bone({ className }: { className: string }) {
  return (
    <div className={`bg-slate-100 rounded-lg animate-pulse ${className}`} />
  );
}

// One fake job card
function JobCardSkeleton({ delay = 0 }: { delay?: number }) {
  return (
    <div
      className="bg-white rounded-2xl border border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] p-5 animate-pulse"
      style={{ animationDelay: `${delay}ms` }}
    >
      <div className="flex items-start gap-4">
        {/* Score ring placeholder */}
        <div className="w-16 h-16 rounded-full bg-slate-100 flex-shrink-0" />

        <div className="flex-grow space-y-3">
          {/* Title */}
          <Bone className="h-5 w-3/4" />
          {/* Meta row */}
          <div className="flex gap-3">
            <Bone className="h-3.5 w-24" />
            <Bone className="h-3.5 w-20" />
            <Bone className="h-3.5 w-16" />
          </div>
          {/* Tags */}
          <div className="flex gap-2">
            <Bone className="h-5 w-16 rounded-full" />
            <Bone className="h-5 w-14 rounded-full" />
          </div>
          {/* CTA row */}
          <div className="flex items-center justify-between pt-1">
            <Bone className="h-4 w-28" />
            <Bone className="h-7 w-20 rounded-full" />
          </div>
        </div>
      </div>
    </div>
  );
}

// Sidebar profile card skeleton
export function ProfileCardSkeleton() {
  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] overflow-hidden animate-pulse">
      {/* Header */}
      <div className="h-24 bg-slate-100" />
      <div className="px-5 py-5 space-y-4">
        <Bone className="h-4 w-1/2" />
        <Bone className="h-4 w-2/3" />
        <div className="flex gap-2 flex-wrap">
          {[1,2,3,4].map(i => <Bone key={i} className="h-6 w-16 rounded-full" />)}
        </div>
        <Bone className="h-4 w-full" />
        <Bone className="h-4 w-4/5" />
      </div>
    </div>
  );
}

// Main export: N job card skeletons
export function JobListSkeleton({ count = 5 }: { count?: number }) {
  return (
    <div className="space-y-4">
      {Array.from({ length: count }).map((_, i) => (
        <JobCardSkeleton key={i} delay={i * 80} />
      ))}
    </div>
  );
}