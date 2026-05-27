import React from 'react';
import { ArrowRight, BookOpen } from 'lucide-react';
import { KnowledgeArticle } from '../types';
import { useSEO, SEO_CONFIGS } from '../hooks/useSEO';

interface KnowledgeHubProps {
  articles: KnowledgeArticle[];
  onOpenArticle: (articleId: string) => void;
}

const KnowledgeHub: React.FC<KnowledgeHubProps> = ({ articles, onOpenArticle }) => {
  useSEO(SEO_CONFIGS.knowledge);
  return (
    <div className="bg-gray-50 min-h-screen">
      <section className="bg-white border-b border-gray-100 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col gap-4">
            <div className="inline-flex items-center gap-2 bg-igo-lime/10 text-igo-dark px-4 py-2 rounded-full text-xs font-black uppercase tracking-[0.2em] w-fit">
              <BookOpen className="w-4 h-4 text-igo-lime" />
              Knowledge Hub
            </div>
            <h1 className="text-4xl md:text-5xl font-black tracking-tight text-igo-dark">
              Expert Articles From IGO
            </h1>
            <p className="text-igo-muted max-w-3xl text-base md:text-lg">
              Practical guidance on plant care, resilient propagation, and landscape design.
            </p>
          </div>
        </div>
      </section>

      <section className="py-14 md:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {articles.map((article) => (
              <article
                key={article.id}
                className="group relative bg-white border border-gray-100 rounded-3xl overflow-hidden shadow-sm hover:shadow-2xl transition-all duration-300"
              >
                <button
                  type="button"
                  aria-label={`Open article: ${article.title}`}
                  onClick={() => onOpenArticle(article.id)}
                  className="absolute inset-0 z-10"
                />

                <div className="relative h-56 md:h-64 overflow-hidden">
                  <img
                    src={article.image}
                    alt={article.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-black/0" />
                </div>

                <div className="p-6 md:p-8 relative z-20">
                  <h2 className="text-2xl font-black text-igo-dark leading-tight mb-3 group-hover:text-green-700 transition-colors">
                    {article.title}
                  </h2>
                  <p className="text-igo-muted text-sm md:text-base leading-relaxed mb-6">
                    {article.excerpt}
                  </p>

                  <button
                    type="button"
                    onClick={(event) => {
                      event.stopPropagation();
                      onOpenArticle(article.id);
                    }}
                    className="inline-flex items-center gap-2 bg-igo-dark text-white px-5 py-3 rounded-xl text-xs font-black uppercase tracking-[0.15em] hover:bg-igo-charcoal transition-colors"
                  >
                    Read Article
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default KnowledgeHub;
