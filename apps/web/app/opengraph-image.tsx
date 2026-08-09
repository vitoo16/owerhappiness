import { ImageResponse } from 'next/og';
import { getPublicSettings } from '@/lib/server-data';
import { textSetting } from '@/lib/settings';

export const alt = 'Thông — designer-ish fullstack developer';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default async function OpenGraphImage() {
  const settings = await getPublicSettings().catch(() => ({}));
  const name = textSetting(settings, 'ownerName', 'Thông');
  const primary = textSetting(settings, 'heroPrimary', 'designer-ish');
  const secondary = textSetting(settings, 'heroSecondary', 'fullstack developer');

  return new ImageResponse(
    <div
      style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        padding: '64px 72px',
        color: '#241d20',
        background: '#f6e8e7',
        fontFamily: 'Arial, sans-serif',
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', fontSize: 30, fontWeight: 800, letterSpacing: '-1px' }}>
          {name.toUpperCase()}
          <span style={{ color: '#b86a38' }}>.</span>
        </div>
        <div style={{ display: 'flex', fontSize: 18, letterSpacing: '4px', color: '#776a6f' }}>
          PORTFOLIO / 2026
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
        <div style={{ display: 'flex', fontSize: 98, fontWeight: 300, letterSpacing: '-7px' }}>
          {primary}
        </div>
        <div
          style={{
            display: 'flex',
            marginLeft: 190,
            fontSize: 98,
            fontWeight: 300,
            letterSpacing: '-7px',
          }}
        >
          {secondary}
          <span style={{ color: '#b86a38' }}>.</span>
        </div>
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
        <div
          style={{ display: 'flex', gap: 10, alignItems: 'center', color: '#776a6f', fontSize: 19 }}
        >
          <span style={{ display: 'flex', width: 54, height: 1, background: '#241d20' }} />
          code, design &amp; useful things
        </div>
        <div style={{ display: 'flex', fontSize: 40, transform: 'rotate(-7deg)' }}>↗</div>
      </div>
    </div>,
    size,
  );
}
