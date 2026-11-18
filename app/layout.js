import { Analytics } from '@vercel/analytics/next';
import { siteConfig } from './data/site-config';
import { globalStyles } from './global-styles';

export const metadata = {
  title: `${siteConfig.name} | Links`,
  description: `${siteConfig.name} is a pastor, realtor, and improv comedian in Grand Rapids, Michigan.`,
  openGraph: {
    title: `${siteConfig.name} | Links`,
    description: siteConfig.tagline,
    type: 'website'
  }
};

export const viewport = {
  width: 'device-width',
  initialScale: 1
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <style dangerouslySetInnerHTML={{ __html: globalStyles }} />
      </head>
      <body>
        {children}
        <Analytics />
      </body>
    </html>
  );
}
