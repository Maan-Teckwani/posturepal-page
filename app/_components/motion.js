'use client';

import React from 'react';
import { motion, useInView, useReducedMotion } from 'framer-motion';

// One easing + duration for every scroll reveal on the site.
export const EASE = [0.22, 1, 0.36, 1];
export const REVEAL_DURATION = 0.55;

export const revealVariants = {
  fadeUp: { hidden: { opacity: 0, y: 16 }, visible: { opacity: 1, y: 0 } },
};

export const Reveal = ({ children, variant = 'fadeUp', delay = 0, style = {}, className }) => {
  const ref = React.useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-80px' });
  const reduced = useReducedMotion();
  if (reduced) {
    return <div style={style} className={className}>{children}</div>;
  }
  return (
    <motion.div
      ref={ref}
      initial="hidden"
      animate={isInView ? 'visible' : 'hidden'}
      variants={revealVariants[variant]}
      transition={{ duration: REVEAL_DURATION, delay, ease: EASE }}
      style={style}
      className={className}
    >
      {children}
    </motion.div>
  );
};

// Kicker + heading + optional lede — the repeating section header pattern.
export const SectionHeading = ({ kicker, title, lede, center = false, onDark = false, maxWidth }) => (
  <div style={{ textAlign: center ? 'center' : 'left' }}>
    {kicker && (
      <Reveal>
        <div className={`kicker${onDark ? ' kicker--on-dark' : ''}${center ? ' kicker--center' : ''}`}>{kicker}</div>
      </Reveal>
    )}
    <Reveal delay={0.06}>
      <h2
        style={{
          fontSize: 'clamp(1.75rem, 3vw, 2.5rem)',
          lineHeight: 1.15,
          letterSpacing: '-0.015em',
          margin: center ? '16px auto 0' : '16px 0 0',
          maxWidth,
        }}
      >
        {title}
      </h2>
    </Reveal>
    {lede && (
      <Reveal delay={0.1}>
        <p
          style={{
            fontSize: '1.1rem',
            lineHeight: 1.6,
            color: onDark ? 'var(--sage)' : 'var(--muted)',
            margin: center ? '14px auto 0' : '14px 0 0',
            maxWidth: '52ch',
          }}
        >
          {lede}
        </p>
      </Reveal>
    )}
  </div>
);
