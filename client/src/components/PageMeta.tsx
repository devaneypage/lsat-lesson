/**
 * PageMeta — drop this at the top of any page component to set
 * route-specific <title>, <meta name="description">, and Open Graph tags.
 *
 * Usage:
 *   <PageMeta
 *     title="Necessary Assumptions | LSAT Mastery"
 *     description="Learn the Negation Test for Necessary Assumption questions..."
 *   />
 */

import { Helmet } from "react-helmet-async";

interface PageMetaProps {
  title: string;
  description: string;
  /** Optional canonical URL — defaults to current href */
  canonical?: string;
}

export default function PageMeta({ title, description, canonical }: PageMetaProps) {
  const url = canonical ?? (typeof window !== "undefined" ? window.location.href : "");

  return (
    <Helmet>
      <title>{title}</title>
      <meta name="description" content={description} />
      {url && <link rel="canonical" href={url} />}
      {/* Open Graph */}
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      {url && <meta property="og:url" content={url} />}
    </Helmet>
  );
}
