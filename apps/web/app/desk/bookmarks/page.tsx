import { DeskBookmarks } from '@/components/desk/DeskBookmarks';
import { Stickman } from '@/components/Stickman';

export const metadata = { title: 'Bookmarks' };

export default function DeskBookmarksPage() {
  return (
    <main className="desk-page">
      <header className="desk-section-heading">
        <div>
          <p className="eyebrow">MY SPACE / BOOKMARKS</p>
          <h1>useful places, remembered.</h1>
          <p>
            Keep references, docs and rabbit holes organized without mixing them into public
            content.
          </p>
        </div>
        <Stickman pose="point" />
      </header>
      <DeskBookmarks />
    </main>
  );
}
