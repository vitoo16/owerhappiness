import Image from 'next/image';
import {
  parseBlockContent,
  type BlockType,
  type MediaAssetDto,
  type ProjectBlockDto,
} from '@portfolio/contracts';

interface CaseStudyRendererProps {
  blocks: ProjectBlockDto[];
  media: MediaAssetDto[];
}

type MediaLookup = Map<string, MediaAssetDto>;

export function CaseStudyRenderer({ blocks, media }: CaseStudyRendererProps) {
  const mediaById = new Map(media.map((asset) => [asset.id, asset]));

  return (
    <div className="case-study-blocks">
      {blocks.map((block) => (
        <CaseStudyBlock key={block.id} block={block} mediaById={mediaById} />
      ))}
    </div>
  );
}

function CaseStudyBlock({
  block,
  mediaById,
}: {
  block: ProjectBlockDto;
  mediaById: MediaLookup;
}) {
  try {
    return renderBlock(block, mediaById);
  } catch {
    // Persisted content is validated by the API. If old/corrupt content somehow
    // reaches the renderer, skipping one invalid block is safer than breaking
    // the whole public case study.
    return null;
  }
}

function renderBlock(block: ProjectBlockDto, mediaById: MediaLookup) {
  switch (block.type) {
    case 'HEADING': {
      const content = parseBlockContent('HEADING', block.content);
      if (content.level === 4) {
        return <h4 className="case-heading">{content.text}</h4>;
      }
      if (content.level === 3) {
        return <h3 className="case-heading">{content.text}</h3>;
      }
      return <h2 className="case-heading">{content.text}</h2>;
    }

    case 'PARAGRAPH': {
      const content = parseBlockContent('PARAGRAPH', block.content);
      return <p className="case-paragraph">{content.text}</p>;
    }

    case 'IMAGE': {
      const content = parseBlockContent('IMAGE', block.content);
      const asset = mediaById.get(content.mediaAssetId);
      if (!asset) return null;

      return (
        <figure className="case-image">
          <Image
            src={asset.url}
            alt={content.altOverride || asset.altText || ''}
            width={asset.width ?? 1600}
            height={asset.height ?? 1000}
            sizes="(max-width: 900px) 100vw, 1240px"
          />
          {content.caption ? <figcaption>{content.caption}</figcaption> : null}
        </figure>
      );
    }

    case 'IMAGE_GROUP': {
      const content = parseBlockContent('IMAGE_GROUP', block.content);
      return (
        <figure>
          <div className={`image-group ${content.layout}`}>
            {content.mediaAssetIds.map((id) => {
              const asset = mediaById.get(id);
              if (!asset) return null;

              return (
                <Image
                  key={id}
                  src={asset.url}
                  alt={asset.altText || ''}
                  width={asset.width ?? 1200}
                  height={asset.height ?? 900}
                  sizes="(max-width: 700px) 100vw, 50vw"
                />
              );
            })}
          </div>
          {content.caption ? <figcaption>{content.caption}</figcaption> : null}
        </figure>
      );
    }

    case 'QUOTE': {
      const content = parseBlockContent('QUOTE', block.content);
      return (
        <blockquote>
          {content.text}
          {content.attribution ? <cite>— {content.attribution}</cite> : null}
        </blockquote>
      );
    }

    case 'VIDEO': {
      const content = parseBlockContent('VIDEO', block.content);
      const embedUrl = toSafeEmbedUrl(content.provider, content.url);

      if (!embedUrl) {
        return (
          <div className="case-callout">
            <strong>Video</strong>
            <a href={content.url} target="_blank" rel="noreferrer">
              Open video ↗
            </a>
            {content.caption ? <p>{content.caption}</p> : null}
          </div>
        );
      }

      return (
        <figure className="case-video">
          <iframe
            src={embedUrl}
            title={content.caption || `${content.provider} video`}
            loading="lazy"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            referrerPolicy="strict-origin-when-cross-origin"
          />
          {content.caption ? <figcaption>{content.caption}</figcaption> : null}
        </figure>
      );
    }

    case 'CODE': {
      const content = parseBlockContent('CODE', block.content);
      return (
        <figure className="code-block">
          <figcaption>{content.caption || content.language}</figcaption>
          <pre>
            <code>{content.code}</code>
          </pre>
        </figure>
      );
    }

    case 'TECH_CALLOUT': {
      const content = parseBlockContent('TECH_CALLOUT', block.content);
      return (
        <aside className="case-callout">
          <span className="eyebrow">engineering note</span>
          <h3>{content.title}</h3>
          <p>{content.body}</p>
          <div className="tags">
            {content.tags.map((tag) => (
              <span key={tag}>{tag}</span>
            ))}
          </div>
        </aside>
      );
    }

    default:
      return assertNever(block.type);
  }
}

function toSafeEmbedUrl(provider: 'youtube' | 'vimeo', rawUrl: string) {
  const url = new URL(rawUrl);

  if (provider === 'youtube') {
    const videoId =
      url.hostname === 'youtu.be'
        ? url.pathname.split('/').filter(Boolean)[0]
        : url.searchParams.get('v') ?? extractPathId(url.pathname, 'embed', 'shorts');

    return videoId
      ? `https://www.youtube-nocookie.com/embed/${encodeURIComponent(videoId)}`
      : null;
  }

  const videoId = extractNumericPathSegment(url.pathname);
  return videoId ? `https://player.vimeo.com/video/${videoId}` : null;
}

function extractPathId(pathname: string, ...prefixes: string[]) {
  const parts = pathname.split('/').filter(Boolean);
  const prefixIndex = parts.findIndex((part) => prefixes.includes(part));
  return prefixIndex >= 0 ? parts[prefixIndex + 1] ?? null : null;
}

function extractNumericPathSegment(pathname: string) {
  return pathname
    .split('/')
    .filter(Boolean)
    .find((part) => /^\d+$/.test(part)) ?? null;
}

function assertNever(value: never): null {
  void value;
  return null;
}

// Compile-time guard: the switch above must stay aligned with the shared enum.
const _blockTypeGuard: BlockType | undefined = undefined;
void _blockTypeGuard;
