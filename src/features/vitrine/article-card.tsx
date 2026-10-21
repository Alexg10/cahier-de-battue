import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { formatDateSimple } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { Article } from "./articles";

/** Carte d'article (accueil et liste des articles). */
export function ArticleCard({
  article,
  className,
}: {
  article: Article;
  className?: string;
}) {
  return (
    <Link
      href={`/articles/${article.slug}`}
      className={cn(
        "flex flex-col gap-3 rounded-[18px] border border-border p-7 transition-colors hover:border-primary",
        className,
      )}
    >
      <span className="text-sm text-ink-muted">
        {formatDateSimple(article.publieLe)} · {article.lecture} min de lecture
      </span>
      <h3 className="text-[21px] leading-snug font-bold">{article.titre}</h3>
      <p className="flex-1 text-ink-muted">{article.description}</p>
      <span className="inline-flex items-center gap-1.5 font-semibold text-primary">
        Lire l&apos;article
        <ArrowRight className="size-4" aria-hidden="true" />
      </span>
    </Link>
  );
}

/** Articles du plus récent au plus ancien. */
export const articlesRecents = (articles: Article[]) =>
  [...articles].sort((a, b) => b.publieLe.localeCompare(a.publieLe));
