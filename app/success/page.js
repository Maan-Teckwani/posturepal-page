'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';

function SuccessContent() {
  const searchParams = useSearchParams();
  const licenseKey = searchParams.get('key') || '';
  const [copied, setCopied] = useState(false);
  const [os, setOs] = useState('unknown');

  const downloadLinks = {
    mac: process.env.NEXT_PUBLIC_DOWNLOAD_URL_MAC || 'https://github.com/Maan-Teckwani/posturepal-releases/releases/latest/download/PosturePal.dmg',
    win: process.env.NEXT_PUBLIC_DOWNLOAD_URL_WIN || 'https://github.com/Maan-Teckwani/posturepal-releases/releases/latest/download/PosturePal-Setup.exe',
  };

  useEffect(() => {
    const ua = window.navigator.userAgent.toLowerCase();
    if (ua.includes('mac')) setOs('mac');
    else if (ua.includes('win')) setOs('win');

    const observer = new IntersectionObserver(
      (entries) => entries.forEach(e => {
        if (e.isIntersecting) {
          e.target.style.opacity = '1';
          e.target.style.transform = 'translateY(0)';
        }
      }),
      { threshold: 0.1 }
    );
    document.querySelectorAll('.scroll-fade').forEach(el => {
      el.style.opacity = '0';
      el.style.transform = 'translateY(24px)';
      el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
      observer.observe(el);
    });
    return () => observer.disconnect();
  }, []);

  const handleCopy = () => {
    if (!licenseKey) return;
    navigator.clipboard.writeText(licenseKey).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: 'var(--cream)' }}>
      <nav style={{
        position: 'sticky', top: 0, zIndex: 100, background: 'var(--white)',
        borderBottom: '2px solid var(--black)', height: '64px',
        display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0 24px'
      }}>
        <div style={{ maxWidth: 'var(--max-width)', margin: '0 auto', width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <a href="/" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', textDecoration: 'none', color: 'var(--black)' }}>
            <div style={{ fontWeight: 700, fontSize: '18px', lineHeight: 1.1 }}>PosturePal</div>
            <div style={{ fontSize: '11px', color: 'var(--muted)', fontWeight: 600, marginTop: '2px' }}>back to home</div>
          </a>
          <a href="mailto:support@posturepal.io" style={{ textDecoration: 'none', color: 'var(--black)', fontSize: '14px', fontWeight: 600 }}>Need help?</a>
        </div>
      </nav>

      <section style={{ padding: '80px 24px 60px', flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <div style={{ maxWidth: '800px', width: '100%' }}>

          <div className="scroll-fade" style={{ textAlign: 'center', marginBottom: '48px' }}>
            <div className="neo-tag" style={{ background: '#d4f57a', display: 'inline-block' }}>PAYMENT SUCCESSFUL</div>
            <h1 style={{ fontSize: '64px', margin: '20px 0', lineHeight: 1.1 }}>The group chat is at peace.</h1>
            <p style={{ fontSize: '20px', color: 'var(--muted)', maxWidth: '500px', margin: '0 auto' }}>
              Your spine thanks you. Copy your license key below.
            </p>
          </div>

          {/* LICENSE KEY CARD */}
          <div className="neo-card scroll-fade" style={{ background: 'var(--white)', marginBottom: '48px', padding: '40px', textAlign: 'center' }}>
            <h2 style={{ fontSize: '22px', marginBottom: '8px' }}>Your License Key</h2>
            <p style={{ color: 'var(--muted)', fontSize: '14px', marginBottom: '24px' }}>
              This key has also been emailed to you. It activates PosturePal on up to 2 devices.
            </p>

            {licenseKey ? (
              <>
                <div style={{
                  background: '#d4f57a', border: '2px solid var(--black)',
                  padding: '24px 20px', fontSize: '28px', letterSpacing: '8px',
                  textAlign: 'center', fontFamily: 'monospace', fontWeight: 700,
                  marginBottom: '16px', userSelect: 'all'
                }}>
                  {licenseKey}
                </div>
                <button
                  onClick={handleCopy}
                  className="neo-btn"
                  style={{
                    background: copied ? '#d4f57a' : 'var(--black)',
                    color: copied ? 'var(--black)' : 'var(--white)',
                    border: '2px solid var(--black)',
                    padding: '12px 32px', fontSize: '14px', fontWeight: 700,
                    cursor: 'pointer', transition: 'background 0.2s, color 0.2s'
                  }}
                >
                  {copied ? '✓ Copied!' : 'Copy License Key'}
                </button>
              </>
            ) : (
              <div style={{
                background: '#f5f5f5', border: '2px solid var(--black)',
                padding: '24px', fontSize: '15px', color: 'var(--muted)',
                marginBottom: '16px'
              }}>
                Your license key has been sent to your email. Check your inbox (and spam folder).
              </div>
            )}

            <p style={{ fontSize: '13px', color: 'var(--muted)', marginTop: '16px' }}>
              Keep this key safe — you'll need it to activate the app.
            </p>
          </div>

          {/* NEXT STEPS */}
          <div className="scroll-fade">
            <h2 style={{ fontSize: '32px', marginBottom: '24px', textAlign: 'center' }}>Next Steps</h2>
            <div className="grid-3">
              <div className="neo-card" style={{ background: 'var(--accent)', display: 'flex', flexDirection: 'column' }}>
                <div style={{ fontSize: '32px', marginBottom: '16px' }}>1️⃣</div>
                <h3 style={{ fontSize: '20px', marginBottom: '12px' }}>Download</h3>
                <p style={{ color: 'var(--black)', marginBottom: '24px', flex: 1 }}>Get the PosturePal app for your operating system.</p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <a href={downloadLinks.mac} target="_blank" rel="noopener noreferrer" className="neo-btn"
                    style={{ background: 'var(--white)', textAlign: 'center', textDecoration: 'none', color: 'var(--black)', padding: '12px', display: 'block' }}>
                    {os === 'mac' ? '★ Download for Mac' : 'Download for Mac'}
                  </a>
                  <a href={downloadLinks.win} target="_blank" rel="noopener noreferrer" className="neo-btn"
                    style={{ background: 'var(--white)', textAlign: 'center', textDecoration: 'none', color: 'var(--black)', padding: '12px', display: 'block' }}>
                    {os === 'win' ? '★ Download for Windows' : 'Download for Windows'}
                  </a>
                </div>
              </div>

              <div className="neo-card" style={{ background: 'var(--white)', display: 'flex', flexDirection: 'column' }}>
                <div style={{ fontSize: '32px', marginBottom: '16px' }}>2️⃣</div>
                <h3 style={{ fontSize: '20px', marginBottom: '12px' }}>Activate</h3>
                <p style={{ color: 'var(--muted)', flex: 1 }}>Open the app, grant camera permissions, and paste your license key when prompted.</p>
                <div style={{ background: '#f5f5f5', border: '2px solid black', padding: '12px', textAlign: 'center', fontSize: '14px', fontWeight: 600, marginTop: '24px' }}>
                  No account needed.
                </div>
              </div>

              <div className="neo-card" style={{ background: 'var(--white)', display: 'flex', flexDirection: 'column' }}>
                <div style={{ fontSize: '32px', marginBottom: '16px' }}>3️⃣</div>
                <h3 style={{ fontSize: '20px', marginBottom: '12px' }}>Calibrate</h3>
                <p style={{ color: 'var(--muted)', flex: 1 }}>Sit up straight for 3 seconds. The AI learns your baseline. Then let it run in the background.</p>
                <div style={{ color: '#ef4444', fontWeight: 700, fontSize: '14px', marginTop: '24px' }}>
                  The group chat is watching 👁️
                </div>
              </div>
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

export default function SuccessPage() {
  return (
    <Suspense fallback={<div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', background: 'var(--cream)', fontWeight: 600 }}>Loading...</div>}>
      <SuccessContent />
    </Suspense>
  );
}
