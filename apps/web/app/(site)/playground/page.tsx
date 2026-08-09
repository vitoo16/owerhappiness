import Image from 'next/image';
import type { PlaygroundItemDto } from '@portfolio/contracts';
import { SectionLabel } from '@/components/SectionLabel';
import { Stickman } from '@/components/Stickman';
import { publicApi } from '@/lib/api';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'Playground' };

export default async function PlaygroundPage() {
  const items = await publicApi<PlaygroundItemDto[]>('/playground');

  return (
    <section className="page-shell section-peach">
      <div className="container">
        <SectionLabel index="LAB">PLAYGROUND</SectionLabel>

        <header className="page-heading split-heading">
          <div>
            <h1>
              things I made
              <br />
              because I wanted to.
            </h1>
            <p>Experiments, interfaces, visual studies and small weird ideas.</p>
          </div>
          <Stickman pose="draw" />
        </header>

        <div className="lab-grid">
          {items.map((item, index) => (
            <article key={item.id} className="lab-item">
              <span className="lab-number">{String(index + 1).padStart(2, '0')}</span>
              {item.thumbnail ? (
                <Image
                  src={item.thumbnail.url}
                  alt={item.thumbnail.altText || item.title}
                  width={item.thumbnail.width ?? 1200}
                  height={item.thumbnail.height ?? 900}
                  sizes="(max-width: 900px) 100vw, 50vw"
                />
              ) : (
                <div className="lab-doodle">
                  <Stickman pose={index % 2 ? 'think' : 'laptop'} />
                </div>
              )}
              <span className="eyebrow">{item.type}</span>
              <h2>{item.title}</h2>
              <p>{item.summary}</p>
              <div className="lab-links">
                {item.liveUrl ? (
                  <a href={item.liveUrl} target="_blank" rel="noreferrer">
                    live ↗
                  </a>
                ) : null}
                {item.sourceUrl ? (
                  <a href={item.sourceUrl} target="_blank" rel="noreferrer">
                    source ↗
                  </a>
                ) : null}
              </div>
            </article>
          ))}
        </div>

        {!items.length ? <p className="empty-copy">The lab is quiet for now.</p> : null}
      </div>
    </section>
  );
}
