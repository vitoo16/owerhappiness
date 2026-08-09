import type { Metadata } from 'next';
import { getPublicSettings } from '@/lib/server-data';
import { textSetting } from '@/lib/settings';
import './globals.css';

export async function generateMetadata(): Promise<Metadata> {
  try {
    const settings = await getPublicSettings();
    return {
      title: {
        default: textSetting(
          settings,
          'seoTitle',
          'Thông — Designer-ish / Fullstack Developer',
        ),
        template: `%s — ${textSetting(settings, 'ownerName', 'Thông')}`,
      },
      description: textSetting(
        settings,
        'seoDescription',
        'Personal portfolio, case studies and creative experiments.',
      ),
    };
  } catch {
    return {
      title: 'Thông — Designer-ish / Fullstack Developer',
      description: 'Personal portfolio, case studies and creative experiments.',
    };
  }
}

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const defaultTheme = await resolveDefaultTheme();

  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themePrepaintScript(defaultTheme) }} />
      </head>
      <body>{children}</body>
    </html>
  );
}

async function resolveDefaultTheme() {
  try {
    const settings = await getPublicSettings();
    return textSetting(settings, 'defaultTheme', 'system');
  } catch {
    // The local API may still be booting. System theme is a content-independent fallback.
    return 'system';
  }
}

function themePrepaintScript(defaultTheme: string) {
  const fallback = JSON.stringify(defaultTheme);
  return `(function(){try{var stored=localStorage.getItem('portfolio-theme');var fallback=${fallback};var value=stored==='dark'||stored==='light'?stored:(fallback==='dark'||fallback==='light'?fallback:(matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light'));document.documentElement.dataset.theme=value}catch(e){}})()`;
}
