'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import DownloadHub from '../_components/DownloadHub';

function DownloadContent() {
  const searchParams = useSearchParams();
  // Backwards-compatible: accept either ?trial_key= or the older ?token=.
  const trialKey = (searchParams.get('trial_key') || searchParams.get('token') || '').toUpperCase();
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!copied) return;
    const t = setTimeout(() => setCopied(false), 2000);
    return () => clearTimeout(t);
  }, [copied]);

  const handleCopy = () => {
    if (!trialKey) return;
    navigator.clipboard.writeText(trialKey).then(() => setCopied(true)).catch(() => {});
  };

  if (!trialKey) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: 'var(--cream)' }}>
        <nav style={{ position: 'sticky', top: 0, zIndex: 100, background: 'var(--white)', borderBottom: '2px solid var(--black)', height: '64px', display: 'flex', alignItems: 'center', padding: '0 24px' }}>
          <div style={{ maxWidth: 'var(--max-width)', margin: '0 auto', width: '100%' }}>
            <a href="/" style={{ display: 'flex', flexDirection: 'column', textDecoration: 'none', color: 'var(--black)' }}>
              <div style={{ fontWeight: 700, fontSize: '18px', lineHeight: 1.1 }}>PosturePal</div>
              <div style={{ fontSize: '11px', color: 'var(--muted)', fontWeight: 600, marginTop: '2px' }}>back to home</div>
            </a>
          </div>
        </nav>
        <section style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '60px 24px' }}>
          <div className="neo-card" style={{ background: 'var(--white)', padding: '48px', maxWidth: '480px', textAlign: 'center' }}>
            <div style={{ fontSize: '48px', marginBottom: '16px' }}>🔍</div>
            <h2 style={{ fontSize: '24px', marginBottom: '12px' }}>No trial key found</h2>
            <p style={{ color: 'var(--muted)', fontSize: '15px', marginBottom: '28px', lineHeight: 1.7 }}>
              Start your free trial from the home page to get a trial key and download link.
            </p>
            <a href="/" className="neo-btn accent" style={{ textDecoration: 'none', padding: '14px 32px' }}>
              Back to Home
            </a>
          </div>
        </section>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: 'var(--cream)' }}>
      <nav style={{ position: 'sticky', top: 0, zIndex: 100, background: 'var(--white)', borderBottom: '2px solid var(--black)', height: '64px', display: 'flex', alignItems: 'center', padding: '0 24px' }}>
        <div style={{ maxWidth: 'var(--max-width)', margin: '0 auto', width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <a href="/" style={{ display: 'flex', flexDirection: 'column', textDecoration: 'none', color: 'var(--black)' }}>
            <div style={{ fontWeight: 700, fontSize: '18px', lineHeight: 1.1 }}>PosturePal</div>
            <div style={{ fontSize: '11px', color: 'var(--muted)', fontWeight: 600, marginTop: '2px' }}>back to home</div>
          </a>
          <a href="mailto:support@posturepal.io" style={{ textDecoration: 'none', color: 'var(--black)', fontSize: '14px', fontWeight: 600 }}>Need help?</a>
        </div>
      </nav>

      <section style={{ padding: '48px 24px 60px', flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <div style={{ maxWidth: '720px', width: '100%' }}>

          {/* HERO */}
          <div style={{ textAlign: 'center', marginBottom: '32px' }}>
            <div className="neo-tag" style={{ background: 'var(--accent)', display: 'inline-block' }}>YOUR FREE TRIAL KEY IS READY</div>
            <h1 style={{ fontSize: '48px', margin: '14px 0 12px', lineHeight: 1.1 }}>Download PosturePal & paste your key.</h1>
            <p style={{ fontSize: '17px', color: 'var(--muted)', maxWidth: '520px', margin: '0 auto' }}>
              Your 5-day trial timer starts the moment you activate the key inside the app.
            </p>
          </div>

          {/* TRIAL KEY CARD */}
          <div className="neo-card" style={{ background: 'var(--white)', padding: '28px', marginBottom: '32px', textAlign: 'center' }}>
            <h2 style={{ fontSize: '20px', marginBottom: '6px' }}>Your Free Trial Key</h2>
            <p style={{ color: 'var(--muted)', fontSize: '13px', marginBottom: '18px' }}>
              Copy this. You'll paste it into PosturePal after installing.
            </p>
            <div style={{
              background: 'var(--accent)', border: '2px solid var(--black)',
              padding: '18px 16px', fontSize: '22px', letterSpacing: '4px',
              textAlign: 'center', fontFamily: 'monospace', fontWeight: 700,
              marginBottom: '14px', userSelect: 'all'
            }}>
              {trialKey}
            </div>
            <button
              onClick={handleCopy}
              className="neo-btn"
              style={{
                background: copied ? 'var(--accent)' : 'var(--black)',
                color: copied ? 'var(--black)' : 'var(--white)',
                border: '2px solid var(--black)',
                padding: '12px 28px', fontSize: '14px', fontWeight: 700,
                cursor: 'pointer'
              }}
            >
              {copied ? '✓ Copied!' : 'Copy Trial Key'}
            </button>
          </div>

          {/* SECTION HEADING */}
          <div style={{ textAlign: 'center', marginBottom: '20px' }}>
            <h2 style={{ fontSize: '28px', marginBottom: '6px' }}>Download the app</h2>
            <p style={{ color: 'var(--muted)', fontSize: '14px', margin: 0 }}>
              We've picked your platform automatically — switch tabs if it's wrong.
            </p>
          </div>

          {/* DOWNLOAD HUB (Windows / Mac tabs + install guide) */}
          <div style={{ marginBottom: '36px' }}>
            <DownloadHub />
          </div>

          {/* AFTER-INSTALL REMINDER */}
          <div
            className="neo-card"
            style={{ background: 'var(--white)', padding: '24px 28px', display: 'flex', gap: '18px', alignItems: 'flex-start' }}
          >
            <div style={{
              background: 'var(--black)', color: 'var(--accent)',
              border: '2px solid var(--black)', boxShadow: '3px 3px 0 var(--accent)',
              width: '44px', height: '44px', display: 'flex', alignItems: 'center',
              justifyContent: 'center', fontWeight: 800, fontSize: '18px', flexShrink: 0,
            }}>
              →
            </div>
            <div>
              <h3 style={{ fontSize: '18px', marginBottom: '6px' }}>After installing, paste your trial key</h3>
              <p style={{ color: 'var(--muted)', fontSize: '14px', lineHeight: 1.65, margin: 0 }}>
                Launch PosturePal, allow camera access, and paste the trial key shown above on the activation screen.
                Your 5-day trial starts immediately.
              </p>
            </div>
          </div>

        </div>
      </section>

      <footer style={{ borderTop: '2px solid var(--black)', padding: '24px', textAlign: 'center', fontSize: '14px', fontWeight: 600, background: 'var(--white)' }}>
        © 2026 PosturePal. Your spine is safe.
      </footer>
    </div>
  );
}

export default function DownloadPage() {
  return (
    <Suspense fallback={
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', background: 'var(--cream)', fontWeight: 600 }}>
        Loading...
      </div>
    }>
      <DownloadContent />
    </Suspense>
  );
}
