'use client';

import { useEffect } from 'react';

// Progressive enhancement for the homepage: role/portrait cycling, scroll reveals,
// a cursor spotlight, portrait tilt and hover photos. Without JavaScript the page
// renders fully (first role and photo shown, everything visible).
export default function HomeMotion() {
  useEffect(() => {
    const root = document.querySelector('.bk');
    if (!root) return undefined;

    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const finePointer = window.matchMedia('(pointer: fine)').matches;
    const cleanups = [];
    root.classList.add('bk-js');

    // --- Hero: cycle Pastor / Realtor / Improv comedian with matching photos ---
    const hero = root.querySelector('.bk-hero');
    const roleEls = hero ? Array.from(hero.querySelectorAll('[data-role]')) : [];
    if (hero && roleEls.length) {
      let active = 0;
      let paused = false;
      const setActive = (index) => {
        active = index;
        hero.dataset.active = String(index);
      };
      const timer = reduceMotion
        ? 0
        : window.setInterval(() => {
            if (!paused && !document.hidden) setActive((active + 1) % roleEls.length);
          }, 3200);

      roleEls.forEach((el, index) => {
        const enter = () => {
          paused = true;
          setActive(index);
        };
        const leave = () => {
          paused = false;
        };
        el.addEventListener('pointerenter', enter);
        el.addEventListener('pointerleave', leave);
        cleanups.push(() => {
          el.removeEventListener('pointerenter', enter);
          el.removeEventListener('pointerleave', leave);
        });
      });
      cleanups.push(() => window.clearInterval(timer));
    }

    // --- Scroll reveals ---
    const revealTargets = root.querySelectorAll('.bk-reveal');
    if (reduceMotion || !('IntersectionObserver' in window)) {
      revealTargets.forEach((el) => el.classList.add('is-in'));
    } else {
      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              entry.target.classList.add('is-in');
              observer.unobserve(entry.target);
            }
          });
        },
        { rootMargin: '0px 0px -8% 0px', threshold: 0.12 }
      );
      revealTargets.forEach((el) => observer.observe(el));
      cleanups.push(() => observer.disconnect());
    }

    if (reduceMotion || !finePointer) {
      return () => cleanups.forEach((fn) => fn());
    }

    // --- Hover photos on the "Where to find me" rows ---
    // Position is eased in a single requestAnimationFrame loop (no CSS transition on
    // transform), so it glides smoothly instead of restarting on every mouse event.
    const rooms = root.querySelector('.bk-rooms');
    const float = root.querySelector('.bk-float');
    if (rooms && float) {
      root.classList.add('bk-has-float');
      const goal = { x: 0, y: 0 };
      const pos = { x: 0, y: 0, tilt: 0 };
      let floatFrame = 0;
      let placed = false;

      const render = () => {
        float.style.transform = `translate3d(${pos.x.toFixed(2)}px, ${pos.y.toFixed(2)}px, 0) translate(36px, -55%) rotate(${pos.tilt.toFixed(2)}deg)`;
      };

      const step = () => {
        const dx = goal.x - pos.x;
        const dy = goal.y - pos.y;
        pos.x += dx * 0.16;
        pos.y += dy * 0.16;
        const tiltGoal = Math.max(-7, Math.min(7, dx * 0.06));
        pos.tilt += (tiltGoal - pos.tilt) * 0.12;
        render();
        if (Math.abs(dx) > 0.2 || Math.abs(dy) > 0.2 || Math.abs(pos.tilt - tiltGoal) > 0.05) {
          floatFrame = requestAnimationFrame(step);
        } else {
          floatFrame = 0;
        }
      };

      const onRoomMove = (event) => {
        const rect = rooms.getBoundingClientRect();
        goal.x = event.clientX - rect.left;
        goal.y = event.clientY - rect.top;
        if (!placed) {
          pos.x = goal.x;
          pos.y = goal.y;
          placed = true;
          render();
        }
        const room = event.target.closest?.('[data-room]');
        if (room) {
          if (float.dataset.show !== room.dataset.room) float.dataset.show = room.dataset.room;
        } else if (float.dataset.show) {
          delete float.dataset.show;
        }
        if (!floatFrame) floatFrame = requestAnimationFrame(step);
      };
      const onRoomLeave = () => {
        delete float.dataset.show;
        placed = false;
      };
      rooms.addEventListener('pointermove', onRoomMove, { passive: true });
      rooms.addEventListener('pointerleave', onRoomLeave);
      cleanups.push(() => {
        rooms.removeEventListener('pointermove', onRoomMove);
        rooms.removeEventListener('pointerleave', onRoomLeave);
        if (floatFrame) cancelAnimationFrame(floatFrame);
      });
    }

    // --- Spotlight + portrait tilt ---
    root.classList.add('bk-has-spot');
    const portrait = root.querySelector('.bk-portrait-tilt');
    const target = { x: window.innerWidth * 0.7, y: window.innerHeight * 0.35 };
    const current = { ...target };
    let frame = 0;

    const tick = () => {
      current.x += (target.x - current.x) * 0.12;
      current.y += (target.y - current.y) * 0.12;
      root.style.setProperty('--mx', `${current.x.toFixed(1)}px`);
      root.style.setProperty('--my', `${current.y.toFixed(1)}px`);

      if (portrait) {
        const rect = portrait.getBoundingClientRect();
        const dx = (current.x - (rect.left + rect.width / 2)) / window.innerWidth;
        const dy = (current.y - (rect.top + rect.height / 2)) / window.innerHeight;
        portrait.style.setProperty('--ry', `${(dx * 10).toFixed(2)}deg`);
        portrait.style.setProperty('--rx', `${(-dy * 8).toFixed(2)}deg`);
      }

      if (Math.abs(target.x - current.x) > 0.3 || Math.abs(target.y - current.y) > 0.3) {
        frame = requestAnimationFrame(tick);
      } else {
        frame = 0;
      }
    };

    const onMove = (event) => {
      target.x = event.clientX;
      target.y = event.clientY;
      if (!frame) frame = requestAnimationFrame(tick);
    };

    window.addEventListener('pointermove', onMove, { passive: true });
    frame = requestAnimationFrame(tick);
    cleanups.push(() => {
      window.removeEventListener('pointermove', onMove);
      if (frame) cancelAnimationFrame(frame);
    });

    return () => cleanups.forEach((fn) => fn());
  }, []);

  return null;
}
