import { DeskTools } from '@/components/desk/DeskTools';
import { Stickman } from '@/components/Stickman';

export const metadata = { title: 'My Desk' };

export default function DeskPage() {
  return (
    <main className="desk-page">
      <header className="desk-welcome">
        <div>
          <p className="eyebrow">OWNER ONLY / DESK</p>
          <h1>useful little things.</h1>
          <p>Small tools I actually want within reach.</p>
        </div>
        <Stickman pose="laptop" />
      </header>
      <DeskTools />
    </main>
  );
}
