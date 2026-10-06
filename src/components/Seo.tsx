import { Helmet } from 'react-helmet';
import { absUrl, BRAND, DEFAULT_IMAGE, type PageMeta } from '../seo';

/** Мета-теги страницы: title, description, canonical, Open Graph и Schema.org */
export default function Seo({ meta }: { meta: PageMeta }) {
	const url = absUrl(meta.path);
	const image = absUrl(meta.image ?? DEFAULT_IMAGE);

	return (
		<Helmet>
			<title>{meta.title}</title>
			<meta name="description" content={meta.description} />
			{meta.noindex ? (
				<meta name="robots" content="noindex, follow" />
			) : (
				<link rel="canonical" href={url} />
			)}

			<meta property="og:type" content={meta.type === 'product' ? 'product' : 'website'} />
			<meta property="og:site_name" content={BRAND} />
			<meta property="og:locale" content="ru_RU" />
			<meta property="og:title" content={meta.title} />
			<meta property="og:description" content={meta.description} />
			<meta property="og:url" content={url} />
			<meta property="og:image" content={image} />
			<meta name="twitter:card" content="summary_large_image" />

			{meta.jsonLd?.map((ld, i) => (
				<script key={i} type="application/ld+json">
					{JSON.stringify(ld)}
				</script>
			))}
		</Helmet>
	);
}
