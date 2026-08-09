'use client';

import { type FormEvent, useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import type {
  BlockType,
  MediaAssetDto,
  ProjectBlockDto,
  ProjectDetailDto,
  ProjectDto,
  ProjectStatus,
  ProjectType,
} from '@portfolio/contracts';
import { CaseStudyRenderer } from '@/components/CaseStudyRenderer';
import { api, ClientApiError } from '@/lib/client-api';

const blockTypes: BlockType[] = [
  'HEADING',
  'PARAGRAPH',
  'IMAGE',
  'IMAGE_GROUP',
  'QUOTE',
  'VIDEO',
  'CODE',
  'TECH_CALLOUT',
];

interface ProjectFormState {
  title: string;
  slug: string;
  summary: string;
  description: string;
  type: ProjectType;
  status: ProjectStatus;
  year: number | string;
  role: string;
  client: string;
  technologies: string;
  services: string;
  githubUrl: string;
  liveUrl: string;
  behanceUrl: string;
  externalUrl: string;
  featured: boolean;
  sortOrder: number | string;
  coverImageId: string;
  coverOmitted: boolean;
}

interface ProjectEditorProps {
  initial?: ProjectDetailDto;
}

export function ProjectEditor({ initial }: ProjectEditorProps) {
  const router = useRouter();
  const projectId = initial?.id;
  const [form, setForm] = useState<ProjectFormState>(() =>
    initial ? fromProject(initial) : blankProject(),
  );
  const [blocks, setBlocks] = useState<ProjectBlockDto[]>(initial?.blocks ?? []);
  const [gallery, setGallery] = useState<string[]>(initial?.galleryMediaIds ?? []);
  const [allMedia, setAllMedia] = useState<MediaAssetDto[]>(initial?.media ?? []);
  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [preview, setPreview] = useState(false);

  useEffect(() => {
    if (!projectId) return;

    let active = true;
    api<MediaAssetDto[]>('/admin/media')
      .then((items) => {
        if (active) setAllMedia(items);
      })
      .catch(() => {
        if (active) setError('Could not load the media library.');
      });

    return () => {
      active = false;
    };
  }, [projectId]);

  const rendererMedia = useMemo(() => {
    const byId = new Map<string, MediaAssetDto>();
    for (const asset of [...allMedia, ...(initial?.media ?? [])]) {
      byId.set(asset.id, asset);
    }
    return [...byId.values()];
  }, [allMedia, initial?.media]);

  function patch<K extends keyof ProjectFormState>(key: K, value: ProjectFormState[K]) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  async function save(event?: FormEvent) {
    event?.preventDefault();
    setBusy(true);
    clearFeedback();

    try {
      if (projectId) {
        await api<ProjectDto>(`/admin/projects/${projectId}`, {
          method: 'PATCH',
          body: JSON.stringify(toProjectPayload(form)),
        });
        await api(`/admin/projects/${projectId}/media`, {
          method: 'PUT',
          body: JSON.stringify({ mediaAssetIds: gallery }),
        });
        setMessage('Saved.');
        router.refresh();
        return;
      }

      const created = await api<ProjectDto>('/admin/projects', {
        method: 'POST',
        body: JSON.stringify(toProjectPayload(form)),
      });
      router.replace(`/admin/projects/${created.id}`);
      router.refresh();
    } catch (caught) {
      setError(errorMessage(caught, 'Save failed.'));
    } finally {
      setBusy(false);
    }
  }

  async function runLifecycle(action: 'publish' | 'unpublish' | 'archive') {
    if (!projectId) return;
    clearFeedback();

    try {
      const updated = await api<ProjectDto>(`/admin/projects/${projectId}/${action}`, {
        method: 'POST',
      });
      patch('status', updated.status);
      setMessage(`${humanize(action)} complete.`);
      router.refresh();
    } catch (caught) {
      setError(errorMessage(caught, 'Action failed.'));
    }
  }

  async function addBlock(type: BlockType, content?: unknown) {
    if (!projectId) return;
    clearFeedback();

    const initialContent = content ?? defaultBlockContent(type, allMedia);
    if (!initialContent) {
      setError(
        type === 'IMAGE_GROUP'
          ? 'Upload at least two images before adding an image group.'
          : 'Upload an image before adding an image block.',
      );
      return;
    }

    try {
      const created = await api<ProjectBlockDto>(
        `/admin/projects/${projectId}/blocks`,
        {
          method: 'POST',
          body: JSON.stringify({
            type,
            content: initialContent,
            sortOrder: blocks.length,
          }),
        },
      );
      setBlocks((current) => [...current, created]);
    } catch (caught) {
      setError(errorMessage(caught, 'Could not add block.'));
    }
  }

  async function saveBlock(block: ProjectBlockDto) {
    if (!projectId) return;
    clearFeedback();

    try {
      const saved = await api<ProjectBlockDto>(
        `/admin/projects/${projectId}/blocks/${block.id}`,
        {
          method: 'PATCH',
          body: JSON.stringify({
            type: block.type,
            content: block.content,
            sortOrder: block.sortOrder,
          }),
        },
      );
      setBlocks((current) =>
        current.map((item) => (item.id === saved.id ? saved : item)),
      );
      setMessage('Block saved.');
    } catch (caught) {
      setError(errorMessage(caught, 'Could not save block.'));
    }
  }

  async function deleteBlock(blockId: string) {
    if (!projectId || !confirm('Delete this block?')) return;
    clearFeedback();

    try {
      await api(`/admin/projects/${projectId}/blocks/${blockId}`, {
        method: 'DELETE',
      });
      setBlocks((current) => current.filter((block) => block.id !== blockId));
    } catch (caught) {
      setError(errorMessage(caught, 'Could not delete block.'));
    }
  }

  async function reorderBlocks(from: number, to: number) {
    if (!projectId || to < 0 || to >= blocks.length || from === to) return;

    const previous = blocks;
    const next = [...blocks];
    const [picked] = next.splice(from, 1);
    if (!picked) return;
    next.splice(to, 0, picked);

    const ordered = next.map((block, index) => ({ ...block, sortOrder: index }));
    setBlocks(ordered);
    clearFeedback();

    try {
      await api(`/admin/projects/${projectId}/blocks/order`, {
        method: 'PUT',
        body: JSON.stringify({ blockIds: ordered.map((block) => block.id) }),
      });
    } catch (caught) {
      setBlocks(previous);
      setError(errorMessage(caught, 'Could not reorder blocks.'));
    }
  }

  async function deleteProject() {
    if (!projectId || form.status !== 'DRAFT') return;
    if (!confirm('Permanently delete this draft project? This cannot be undone.')) return;

    clearFeedback();
    try {
      await api(`/admin/projects/${projectId}`, { method: 'DELETE' });
      router.replace('/admin/projects');
      router.refresh();
    } catch (caught) {
      setError(errorMessage(caught, 'Could not delete project.'));
    }
  }

  function clearFeedback() {
    setError('');
    setMessage('');
  }

  return (
    <div className="project-editor">
      <ProjectDataForm
        form={form}
        projectId={projectId}
        media={allMedia}
        gallery={gallery}
        busy={busy}
        error={error}
        message={message}
        onPatch={patch}
        onGalleryChange={setGallery}
        onSubmit={save}
        onLifecycle={runLifecycle}
        onDeleteProject={deleteProject}
      />

      {projectId ? (
        <section className="admin-panel block-builder">
          <div className="panel-title">
            <div>
              <span className="eyebrow">CASE STUDY</span>
              <h2>Structured blocks</h2>
            </div>
            <button
              className="ghost-button"
              type="button"
              onClick={() => setPreview((value) => !value)}
            >
              {preview ? 'Edit blocks' : 'Preview'}
            </button>
          </div>

          {preview ? (
            <div className="admin-preview">
              <CaseStudyRenderer blocks={blocks} media={rendererMedia} />
            </div>
          ) : (
            <>
              <div className="block-add-menu">
                {blockTypes.map((type) => (
                  <button type="button" key={type} onClick={() => void addBlock(type)}>
                    + {humanize(type)}
                  </button>
                ))}
              </div>

              <div className="block-list">
                {blocks.map((block, index) => (
                  <div
                    key={block.id}
                    draggable
                    onDragStart={() => setDragIndex(index)}
                    onDragEnd={() => setDragIndex(null)}
                    onDragOver={(event) => event.preventDefault()}
                    onDrop={() => {
                      if (dragIndex !== null) void reorderBlocks(dragIndex, index);
                      setDragIndex(null);
                    }}
                  >
                    <BlockEditor
                      block={block}
                      media={allMedia}
                      first={index === 0}
                      last={index === blocks.length - 1}
                      onChange={(next) =>
                        setBlocks((current) =>
                          current.map((item) => (item.id === next.id ? next : item)),
                        )
                      }
                      onSave={() => void saveBlock(block)}
                      onDuplicate={() => void addBlock(block.type, block.content)}
                      onDelete={() => void deleteBlock(block.id)}
                      onUp={() => void reorderBlocks(index, index - 1)}
                      onDown={() => void reorderBlocks(index, index + 1)}
                    />
                  </div>
                ))}
              </div>

              {!blocks.length ? (
                <div className="admin-empty">
                  <p>No blocks yet.</p>
                  <span>Add a heading or paragraph to begin the story.</span>
                </div>
              ) : null}
            </>
          )}
        </section>
      ) : null}
    </div>
  );
}

interface ProjectDataFormProps {
  form: ProjectFormState;
  projectId?: string;
  media: MediaAssetDto[];
  gallery: string[];
  busy: boolean;
  error: string;
  message: string;
  onPatch: <K extends keyof ProjectFormState>(
    key: K,
    value: ProjectFormState[K],
  ) => void;
  onGalleryChange: React.Dispatch<React.SetStateAction<string[]>>;
  onSubmit: (event?: FormEvent) => Promise<void>;
  onLifecycle: (action: 'publish' | 'unpublish' | 'archive') => Promise<void>;
  onDeleteProject: () => Promise<void>;
}

function ProjectDataForm({
  form,
  projectId,
  media,
  gallery,
  busy,
  error,
  message,
  onPatch,
  onGalleryChange,
  onSubmit,
  onLifecycle,
  onDeleteProject,
}: ProjectDataFormProps) {
  return (
    <form className="admin-form admin-panel" onSubmit={onSubmit}>
      <div className="panel-title">
        <div>
          <span className="eyebrow">PROJECT DATA</span>
          <h2>Identity & publication</h2>
        </div>
        <button className="button small" disabled={busy}>
          {busy ? 'saving…' : projectId ? 'Save changes' : 'Create draft'}
        </button>
      </div>

      <div className="form-grid two">
        <Field label="Title">
          <input
            value={form.title}
            onChange={(event) => onPatch('title', event.target.value)}
            required
            maxLength={160}
          />
        </Field>
        <Field label="Slug">
          <input
            value={form.slug}
            onChange={(event) => onPatch('slug', event.target.value)}
            required
            maxLength={180}
          />
        </Field>
      </div>

      <Field label="Short summary">
        <textarea
          value={form.summary}
          onChange={(event) => onPatch('summary', event.target.value)}
          required
          rows={3}
        />
      </Field>
      <Field label="Long description">
        <textarea
          value={form.description}
          onChange={(event) => onPatch('description', event.target.value)}
          rows={5}
        />
      </Field>

      <div className="form-grid four">
        <Field label="Type">
          <select
            value={form.type}
            onChange={(event) => onPatch('type', event.target.value as ProjectType)}
          >
            <option value="DEVELOPMENT">DEVELOPMENT</option>
            <option value="DESIGN">DESIGN</option>
            <option value="HYBRID">HYBRID</option>
          </select>
        </Field>
        <Field label="Status">
          <input value={form.status} readOnly />
        </Field>
        <Field label="Year">
          <input
            type="number"
            value={form.year}
            onChange={(event) => onPatch('year', event.target.value)}
          />
        </Field>
        <Field label="Display order">
          <input
            type="number"
            value={form.sortOrder}
            onChange={(event) => onPatch('sortOrder', event.target.value)}
          />
        </Field>
      </div>

      <div className="form-grid two">
        <Field label="Role">
          <input
            value={form.role}
            onChange={(event) => onPatch('role', event.target.value)}
            required
          />
        </Field>
        <Field label="Client">
          <input
            value={form.client}
            onChange={(event) => onPatch('client', event.target.value)}
          />
        </Field>
      </div>

      <div className="form-grid two">
        <Field label="Technologies (comma-separated)">
          <input
            value={form.technologies}
            onChange={(event) => onPatch('technologies', event.target.value)}
          />
        </Field>
        <Field label="Services (comma-separated)">
          <input
            value={form.services}
            onChange={(event) => onPatch('services', event.target.value)}
          />
        </Field>
      </div>

      <div className="form-grid two">
        <Field label="GitHub URL">
          <input
            value={form.githubUrl}
            onChange={(event) => onPatch('githubUrl', event.target.value)}
          />
        </Field>
        <Field label="Live URL">
          <input
            value={form.liveUrl}
            onChange={(event) => onPatch('liveUrl', event.target.value)}
          />
        </Field>
        <Field label="Behance URL">
          <input
            value={form.behanceUrl}
            onChange={(event) => onPatch('behanceUrl', event.target.value)}
          />
        </Field>
        <Field label="External URL">
          <input
            value={form.externalUrl}
            onChange={(event) => onPatch('externalUrl', event.target.value)}
          />
        </Field>
      </div>

      {projectId ? (
        <div className="form-grid two">
          <Field label="Cover image">
            <select
              value={form.coverImageId}
              onChange={(event) => {
                onPatch('coverImageId', event.target.value);
                onPatch('coverOmitted', !event.target.value);
              }}
            >
              <option value="">No cover (intentional)</option>
              {media.map((asset) => (
                <option key={asset.id} value={asset.id}>
                  {asset.originalName} {asset.altText ? '' : '⚠ no alt'}
                </option>
              ))}
            </select>
          </Field>
          <label className="check-field">
            <input
              type="checkbox"
              checked={form.featured}
              onChange={(event) => onPatch('featured', event.target.checked)}
            />
            Featured project
          </label>
        </div>
      ) : null}

      {projectId ? (
        <fieldset className="gallery-picker">
          <legend>Project gallery</legend>
          <p className="admin-hint">
            Optional reusable gallery assets. Case-study blocks can reference the same media
            library.
          </p>
          <div className="media-checks">
            {media.map((asset) => (
              <label key={asset.id}>
                <input
                  type="checkbox"
                  checked={gallery.includes(asset.id)}
                  onChange={(event) =>
                    onGalleryChange((current) =>
                      event.target.checked
                        ? current.includes(asset.id)
                          ? current
                          : [...current, asset.id]
                        : current.filter((id) => id !== asset.id),
                    )
                  }
                />
                {asset.originalName}
              </label>
            ))}
          </div>
        </fieldset>
      ) : null}

      {error ? (
        <p className="form-error" role="alert">
          {error}
        </p>
      ) : null}
      {message ? (
        <p className="form-success" role="status">
          {message}
        </p>
      ) : null}

      {projectId ? (
        <div className="form-actions">
          <button
            type="button"
            className="ghost-button"
            onClick={() => void onLifecycle('publish')}
          >
            Publish
          </button>
          <button
            type="button"
            className="ghost-button"
            onClick={() => void onLifecycle('unpublish')}
          >
            Unpublish
          </button>
          <button
            type="button"
            className="ghost-button danger"
            onClick={() => void onLifecycle('archive')}
          >
            Archive
          </button>
          {form.status === 'DRAFT' ? (
            <button
              type="button"
              className="ghost-button danger"
              onClick={() => void onDeleteProject()}
            >
              Delete draft
            </button>
          ) : null}
        </div>
      ) : null}
    </form>
  );
}

interface BlockEditorProps {
  block: ProjectBlockDto;
  media: MediaAssetDto[];
  first: boolean;
  last: boolean;
  onChange: (block: ProjectBlockDto) => void;
  onSave: () => void;
  onDuplicate: () => void;
  onDelete: () => void;
  onUp: () => void;
  onDown: () => void;
}

function BlockEditor({
  block,
  media,
  first,
  last,
  onChange,
  onSave,
  onDuplicate,
  onDelete,
  onUp,
  onDown,
}: BlockEditorProps) {
  const content = asRecord(block.content);
  const set = (key: string, value: unknown) =>
    onChange({ ...block, content: { ...content, [key]: value } });

  return (
    <article className="block-editor">
      <header>
        <strong>{humanize(block.type)}</strong>
        <div>
          <button type="button" disabled={first} onClick={onUp} aria-label="Move block up">
            ↑
          </button>
          <button type="button" disabled={last} onClick={onDown} aria-label="Move block down">
            ↓
          </button>
          <button type="button" onClick={onDuplicate}>
            duplicate
          </button>
          <button type="button" onClick={onDelete} className="danger">
            delete
          </button>
        </div>
      </header>

      <div className="block-fields">
        {block.type === 'HEADING' ? (
          <>
            <Field label="Level">
              <select
                value={numberValue(content.level, 2)}
                onChange={(event) => set('level', Number(event.target.value))}
              >
                <option value="2">H2</option>
                <option value="3">H3</option>
                <option value="4">H4</option>
              </select>
            </Field>
            <Field label="Text">
              <input
                value={stringValue(content.text)}
                onChange={(event) => set('text', event.target.value)}
              />
            </Field>
          </>
        ) : null}

        {block.type === 'PARAGRAPH' ? (
          <Field label="Paragraph">
            <textarea
              rows={6}
              value={stringValue(content.text)}
              onChange={(event) => set('text', event.target.value)}
            />
          </Field>
        ) : null}

        {block.type === 'IMAGE' ? (
          <>
            <MediaSelect
              media={media}
              value={stringValue(content.mediaAssetId)}
              onChange={(value) => set('mediaAssetId', value)}
            />
            <Field label="Caption">
              <input
                value={stringValue(content.caption)}
                onChange={(event) => set('caption', event.target.value)}
              />
            </Field>
            <Field label="Alt override">
              <input
                value={stringValue(content.altOverride)}
                onChange={(event) => set('altOverride', event.target.value)}
              />
            </Field>
          </>
        ) : null}

        {block.type === 'IMAGE_GROUP' ? (
          <>
            <fieldset>
              <legend>Images</legend>
              <div className="media-checks">
                {media.map((asset) => {
                  const selected = stringArray(content.mediaAssetIds);
                  return (
                    <label key={asset.id}>
                      <input
                        type="checkbox"
                        checked={selected.includes(asset.id)}
                        onChange={(event) => {
                          const ids = new Set(selected);
                          if (event.target.checked) ids.add(asset.id);
                          else ids.delete(asset.id);
                          set('mediaAssetIds', [...ids]);
                        }}
                      />
                      {asset.originalName}
                    </label>
                  );
                })}
              </div>
            </fieldset>
            <Field label="Layout">
              <select
                value={stringValue(content.layout, 'two-column')}
                onChange={(event) => set('layout', event.target.value)}
              >
                <option value="two-column">Two column</option>
                <option value="gallery">Gallery</option>
              </select>
            </Field>
          </>
        ) : null}

        {block.type === 'QUOTE' ? (
          <>
            <Field label="Quote">
              <textarea
                rows={4}
                value={stringValue(content.text)}
                onChange={(event) => set('text', event.target.value)}
              />
            </Field>
            <Field label="Attribution">
              <input
                value={stringValue(content.attribution)}
                onChange={(event) => set('attribution', event.target.value)}
              />
            </Field>
          </>
        ) : null}

        {block.type === 'VIDEO' ? (
          <>
            <Field label="Provider">
              <select
                value={stringValue(content.provider, 'youtube')}
                onChange={(event) => set('provider', event.target.value)}
              >
                <option value="youtube">YouTube</option>
                <option value="vimeo">Vimeo</option>
              </select>
            </Field>
            <Field label="URL">
              <input
                value={stringValue(content.url)}
                onChange={(event) => set('url', event.target.value)}
              />
            </Field>
            <Field label="Caption">
              <input
                value={stringValue(content.caption)}
                onChange={(event) => set('caption', event.target.value)}
              />
            </Field>
          </>
        ) : null}

        {block.type === 'CODE' ? (
          <>
            <Field label="Language">
              <input
                value={stringValue(content.language)}
                onChange={(event) => set('language', event.target.value)}
              />
            </Field>
            <Field label="Code">
              <textarea
                className="code-input"
                rows={10}
                value={stringValue(content.code)}
                onChange={(event) => set('code', event.target.value)}
              />
            </Field>
            <Field label="Caption">
              <input
                value={stringValue(content.caption)}
                onChange={(event) => set('caption', event.target.value)}
              />
            </Field>
          </>
        ) : null}

        {block.type === 'TECH_CALLOUT' ? (
          <>
            <Field label="Title">
              <input
                value={stringValue(content.title)}
                onChange={(event) => set('title', event.target.value)}
              />
            </Field>
            <Field label="Body">
              <textarea
                rows={5}
                value={stringValue(content.body)}
                onChange={(event) => set('body', event.target.value)}
              />
            </Field>
            <Field label="Tags (comma separated)">
              <input
                value={stringArray(content.tags).join(', ')}
                onChange={(event) => set('tags', splitList(event.target.value))}
              />
            </Field>
          </>
        ) : null}
      </div>

      <footer>
        <button className="ghost-button" type="button" onClick={onSave}>
          Save block
        </button>
      </footer>
    </article>
  );
}

function MediaSelect({
  media,
  value,
  onChange,
}: {
  media: MediaAssetDto[];
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <Field label="Media">
      <select value={value} onChange={(event) => onChange(event.target.value)}>
        <option value="">Select image…</option>
        {media.map((asset) => (
          <option key={asset.id} value={asset.id}>
            {asset.originalName}
          </option>
        ))}
      </select>
    </Field>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label>
      {label}
      {children}
    </label>
  );
}

function blankProject(): ProjectFormState {
  return {
    title: '',
    slug: '',
    summary: '',
    description: '',
    type: 'DEVELOPMENT',
    status: 'DRAFT',
    year: new Date().getFullYear(),
    role: 'Fullstack Developer',
    client: '',
    technologies: 'Next.js, NestJS, PostgreSQL',
    services: '',
    githubUrl: '',
    liveUrl: '',
    behanceUrl: '',
    externalUrl: '',
    featured: false,
    sortOrder: 0,
    coverImageId: '',
    coverOmitted: true,
  };
}

function fromProject(project: ProjectDetailDto): ProjectFormState {
  return {
    title: project.title,
    slug: project.slug,
    summary: project.summary,
    description: project.description ?? '',
    type: project.type,
    status: project.status,
    year: project.year,
    role: project.role,
    client: project.client ?? '',
    technologies: project.technologies.join(', '),
    services: project.services.join(', '),
    githubUrl: project.githubUrl ?? '',
    liveUrl: project.liveUrl ?? '',
    behanceUrl: project.behanceUrl ?? '',
    externalUrl: project.externalUrl ?? '',
    featured: project.featured,
    sortOrder: project.sortOrder,
    coverImageId: project.coverImage?.id ?? '',
    coverOmitted: project.coverOmitted,
  };
}

function toProjectPayload(form: ProjectFormState) {
  return {
    title: form.title,
    slug: form.slug,
    summary: form.summary,
    description: form.description || null,
    type: form.type,
    year: Number(form.year),
    role: form.role,
    client: form.client || null,
    technologies: splitList(form.technologies),
    services: splitList(form.services),
    githubUrl: form.githubUrl || null,
    liveUrl: form.liveUrl || null,
    behanceUrl: form.behanceUrl || null,
    externalUrl: form.externalUrl || null,
    featured: form.featured,
    sortOrder: Number(form.sortOrder),
    coverImageId: form.coverImageId || null,
    coverOmitted: form.coverOmitted,
  };
}

function defaultBlockContent(type: BlockType, media: MediaAssetDto[]): unknown | null {
  switch (type) {
    case 'HEADING':
      return { level: 2, text: 'New section' };
    case 'PARAGRAPH':
      return { text: 'Tell the story here.' };
    case 'IMAGE':
      return media[0] ? { mediaAssetId: media[0].id } : null;
    case 'IMAGE_GROUP':
      return media.length >= 2
        ? { mediaAssetIds: [media[0].id, media[1].id], layout: 'two-column' }
        : null;
    case 'QUOTE':
      return { text: 'A useful quote or design insight.' };
    case 'VIDEO':
      return {
        provider: 'youtube',
        url: 'https://www.youtube.com/watch?v=video',
      };
    case 'CODE':
      return { language: 'ts', code: '// code snippet' };
    case 'TECH_CALLOUT':
      return {
        title: 'Engineering decision',
        body: 'Explain the trade-off.',
        tags: [],
      };
  }
}

function asRecord(value: unknown): Record<string, unknown> {
  return value && typeof value === 'object' && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : {};
}

function stringValue(value: unknown, fallback = '') {
  return typeof value === 'string' ? value : fallback;
}

function numberValue(value: unknown, fallback: number) {
  return typeof value === 'number' && Number.isFinite(value) ? value : fallback;
}

function stringArray(value: unknown) {
  return Array.isArray(value)
    ? value.filter((item): item is string => typeof item === 'string')
    : [];
}

function splitList(value: string) {
  return value
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean);
}

function humanize(value: string) {
  return value.toLowerCase().replaceAll('_', ' ');
}

function errorMessage(error: unknown, fallback: string) {
  return error instanceof ClientApiError ? error.message : fallback;
}
