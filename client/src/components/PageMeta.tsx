/**
 * PageMeta — drop this at the top of any page component to set
 * route-specific <title>, <meta name="description">, Open Graph, and Twitter Card tags.
 *
 * Usage:
 *   <PageMeta
 *     title="Necessary Assumptions | LSAT Mastery"
 *     description="Learn the Negation Test for Necessary Assumption questions..."
 *   />
 */

import { Helmet } from "react-helmet-async";

// Shared Open Graph image — hosted on CDN, tied to site lifecycle
const OG_IMAGE =
  "https://d2xsxph8kpxj0f.cloudfront.net/310519663296889444/4kXdUkpMX9ujMWJCTbKx2q/og-image-QBAjJNZgty46BkkFYAYXqi.png";

interface PageMetaProps {
  title: string;
  description: string;
  /** Optional canonical URL — defaults to current href */
  canonical?: string;
  /** Optional per-page OG image — falls back to the shared site banner */
  image?: string;
}

export default function PageMeta({ title, description, canonical, image }: PageMetaProps) {
  const url = canonical ?? (typeof window !== "undefined" ? window.location.href : "");
  const ogImage = image ?? OG_IMAGE;

  return (
    <Helmet>
      <title>{title}</title>
      <meta name="description" content={description} />
      {url && <link rel="canonical" href={url} />}

      {/* Open Graph */}
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:type" content="website" />
      {url && <meta property="og:url" content={url} />}
      <meta property="og:image" content={ogImage} />
      <meta property="og:image:width" content="2560" />
      <meta property="og:image:height" content="1440" />
      <meta property="og:image:alt" content="LSAT Mastery — Free Lessons by Devaney M. Page, JD" />

      {/* Twitter Card */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={ogImage} />
    </Helmet>
  );
}
