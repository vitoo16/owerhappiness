import Link from 'next/link';

export function SiteFooter() {
  return (
    <footer className="site-footer">
      <span>made somewhere between Figma &amp; VS Code.</span>
      <div>
        <Link href="/work">work</Link>
        <Link href="/admin">admin</Link>
      </div>
    </footer>
  );
}
