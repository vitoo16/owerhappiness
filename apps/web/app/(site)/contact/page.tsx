import { SectionLabel } from '@/components/SectionLabel';
import { Stickman } from '@/components/Stickman';
import { getPublicSettings } from '@/lib/server-data';
import { textSetting } from '@/lib/settings';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'Contact' };

const socialLinks = [
  ['githubUrl', 'github'],
  ['upworkUrl', 'upwork'],
  ['linkedinUrl', 'linkedin'],
] as const;

export default async function ContactPage() {
  const settings = await getPublicSettings();
  const email = textSetting(settings, 'contactEmail', 'hello@example.com');

  return (
    <section className="page-shell section-blush">
      <div className="container">
        <SectionLabel index="HELLO">CONTACT</SectionLabel>

        <div className="contact-page">
          <Stickman pose="wave" />
          <div>
            <p className="hand-note">my inbox is over here ↓</p>
            <h1>
              have something
              <br />
              interesting in mind?
            </h1>
            <a className="contact-email" href={`mailto:${email}`}>
              {email}
            </a>
            <p>{textSetting(settings, 'availability')}</p>

            <div className="socials">
              {socialLinks.map(([key, label]) => {
                const href = textSetting(settings, key);
                return href ? (
                  <a key={key} href={href} target="_blank" rel="noreferrer">
                    {label} ↗
                  </a>
                ) : null;
              })}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
