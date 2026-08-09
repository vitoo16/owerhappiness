'use client';

import { useState } from 'react';
import { api, ClientApiError } from '@/lib/client-api';

const textFields = [
  ['siteTitle', 'Site title'],
  ['siteDescription', 'Site description'],
  ['ownerName', 'Name'],
  ['ownerHeadline', 'Headline'],
  ['ownerBio', 'Bio'],
  ['contactEmail', 'Contact email'],
  ['githubUrl', 'GitHub'],
  ['linkedinUrl', 'LinkedIn'],
  ['upworkUrl', 'Upwork'],
  ['heroEyebrow', 'Hero eyebrow'],
  ['heroPrimary', 'Hero primary line'],
  ['heroSecondary', 'Hero secondary line'],
  ['availability', 'Availability'],
  ['seoTitle', 'SEO title'],
  ['seoDescription', 'SEO description'],
] as const;

type SkillGroup = 'build' | 'design' | 'other';
type Skills = Record<SkillGroup, string[]>;

export function SettingsEditor({ initial }: { initial: Record<string, unknown> }) {
  const [settings, setSettings] = useState(initial);
  const [skillDrafts, setSkillDrafts] = useState<Record<SkillGroup, string>>(() => {
    const values = normalizeSkills(initial.skills);
    return {
      build: values.build.join('\n'),
      design: values.design.join('\n'),
      other: values.other.join('\n'),
    };
  });
  const [dirty, setDirty] = useState<Set<string>>(() => new Set());
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  function update(key: string, value: unknown) {
    setSettings((current) => ({ ...current, [key]: value }));
    setDirty((current) => new Set(current).add(key));
    setMessage('');
    setError('');
  }

  async function saveChanges() {
    const keys = [...dirty];
    if (!keys.length || busy) return;

    setBusy(true);
    setMessage('');
    setError('');
    try {
      await Promise.all(
        keys.map((key) =>
          api(`/admin/settings/${key}`, {
            method: 'PUT',
            body: JSON.stringify({ value: settings[key] }),
          }),
        ),
      );
      setDirty(new Set());
      setMessage(`${keys.length} setting${keys.length === 1 ? '' : 's'} saved.`);
    } catch (cause) {
      setError(cause instanceof ClientApiError ? cause.message : 'Could not save settings.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="settings-editor">
      <div className="settings-savebar">
        <div>
          <span className="eyebrow">EDIT STATE</span>
          <strong>
            {dirty.size
              ? `${dirty.size} unsaved change${dirty.size === 1 ? '' : 's'}`
              : 'Everything is saved'}
          </strong>
        </div>
        <button
          className="button small"
          type="button"
          disabled={!dirty.size || busy}
          onClick={() => void saveChanges()}
        >
          {busy ? 'saving…' : 'save changes'}
        </button>
      </div>

      {message ? (
        <p className="form-success" role="status">
          {message}
        </p>
      ) : null}
      {error ? (
        <p className="form-error" role="alert">
          {error}
        </p>
      ) : null}

      <div className="settings-columns">
        <section className="admin-panel admin-form">
          <h2>Identity &amp; contact</h2>
          {textFields.map(([key, label]) => {
            const value = String(settings[key] ?? '');
            const multiline = key === 'ownerBio' || key.includes('Description');
            return (
              <label key={key}>
                {label}
                {multiline ? (
                  <textarea
                    rows={key === 'ownerBio' ? 6 : 3}
                    value={value}
                    onChange={(event) => update(key, event.target.value)}
                  />
                ) : (
                  <input value={value} onChange={(event) => update(key, event.target.value)} />
                )}
              </label>
            );
          })}

          <label>
            Default theme
            <select
              value={String(settings.defaultTheme ?? 'system')}
              onChange={(event) => update('defaultTheme', event.target.value)}
            >
              <option value="system">System</option>
              <option value="light">Light</option>
              <option value="dark">Dark</option>
            </select>
          </label>
        </section>

        <section className="admin-panel admin-form">
          <h2>Skills</h2>
          {(['build', 'design', 'other'] as SkillGroup[]).map((group) => (
            <label key={group}>
              {group.toUpperCase()}
              <textarea
                rows={7}
                value={skillDrafts[group]}
                onChange={(event) => {
                  const nextDrafts = {
                    ...skillDrafts,
                    [group]: event.target.value,
                  };
                  const next: Skills = {
                    build: splitLines(nextDrafts.build),
                    design: splitLines(nextDrafts.design),
                    other: splitLines(nextDrafts.other),
                  };
                  setSkillDrafts(nextDrafts);
                  update('skills', next);
                }}
              />
            </label>
          ))}
          <p className="admin-hint">
            One skill per line. No percentage bars — the projects do the explaining.
          </p>
        </section>
      </div>
    </div>
  );
}

function normalizeSkills(value: unknown): Skills {
  const source = value && typeof value === 'object' ? (value as Record<string, unknown>) : {};
  const list = (key: SkillGroup) =>
    Array.isArray(source[key])
      ? source[key].filter((item): item is string => typeof item === 'string')
      : [];
  return { build: list('build'), design: list('design'), other: list('other') };
}

function splitLines(value: string) {
  return value
    .split('\n')
    .map((item) => item.trim())
    .filter(Boolean);
}
