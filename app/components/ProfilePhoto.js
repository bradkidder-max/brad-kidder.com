'use client';

import { useState } from 'react';

export default function ProfilePhoto({ src, name }) {
  const [failed, setFailed] = useState(false);

  if (failed || !src) {
    return (
      <div className="profile-photo profile-photo-fallback" aria-label={`${name} profile photo placeholder`}>
        BWK
      </div>
    );
  }

  return (
    <div className="profile-photo">
      <img src={src} alt={`${name} headshot`} onError={() => setFailed(true)} />
    </div>
  );
}
