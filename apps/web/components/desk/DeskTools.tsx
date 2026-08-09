'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { gsap, useGSAP } from '../motion/gsap';

type ToolId = 'json' | 'jwt' | 'uuid' | 'time' | 'regex' | 'url' | 'base64' | 'color';

const tools: Array<{ id: ToolId; index: string; label: string; description: string }> = [
  { id: 'json', index: '01', label: 'JSON', description: 'format or minify' },
  { id: 'jwt', index: '02', label: 'JWT', description: 'inspect a token' },
  { id: 'uuid', index: '03', label: 'UUID', description: 'generate identifiers' },
  { id: 'time', index: '04', label: 'Time', description: 'convert timestamps' },
  { id: 'regex', index: '05', label: 'Regex', description: 'test a pattern' },
  { id: 'url', index: '06', label: 'URL', description: 'encode or decode' },
  { id: 'base64', index: '07', label: 'Base64', description: 'UTF-8 safe' },
  { id: 'color', index: '08', label: 'Color', description: 'HEX to RGB/HSL' },
];

export function DeskTools() {
  const [active, setActive] = useState<ToolId>('json');
  const stage = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const readHash = () => {
      const candidate = window.location.hash.slice(1) as ToolId;
      if (tools.some((tool) => tool.id === candidate)) setActive(candidate);
    };
    readHash();
    window.addEventListener('hashchange', readHash);
    return () => window.removeEventListener('hashchange', readHash);
  }, []);

  useGSAP(
    () => {
      const element = stage.current;
      if (!element) return;

      const media = gsap.matchMedia();
      media.add('(prefers-reduced-motion: no-preference)', () => {
        const heading = gsap.utils.toArray<HTMLElement>('.tool-card-heading > *');
        const content = gsap.utils.toArray<HTMLElement>('.tool-card > :not(.tool-card-heading)');
        const targets = [...heading, ...content];
        const timeline = gsap.timeline({
          defaults: { ease: 'power3.out' },
          onComplete: () => gsap.set(targets, { clearProps: 'opacity,visibility,transform' }),
        });

        timeline.addLabel('tool', 0);
        timeline.from(heading, { autoAlpha: 0, y: 16, duration: 0.48, stagger: 0.05 }, 'tool');
        timeline.from(
          content,
          { autoAlpha: 0, y: 10, duration: 0.38, stagger: 0.025 },
          'tool+=0.12',
        );
      });

      return () => media.revert();
    },
    { scope: stage, dependencies: [active], revertOnUpdate: true },
  );

  function choose(id: ToolId) {
    setActive(id);
    window.history.replaceState(null, '', `#${id}`);
  }

  return (
    <div className="desk-tool-layout">
      <nav className="tool-index" aria-label="Utilities" role="tablist">
        {tools.map((tool) => (
          <button
            key={tool.id}
            type="button"
            role="tab"
            aria-selected={active === tool.id}
            aria-controls={`tool-${tool.id}`}
            className={active === tool.id ? 'active' : ''}
            onClick={() => choose(tool.id)}
          >
            <span>{tool.index}</span>
            <strong>{tool.label}</strong>
            <small>{tool.description}</small>
          </button>
        ))}
      </nav>

      <div className="tool-stage" ref={stage}>
        {active === 'json' ? <JsonTool /> : null}
        {active === 'jwt' ? <JwtTool /> : null}
        {active === 'uuid' ? <UuidTool /> : null}
        {active === 'time' ? <TimeTool /> : null}
        {active === 'regex' ? <RegexTool /> : null}
        {active === 'url' ? <UrlTool /> : null}
        {active === 'base64' ? <Base64Tool /> : null}
        {active === 'color' ? <ColorTool /> : null}
      </div>
    </div>
  );
}

function ToolPanel({
  id,
  title,
  note,
  children,
}: {
  id: ToolId;
  title: string;
  note: string;
  children: React.ReactNode;
}) {
  return (
    <section className="tool-card" id={`tool-${id}`} role="tabpanel">
      <header className="tool-card-heading">
        <div>
          <span className="eyebrow">UTILITY / {id.toUpperCase()}</span>
          <h2>{title}</h2>
        </div>
        <p>{note}</p>
      </header>
      {children}
    </section>
  );
}

