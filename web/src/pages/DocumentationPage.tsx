import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import {
  Search, X, ChevronRight, ChevronLeft,
  BookOpen, Menu, Lightbulb, AlertTriangle, Info, CheckCircle,
} from 'lucide-react';
import { useTranslation } from '../hooks/useTranslation';
import { useUserSettings, type Language } from '../hooks/useUserSettings';
import { DOC_SECTIONS, SECTION_BY_SLUG, ARTICLE_LOOKUP } from '../constants/documentation';
import DotGrid from '../components/backgrounds/DotGrid';

/* ─── Language list (same as landing) ──────────────────────────────────────*/
const LANGUAGES: { value: Language; flag: string; label: string }[] = [
  { value: 'fr', flag: '🇫🇷', label: 'Français' },
  { value: 'en', flag: '🇬🇧', label: 'English' },
  { value: 'es', flag: '🇪🇸', label: 'Español' },
  { value: 'de', flag: '🇩🇪', label: 'Deutsch' },
  { value: 'pt', flag: '🇧🇷', label: 'Português' },
];

/* ─── Theme constants ──────────────────────────────────────────────────────*/
const DARK = {
  bg: '#323339', bgAlt: '#2C2D32', surface: '#2A2B2F', surface2: '#36373E',
  border: '#36373E', text: '#E6E6E6', textSub: '#C6C7C9', muted: '#8B8D93',
  accent: '#7289DA', accentAlpha: 'rgba(114,137,218,0.12)', accentHover: '#5B6EAE',
};

/* ─── Callout component ───────────────────────────────────────────────────*/
function Callout({ type, children }: { type: 'tip' | 'warning' | 'info' | 'success'; children: React.ReactNode }) {
  const config = {
    tip:     { icon: Lightbulb,      bg: 'rgba(234,179,8,0.08)',  border: 'rgba(234,179,8,0.25)',  color: '#EAB308' },
    warning: { icon: AlertTriangle,  bg: 'rgba(239,68,68,0.08)',  border: 'rgba(239,68,68,0.25)',  color: '#EF4444' },
    info:    { icon: Info,           bg: 'rgba(59,130,246,0.08)', border: 'rgba(59,130,246,0.25)', color: '#3B82F6' },
    success: { icon: CheckCircle,    bg: 'rgba(34,197,94,0.08)',  border: 'rgba(34,197,94,0.25)',  color: '#22C55E' },
  }[type];
  const Icon = config.icon;
  return (
    <div className="flex gap-3 p-4 rounded-xl my-4" style={{ background: config.bg, border: `1px solid ${config.border}` }}>
      <Icon className="w-5 h-5 shrink-0 mt-0.5" style={{ color: config.color }} />
      <div className="flex-1 text-sm leading-relaxed" style={{ color: DARK.textSub }}>{children}</div>
    </div>
  );
}

/* ─── Code block ──────────────────────────────────────────────────────────*/
function CodeBlock({ children, lang }: { children: string; lang?: string }) {
  return (
    <div className="relative rounded-xl overflow-hidden my-4" style={{ background: '#1E1F23', border: `1px solid ${DARK.border}` }}>
      {lang && (
        <div className="px-4 py-1.5 text-[10px] font-mono uppercase tracking-wider" style={{ color: DARK.muted, borderBottom: `1px solid ${DARK.border}` }}>
          {lang}
        </div>
      )}
      <pre className="p-4 overflow-x-auto text-sm font-mono leading-relaxed" style={{ color: '#D4D4D8' }}>
        <code>{children}</code>
      </pre>
    </div>
  );
}

