import localFont from 'next/font/local';
import { ArrowUpRight, Facebook, Instagram, Mail, Send, Sparkles, Video } from 'lucide-react';
import HomeMotion from './components/HomeMotion';
import TrackedLink from './components/TrackedLink';
import { siteConfig } from './data/site-config';
import './home.css';

const display = localFont({
  src: [
    { path: './fonts/jost-latin-wght-normal.woff2', style: 'normal', weight: '100 900' },
    { path: './fonts/jost-latin-wght-italic.woff2', style: 'italic', weight: '100 900' }
  ],
  variable: '--bk-font-display',
  display: 'swap'
});

const mono = localFont({
  src: [
    { path: './fonts/dm-mono-latin-400-normal.woff2', style: 'normal', weight: '400' },
    { path: './fonts/dm-mono-latin-500-normal.woff2', style: 'normal', weight: '500' }
  ],
  variable: '--bk-font-mono',
  display: 'swap'
});

const shareImage = {
  url: '/og-image.jpg',
  width: 1200,
  height: 630,
  alt: `${siteConfig.name}: ${siteConfig.tagline}`
};

export const metadata = {
  metadataBase: new URL('https://bradkidder.com'),
  title: `${siteConfig.name} — ${siteConfig.tagline}`,
  description: `${siteConfig.name} is a pastor, realtor, and improv comedian in Grand Rapids, Michigan.`,
  alternates: { canonical: '/' },
  openGraph: {
    title: siteConfig.name,
    description: siteConfig.tagline,
    url: '/',
    siteName: siteConfig.name,
    type: 'website',
    images: [shareImage]
  },
  twitter: {
    card: 'summary_large_image',
    title: siteConfig.name,
    description: siteConfig.tagline,
    images: [shareImage]
  }
};

export const viewport = {
  themeColor: '#f1ece2'
};

// One portrait per role, in the same order as the tagline and mainLinks.
const roleLooks = {
  Pastor: {
    accent: 'var(--bk-accent)',
    photo: '/role-pastor.webp',
    alt: `${siteConfig.name} smiling in patterned glasses`
  },
  Realtor: {
    accent: 'var(--bk-accent)',
    photo: '/role-realtor.webp',
    alt: `${siteConfig.name} in sunglasses checking his watch, in black and white`
  },
  Comedy: {
    accent: 'var(--bk-accent)',
    photo: '/role-comedy.webp',
    alt: `${siteConfig.name} in sunglasses doing finger guns`
  }
};

const roleOrder = ['Pastor', 'Realtor', 'Comedy'];

const socialIcons = {
  Instagram,
  TikTok: Video,
  Facebook
};

const inquiryTypes = ['Speaking', 'Real estate', 'Comedy/event', 'General'];

const marqueeWords = ['Pastor', 'Realtor', 'Improv comedian', siteConfig.location];

const starburst =
  '100,74 102.3,91.3 113,77.5 106.4,93.6 122.5,87 108.7,97.7 126,100 108.7,102.3 122.5,113 106.4,106.4 113,122.5 102.3,108.7 100,126 97.7,108.7 87,122.5 93.6,106.4 77.5,113 91.3,102.3 74,100 91.3,97.7 77.5,87 93.6,93.6 87,77.5 97.7,91.3';

function Letters({ word, offset = 0 }) {
  return word.split('').map((char, index) => (
    <span className="bk-letter" style={{ '--i': index + offset }} key={`${char}-${index}`}>
      {char}
    </span>
  ));
}