function JsonTool() {
  const [input, setInput] = useState('{"hello":"world","useful":true}');
  const [output, setOutput] = useState('');
  const [error, setError] = useState('');

  function transform(spaces?: number) {
    try {
      setOutput(JSON.stringify(JSON.parse(input), null, spaces));
      setError('');
    } catch (cause) {
      setOutput('');
      setError(cause instanceof Error ? cause.message : 'Invalid JSON.');
    }
  }

  return (
    <ToolPanel
      id="json"
      title="JSON formatter"
      note="Pretty-print or minify a payload without sending it anywhere."
    >
      <div className="tool-columns">
        <label>
          Input
          <textarea
            rows={16}
            value={input}
            onChange={(event) => setInput(event.target.value)}
            spellCheck={false}
          />
        </label>
        <OutputArea value={output} placeholder="Your transformed JSON appears here." />
      </div>
      {error ? (
        <p className="form-error" role="alert">
          {error}
        </p>
      ) : null}
      <div className="form-actions">
        <button className="button small" type="button" onClick={() => transform(2)}>
          format →
        </button>
        <button className="ghost-button" type="button" onClick={() => transform()}>
          minify
        </button>
        <CopyButton value={output} />
      </div>
    </ToolPanel>
  );
}

function JwtTool() {
  const [token, setToken] = useState('');
  const decoded = useMemo(() => decodeJwt(token), [token]);

  return (
    <ToolPanel
      id="jwt"
      title="JWT decoder"
      note="Decode only—no signature verification. Tokens never leave this browser."
    >
      <label>
        Token
        <textarea
          rows={6}
          value={token}
          onChange={(event) => setToken(event.target.value.trim())}
          placeholder="eyJ…"
          spellCheck={false}
        />
      </label>
      {decoded.error ? (
        <p className="form-error" role="alert">
          {decoded.error}
        </p>
      ) : null}
      <div className="tool-columns jwt-output">
        <OutputArea label="Header" value={decoded.header} placeholder="JWT header" />
        <OutputArea label="Payload" value={decoded.payload} placeholder="JWT payload" />
      </div>
      {decoded.summary ? <p className="tool-insight">{decoded.summary}</p> : null}
      <CopyButton value={decoded.payload} label="copy payload" />
    </ToolPanel>
  );
}

function UuidTool() {
  const [count, setCount] = useState(5);
  const [values, setValues] = useState<string[]>([]);

  function generate(amount = count) {
    setValues(Array.from({ length: amount }, () => crypto.randomUUID()));
  }

  return (
    <ToolPanel
      id="uuid"
      title="UUID generator"
      note="Generate one or a small batch of RFC 4122 version 4 identifiers."
    >
      <div className="tool-inline-field">
        <label>
          How many?
          <input
            type="number"
            min={1}
            max={20}
            value={count}
            onChange={(event) =>
              setCount(Math.min(20, Math.max(1, Number(event.target.value) || 1)))
            }
          />
        </label>
        <button className="button small" type="button" onClick={() => generate()}>
          generate →
        </button>
        <CopyButton value={values.join('\n')} label="copy all" />
      </div>
      <ol className="uuid-list">
        {values.map((value) => (
          <li key={value}>
            <code>{value}</code>
            <CopyButton value={value} label="copy" />
          </li>
        ))}
      </ol>
    </ToolPanel>
  );
}

