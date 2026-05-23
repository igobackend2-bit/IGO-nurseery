import React from 'react';
import { ArrowLeft, CalendarDays } from 'lucide-react';
import { KnowledgeArticle } from '../types';

interface KnowledgeDetailProps {
  article: KnowledgeArticle | null;
  onBack: () => void;
}

const formatDate = (value?: string): string | null => {
  if (!value) return null;
  const parsedDate = new Date(value);
  if (Number.isNaN(parsedDate.getTime())) return value;
  return new Intl.DateTimeFormat('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(parsedDate);
};

const KnowledgeDetail: React.FC<KnowledgeDetailProps> = ({ article, onBack }) => {
  if (!article) {
    return (
      <section className="min-h-screen bg-gray-50 py-20">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h1 className="text-4xl font-black text-igo-dark mb-4">Article Not Found</h1>
          <p className="text-igo-muted mb-8">
            The article you requested is unavailable or may have been removed.
          </p>
          <button
            type="button"
            onClick={onBack}
            className="inline-flex items-center gap-2 bg-igo-dark text-white px-6 py-3 rounded-xl text-xs font-black uppercase tracking-[0.15em] hover:bg-igo-charcoal transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back To Knowledge
          </button>
        </div>
      </section>
    );
  }

  const publishLabel = formatDate(article.publishDate);
  const contentBlocks = article.content.split(/\n\n+/).filter(Boolean);

  return (
    <div className="bg-gray-50 min-h-screen">
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-10">
        <button
          type="button"
          onClick={onBack}
          className="inline-flex items-center gap-2 bg-white border border-gray-200 text-igo-dark px-5 py-3 rounded-xl text-xs font-black uppercase tracking-[0.15em] hover:bg-gray-100 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back To Knowledge
        </button>
      </section>

      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-10">
        <div className="rounded-3xl overflow-hidden border border-gray-100 shadow-xl bg-white">
          <div className="h-[240px] sm:h-[320px] md:h-[420px] relative">
            <img src={article.image} alt={article.title} className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/65 to-black/15" />
            <div className="absolute left-6 right-6 bottom-6 md:left-10 md:right-10 md:bottom-10">
              <h1 className="text-white text-3xl md:text-5xl font-black tracking-tight leading-tight">
                {article.title}
              </h1>
              {publishLabel && (
                <div className="mt-4 inline-flex items-center gap-2 bg-white/15 border border-white/20 text-white px-3 py-1.5 rounded-full text-xs font-bold uppercase tracking-[0.1em]">
                  <CalendarDays className="w-4 h-4" />
                  Published {publishLabel}
                </div>
              )}
            </div>
          </div>

          <div className="px-6 py-8 md:px-10 md:py-12">
            <div className="max-w-4xl">
              <div className="space-y-6 text-igo-dark leading-8 text-base md:text-lg">
                {contentBlocks.map((paragraph, index) => (
                  <p key={`${article.id}-paragraph-${index}`}>{paragraph}</p>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default KnowledgeDetail;
