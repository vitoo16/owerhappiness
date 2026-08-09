import { DeskTools } from '@/components/desk/DeskTools';
import { Stickman } from '@/components/Stickman';

export const metadata = { title: 'Utilities' };

export default function DeskToolsPage() {
  return (
    <main className="desk-page">
      <header className="desk-section-heading">
        <div>
          <p className="eyebrow">MY SPACE / UTILITIES</p>
          <h1>tiny tools, close by.</h1>
          <p>Everything here runs locally in your browser. Inputs are not saved or sent.</p>
        </div>
        <Stickman pose="laptop" />
      </header>
      <DeskTools />
    </main>
  );
}