function TimeTool() {
  const [timestamp, setTimestamp] = useState('');
  const [dateDraft, setDateDraft] = useState('');

  useEffect(() => {
    const now = new Date();
    setTimestamp(String(now.getTime()));
    setDateDraft(toDateTimeLocal(now));
  }, []);

  const parsed = useMemo(() => parseTimestamp(timestamp), [timestamp]);
  const reverseDate = dateDraft ? new Date(dateDraft) : null;
  const reverseValid = reverseDate && Number.isFinite(reverseDate.getTime());

  return (
    <ToolPanel
      id="time"
      title="Timestamp converter"
      note="Unix seconds and milliseconds are detected automatically."
    >
      <div className="tool-columns">
        <div className="tool-field-stack">
          <label>
            Unix timestamp
            <input
              value={timestamp}
              inputMode="numeric"
              onChange={(event) => setTimestamp(event.target.value)}
            />
          </label>
          <button
            className="ghost-button"
            type="button"
            onClick={() => setTimestamp(String(Date.now()))}
          >
            use now
          </button>
          {parsed.error ? (
            <p className="form-error">{parsed.error}</p>
          ) : (
            <dl className="conversion-list">
              <div>
                <dt>Local</dt>
                <dd>{parsed.date?.toLocaleString()}</dd>
              </div>
              <div>
                <dt>ISO 8601</dt>
                <dd>{parsed.date?.toISOString()}</dd>
              </div>
              <div>
                <dt>Detected</dt>
                <dd>{parsed.unit}</dd>
              </div>
            </dl>
          )}
        </div>
        <div className="tool-field-stack">
          <label>
            Date & time
            <input
              type="datetime-local"
              value={dateDraft}
              onChange={(event) => setDateDraft(event.target.value)}
            />
          </label>
          <dl className="conversion-list">
            <div>
              <dt>Milliseconds</dt>
              <dd>{reverseValid ? reverseDate.getTime() : '—'}</dd>
            </div>
            <div>
              <dt>Seconds</dt>
              <dd>{reverseValid ? Math.floor(reverseDate.getTime() / 1000) : '—'}</dd>
            </div>
          </dl>
        </div>
      </div>
    </ToolPanel>
  );
}

function RegexTool() {
  const [pattern, setPattern] = useState('\\b[A-Z][a-z]+\\b');
  const [flags, setFlags] = useState('g');
  const [text, setText] = useState('Thông builds useful things with React and NestJS.');
  const result = useMemo(() => runRegex(pattern, flags, text), [pattern, flags, text]);

  return (
    <ToolPanel
      id="regex"
      title="Regex tester"
      note="See matches, positions and capture groups as you type."
    >
      <div className="regex-fields">
        <label>
          Pattern
          <input
            value={pattern}
            onChange={(event) => setPattern(event.target.value)}
            spellCheck={false}
          />
        </label>
        <label>
          Flags
          <input
            value={flags}
            onChange={(event) => setFlags(event.target.value)}
            maxLength={8}
            spellCheck={false}
          />
        </label>
      </div>
      <label>
        Test text
        <textarea rows={9} value={text} onChange={(event) => setText(event.target.value)} />
      </label>
      {result.error ? (
        <p className="form-error" role="alert">
          {result.error}
        </p>
      ) : (
        <div className="match-list" aria-live="polite">
          <span className="eyebrow">
            {result.matches.length} MATCH{result.matches.length === 1 ? '' : 'ES'}
          </span>
          {result.matches.map((match, index) => (
            <div key={`${match.index}-${index}`}>
              <code>{match.value || '(empty match)'}</code>
              <span>index {match.index}</span>
              {match.groups.length ? <small>groups: {match.groups.join(' · ')}</small> : null}
            </div>
          ))}
        </div>
      )}
    </ToolPanel>
  );
}

function UrlTool() {
  const [mode, setMode] = useState<'encode' | 'decode'>('encode');
  const [input, setInput] = useState('hello world?from=my space');
  const transformed = useMemo(
    () => transformText(input, mode === 'encode' ? encodeURIComponent : decodeURIComponent),
    [input, mode],
  );

  return (
    <ToolPanel
      id="url"
      title="URL encoder / decoder"
      note="Transform a URL component safely, including spaces and Unicode characters."
    >
      <ModeSwitch value={mode} onChange={setMode} left="encode" right="decode" />
      <div className="tool-columns">
        <label>
          Input
          <textarea rows={12} value={input} onChange={(event) => setInput(event.target.value)} />
        </label>
        <OutputArea value={transformed.value} placeholder="Output" />
      </div>
      {transformed.error ? <p className="form-error">{transformed.error}</p> : null}
      <CopyButton value={transformed.value} />
    </ToolPanel>
  );
}

