type StoryName = 'about' | 'work' | 'journey' | 'playground' | 'contact';

interface StorySectionProps {
  children: React.ReactNode;
  className: string;
  id: `story-${StoryName}`;
  story: StoryName;
}

export function StorySection({ children, className, id, story }: StorySectionProps) {
  return (
    <div
      className="story-scene story-chapter"
      data-story={story}
      data-story-section
      data-story-state="prepared"
      id={id}
    >
      <section className={`section story-section story-panel ${className}`} data-story-panel>
        <span className="story-edge-line" data-story-edge aria-hidden />
        <div className="container" data-story-content>
          {children}
        </div>
      </section>
    </div>
  );
}
