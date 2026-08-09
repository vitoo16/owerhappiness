import { DeskNotes } from '@/components/desk/DeskNotes';
import { Stickman } from '@/components/Stickman';

export const metadata = { title: 'Notes' };

export default function DeskNotesPage() {
  return (
    <main className="desk-page">
      <header className="desk-section-heading">
        <div>
          <p className="eyebrow">MY SPACE / NOTES</p>
          <h1>thoughts worth keeping.</h1>
          <p>Private notes are stored in PostgreSQL and never exposed through public routes.</p>
        </div>
        <Stickman pose="think" />
      </header>
      <DeskNotes />
    </main>
  );
}