function Base64Tool() {
  const [mode, setMode] = useState<'encode' | 'decode'>('encode');
  const [input, setInput] = useState('Xin chào, My Space ✨');
  const transformed = useMemo(
    () => transformText(input, mode === 'encode' ? encodeBase64 : decodeBase64),
    [input, mode],
  );

  return (
    <ToolPanel
      id="base64"
      title="Base64 converter"
      note="UTF-8 safe for Vietnamese text and emoji. Nothing is uploaded."
    >
      <ModeSwitch value={mode} onChange={setMode} left="encode" right="decode" />
      <div className="tool-columns">
        <label>
          Input
          <textarea rows={12} value={input} onChange={(event) => setInput(event.target.value)} />
        </label>
        <OutputArea value={transformed.value} placeholder="Output" />
      </div>
      {transformed.error ? <p className="form-error">{transformed.error}</p> : null}
      <CopyButton value={transformed.value} />
    </ToolPanel>
  );
}

function ColorTool() {
  const [input, setInput] = useState('#b86a38');
  const color = useMemo(() => parseHexColor(input), [input]);

  return (
    <ToolPanel
      id="color"
      title="Color converter"
      note="Convert HEX colors into RGB and HSL values for design tokens."
    >
      <div className="color-tool">
        <div
          className="color-preview"
          style={{ backgroundColor: color?.hex ?? 'transparent' }}
          aria-label={color ? `Preview of ${color.hex}` : 'Invalid color'}
        />
        <div className="tool-field-stack">
          <label>
            HEX
            <input
              value={input}
              onChange={(event) => setInput(event.target.value)}
              placeholder="#b86a38"
              spellCheck={false}
            />
          </label>
          {!color ? (
            <p className="form-error">Use a 3 or 6 digit HEX color.</p>
          ) : (
            <dl className="conversion-list">
              <ColorValue label="HEX" value={color.hex} />
              <ColorValue label="RGB" value={color.rgb} />
              <ColorValue label="HSL" value={color.hsl} />
            </dl>
          )}
        </div>
      </div>
    </ToolPanel>
  );
}

function OutputArea({
  value,
  placeholder,
  label = 'Output',
}: {
  value: string;
  placeholder: string;
  label?: string;
}) {
  return (
    <label>
      {label}
      <textarea rows={16} value={value} readOnly placeholder={placeholder} spellCheck={false} />
    </label>
  );
}

function CopyButton({ value, label = 'copy output' }: { value: string; label?: string }) {
  const [status, setStatus] = useState(label);
  async function copy() {
    if (!value) return;
    try {
      await navigator.clipboard.writeText(value);
      setStatus('copied ✓');
      window.setTimeout(() => setStatus(label), 1_500);
    } catch {
      setStatus('copy failed');
    }
  }
  return (
    <button className="ghost-button" type="button" disabled={!value} onClick={() => void copy()}>
      {status}
    </button>
  );
}

function ModeSwitch<T extends string>({
  value,
  onChange,
  left,
  right,
}: {
  value: T;
  onChange: (value: T) => void;
  left: T;
  right: T;
}) {
  return (
    <div className="mode-switch" aria-label="Conversion direction">
      {[left, right].map((option) => (
        <button
          key={option}
          type="button"
          className={value === option ? 'active' : ''}
          aria-pressed={value === option}
          onClick={() => onChange(option)}
        >
          {option}
        </button>
      ))}
    </div>
  );
}

function ColorValue({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt>{label}</dt>
      <dd>{value}</dd>
      <CopyButton value={value} label="copy" />
    </div>
  );
}

function decodeJwt(token: string) {
  if (!token) return { header: '', payload: '', summary: '', error: '' };
  const parts = token.split('.');
  if (parts.length !== 3)
    return {
      header: '',
      payload: '',
      summary: '',
      error: 'A JWT must contain three dot-separated parts.',
    };
  try {
    const headerObject = JSON.parse(decodeBase64Url(parts[0] ?? '')) as Record<string, unknown>;
    const payloadObject = JSON.parse(decodeBase64Url(parts[1] ?? '')) as Record<string, unknown>;
    const expiry =
      typeof payloadObject.exp === 'number' ? new Date(payloadObject.exp * 1000) : null;
    const summary = expiry
      ? `${expiry.getTime() < Date.now() ? 'Expired' : 'Expires'} ${expiry.toLocaleString()}. Signature not verified.`
      : 'No numeric exp claim. Signature not verified.';
    return {
      header: JSON.stringify(headerObject, null, 2),
      payload: JSON.stringify(payloadObject, null, 2),
      summary,
      error: '',
    };
  } catch {
    return {
      header: '',
      payload: '',
      summary: '',
      error: 'The JWT header or payload is not valid Base64URL JSON.',
    };
  }
}

