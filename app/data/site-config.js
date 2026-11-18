export const siteConfig = {
  name: 'Brad Kidder',
  tagline: 'Pastor. Realtor. Improv comedian.',
  location: 'Grand Rapids, Michigan',
  intro:
    'I like being with people and making them laugh, and I try to bring that into everything I do.',
  contactEmail: 'bradkidder@gmail.com',
  headshot: '/headshot.jpg',
  // Set to an object ({ eyebrow, title, description, href, cta }) to show an announcement card.
  featuredLink: null,
  mainLinks: [
    {
      title: 'River City',
      description:
        "The church I'm a part of and serve at as pastor. We'd love to have you come meet us and find community here.",
      href: 'https://rivcitychurch.com',
      type: 'Pastor'
    },
    {
      title: 'Brad at The Local Element',
      description:
        'Relationship-based real estate help for buying, selling, transaction coordination, investment, small commercial, and church property needs.',
      href: 'https://westmi.thelocalelement.com/brad-kidder/',
      type: 'Realtor'
    },
    {
      title: 'The Comedy Project',
      description: 'A local improv theater where I often get to perform. You should take a class, it is fun.',
      href: 'https://thecomedyproject.com',
      type: 'Comedy'
    }
  ],
  socialLinks: [
    {
      label: 'Instagram',
      href: 'https://www.instagram.com/bradkidder/'
    },
    {
      label: 'TikTok',
      href: 'https://www.tiktok.com/@bradkidder1'
    },
    {
      label: 'Facebook',
      href: 'https://www.facebook.com/bradkidder'
    }
  ],
  formspreeEndpoint: process.env.NEXT_PUBLIC_FORMSPREE_ENDPOINT || ''
};
