import { DeskSnippets } from '@/components/desk/DeskSnippets';
import { Stickman } from '@/components/Stickman';

export const metadata = { title: 'Snippets' };

export default function DeskSnippetsPage() {
  return (
    <main className="desk-page">
      <header className="desk-section-heading">
        <div>
          <p className="eyebrow">MY SPACE / SNIPPETS</p>
          <h1>code worth reusing.</h1>
          <p>A small private library for patterns, commands and fixes that earned a second life.</p>
        </div>
        <Stickman pose="laptop" />
      </header>
      <DeskSnippets />
    </main>
  );
}