function decodeBase64Url(value: string) {
  const normalized = value.replace(/-/g, '+').replace(/_/g, '/');
  return decodeBase64(normalized.padEnd(Math.ceil(normalized.length / 4) * 4, '='));
}

function encodeBase64(value: string) {
  const bytes = new TextEncoder().encode(value);
  let binary = '';
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary);
}

function decodeBase64(value: string) {
  const binary = atob(value.replace(/\s/g, ''));
  const bytes = Uint8Array.from(binary, (character) => character.charCodeAt(0));
  return new TextDecoder('utf-8', { fatal: true }).decode(bytes);
}

function parseTimestamp(raw: string): { date: Date | null; unit: string; error: string } {
  const numeric = Number(raw.trim());
  if (!raw.trim() || !Number.isFinite(numeric))
    return { date: null, unit: '', error: 'Enter a valid Unix timestamp.' };
  const unit = Math.abs(numeric) < 100_000_000_000 ? 'seconds' : 'milliseconds';
  const date = new Date(unit === 'seconds' ? numeric * 1000 : numeric);
  return Number.isFinite(date.getTime())
    ? { date, unit, error: '' }
    : { date: null, unit, error: 'Timestamp is outside the supported date range.' };
}

function toDateTimeLocal(date: Date) {
  const offset = date.getTimezoneOffset() * 60_000;
  return new Date(date.getTime() - offset).toISOString().slice(0, 16);
}

function runRegex(pattern: string, flags: string, text: string) {
  if (!pattern)
    return { matches: [] as Array<{ value: string; index: number; groups: string[] }>, error: '' };
  try {
    const uniqueFlags = [...new Set(flags)].join('');
    const regex = new RegExp(pattern, uniqueFlags.includes('g') ? uniqueFlags : `${uniqueFlags}g`);
    const matches = Array.from(text.matchAll(regex))
      .slice(0, 200)
      .map((match) => ({
        value: match[0],
        index: match.index ?? 0,
        groups: match.slice(1).map((group) => group ?? 'undefined'),
      }));
    return { matches, error: '' };
  } catch (cause) {
    return {
      matches: [],
      error: cause instanceof Error ? cause.message : 'Invalid regular expression.',
    };
  }
}

function transformText(input: string, transform: (value: string) => string) {
  try {
    return { value: transform(input), error: '' };
  } catch (cause) {
    return {
      value: '',
      error: cause instanceof Error ? cause.message : 'Could not transform this value.',
    };
  }
}

function parseHexColor(raw: string) {
  const match = raw.trim().match(/^#?([0-9a-f]{3}|[0-9a-f]{6})$/i);
  if (!match?.[1]) return null;
  const digits =
    match[1].length === 3
      ? match[1]
          .split('')
          .map((part) => `${part}${part}`)
          .join('')
      : match[1];
  const r = Number.parseInt(digits.slice(0, 2), 16);
  const g = Number.parseInt(digits.slice(2, 4), 16);
  const b = Number.parseInt(digits.slice(4, 6), 16);
  const [h, s, l] = rgbToHsl(r, g, b);
  return {
    hex: `#${digits.toUpperCase()}`,
    rgb: `rgb(${r}, ${g}, ${b})`,
    hsl: `hsl(${h}, ${s}%, ${l}%)`,
  };
}

function rgbToHsl(rByte: number, gByte: number, bByte: number) {
  const r = rByte / 255;
  const g = gByte / 255;
  const b = bByte / 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const lightness = (max + min) / 2;
  if (max === min) return [0, 0, Math.round(lightness * 100)];
  const delta = max - min;
  const saturation = lightness > 0.5 ? delta / (2 - max - min) : delta / (max + min);
  let hue =
    max === r
      ? (g - b) / delta + (g < b ? 6 : 0)
      : max === g
        ? (b - r) / delta + 2
        : (r - g) / delta + 4;
  hue /= 6;
  return [Math.round(hue * 360), Math.round(saturation * 100), Math.round(lightness * 100)];
}
