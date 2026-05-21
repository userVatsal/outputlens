import { useEffect } from 'react';
import { Link, useParams, Navigate } from 'react-router-dom';
import { Layout } from '@/components/layout/Layout';
import { BLOG_ARTICLES, getArticle, type BlogLevel } from '@/data/blogArticles';
import * as Icons from 'lucide-react';
import { ArrowLeft, ArrowRight, Clock } from 'lucide-react';

const LEVEL_COLOR: Record<BlogLevel, string> = {
  Basics: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
  Intermediate: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
  Advanced: 'bg-rose-500/10 text-rose-400 border-rose-500/20',
};

export default function BlogPost() {
  const { slug } = useParams<{ slug: string }>();
  const article = slug ? getArticle(slug) : undefined;

  useEffect(() => {
    if (article) document.title = `${article.title} — OutputLens Blog`;
  }, [article]);

  if (!article) return <Navigate to="/blog" replace />;

  const Icon = ((Icons as unknown as Record<string, React.ComponentType<{ className?: string }>>)[article.icon]) || Icons.FileText;
  const idx = BLOG_ARTICLES.findIndex(a => a.slug === article.slug);
  const prev = BLOG_ARTICLES[idx - 1];
  const next = BLOG_ARTICLES[idx + 1];

  return (
    <Layout>
      {/* Hero */}
      <section className={`relative bg-gradient-to-br ${article.gradient} border-b border-border`}>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_10%,hsl(var(--background)/0.4),transparent_60%)]" />
        <div className="relative section-container max-w-3xl py-16 lg:py-24">
          <Link to="/blog" className="inline-flex items-center gap-2 text-sm text-foreground/70 hover:text-foreground mb-8 transition-colors">
            <ArrowLeft className="h-4 w-4" /> All articles
          </Link>
          <div className="flex items-center gap-2 mb-6 flex-wrap">
            <span className={`text-[11px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded border ${LEVEL_COLOR[article.level]}`}>{article.level}</span>
            <span className="text-xs text-muted-foreground">{article.category}</span>
            <span className="text-xs text-muted-foreground inline-flex items-center gap-1"><Clock className="h-3 w-3" />{article.readMinutes} min read</span>
          </div>
          <div className="flex items-start gap-5">
            <div className="hidden sm:flex h-14 w-14 rounded-lg bg-background/60 border border-border items-center justify-center flex-shrink-0">
              <Icon className="h-7 w-7 text-primary" />
            </div>
            <div>
              <h1 className="text-3xl md:text-4xl lg:text-5xl font-display font-bold text-foreground leading-tight mb-4">{article.title}</h1>
              <p className="text-lg text-muted-foreground leading-relaxed">{article.excerpt}</p>
            </div>
          </div>
        </div>
      </section>

      {/* KPIs */}
      {article.kpis && article.kpis.length > 0 && (
        <section className="border-b border-border bg-surface/50">
          <div className="section-container max-w-3xl py-6">
            <div className="grid grid-cols-2 gap-4">
              {article.kpis.map(k => (
                <div key={k.label} className="rounded-md border border-border bg-background p-4">
                  <div className="text-[11px] uppercase tracking-wider text-muted-foreground mb-1">{k.label}</div>
                  <div className="font-mono text-lg text-foreground font-semibold">{k.value}</div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Body */}
      <article className="py-16">
        <div className="section-container max-w-3xl space-y-12">
          {article.sections.map((s, i) => (
            <section key={s.heading} className="animate-fade-in" style={{ animationDelay: `${i * 60}ms` }}>
              <div className="flex items-center gap-3 mb-4">
                <span className="font-mono text-xs text-primary">0{i + 1}</span>
                <div className="h-px flex-1 bg-border" />
              </div>
              <h2 className="text-2xl font-display font-bold text-foreground mb-4">{s.heading}</h2>
              <p className="text-foreground/80 leading-[1.8] text-[16px]">{s.body}</p>
              {s.bullets && (
                <ul className="mt-4 space-y-2">
                  {s.bullets.map(b => (
                    <li key={b} className="flex items-start gap-2 text-foreground/80 leading-relaxed">
                      <span className="h-1.5 w-1.5 rounded-full bg-primary mt-2.5 flex-shrink-0" />
                      <span>{b}</span>
                    </li>
                  ))}
                </ul>
              )}
              {s.callout && (
                <div className="mt-5 rounded-md border-l-2 border-primary bg-surface p-4">
                  <div className="text-[11px] font-semibold uppercase tracking-wider text-primary mb-1">{s.callout.label}</div>
                  <div className="text-sm text-foreground/80 leading-relaxed">{s.callout.text}</div>
                </div>
              )}
            </section>
          ))}
        </div>
      </article>

      {/* Prev / Next */}
      <section className="border-t border-border py-10 bg-surface/30">
        <div className="section-container max-w-3xl grid sm:grid-cols-2 gap-4">
          {prev ? (
            <Link to={`/blog/${prev.slug}`} className="group rounded-md border border-border p-5 hover:border-primary/40 transition-colors">
              <div className="text-[11px] uppercase tracking-wider text-muted-foreground mb-2 inline-flex items-center gap-1"><ArrowLeft className="h-3 w-3" /> Previous</div>
              <div className="font-semibold text-foreground group-hover:text-primary transition-colors">{prev.title}</div>
            </Link>
          ) : <div />}
          {next ? (
            <Link to={`/blog/${next.slug}`} className="group rounded-md border border-border p-5 hover:border-primary/40 transition-colors text-right">
              <div className="text-[11px] uppercase tracking-wider text-muted-foreground mb-2 inline-flex items-center gap-1 justify-end w-full">Next <ArrowRight className="h-3 w-3" /></div>
              <div className="font-semibold text-foreground group-hover:text-primary transition-colors">{next.title}</div>
            </Link>
          ) : <div />}
        </div>
      </section>
    </Layout>
  );
}