/* ─── Render body text with simple markup ─────────────────────────────────*/
function RenderBody({ text }: { text: string }) {
  // Split on special blocks: ```lang\n...\n```, :::tip\n...\n:::, etc.
  const parts: React.ReactNode[] = [];
  let remaining = text;
  let key = 0;

  while (remaining.length > 0) {
    // Code blocks: ```lang\ncontent\n```
    const codeMatch = remaining.match(/^```(\w*)\n([\s\S]*?)```/);
    if (codeMatch && remaining.indexOf(codeMatch[0]) === 0) {
      parts.push(<CodeBlock key={key++} lang={codeMatch[1] || undefined}>{codeMatch[2].trimEnd()}</CodeBlock>);
      remaining = remaining.slice(codeMatch[0].length).replace(/^\n/, '');
      continue;
    }

    // Callouts: :::tip\ncontent\n:::
    const calloutMatch = remaining.match(/^:::(tip|warning|info|success)\n([\s\S]*?):::/);
    if (calloutMatch && remaining.indexOf(calloutMatch[0]) === 0) {
      parts.push(
        <Callout key={key++} type={calloutMatch[1] as 'tip'}>
          {calloutMatch[2].trim()}
        </Callout>
      );
      remaining = remaining.slice(calloutMatch[0].length).replace(/^\n/, '');
      continue;
    }

    // Next block boundary
    const nextCode = remaining.indexOf('```');
    const nextCallout = remaining.indexOf(':::');
    const boundaries = [nextCode, nextCallout].filter(i => i > 0);
    const nextBoundary = boundaries.length > 0 ? Math.min(...boundaries) : remaining.length;

    const textChunk = remaining.slice(0, nextBoundary);
    if (textChunk.trim()) {
      parts.push(
        <div key={key++} className="prose-content">
          {textChunk.split('\n\n').map((para, i) => {
            // Heading: ## Title
            if (para.startsWith('## ')) {
              return <h3 key={i} className="text-lg font-bold mt-6 mb-3" style={{ color: DARK.text }}>{para.slice(3)}</h3>;
            }
            if (para.startsWith('### ')) {
              return <h4 key={i} className="text-base font-semibold mt-5 mb-2" style={{ color: DARK.text }}>{para.slice(4)}</h4>;
            }
            // Bullet list
            if (para.match(/^[-•] /m)) {
              return (
                <ul key={i} className="list-disc list-inside space-y-1 my-3 ml-2" style={{ color: DARK.textSub }}>
                  {para.split('\n').filter(l => l.match(/^[-•] /)).map((l, j) => (
                    <li key={j} className="text-sm leading-relaxed">{renderInline(l.replace(/^[-•] /, ''))}</li>
                  ))}
                </ul>
              );
            }
            // Numbered list
            if (para.match(/^\d+\. /m)) {
              return (
                <ol key={i} className="list-decimal list-inside space-y-1 my-3 ml-2" style={{ color: DARK.textSub }}>
                  {para.split('\n').filter(l => l.match(/^\d+\. /)).map((l, j) => (
                    <li key={j} className="text-sm leading-relaxed">{renderInline(l.replace(/^\d+\. /, ''))}</li>
                  ))}
                </ol>
              );
            }
            // Regular paragraph
            return <p key={i} className="text-sm leading-relaxed my-3" style={{ color: DARK.textSub }}>{renderInline(para)}</p>;
          })}
        </div>
      );
    }
    remaining = remaining.slice(nextBoundary);
  }

  return <>{parts}</>;
}

/** Inline formatting: **bold**, `code`, *italic* */
function renderInline(text: string): React.ReactNode {
  const parts: React.ReactNode[] = [];
  const regex = /(\*\*(.+?)\*\*|`(.+?)`|\*(.+?)\*)/g;
  let lastIndex = 0;
  let match;
  let key = 0;

  while ((match = regex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      parts.push(text.slice(lastIndex, match.index));
    }
    if (match[2]) parts.push(<strong key={key++} style={{ color: DARK.text, fontWeight: 600 }}>{match[2]}</strong>);
    else if (match[3]) parts.push(<code key={key++} className="px-1.5 py-0.5 rounded text-xs font-mono" style={{ background: DARK.surface2, color: DARK.accent }}>{match[3]}</code>);
    else if (match[4]) parts.push(<em key={key++}>{match[4]}</em>);
    lastIndex = match.index + match[0].length;
  }
  if (lastIndex < text.length) parts.push(text.slice(lastIndex));
  return parts.length === 1 ? parts[0] : <>{parts}</>;
}

