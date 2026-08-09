import { SectionLabel } from '@/components/SectionLabel';
import { Stickman } from '@/components/Stickman';
import { getPublicSettings } from '@/lib/server-data';
import { skillsSetting, textSetting } from '@/lib/settings';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'About' };

export default async function AboutPage() {
  const settings = await getPublicSettings();
  const skills = skillsSetting(settings);

  return (
    <section className="page-shell section-cream">
      <div className="container">
        <SectionLabel index="ABOUT">A LITTLE ABOUT ME</SectionLabel>

        <header className="about-page-head">
          <div>
            <h1>
              designer-ish.
              <br />
              developer-ish.
              <br />
              <em>maker, definitely.</em>
            </h1>
            <p>{textSetting(settings, 'ownerBio')}</p>
          </div>
          <Stickman pose="think" />
        </header>

        <div className="skills-grid">
          <SkillGroup title="BUILD" values={skills.build} />
          <SkillGroup title="DESIGN" values={skills.design} />
          <SkillGroup title="OTHER THINGS I LIKE" values={skills.other} />
        </div>

        <div className="about-manifesto">
          <p>I care about clean systems underneath playful interfaces.</p>
          <p>No skill bars. No “90% React”. The work should do the explaining.</p>
        </div>
      </div>
    </section>
  );
}

function SkillGroup({ title, values }: { title: string; values: string[] }) {
  return (
    <section>
      <span className="eyebrow">{title}</span>
      {values.map((value) => (
        <strong key={value}>{value}</strong>
      ))}
    </section>
  );
}
