import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Layout } from '@/components/layout/Layout';
import { BLOG_ARTICLES, BLOG_CATEGORIES, BLOG_LEVELS, type BlogLevel } from '@/data/blogArticles';
import * as Icons from 'lucide-react';
import { ArrowRight, Clock, Filter } from 'lucide-react';

const LEVEL_COLOR: Record<BlogLevel, string> = {
  Basics: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
  Intermediate: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
  Advanced: 'bg-rose-500/10 text-rose-400 border-rose-500/20',
};

export default function Blog() {
  const [level, setLevel] = useState<BlogLevel | 'All'>('All');
  const [category, setCategory] = useState<string>('All');

  useEffect(() => {
    document.title = 'OutputLens Blog — Trading & Investing, Basics to Advanced';
  }, []);

  const filtered = useMemo(
    () => BLOG_ARTICLES.filter(a =>
      (level === 'All' || a.level === level) &&
      (category === 'All' || a.category === category)
    ),
    [level, category]
  );

  const featured = BLOG_ARTICLES[0];

  return (
    <Layout>
      {/* Hero */}
      <section className="hero-gradient py-20 lg:py-28 border-b border-border">
        <div className="section-container max-w-4xl">
          <p className="text-xs font-semibold uppercase tracking-widest text-white/40 mb-5">OutputLens Journal</p>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold font-display text-white leading-tight mb-6">
            Trading & investing,<br /><span className="text-primary">explained properly.</span>
          </h1>
          <p className="text-lg text-white/60 leading-relaxed max-w-2xl">
            Twenty essays — from first principles to quant workflows. No hype, no signals, no price targets. Just the frameworks institutional desks actually use.
          </p>
          <div className="mt-8 flex flex-wrap gap-3 text-xs text-white/50">
            <span>{BLOG_ARTICLES.length} articles</span>
            <span>·</span>
            <span>{BLOG_LEVELS.length} difficulty levels</span>
            <span>·</span>
            <span>{BLOG_CATEGORIES.length} topics</span>
          </div>
        </div>
      </section>

      {/* Featured */}
      <section className="py-12 border-b border-border">
        <div className="section-container">
          <Link
            to={`/blog/${featured.slug}`}
            className="group block rounded-lg overflow-hidden border border-border bg-surface hover:border-primary/40 transition-all"
          >
            <div className="grid md:grid-cols-2">
              <div className={`relative min-h-[280px] bg-gradient-to-br ${featured.gradient} p-10 flex items-end`}>
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_10%,hsl(var(--primary)/0.15),transparent_50%)]" />
                <div className="relative">
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-semibold uppercase tracking-wider bg-primary text-primary-foreground">
                    Featured
                  </span>
                </div>
              </div>
              <div className="p-8 md:p-10 flex flex-col justify-center">
                <div className="flex items-center gap-2 mb-4">
                  <span className={`text-[11px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded border ${LEVEL_COLOR[featured.level]}`}>{featured.level}</span>
                  <span className="text-xs text-muted-foreground">{featured.category}</span>
                  <span className="text-xs text-muted-foreground inline-flex items-center gap-1"><Clock className="h-3 w-3" />{featured.readMinutes} min</span>
                </div>
                <h2 className="text-2xl md:text-3xl font-display font-bold text-foreground mb-3 group-hover:text-primary transition-colors">
                  {featured.title}
                </h2>
                <p className="text-muted-foreground leading-relaxed">{featured.excerpt}</p>
                <span className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-primary">
                  Read article <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </span>
              </div>
            </div>
          </Link>
        </div>
      </section>

      {/* Filters */}
      <section className="py-8 border-b border-border bg-surface/50 sticky top-14 z-30 backdrop-blur">
        <div className="section-container flex flex-wrap items-center gap-3">
          <span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground"><Filter className="h-3 w-3" />Level</span>
          {(['All', ...BLOG_LEVELS] as const).map(l => (
            <button
              key={l}
              onClick={() => setLevel(l as BlogLevel | 'All')}
              className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${
                level === l ? 'bg-primary text-primary-foreground border-primary' : 'border-border text-muted-foreground hover:text-foreground hover:border-foreground/30'
              }`}
            >
              {l}
            </button>
          ))}
          <span className="mx-2 text-border">|</span>
          <span className="text-xs text-muted-foreground">Topic</span>
          <button
            onClick={() => setCategory('All')}
            className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${
              category === 'All' ? 'bg-primary text-primary-foreground border-primary' : 'border-border text-muted-foreground hover:text-foreground hover:border-foreground/30'
            }`}
          >All</button>
          {BLOG_CATEGORIES.map(c => (
            <button
              key={c}
              onClick={() => setCategory(c)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${
                category === c ? 'bg-primary text-primary-foreground border-primary' : 'border-border text-muted-foreground hover:text-foreground hover:border-foreground/30'
              }`}
            >
              {c}
            </button>
          ))}
        </div>
      </section>

      {/* Grid */}
      <section className="py-16">
        <div className="section-container">
          {filtered.length === 0 ? (
            <div className="text-center py-20 text-muted-foreground">No articles match these filters.</div>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {filtered.map((a, idx) => {
                const Icon = ((Icons as unknown as Record<string, React.ComponentType<{ className?: string }>>)[a.icon]) || Icons.FileText;
                return (
                  <Link
                    key={a.slug}
                    to={`/blog/${a.slug}`}
                    className="group relative rounded-lg overflow-hidden border border-border bg-surface hover:border-primary/40 transition-all animate-fade-in"
                    style={{ animationDelay: `${idx * 40}ms` }}
                  >
                    <div className={`relative h-36 bg-gradient-to-br ${a.gradient} flex items-center justify-center`}>
                      <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_30%,hsl(var(--background)/0.4),transparent_60%)]" />
                      <Icon className="relative h-12 w-12 text-foreground/80 group-hover:scale-110 transition-transform" />
                    </div>
                    <div className="p-5">
                      <div className="flex items-center gap-2 mb-3 flex-wrap">
                        <span className={`text-[10px] font-semibold uppercase tracking-wider px-1.5 py-0.5 rounded border ${LEVEL_COLOR[a.level]}`}>{a.level}</span>
                        <span className="text-[11px] text-muted-foreground">{a.category}</span>
                        <span className="text-[11px] text-muted-foreground inline-flex items-center gap-1 ml-auto"><Clock className="h-3 w-3" />{a.readMinutes}m</span>
                      </div>
                      <h3 className="font-display font-semibold text-foreground text-base leading-snug mb-2 group-hover:text-primary transition-colors">
                        {a.title}
                      </h3>
                      <p className="text-sm text-muted-foreground leading-relaxed line-clamp-2">{a.excerpt}</p>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      </section>
    </Layout>
  );
}