import { Helmet } from 'react-helmet-async'

export default function SEO({ title, description, url }) {
  const fullTitle = title
    ? `${title} — Gustavo Sobrado`
    : 'Gustavo Sobrado — Ingeniero de Software · Backend & IA'
  const desc = description || 'Portfolio de Gustavo Sobrado, ingeniero de software especializado en Backend, IA y sistemas full-stack.'
  const pageUrl = url || 'https://gustavintavo8.github.io/'

  return (
    <Helmet>
      <title>{fullTitle}</title>
      <meta name="description" content={desc} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={desc} />
      <meta property="og:url" content={pageUrl} />
      <meta property="og:type" content="website" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={desc} />
      <meta name="twitter:card" content="summary_large_image" />
    </Helmet>
  )
}
