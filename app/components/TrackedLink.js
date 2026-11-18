'use client';

import { track } from '@vercel/analytics';

export default function TrackedLink({ eventName, eventProperties, onClick, children, ...props }) {
  return (
    <a
      {...props}
      onClick={(event) => {
        track(eventName, eventProperties);
        onClick?.(event);
      }}
    >
      {children}
    </a>
  );
}
