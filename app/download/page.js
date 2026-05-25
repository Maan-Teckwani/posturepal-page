'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';

const WIN_DOWNLOAD_URL =
  process.env.NEXT_PUBLIC_DOWNLOAD_URL_WIN ||
  'https://github.com/Maan-Teckwani/posturepal-releases/releases/latest/download/PosturePal-Setup.exe';

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

  const handleWindowsDownload = () => {
    const link = document.createElement('a');
    link.href = WIN_DOWNLOAD_URL;
    link.setAttribute('download', '');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
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
        <div style={{ maxWidth: '760px', width: '100%' }}>

          {/* HERO */}
          <div style={{ textAlign: 'center', marginBottom: '32px' }}>
            <div className="neo-tag" style={{ background: '#d4f57a', display: 'inline-block' }}>YOUR FREE TRIAL KEY IS READY</div>
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
              background: '#d4f57a', border: '2px solid var(--black)',
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
                background: copied ? '#d4f57a' : 'var(--black)',
                color: copied ? 'var(--black)' : 'var(--white)',
                border: '2px solid var(--black)',
                padding: '12px 28px', fontSize: '14px', fontWeight: 700,
                cursor: 'pointer'
              }}
            >
              {copied ? '✓ Copied!' : 'Copy Trial Key'}
            </button>
          </div>

          {/* STEPS */}
          <div className="neo-card" style={{ background: 'var(--white)', padding: '36px', marginBottom: '36px' }}>
            {/* STEP 1 */}
            <div style={{ display: 'flex', gap: '20px', alignItems: 'flex-start', marginBottom: '32px' }}>
              <div style={{ background: 'var(--accent)', border: '2px solid var(--black)', boxShadow: '3px 3px 0 var(--black)', width: '44px', height: '44px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '18px', flexShrink: 0 }}>1</div>
              <div style={{ flex: 1 }}>
                <h2 style={{ fontSize: '22px', marginBottom: '8px' }}>Download for Windows</h2>
                <p style={{ color: 'var(--muted)', fontSize: '14px', marginBottom: '16px', lineHeight: 1.6 }}>
                  Mac & Linux coming soon. Currently Windows only.
                </p>
                <button onClick={handleWindowsDownload} className="neo-btn accent" style={{ fontSize: '16px', padding: '14px 28px', cursor: 'pointer' }}>
                  ⬇  Download PosturePal-Setup.exe
                </button>
              </div>
            </div>

            <div style={{ height: '2px', background: 'var(--black)', opacity: 0.1, marginBottom: '32px' }} />

            {/* STEP 2 */}
            <div style={{ display: 'flex', gap: '20px', alignItems: 'flex-start', marginBottom: '32px' }}>
              <div style={{ background: 'var(--accent)', border: '2px solid var(--black)', boxShadow: '3px 3px 0 var(--black)', width: '44px', height: '44px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '18px', flexShrink: 0 }}>2</div>
              <div style={{ flex: 1 }}>
                <h2 style={{ fontSize: '22px', marginBottom: '8px' }}>Install the app</h2>
                <p style={{ color: 'var(--muted)', fontSize: '14px', marginBottom: '12px', lineHeight: 1.7 }}>
                  Run <strong>PosturePal-Setup.exe</strong> once it finishes downloading. Windows may show a blue <em>"Windows protected your PC"</em> screen — that's expected for indie apps. See the safe install guide below if you need it.
                </p>
              </div>
            </div>

            <div style={{ height: '2px', background: 'var(--black)', opacity: 0.1, marginBottom: '32px' }} />

            {/* STEP 3 */}
            <div style={{ display: 'flex', gap: '20px', alignItems: 'flex-start' }}>
              <div style={{ background: 'var(--black)', color: 'var(--accent)', border: '2px solid var(--black)', boxShadow: '3px 3px 0 var(--accent)', width: '44px', height: '44px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '18px', flexShrink: 0 }}>3</div>
              <div style={{ flex: 1 }}>
                <h2 style={{ fontSize: '22px', marginBottom: '8px' }}>Open PosturePal & paste your trial key</h2>
                <p style={{ color: 'var(--muted)', fontSize: '14px', marginBottom: '8px', lineHeight: 1.7 }}>
                  Launch the app from your Start Menu or desktop shortcut. On the activation screen, paste the trial key from the card above. Your 5-day free trial starts immediately and you'll see the remaining days on the dashboard.
                </p>
              </div>
            </div>
          </div>

          {/* SMARTSCREEN GUIDE — TEXT ONLY */}
          <div style={{ background: 'var(--black)', border: '2px solid var(--black)', boxShadow: '8px 8px 0 var(--accent)', padding: '36px', marginBottom: '24px' }}>
            <div className="neo-tag" style={{ background: 'var(--accent)', marginBottom: '16px' }}>WINDOWS SAFE-INSTALL GUIDE</div>
            <h2 style={{ fontSize: '24px', color: 'var(--white)', marginBottom: '14px' }}>
              About the "Windows protected your PC" warning
            </h2>
            <p style={{ color: 'rgba(255,255,255,0.82)', fontSize: '15px', lineHeight: 1.7, marginBottom: '24px' }}>
              PosturePal is a small, independent app. Because we haven't yet purchased an expensive code-signing certificate, Windows SmartScreen may flag the installer as coming from an "Unknown publisher" on first run. This is purely a missing-certificate warning — <strong style={{ color: 'var(--accent)' }}>PosturePal is safe to install</strong>, runs 100% on-device, and never sends your webcam or any personal data anywhere.
            </p>
            <h3 style={{ fontSize: '16px', color: 'var(--accent)', marginBottom: '12px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>To install safely:</h3>
            <ol style={{ color: 'rgba(255,255,255,0.9)', fontSize: '15px', lineHeight: 1.9, paddingLeft: '22px', marginBottom: '24px' }}>
              <li>Double-click <strong>PosturePal-Setup.exe</strong> after it downloads.</li>
              <li>If a blue <em>"Windows protected your PC"</em> screen appears, click the small <strong style={{ color: 'var(--accent)' }}>More info</strong> link near the top of the dialog.</li>
              <li>A new <strong style={{ color: 'var(--accent)' }}>Run anyway</strong> button will appear at the bottom — click it.</li>
              <li>Follow the standard installer prompts (choose where to install, click Next, Install, Finish).</li>
              <li>Open PosturePal from your Start Menu and paste your trial key.</li>
            </ol>
            <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '13px', margin: 0, lineHeight: 1.6 }}>
              Still unsure? Email <a href="mailto:support@posturepal.io" style={{ color: 'var(--accent)' }}>support@posturepal.io</a> — we're happy to walk you through it.
            </p>
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
