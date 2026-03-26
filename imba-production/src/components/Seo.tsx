import { Helmet } from 'react-helmet-async'

interface SeoProps {
  title?: string
  description?: string
  ogTitle?: string
  ogDescription?: string
  ogImage?: string
  ogType?: 'website' | 'article'
  canonicalPath?: string
  noIndex?: boolean
  structuredData?: object
}

const SITE_NAME = 'Imba Production'
const SITE_URL = 'https://imbaproduction.com'
const DEFAULT_DESC = 'Next-gen video production powered by cinematic craft and AI strategy. Brand films, AI campaigns, product videos, drone, and social content.'
const DEFAULT_OG_IMAGE = `${SITE_URL}/og-default.jpg`

export default function Seo({
  title,
  description = DEFAULT_DESC,
  ogTitle,
  ogDescription,
  ogImage = DEFAULT_OG_IMAGE,
  ogType = 'website',
  canonicalPath,
  noIndex = false,
  structuredData,
}: SeoProps) {
  const fullTitle = title ? `${title} | ${SITE_NAME}` : `${SITE_NAME} — Cinematic Video Production`
  const canonical = canonicalPath ? `${SITE_URL}${canonicalPath}` : undefined

  return (
    <Helmet>
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      {canonical && <link rel="canonical" href={canonical} />}
      {noIndex && <meta name="robots" content="noindex, nofollow" />}

      {/* Open Graph */}
      <meta property="og:type" content={ogType} />
      <meta property="og:title" content={ogTitle ?? fullTitle} />
      <meta property="og:description" content={ogDescription ?? description} />
      <meta property="og:image" content={ogImage} />
      {canonical && <meta property="og:url" content={canonical} />}
      <meta property="og:site_name" content={SITE_NAME} />

      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={ogTitle ?? fullTitle} />
      <meta name="twitter:description" content={ogDescription ?? description} />
      <meta name="twitter:image" content={ogImage} />

      {/* Structured data */}
      {structuredData && (
        <script type="application/ld+json">
          {JSON.stringify(structuredData)}
        </script>
      )}
    </Helmet>
  )
}
