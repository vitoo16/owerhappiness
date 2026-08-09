'use client';

import { useEffect, useState } from 'react';
import { api, ClientApiError } from '@/lib/client-api';

type Tab = 'json' | 'jwt' | 'uuid' | 'time' | 'notes';

const tabs: Tab[] = ['json', 'jwt', 'uuid', 'time', 'notes'];

export function DeskTools() {
  const [tab, setTab] = useState<Tab>('json');

  return (
    <div className="desk-tools">
      <nav className="tool-tabs" aria-label="Desk utilities">
        {tabs.map((item) => (
          <button
            className={tab === item ? 'active' : ''}
            key={item}
            type="button"
            onClick={() => setTab(item)}
          >
            {item}
          </button>
        ))}
      </nav>

      {tab === 'json' ? <JsonTool /> : null}
      {tab === 'jwt' ? <JwtTool /> : null}
      {tab === 'uuid' ? <UuidTool /> : null}
      {tab === 'time' ? <TimeTool /> : null}
      {tab === 'notes' ? <NotesTool /> : null}
    </div>
  );
}

function Tool({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="tool-card">
      <span className="eyebrow">UTILITY</span>
      <h2>{title}</h2>
      {children}
    </section>
  );
}

function JsonTool() {
  const [input, setInput] = useState('{"hello":"world"}');
  const [output, setOutput] = useState('');
  const [error, setError] = useState('');

  function format() {
    try {
      setOutput(JSON.stringify(JSON.parse(input), null, 2));
      setError('');
    } catch (caught) {
      setOutput('');
      setError(caught instanceof Error ? caught.message : 'Invalid JSON');
    }
  }

  return (
    <Tool title="JSON formatter">
      <textarea value={input} onChange={(event) => setInput(event.target.value)} rows={10} />
      <button className="button small" type="button" onClick={format}>
        format →
      </button>
      {error ? <p className="form-error">{error}</p> : null}
      {output ? <pre>{output}</pre> : null}
    </Tool>
  );
}

function JwtTool() {
  const [token, setToken] = useState('');
  const decoded = decodeJwtPayload(token);

  return (
    <Tool title="JWT decoder">
      <p className="admin-hint">
        Decode only. No signature verification; token never leaves this browser.
      </p>
      <textarea
        rows={6}
        value={token}
        onChange={(event) => setToken(event.target.value)}
        placeholder="eyJ…"
      />
      {decoded ? <pre>{decoded}</pre> : null}
    </Tool>
  );
}

function UuidTool() {
  const [value, setValue] = useState('');

  useEffect(() => {
    setValue(crypto.randomUUID());
  }, []);

  return (
    <Tool title="UUID generator">
      <div className="big-output">{value}</div>
      <button
        className="button small"
        type="button"
        onClick={() => setValue(crypto.randomUUID())}
      >
        another one →
      </button>
    </Tool>
  );
}

function TimeTool() {
  const [draft, setDraft] = useState('');

  useEffect(() => {
    setDraft(String(Date.now()));
  }, []);

  const timestamp = Number(draft);
  const formatted = Number.isFinite(timestamp)
    ? new Date(timestamp).toLocaleString()
    : 'Invalid timestamp';

  return (
    <Tool title="Timestamp converter">
      <label>
        Unix milliseconds
        <input value={draft} onChange={(event) => setDraft(event.target.value)} />
      </label>
      <div className="big-output">{formatted}</div>
      <button
        className="ghost-button"
        type="button"
        onClick={() => setDraft(String(Date.now()))}
      >
        use now
      </button>
    </Tool>
  );
}

function NotesTool() {
  const [text, setText] = useState('');
  const [message, setMessage] = useState('loading…');
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    let active = true;

    api<string | null>('/desk/data/notes/main')
      .then((value) => {
        if (!active) return;
        setText(value ?? '');
        setMessage('');
      })
      .catch(() => {
        if (active) setMessage('Could not load notes.');
      });

    return () => {
      active = false;
    };
  }, []);

  async function save() {
    setBusy(true);
    setMessage('saving…');
    try {
      await api('/desk/data/notes/main', {
        method: 'PUT',
        body: JSON.stringify({ value: text }),
      });
      setMessage('saved.');
    } catch (caught) {
      setMessage(
        caught instanceof ClientApiError ? caught.message : 'Could not save notes.',
      );
    } finally {
      setBusy(false);
    }
  }

  return (
    <Tool title="Scratch notes">
      <textarea
        rows={16}
        value={text}
        onChange={(event) => setText(event.target.value)}
        placeholder="private notes live in PostgreSQL…"
      />
      <div className="form-actions">
        <button className="button small" type="button" onClick={save} disabled={busy}>
          {busy ? 'saving…' : 'save note'}
        </button>
        <span role="status">{message}</span>
      </div>
    </Tool>
  );
}

function decodeJwtPayload(token: string) {
  if (!token.trim()) return '';

  try {
    const payload = token.split('.')[1];
    if (!payload) return 'Invalid JWT payload';

    const normalized = payload.replace(/-/g, '+').replace(/_/g, '/');
    const padded = normalized.padEnd(Math.ceil(normalized.length / 4) * 4, '=');
    const binary = atob(padded);
    const bytes = Uint8Array.from(binary, (character) => character.charCodeAt(0));
    const json = new TextDecoder().decode(bytes);
    return JSON.stringify(JSON.parse(json), null, 2);
  } catch {
    return 'Invalid JWT payload';
  }
}
