import { Helmet } from 'react-helmet-async'

export default function SEO({ title, description, url }) {
  const fullTitle = title
    ? `${title} — Gustavo Sobrado`
    : 'Gustavo Sobrado — Backend Developer .NET · Identidad digital & IA'
  const desc = description || 'Portfolio de Gustavo Sobrado Aller, desarrollador backend .NET en Kirey: identidad digital (OAuth 2.0 / OpenID Connect) y Azure. Proyectos con IA: LegalDev y PachagasApp.'
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