export default function HomePage() {
  const [firstName, ...rest] = siteConfig.name.split(' ');
  const lastName = rest.join(' ');
  const roles = siteConfig.tagline
    .split('. ')
    .map((role) => role.replace(/\.$/, ''))
    .map((label, index) => ({ label, ...roleLooks[roleOrder[index]] }));
  const mailtoHref = `mailto:${siteConfig.contactEmail}?subject=${encodeURIComponent(
    'Hello from BradKidder.com'
  )}`;
  const featured = siteConfig.featuredLink;
  const brokerage = siteConfig.brokerage;
  const year = new Date().getFullYear();

  return (
    <main className={`bk ${display.variable} ${mono.variable}`}>
      <HomeMotion />
      <div className="bk-spot" aria-hidden="true" />
      <div className="bk-grain" aria-hidden="true" />

      <header className="bk-top">
        <a className="bk-mark" href="#top" aria-label={`${siteConfig.name}, back to top`}>
          BWK
        </a>
        <span className="bk-top-place">{siteConfig.location}</span>
        <a className="bk-top-cta" href="#contact">
          Work with Brad
          <ArrowUpRight size={16} aria-hidden="true" />
        </a>
      </header>

      <section className="bk-hero" id="top" data-active="0" aria-label={`${siteConfig.name} introduction`}>
        <div className="bk-hero-copy">
          <p className="bk-hello">Hello, I&apos;m</p>
          <h1 className="bk-name">
            <span className="bk-sr">{siteConfig.name}</span>
            <span className="bk-name-line" aria-hidden="true">
              <span className="bk-name-inner">
                <Letters word={firstName} />
              </span>
            </span>
            <span className="bk-name-line bk-name-line-2" aria-hidden="true">
              <span className="bk-name-inner">
                <Letters word={lastName} offset={firstName.length} />
              </span>
            </span>
          </h1>

          <p className="bk-roles">
            {roles.map((role, index) => (
              <span
                className="bk-role"
                data-role={index}
                key={role.label}
                style={{ '--r': index, '--accent': role.accent }}
              >
                {role.label}.
                <svg className="bk-squiggle" viewBox="0 0 300 24" preserveAspectRatio="none" aria-hidden="true">
                  <path d="M3 15 C 30 3, 52 23, 80 12 S 130 2, 158 13 S 210 23, 238 11 S 282 5, 297 12" />
                </svg>
              </span>
            ))}
          </p>

          <p className="bk-intro">{siteConfig.intro}</p>
        </div>

        <figure className="bk-portrait">
          <span className="bk-shape bk-shape-sun" aria-hidden="true" />
          <span className="bk-shape bk-shape-ring" aria-hidden="true" />
          <div className="bk-portrait-tilt">
            <div className="bk-arch">
              {roles.map((role, index) => (
                <img
                  className={`bk-shot bk-shot-${index}`}
                  key={role.photo}
                  src={role.photo}
                  alt={index === 0 ? role.alt : ''}
                  aria-hidden={index === 0 ? undefined : 'true'}
                  width="960"
                  height="1248"
                  fetchPriority={index === 0 ? 'high' : undefined}
                  decoding="async"
                />
              ))}
            </div>
            <svg className="bk-badge" viewBox="0 0 200 200" aria-hidden="true">
              <defs>
                <path id="bk-badge-circle" d="M100,100 m-74,0 a74,74 0 1,1 148,0 a74,74 0 1,1 -148,0" />
              </defs>
              <circle cx="100" cy="100" r="96" />
              <text>
                <textPath href="#bk-badge-circle" startOffset="0" textLength="458" lengthAdjust="spacing">
                  Pastor ✦ Realtor ✦ Improv comedian ✦
                </textPath>
              </text>
              <polygon className="bk-badge-star" points={starburst} />
            </svg>
          </div>
        </figure>
      </section>

      {featured ? (
        <TrackedLink
          className="bk-feature bk-reveal"
          href={featured.href}
          target="_blank"
          rel="noreferrer"
          eventName="featured_link_click"
          eventProperties={{ label: featured.title }}
        >
          <span className="bk-feature-stub" aria-hidden="true">
            <Sparkles size={22} />
          </span>
          <span className="bk-feature-copy">
            <span className="bk-feature-eyebrow">{featured.eyebrow}</span>
            <strong>{featured.title}</strong>
            <span>{featured.description}</span>
          </span>
          <span className="bk-feature-cta">
            {featured.cta}
            <ArrowUpRight size={18} aria-hidden="true" />
          </span>
        </TrackedLink>
      ) : null}

      <div className="bk-marquee" aria-hidden="true">
        <div className="bk-marquee-track">
          {[0, 1].map((copy) => (
            <span className="bk-marquee-group" key={copy}>
              {[...marqueeWords, ...marqueeWords].map((word, index) => (
                <span key={`${word}-${index}`}>
                  <em>{word}</em>
                  <i>✺</i>
                </span>
              ))}
            </span>
          ))}
        </div>
      </div>

      <section className="bk-rooms" aria-label="Main links">
        <p className="bk-kicker bk-reveal">Where to find me</p>
        <ol className="bk-room-list">
          {siteConfig.mainLinks.map((link, index) => {
            const look = roleLooks[link.type] || {};
            return (
              <li className="bk-reveal" key={link.href} style={{ '--d': index }}>
                <TrackedLink
                  className="bk-room"
                  data-room={look.photo ? roleOrder.indexOf(link.type) : undefined}
                  href={link.href}
                  target="_blank"
                  rel="noreferrer"
                  style={{ '--accent': look.accent || 'var(--bk-fg)' }}
                  eventName="main_link_click"
                  eventProperties={{ label: link.title, type: link.type }}
                >
                  <span className="bk-room-num">{String(index + 1).padStart(2, '0')}</span>
                  {look.photo ? (
                    <span className="bk-room-thumb" aria-hidden="true">
                      <img src={look.photo} alt="" width="960" height="1248" loading="lazy" decoding="async" />
                    </span>
                  ) : null}
                  <span className="bk-room-type">{link.type}</span>
                  <strong className="bk-room-title">{link.title}</strong>
                  <span className="bk-room-desc">
                    {link.description}
                    {link.type === 'Realtor' && brokerage ? (
                      <span className="bk-room-legal">
                        {brokerage.licenseType} licensed in {brokerage.licensedIn} with {brokerage.name} ·{' '}
                        {brokerage.address} · {brokerage.phone}
                      </span>
                    ) : null}
                  </span>
                  <span className="bk-room-arrow" aria-hidden="true">
                    <ArrowUpRight size={28} />
                  </span>
                </TrackedLink>
              </li>
            );
          })}
        </ol>
        <div className="bk-float" aria-hidden="true">
          {roleOrder.map((type, index) => (
            <img
              className={`bk-float-${index}`}
              key={type}
              src={roleLooks[type].photo}
              alt=""
              width="960"
              height="1248"
              loading="lazy"
              decoding="async"
            />
          ))}
        </div>
      </section>

      <section className="bk-contact" id="contact" aria-label="Work with Brad">
        <p className="bk-kicker bk-reveal">Contact</p>
        <h2 className="bk-contact-title bk-reveal">
          Work with <em>Brad</em>
        </h2>
        <p className="bk-contact-copy bk-reveal">
          Reach out for speaking, real estate questions, comedy/event conversations, or a general hello.
        </p>

        {siteConfig.formspreeEndpoint ? (
          <form className="bk-form bk-reveal" action={siteConfig.formspreeEndpoint} method="POST">
            <label>
              <span>Name</span>
              <input name="name" type="text" autoComplete="name" required />
            </label>
            <label>
              <span>Email</span>
              <input name="email" type="email" autoComplete="email" required />
            </label>
            <label>
              <span>Inquiry type</span>
              <select name="inquiryType" defaultValue="General">
                {inquiryTypes.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>
            </label>
            <label className="bk-form-wide">
              <span>Message</span>
              <textarea name="message" rows="5" required />
            </label>
            <button type="submit">
              <Send size={18} aria-hidden="true" />
              Send message
            </button>
          </form>
        ) : null}

        <TrackedLink
          className="bk-email bk-reveal"
          href={mailtoHref}
          eventName="email_click"
          eventProperties={{ label: siteConfig.contactEmail }}
        >
          <Mail size={22} aria-hidden="true" />
          <span>{siteConfig.contactEmail}</span>
        </TrackedLink>

        <nav className="bk-social bk-reveal" aria-label="Social links">
          {siteConfig.socialLinks.map((link) => {
            const Icon = socialIcons[link.label] || ArrowUpRight;
            return (
              <TrackedLink
                key={link.href}
                href={link.href}
                target="_blank"
                rel="noreferrer"
                eventName="social_link_click"
                eventProperties={{ label: link.label }}
              >
                <Icon size={18} aria-hidden="true" />
                <span>{link.label}</span>
              </TrackedLink>
            );
          })}
        </nav>
      </section>

      {brokerage ? (
        <section className="bk-legal" aria-label="Real estate disclosure">
          <svg className="bk-eho" viewBox="0 0 64 64" role="img" aria-label="Equal Housing Opportunity">
            <path d="M32 6 4 28h7v28h42V28h7L32 6Zm14 44H18V25.6L32 14.4l14 11.2V50Z" />
            <rect x="22" y="30" width="20" height="5" />
            <rect x="22" y="39" width="20" height="5" />
          </svg>
          <p>
            <strong>{brokerage.name}</strong>
            <span>
              {siteConfig.name}, {brokerage.licenseType.toLowerCase()} licensed in {brokerage.licensedIn}. Real
              estate services are provided through {brokerage.name}.
            </span>
            <span>
              {brokerage.address} ·{' '}
              <a href={`tel:+1${brokerage.phone.replace(/\D/g, '')}`}>{brokerage.phone}</a>
            </span>
            <span>Equal Housing Opportunity.</span>
          </p>
        </section>
      ) : null}

      <footer className="bk-foot">
        <span>
          © {year} {siteConfig.name}
        </span>
        <span>{siteConfig.location}</span>
      </footer>
    </main>
  );
}