/* ─── DocumentationPage ───────────────────────────────────────────────────*/

export default function DocumentationPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const { t, lang } = useTranslation();
  const { updateSettings } = useUserSettings();
  const docs = (t as any).docs ?? {};

  const helpSlug = searchParams.get('help');
  const articleSlug = searchParams.get('article');

  const [search, setSearch] = useState('');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const contentRef = useRef<HTMLDivElement>(null);

  // Current section & article
  const currentSection = helpSlug ? SECTION_BY_SLUG[helpSlug] ?? null : null;
  const currentArticle = articleSlug ? ARTICLE_LOOKUP[articleSlug] ?? null : null;

  // Scroll to top on navigation
  useEffect(() => {
    contentRef.current?.scrollTo(0, 0);
  }, [helpSlug, articleSlug]);

  // Close mobile menu on navigation
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [helpSlug, articleSlug]);

  // Search across all sections and articles
  const searchResults = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return [];
    return DOC_SECTIONS.flatMap(section =>
      section.articles
        .filter(a => {
          const title = docs[a.titleKey] ?? a.titleKey;
          const body = docs[a.bodyKey] ?? '';
          return title.toLowerCase().includes(q) || body.toLowerCase().includes(q);
        })
        .map(a => ({ section, article: a }))
    );
  }, [search, docs]);

  function navigate(help?: string, article?: string) {
    const params: Record<string, string> = {};
    if (help) params.help = help;
    if (article) params.article = article;
    setSearchParams(params);
  }

  return (
    <div className="flex flex-col h-screen" style={{ background: DARK.bg, color: DARK.text }}>
      {/* Background */}
      <div className="fixed inset-0 pointer-events-none opacity-30">
        <DotGrid baseColor="#444" activeColor={DARK.accent} dotSize={1} gap={32} proximity={80} />
      </div>

      {/* ── Top bar ────────────────────────────────────────────────────── */}
      <header
        className="relative z-20 shrink-0 flex items-center justify-between px-6 h-14"
        style={{ background: DARK.surface, borderBottom: `1px solid ${DARK.border}`, backdropFilter: 'blur(12px)' }}
      >
        <div className="flex items-center gap-4">
          {/* Mobile menu toggle */}
          <button
            onClick={() => setMobileMenuOpen(o => !o)}
            className="lg:hidden p-1.5 rounded-lg transition"
            style={{ color: DARK.muted }}
          >
            <Menu className="w-5 h-5" />
          </button>
          <Link to="/" className="flex items-center gap-2 shrink-0">
            <BookOpen className="w-5 h-5" style={{ color: DARK.accent }} />
            <span className="text-sm font-bold" style={{ color: DARK.text }}>DisFlow</span>
            <span className="text-xs font-medium px-2 py-0.5 rounded-full" style={{ background: DARK.accentAlpha, color: DARK.accent }}>
              {docs.docsLabel ?? 'Docs'}
            </span>
          </Link>
        </div>

        {/* Search */}
        <div className="hidden sm:flex items-center flex-1 max-w-md mx-8">
          <div className="relative w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: DARK.muted }} />
            <input
              type="text"
              placeholder={docs.searchPlaceholder ?? 'Search documentation...'}
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-10 pr-10 py-2 rounded-xl text-sm outline-none transition"
              style={{ background: DARK.surface2, border: `1px solid ${DARK.border}`, color: DARK.text }}
              onFocus={e => { e.currentTarget.style.borderColor = DARK.accent; }}
              onBlur={e => { e.currentTarget.style.borderColor = DARK.border; }}
            />
            {search && (
              <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2" style={{ color: DARK.muted }}>
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* Language selector */}
        <div className="flex items-center gap-2">
          <select
            value={lang}
            onChange={e => updateSettings({ defaultLanguage: e.target.value as Language })}
            className="text-xs rounded-lg px-2 py-1.5 outline-none cursor-pointer"
            style={{ background: DARK.surface2, border: `1px solid ${DARK.border}`, color: DARK.textSub }}
          >
            {LANGUAGES.map(l => (
              <option key={l.value} value={l.value}>{l.flag} {l.label}</option>
            ))}
          </select>
        </div>
      </header>

      {/* Search results dropdown */}
      {search && searchResults.length > 0 && (
        <div
          className="absolute z-30 top-14 left-1/2 -translate-x-1/2 w-full max-w-lg rounded-xl shadow-2xl overflow-hidden mt-1"
          style={{ background: DARK.surface, border: `1px solid ${DARK.border}` }}
        >
          <div className="max-h-80 overflow-y-auto p-2">
            {searchResults.slice(0, 20).map(({ section, article }) => (
              <button
                key={article.slug}
                onClick={() => { navigate(section.slug, article.slug); setSearch(''); }}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left transition"
                style={{ color: DARK.textSub }}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = DARK.surface2; }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = ''; }}
              >
                <section.icon className={`w-4 h-4 shrink-0 ${section.iconColor}`} />
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium truncate" style={{ color: DARK.text }}>{docs[article.titleKey] ?? article.titleKey}</p>
                  <p className="text-xs truncate" style={{ color: DARK.muted }}>{docs[section.titleKey] ?? section.titleKey}</p>
                </div>
                <ChevronRight className="w-3.5 h-3.5 shrink-0" style={{ color: DARK.muted }} />
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="relative z-10 flex flex-1 overflow-hidden">
        {/* ── Left Sidebar ──────────────────────────────────────────── */}
        <aside
          className={`shrink-0 w-72 flex-col overflow-y-auto py-4 transition-transform duration-200
            ${mobileMenuOpen ? 'flex fixed inset-y-14 left-0 z-30' : 'hidden lg:flex'}`}
          style={{ background: DARK.surface, borderRight: `1px solid ${DARK.border}` }}
        >
          {/* Mobile search */}
          <div className="px-4 pb-3 sm:hidden">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: DARK.muted }} />
              <input
                type="text"
                placeholder={docs.searchPlaceholder ?? 'Search...'}
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2 rounded-xl text-sm outline-none"
                style={{ background: DARK.surface2, border: `1px solid ${DARK.border}`, color: DARK.text }}
              />
            </div>
          </div>

          {/* Section list */}
          <nav className="px-3 space-y-0.5">
            {/* Home */}
            <button
              onClick={() => navigate()}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left text-sm font-medium transition"
              style={{
                color: !helpSlug ? DARK.accent : DARK.textSub,
                background: !helpSlug ? DARK.accentAlpha : 'transparent',
              }}
              onMouseEnter={e => { if (helpSlug) (e.currentTarget as HTMLElement).style.background = DARK.surface2; }}
              onMouseLeave={e => { if (helpSlug) (e.currentTarget as HTMLElement).style.background = ''; }}
            >
              <BookOpen className="w-4 h-4 shrink-0" />
              {docs.homeLabel ?? 'Documentation'}
            </button>

            <div className="my-2" style={{ borderTop: `1px solid ${DARK.border}` }} />

            {DOC_SECTIONS.map(section => {
              const Icon = section.icon;
              const isActive = helpSlug === section.slug;
              return (
                <div key={section.slug}>
                  <button
                    onClick={() => navigate(section.slug)}
                    className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left text-sm transition"
                    style={{
                      color: isActive ? DARK.accent : DARK.textSub,
                      background: isActive ? DARK.accentAlpha : 'transparent',
                      fontWeight: isActive ? 600 : 500,
                    }}
                    onMouseEnter={e => { if (!isActive) (e.currentTarget as HTMLElement).style.background = DARK.surface2; }}
                    onMouseLeave={e => { if (!isActive) (e.currentTarget as HTMLElement).style.background = ''; }}
                  >
                    <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-[#7289DA]' : 'text-[#8B8D93]'}`} />
                    <span className="truncate">{docs[section.titleKey] ?? section.titleKey}</span>
                  </button>
                  {/* Sub-articles */}
                  {isActive && (
                    <div className="ml-7 mt-1 mb-2 space-y-0.5">
                      {section.articles.map(art => {
                        const artActive = articleSlug === art.slug;
                        return (
                          <button
                            key={art.slug}
                            onClick={() => navigate(section.slug, art.slug)}
                            className="w-full text-left px-3 py-1.5 rounded-lg text-xs transition"
                            style={{
                              color: artActive ? DARK.accent : DARK.muted,
                              background: artActive ? DARK.accentAlpha : 'transparent',
                              fontWeight: artActive ? 600 : 400,
                              borderLeft: `2px solid ${artActive ? DARK.accent : DARK.border}`,
                            }}
                            onMouseEnter={e => { if (!artActive) { (e.currentTarget as HTMLElement).style.background = DARK.surface2; (e.currentTarget as HTMLElement).style.color = DARK.textSub; } }}
                            onMouseLeave={e => { if (!artActive) { (e.currentTarget as HTMLElement).style.background = ''; (e.currentTarget as HTMLElement).style.color = DARK.muted; } }}
                          >
                            {docs[art.titleKey] ?? art.titleKey}
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </nav>
        </aside>

        {/* Mobile overlay */}
        {mobileMenuOpen && (
          <div className="fixed inset-0 z-20 bg-black/40 lg:hidden" onClick={() => setMobileMenuOpen(false)} />
        )}

        {/* ── Main content ───────────────────────────────────────────── */}
        <main ref={contentRef} className="flex-1 overflow-y-auto">
          <div className="max-w-3xl mx-auto px-6 py-10">

            {/* ── Home: all sections grid ── */}
            {!helpSlug && !articleSlug && (
              <>
                <div className="mb-10">
                  <h1 className="text-3xl font-bold mb-3" style={{ color: DARK.text }}>
                    {docs.homeTitle ?? 'DisFlow Documentation'}
                  </h1>
                  <p className="text-base leading-relaxed" style={{ color: DARK.textSub }}>
                    {docs.homeSubtitle ?? 'Everything you need to build powerful Discord bots — no code required.'}
                  </p>
                </div>

                <div className="grid sm:grid-cols-2 gap-4">
                  {DOC_SECTIONS.map(section => {
                    const Icon = section.icon;
                    return (
                      <button
                        key={section.slug}
                        onClick={() => navigate(section.slug)}
                        className="flex items-start gap-4 p-5 rounded-2xl text-left transition group"
                        style={{ background: DARK.surface, border: `1px solid ${DARK.border}` }}
                        onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = DARK.accent; (e.currentTarget as HTMLElement).style.background = DARK.surface2; }}
                        onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = DARK.border; (e.currentTarget as HTMLElement).style.background = DARK.surface; }}
                      >
                        <div className={`w-10 h-10 rounded-xl ${section.iconBg} flex items-center justify-center shrink-0`}>
                          <Icon className={`w-5 h-5 ${section.iconColor}`} />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-semibold mb-1" style={{ color: DARK.text }}>{docs[section.titleKey] ?? section.titleKey}</p>
                          <p className="text-xs leading-relaxed" style={{ color: DARK.muted }}>{docs[section.descKey] ?? section.descKey}</p>
                          <p className="text-[11px] mt-2 font-medium" style={{ color: DARK.accent }}>
                            {section.articles.length} {docs.articlesLabel ?? 'articles'} →
                          </p>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </>
            )}

            {/* ── Section view: article list ── */}
            {currentSection && !articleSlug && (
              <>
                {/* Breadcrumb */}
                <div className="flex items-center gap-2 mb-6 text-xs" style={{ color: DARK.muted }}>
                  <button onClick={() => navigate()} className="hover:underline">{docs.homeLabel ?? 'Docs'}</button>
                  <ChevronRight className="w-3 h-3" />
                  <span style={{ color: DARK.accent }}>{docs[currentSection.titleKey] ?? currentSection.titleKey}</span>
                </div>

                <div className="flex items-center gap-4 mb-2">
                  <div className={`w-12 h-12 rounded-2xl ${currentSection.iconBg} flex items-center justify-center`}>
                    <currentSection.icon className={`w-6 h-6 ${currentSection.iconColor}`} />
                  </div>
                  <div>
                    <h1 className="text-2xl font-bold" style={{ color: DARK.text }}>{docs[currentSection.titleKey] ?? currentSection.titleKey}</h1>
                    <p className="text-sm mt-1" style={{ color: DARK.muted }}>{docs[currentSection.descKey] ?? currentSection.descKey}</p>
                  </div>
                </div>

                <div className="mt-8 space-y-2">
                  {currentSection.articles.map((art, i) => (
                    <button
                      key={art.slug}
                      onClick={() => navigate(currentSection.slug, art.slug)}
                      className="w-full flex items-center gap-4 p-4 rounded-xl text-left transition group"
                      style={{ background: DARK.surface, border: `1px solid ${DARK.border}` }}
                      onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = DARK.accent; (e.currentTarget as HTMLElement).style.background = DARK.surface2; }}
                      onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = DARK.border; (e.currentTarget as HTMLElement).style.background = DARK.surface; }}
                    >
                      <span className="text-sm font-mono w-6 text-center" style={{ color: DARK.muted }}>{i + 1}</span>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold" style={{ color: DARK.text }}>{docs[art.titleKey] ?? art.titleKey}</p>
                      </div>
                      <ChevronRight className="w-4 h-4 shrink-0 opacity-0 group-hover:opacity-100 transition" style={{ color: DARK.accent }} />
                    </button>
                  ))}
                </div>
              </>
            )}

            {/* ── Article view ── */}
            {currentArticle && (
              <>
                {/* Breadcrumb */}
                <div className="flex items-center gap-2 mb-6 text-xs flex-wrap" style={{ color: DARK.muted }}>
                  <button onClick={() => navigate()} className="hover:underline">{docs.homeLabel ?? 'Docs'}</button>
                  <ChevronRight className="w-3 h-3" />
                  <button onClick={() => navigate(currentArticle.section.slug)} className="hover:underline">
                    {docs[currentArticle.section.titleKey] ?? currentArticle.section.titleKey}
                  </button>
                  <ChevronRight className="w-3 h-3" />
                  <span style={{ color: DARK.accent }}>{docs[currentArticle.article.titleKey] ?? currentArticle.article.titleKey}</span>
                </div>

                <h1 className="text-2xl font-bold mb-6" style={{ color: DARK.text }}>
                  {docs[currentArticle.article.titleKey] ?? currentArticle.article.titleKey}
                </h1>

                <div>
                  <RenderBody text={docs[currentArticle.article.bodyKey] ?? `*Content coming soon for "${currentArticle.article.titleKey}"*`} />
                </div>

                {/* Prev / Next navigation */}
                <div className="flex items-center justify-between mt-12 pt-6" style={{ borderTop: `1px solid ${DARK.border}` }}>
                  {(() => {
                    const arts = currentArticle.section.articles;
                    const idx = arts.findIndex(a => a.slug === currentArticle.article.slug);
                    const prev = idx > 0 ? arts[idx - 1] : null;
                    const next = idx < arts.length - 1 ? arts[idx + 1] : null;
                    return (
                      <>
                        {prev ? (
                          <button
                            onClick={() => navigate(currentArticle.section.slug, prev.slug)}
                            className="flex items-center gap-2 text-sm transition"
                            style={{ color: DARK.muted }}
                            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = DARK.accent; }}
                            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = DARK.muted; }}
                          >
                            <ChevronLeft className="w-4 h-4" />
                            {docs[prev.titleKey] ?? prev.titleKey}
                          </button>
                        ) : <div />}
                        {next ? (
                          <button
                            onClick={() => navigate(currentArticle.section.slug, next.slug)}
                            className="flex items-center gap-2 text-sm transition"
                            style={{ color: DARK.muted }}
                            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = DARK.accent; }}
                            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = DARK.muted; }}
                          >
                            {docs[next.titleKey] ?? next.titleKey}
                            <ChevronRight className="w-4 h-4" />
                          </button>
                        ) : <div />}
                      </>
                    );
                  })()}
                </div>
              </>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
