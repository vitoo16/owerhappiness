'use client';

import { useEffect, useState } from 'react';

export function DeskGreeting({ name }: { name: string }) {
  const [now, setNow] = useState<Date | null>(null);

  useEffect(() => {
    const update = () => setNow(new Date());
    update();
    const timer = window.setInterval(update, 30_000);
    return () => window.clearInterval(timer);
  }, []);

  const hour = now?.getHours() ?? 12;
  const greeting = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening';

  return (
    <div className="desk-greeting">
      <p className="eyebrow">OWNER ONLY / MY SPACE</p>
      <h1>
        {greeting}, {name}.
      </h1>
      <div className="desk-date" aria-live="off">
        <span>
          {now
            ? new Intl.DateTimeFormat(undefined, {
                weekday: 'long',
                day: 'numeric',
                month: 'long',
                year: 'numeric',
              }).format(now)
            : 'Your private workspace'}
        </span>
        <strong>
          {now
            ? new Intl.DateTimeFormat(undefined, { hour: '2-digit', minute: '2-digit' }).format(now)
            : '—'}
        </strong>
      </div>
    </div>
  );
}
