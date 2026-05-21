'use client';

import React, { useState, useEffect } from 'react';

const PRICE = 299;

const CheckoutModal = ({ onSubmit, onClose, loading }) => {
  const [form, setForm] = useState({ firstName: '', lastName: '', email: '' });
  const [error, setError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    const { firstName, lastName, email } = form;
    if (!firstName.trim() || !lastName.trim() || !email.trim()) {
      setError('All fields are required.');
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError('Please enter a valid email address.');
      return;
    }
    setError('');
    onSubmit(form);
  };

  const field = (label, key, type, placeholder) => (
    <div style={{ marginBottom: '16px' }}>
      <label style={{ display: 'block', fontWeight: 600, fontSize: '13px', marginBottom: '6px' }}>{label}</label>
      <input
        type={type}
        value={form[key]}
        onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))}
        placeholder={placeholder}
        style={{
          width: '100%', padding: '12px', border: '2px solid var(--black)',
          background: 'var(--white)', fontFamily: 'Space Grotesk, sans-serif',
          fontSize: '14px', outline: 'none', boxSizing: 'border-box'
        }}
      />
    </div>
  );

  return (
    <div
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}
      style={{
        position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.65)',
        zIndex: 1000, display: 'flex', alignItems: 'center',
        justifyContent: 'center', padding: '20px'
      }}
    >
      <div style={{
        background: 'var(--cream)', border: '2px solid var(--black)',
        boxShadow: '8px 8px 0 var(--black)', padding: '40px',
        maxWidth: '440px', width: '100%', position: 'relative'
      }}>
        <button
          onClick={onClose}
          style={{ position: 'absolute', top: '16px', right: '20px', background: 'none', border: 'none', fontSize: '24px', cursor: 'pointer', fontWeight: 300, lineHeight: 1 }}
        >×</button>

        <h2 style={{ fontFamily: 'Instrument Serif, serif', fontSize: '28px', marginBottom: '6px' }}>Almost there.</h2>
        <p style={{ color: 'var(--muted)', fontSize: '14px', marginBottom: '28px' }}>
          Your license key will be shown instantly after payment.
        </p>

        <form onSubmit={handleSubmit}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div>
              {field('First Name', 'firstName', 'text', 'Jane')}
            </div>
            <div>
              {field('Last Name', 'lastName', 'text', 'Doe')}
            </div>
          </div>
          {field('Email', 'email', 'email', 'jane@example.com')}

          {error && <div style={{ color: '#b91c1c', fontSize: '13px', marginBottom: '14px', marginTop: '-4px' }}>{error}</div>}

          <button
            type="submit"
            disabled={loading}
            className="neo-btn accent"
            style={{ width: '100%', fontSize: '15px', padding: '14px', cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.7 : 1 }}
          >
            {loading ? 'Processing…' : `Proceed to Payment — Rs. ${PRICE}`}
          </button>

          <p style={{ fontSize: '12px', color: 'var(--muted)', textAlign: 'center', marginTop: '12px' }}>
            Secure payment via Razorpay
          </p>
        </form>
      </div>
    </div>
  );
};

const RazorpayButton = ({ buttonText = `Buy Now — Rs. ${PRICE}` }) => {
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const loadRazorpayScript = () => new Promise((resolve, reject) => {
    if (typeof window === 'undefined') return reject(new Error('Browser environment required.'));
    if (window.Razorpay) return resolve(true);
    const existing = document.querySelector('script[src="https://checkout.razorpay.com/v1/checkout.js"]');
    if (existing) {
      existing.addEventListener('load', () => resolve(true));
      existing.addEventListener('error', () => reject(new Error('Failed to load Razorpay script.')));
      return;
    }
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    script.onload = () => resolve(true);
    script.onerror = () => reject(new Error('Failed to load Razorpay script.'));
    document.body.appendChild(script);
  });

  const handleFormSubmit = async ({ firstName, lastName, email }) => {
    setLoading(true);
    setError(null);

    try {
      await loadRazorpayScript();

      const createOrderResponse = await fetch('/api/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: PRICE * 100,
          customer: { first_name: firstName, last_name: lastName, email }
        })
      });

      if (!createOrderResponse.ok) {
        const err = await createOrderResponse.json().catch(() => null);
        throw new Error(err?.error || 'Unable to create payment order.');
      }

      const order = await createOrderResponse.json();

      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        amount: order.amount,
        currency: order.currency,
        name: 'PosturePal',
        description: 'PosturePal Lifetime License',
        order_id: order.order_id,
        prefill: { name: `${firstName} ${lastName}`, email },
        theme: { color: '#000000' },
        modal: {
          ondismiss: () => {
            setError('Payment cancelled. You can try again anytime.');
            setLoading(false);
          }
        },
        handler: async function (response) {
          try {
            const verifyRes = await fetch('/api/verify-payment', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_order_id: response.razorpay_order_id,
                razorpay_signature: response.razorpay_signature
              })
            });
            if (!verifyRes.ok) throw new Error('Payment could not be verified.');
            const verifyData = await verifyRes.json();
            if (!verifyData.success) throw new Error(verifyData.message || 'Payment verification failed.');

            const genRes = await fetch('/api/generate-license', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ payment_id: response.razorpay_payment_id, email })
            });
            if (!genRes.ok) throw new Error('License generation failed. Your key will be emailed to you.');
            const genData = await genRes.json();
            if (!genData.success) throw new Error(genData.error || 'License generation failed. Your key will be emailed to you.');

            window.location.href = `/success?token=${encodeURIComponent(genData.sessionToken)}`;
          } catch (err) {
            setError(err.message || 'Something went wrong. Check your email for the license key.');
            setLoading(false);
          }
        }
      };

      const razorpay = new window.Razorpay(options);
      razorpay.on('payment.failed', () => {
        setError('Payment failed. Please try again.');
        setLoading(false);
      });

      setShowModal(false);
      razorpay.open();
    } catch (err) {
      setError(err?.message || 'Unable to start checkout.');
      setLoading(false);
    }
  };

  return (
    <>
      {showModal && (
        <CheckoutModal
          onSubmit={handleFormSubmit}
          onClose={() => { setShowModal(false); setLoading(false); }}
          loading={loading}
        />
      )}
      <button
        onClick={() => { setError(null); setShowModal(true); }}
        className="neo-btn accent"
        style={{ fontSize: '16px', padding: '16px 32px', whiteSpace: 'nowrap', cursor: 'pointer' }}
      >
        {buttonText}
      </button>
      {error && (
        <div style={{ marginTop: '12px', color: '#b91c1c', fontSize: '14px', maxWidth: '420px' }}>
          {error}
        </div>
      )}
    </>
  );
};

export default function Home() {
  const [openFaq, setOpenFaq] = useState(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'translateY(0)';
          }
        });
      },
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

  return (
    <>
      {/* NAVBAR */}
      <nav style={{
        position: 'sticky', top: 0, zIndex: 100, background: 'var(--white)',
        borderBottom: '2px solid var(--black)', height: '64px',
        display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0 24px'
      }}>
        <div style={{ maxWidth: 'var(--max-width)', margin: '0 auto', width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
            <div style={{ fontWeight: 700, fontSize: '18px', lineHeight: 1.1 }}>PosturePal</div>
            <div style={{ fontSize: '11px', color: 'var(--muted)', fontWeight: 600, marginTop: '2px', letterSpacing: '0.02em' }}>your spine's intervention app</div>
          </div>
          <div className="nav-links" style={{ display: 'flex', gap: '32px', fontSize: '14px', fontWeight: 500 }}>
            <a href="#benefits" style={{ textDecoration: 'none', color: 'var(--black)' }}>Benefits</a>
            <a href="#intervention" style={{ textDecoration: 'none', color: 'var(--black)' }}>The Chat</a>
            <a href="#how-it-works" style={{ textDecoration: 'none', color: 'var(--black)' }}>How it works</a>
            <a href="#pricing" style={{ textDecoration: 'none', color: 'var(--black)' }}>Buy</a>
            <a href="#faq" style={{ textDecoration: 'none', color: 'var(--black)' }}>FAQ</a>
          </div>
          <div className="nav-links">
            <a href="#pricing" className="neo-btn" style={{ fontSize: '13px', padding: '10px 20px', background: 'var(--accent)', color: 'var(--black)' }}>
              Buy Now — Rs. {PRICE}
            </a>
          </div>
        </div>
      </nav>

      {/* HERO SECTION */}
      <section className="bg-cream" style={{ padding: '20px 90px 80px 40px', display: 'flex', alignItems: 'center' }}>
        <div className="container" style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', width: '100%' }}>
          <div style={{ flex: '1 1 55%', paddingRight: '60px', minWidth: '300px', paddingTop: '30px' }}>
            <div className="neo-tag fade-up">YOUR NECK ASKED US TO INTERVENE</div>
            <h1 className="fade-up fade-up-delay-1" style={{ fontSize: '70px', margin: '1px 0 0 0', lineHeight: 1.1 }}>Your spine has a group chat.</h1>
            <div className="fade-up fade-up-delay-1" style={{ fontSize: '30px', fontFamily: 'Instrument Serif', fontStyle: 'italic', marginBottom: '20px', fontWeight: 400, marginTop: '10px' }}>It's not looking good in there.</div>
            <p className="fade-up fade-up-delay-2" style={{ fontSize: '18px', color: 'var(--muted)', maxWidth: '480px', marginBottom: '32px' }}>
              PosturePal uses your webcam and on-device AI to catch you slouching before your body files a formal complaint.
              <strong> One-time payment. Your spine will stop yelling.</strong>
            </p>

            <div className="fade-up fade-up-delay-3" style={{ maxWidth: '420px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '16px' }}>
                <span style={{ fontSize: '36px', fontWeight: 700, fontFamily: 'Instrument Serif' }}>Rs. {PRICE}</span>
                <span style={{ fontSize: '14px', color: 'var(--muted)', textDecoration: 'line-through', fontWeight: 600 }}>Rs. 699</span>
                <span style={{ background: 'var(--accent)', border: '2px solid var(--black)', padding: '2px 8px', fontSize: '10px', fontWeight: 700 }}>LIFETIME</span>
              </div>
              <a href="#pricing" className="neo-btn accent" style={{ fontSize: '16px', padding: '16px 32px', whiteSpace: 'nowrap', display: 'inline-block', textDecoration: 'none' }}>
                Buy Now — Rs. {PRICE}
              </a>
            </div>

            <div className="fade-up fade-up-delay-4" style={{ marginTop: '20px', display: 'flex', gap: '20px', fontSize: '13px', color: 'var(--muted)', flexWrap: 'wrap' }}>
              <span>✓ Mac, Windows & Linux</span>
              <span>✓ 100% Offline AI</span>
              <span>✓ Lifetime license</span>
            </div>
          </div>

          <div style={{ flex: '1 1 45%', minWidth: '300px', display: 'flex', justifyContent: 'center', marginTop: '10', marginBottom: '40px' }}>
            <div style={{ animation: 'float 4s ease-in-out infinite', width: '100%', maxWidth: '380px' }}>
              <div className="neo-card" style={{ width: '100%', padding: 0, overflow: 'hidden', display: 'flex', flexDirection: 'column', borderRadius: '0' }}>
                <div style={{ padding: '16px', borderBottom: '2px solid var(--black)', display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{ display: 'flex', gap: '-4px' }}>
                    <div style={{ width: '20px', height: '20px', borderRadius: '50%', background: '#8b5a2b', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px' }}></div>
                    <div style={{ width: '20px', height: '20px', borderRadius: '50%', background: '#ef4444', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px', marginLeft: '-8px', border: '1px solid white' }}></div>
                    <div style={{ width: '20px', height: '20px', borderRadius: '50%', background: '#f5f0e8', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px', marginLeft: '-8px', border: '1px solid white' }}>👁</div>
                    <div style={{ width: '20px', height: '20px', borderRadius: '50%', background: '#facc15', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px', marginLeft: '-8px', border: '1px solid white' }}></div>
                  </div>
                  <div style={{ fontWeight: 700, fontSize: '15px' }}>The Body Collective</div>
                </div>
                <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '13px', fontFamily: 'Space Grotesk, sans-serif' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
                    <div style={{ fontSize: '10px', fontWeight: 700, color: 'var(--muted)', marginBottom: '3px' }}>Neck 🟤</div>
                    <div style={{ background: '#f3f4f6', padding: '8px 12px', borderRadius: '12px', borderTopLeftRadius: '0', maxWidth: '85%' }}>he's doing the goblin lean again</div>
                    <div style={{ fontSize: '9px', color: 'var(--muted)', marginTop: '2px', marginLeft: '4px' }}>9:41 AM</div>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
                    <div style={{ fontSize: '10px', fontWeight: 700, color: 'var(--muted)', marginBottom: '3px' }}>Lower Back 🔴</div>
                    <div style={{ background: '#f3f4f6', padding: '8px 12px', borderRadius: '12px', borderTopLeftRadius: '0', maxWidth: '85%' }}>I can't keep carrying this team</div>
                    <div style={{ fontSize: '9px', color: 'var(--muted)', marginTop: '2px', marginLeft: '4px' }}>9:41 AM</div>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
                    <div style={{ fontSize: '10px', fontWeight: 700, color: 'var(--muted)', marginBottom: '3px' }}>Eyes 👁</div>
                    <div style={{ background: '#f3f4f6', padding: '8px 12px', borderRadius: '12px', borderTopLeftRadius: '0', maxWidth: '85%' }}>3 inches from the monitor btw<br />just thought you should know</div>
                    <div style={{ fontSize: '9px', color: 'var(--muted)', marginTop: '2px', marginLeft: '4px' }}>9:42 AM</div>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
                    <div style={{ fontSize: '10px', fontWeight: 700, color: 'var(--muted)', marginBottom: '3px' }}>You</div>
                    <div style={{ background: 'var(--black)', color: 'var(--white)', padding: '8px 12px', borderRadius: '12px', borderTopRightRadius: '0', maxWidth: '85%' }}>I'm fine</div>
                    <div style={{ fontSize: '9px', color: 'var(--muted)', marginTop: '2px', marginRight: '4px' }}>9:42 AM</div>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
                    <div style={{ fontSize: '10px', fontWeight: 700, color: 'var(--muted)', marginBottom: '3px' }}>Shoulders 🟡</div>
                    <div style={{ background: '#f3f4f6', padding: '8px 12px', borderRadius: '12px', borderTopLeftRadius: '0', maxWidth: '85%' }}>he is NOT fine</div>
                    <div style={{ fontSize: '9px', color: 'var(--muted)', marginTop: '2px', marginLeft: '4px' }}>9:42 AM</div>
                  </div>
                </div>
                <div style={{ padding: '12px 16px', borderTop: '2px solid var(--black)', background: '#fafafa' }}>
                  <div style={{ background: '#e5e7eb', borderRadius: '20px', padding: '8px 16px', color: 'var(--muted)', fontSize: '13px' }}>Type a message...</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* TICKER */}
      <div style={{ background: 'var(--black)', color: 'var(--white)', padding: '16px 0', borderTop: '2px solid var(--black)', borderBottom: '2px solid var(--black)', overflow: 'hidden', whiteSpace: 'nowrap' }}>
        <div style={{ display: 'flex', width: 'fit-content', animation: 'marquee 20s linear infinite' }}>
          {[1, 2, 3, 4].map(i => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '80px', paddingRight: '80px', fontSize: '14px', fontWeight: 700, letterSpacing: '0.1em' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '12px' }}><span style={{ color: 'var(--accent)' }}>✦</span> NO SUBSCRIPTIONS</span>
              <span style={{ display: 'flex', alignItems: 'center', gap: '12px' }}><span style={{ color: 'var(--accent)' }}>✦</span> MAC · WINDOWS · LINUX</span>
              <span style={{ display: 'flex', alignItems: 'center', gap: '12px' }}><span style={{ color: 'var(--accent)' }}>✦</span> 100% OFFLINE</span>
              <span style={{ display: 'flex', alignItems: 'center', gap: '12px' }}><span style={{ color: 'var(--accent)' }}>✦</span> ON-DEVICE AI</span>
            </div>
          ))}
        </div>
      </div>

      {/* PROBLEM SECTION */}
      <section id="benefits" className="bg-cream">
        <div className="container">
          <div className="neo-tag">THE SITUATION</div>
          <h2 className="scroll-fade" style={{ fontSize: '52px', maxWidth: '600px', marginBottom: '16px' }}>The group chat is not happy.</h2>
          <p className="scroll-fade" style={{ fontSize: '18px', color: 'var(--muted)', marginBottom: '48px', maxWidth: '600px' }}>Your body parts have been in crisis mode for months. Here's what they're saying.</p>
          <div className="grid-3">
            {[
              { bg: 'var(--accent)', icon: '🤕', stat: '47', label: 'goblin leans', tag: 'today alone' },
              { bg: 'var(--white)', icon: '💀', stat: 'lower back', label: 'has left the chat', tag: 'on read' },
              { bg: 'var(--white)', icon: '👁️', stat: '2.5 in', label: 'from the screen', tag: 'not a drill' },
            ].map((card, i) => (
              <div key={i} className="neo-card scroll-fade" style={{ background: card.bg, display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: '12px' }}>
                <div style={{ width: '52px', height: '52px', background: 'black', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '24px', flexShrink: 0 }}>{card.icon}</div>
                <div>
                  <div style={{ fontSize: '28px', fontWeight: 800, fontFamily: 'Space Grotesk, sans-serif', lineHeight: 1.1 }}>{card.stat}</div>
                  <div style={{ fontSize: '16px', fontWeight: 600, fontFamily: 'Space Grotesk, sans-serif', marginTop: '4px' }}>{card.label}</div>
                </div>
                <div className="neo-tag" style={{ marginTop: 'auto', marginBottom: 0 }}>{card.tag}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* INTERVENTION SECTION */}
      <section id="intervention" className="bg-white">
        <div className="container">
          <div style={{ textAlign: 'center' }}>
            <div className="neo-tag">EXHIBIT A</div>
            <h2 className="scroll-fade" style={{ fontSize: '52px', marginBottom: '16px' }}>The full conversation.</h2>
            <p className="scroll-fade" style={{ fontSize: '17px', color: 'var(--muted)', marginBottom: '48px', maxWidth: '600px', margin: '0 auto 48px auto' }}>
              Recovered from your spine's group chat. Posted with permission (they insisted).
            </p>
          </div>
          <div className="scroll-fade" style={{ maxWidth: '600px', margin: '0 auto', background: '#f5f5f5', border: '2px solid black', boxShadow: '6px 6px 0 black', padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px', paddingBottom: '16px', borderBottom: '2px solid black' }}>
              <div style={{ width: '44px', height: '44px', borderRadius: '50%', background: 'black', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px', flexShrink: 0 }}>💬</div>
              <div>
                <div style={{ fontWeight: 700, fontSize: '15px' }}>🧠 The Body Collective</div>
                <div style={{ fontSize: '12px', color: 'var(--muted)' }}>Neck, Lower Back, Eyes, Shoulders, and You</div>
              </div>
            </div>
            <div style={{ display: 'flex', justifyContent: 'center', margin: '8px 0' }}>
              <div style={{ background: 'rgba(0,0,0,0.08)', padding: '4px 12px', borderRadius: '20px', fontSize: '11px', color: 'var(--muted)', textAlign: 'center' }}>Today 9:41 AM</div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {[
                { sender: 'Neck 🟤', msg: 'ok so are we going to talk about what\'s happening', align: 'start' },
                { sender: 'Lower Back 🔴', msg: 'I\'ve been trying to raise this for MONTHS', align: 'start' },
                { sender: 'Eyes 👁', msg: 'not to alarm anyone but we are approximately 2.5 inches from the monitor', align: 'start' },
                { sender: 'Shoulders 🟡', msg: 'I\'ve been up around my ears since the standup call', align: 'start' },
                { sender: 'You', msg: 'I\'m literally fine guys', align: 'end' },
                { sender: 'Lower Back 🔴', msg: 'HE SAID FINE', align: 'start' },
                { sender: 'Neck 🟤', msg: 'PosturePal starts now. we already downloaded it.', align: 'start' },
              ].map((m, i) => (
                <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: m.align === 'end' ? 'flex-end' : 'flex-start', gap: '2px' }}>
                  {m.align !== 'end' && <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--muted)', marginBottom: '2px' }}>{m.sender}</div>}
                  <div style={{
                    background: m.align === 'end' ? 'black' : 'white',
                    color: m.align === 'end' ? 'white' : 'inherit',
                    border: m.align === 'end' ? 'none' : '1.5px solid #e0e0e0',
                    borderRadius: m.align === 'end' ? '12px 0 12px 12px' : '0 12px 12px 12px',
                    padding: '10px 14px', fontSize: '14px', maxWidth: '80%',
                    boxShadow: m.align === 'end' ? 'none' : '2px 2px 0 rgba(0,0,0,0.06)'
                  }}>{m.msg}</div>
                </div>
              ))}
            </div>
          </div>
          <p className="scroll-fade" style={{ textAlign: 'center', fontSize: '15px', fontStyle: 'italic', color: 'var(--muted)', marginTop: '24px', marginBottom: '24px' }}>
            Sound familiar? PosturePal stages the intervention your body has been planning.
          </p>
          <div className="scroll-fade" style={{ display: 'flex', justifyContent: 'center' }}>
            <a href="#pricing" className="neo-btn accent" style={{ fontSize: '16px', padding: '16px 32px', whiteSpace: 'nowrap', display: 'inline-block', textDecoration: 'none' }}>
              Buy Now — Rs. {PRICE}
            </a>
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section id="how-it-works" className="bg-cream">
        <div className="container">
          <div className="neo-tag">THE INTERVENTION PLAN</div>
          <h2 className="scroll-fade" style={{ fontSize: '52px', marginBottom: '56px' }}>Three steps. The group chat goes quiet.</h2>
          <div className="grid-3">
            {[
              { num: "01", title: "Sit up. Click Calibrate.", tag: "3 seconds" },
              { num: "02", title: "Back to your doom scroll.", tag: "Always running" },
              { num: "03", title: "Pop-up arrives. You fix it.", tag: "Instant feedback" }
            ].map((step, i) => (
              <div key={i} className="neo-card scroll-fade" style={{ display: 'flex', flexDirection: 'column' }}>
                <div style={{ width: '48px', height: '48px', background: 'var(--accent)', color: 'var(--black)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px', fontFamily: 'Space Grotesk, sans-serif', fontWeight: 700, marginBottom: '24px', border: '2px solid var(--black)', boxShadow: '3px 3px 0 var(--black)' }}>{step.num}</div>
                <h3 style={{ fontSize: '22px', fontWeight: 700, fontFamily: 'Space Grotesk, sans-serif' }}>{step.title}</h3>
                <div className="neo-tag" style={{ marginTop: 'auto', marginBottom: 0 }}>{step.tag}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section id="features" className="bg-white">
        <div className="container">
          <div className="neo-tag">WHAT POSTUREPAL TELLS THE GROUP CHAT</div>
          <h2 className="scroll-fade" style={{ fontSize: '52px', marginBottom: '48px' }}>Everything you need, nothing you don't.</h2>
          <div className="grid-2">
            {[
              { icon: "🎯", title: "Calibrated to your goblin lean", desc: "Your baseline. Not the textbook's." },
              { icon: "🔴", title: "Three signals. Three complaints resolved.", desc: "Head, shoulders, screen distance — tracked independently." },
              { icon: "🔔", title: "3-second intervention timer", desc: "3 seconds of slump triggers one popup." },
              { icon: "📊", title: "Evidence for the group chat", desc: "Daily, weekly, monthly charts. Lower Back will come around." },
              { icon: "🏆", title: "XP for good behavior", desc: "Level up from Shrimp to PosturePal Master." },
              { icon: "🔒", title: "No data leaves your device. Ever.", desc: "AI runs locally. Webcam never touches a server." }
            ].map((f, i) => (
              <div key={i} className="neo-card scroll-fade" style={{ display: 'flex', gap: '20px', alignItems: 'flex-start' }}>
                <div style={{ width: '48px', height: '48px', background: 'var(--accent)', border: '2px solid black', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, fontSize: '22px' }}>{f.icon}</div>
                <div>
                  <h3 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '4px', fontFamily: 'Space Grotesk, sans-serif' }}>{f.title}</h3>
                  <p style={{ color: 'var(--muted)', fontSize: '14px', margin: 0 }}>{f.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section id="testimonials" className="bg-cream" style={{ overflow: 'hidden' }}>
        <div className="container" style={{ paddingBottom: '48px' }}>
          <div className="neo-tag">OTHER PEOPLE'S GROUP CHATS</div>
          <h2 className="scroll-fade" style={{ fontSize: '52px', marginBottom: '48px' }}>Real people. Very relieved spines.</h2>
        </div>
        <div style={{ display: 'flex', width: 'fit-content', animation: 'marquee 30s linear infinite' }}>
          {[1, 2].map(group => (
            <div key={group} style={{ display: 'flex', gap: '24px', paddingRight: '24px', paddingLeft: group === 1 ? '40px' : '0' }}>
              {[
                { quote: "I opened PosturePal as a joke and my neck has been suspiciously quiet ever since.", name: "Sarah J." },
                { quote: "The popup caught me doing the goblin lean 11 times on day one. I thought I had good posture. I was wrong. Lower Back knew.", name: "Mark T." },
                { quote: "My chiropractor asked what changed. I said a small app staged an intervention. He did not find it as funny as I did.", name: "Elena R." },
                { quote: "Best money I've spent this year. My spine has finally left the group chat. Well. It's on mute at least.", name: "David K." },
                { quote: "Three weeks in and my afternoon headaches are gone. Coincidence? Shoulders says no.", name: "Priya M." },
                { quote: "PosturePal is the only coworker who gives me honest feedback without scheduling a meeting about it.", name: "James L." }
              ].map((t, i) => (
                <div key={i} className="neo-card" style={{ width: '300px', flexShrink: 0, padding: '24px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                  <p style={{ fontFamily: 'Instrument Serif', fontStyle: 'italic', fontSize: '16px', marginBottom: '16px', lineHeight: 1.5 }}>"{t.quote}"</p>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{ width: '36px', height: '36px', background: 'black', color: 'white', borderRadius: '50%', fontSize: '13px', fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      {t.name.split(' ')[0][0]}{t.name.split(' ')[1][0]}
                    </div>
                    <div>
                      <div style={{ fontWeight: 600, fontSize: '14px' }}>{t.name}</div>
                      <div style={{ color: '#f59e0b', fontSize: '12px', letterSpacing: '2px' }}>★★★★★</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ))}
        </div>
      </section>

      {/* PRICING */}
      <section id="pricing" className="bg-white" style={{ textAlign: 'center' }}>
        <div className="container">
          <div className="neo-tag">BUY NOW</div>
          <h2 className="scroll-fade" style={{ fontSize: '52px', marginBottom: '16px' }}>The group chat has been waiting.</h2>
          <p className="scroll-fade" style={{ color: 'var(--muted)', marginBottom: '48px', maxWidth: '600px', margin: '0 auto 48px auto' }}>
            One payment. Lifetime peace. No subscriptions. No drama. Just a quiet spine.
          </p>
          <div className="neo-card scroll-fade" style={{ maxWidth: '480px', margin: '0 auto', background: 'var(--accent)', border: '2px solid black', boxShadow: '8px 8px 0 black', padding: '48px', textAlign: 'center' }}>
            <p style={{ fontSize: '16px', color: 'var(--black)', fontWeight: 700, margin: '12px 0 24px' }}>Lifetime License — Rs. {PRICE}</p>
            <div style={{ textAlign: 'left', margin: '0 auto 32px', maxWidth: '280px' }}>
              {[
                "✓ Lifetime license (not a subscription)",
                "✓ 2 devices",
                "✓ 100% offline AI",
                "✓ No webcam footage leaves your device",
                "✓ License key shown instantly after payment",
              ].map((feature, i) => (
                <div key={i} style={{ display: 'flex', gap: '10px', alignItems: 'center', padding: '8px 0', borderBottom: '1px solid rgba(0,0,0,0.15)', fontSize: '15px' }}>
                  {feature}
                </div>
              ))}
            </div>
            <div style={{ display: 'flex', justifyContent: 'center' }}>
              <RazorpayButton buttonText={`Pay Rs. ${PRICE} →`} />
            </div>
            <p style={{ marginTop: '20px', fontSize: '13px', color: 'var(--muted)' }}>
              Secure payment via Razorpay. License key shown instantly.
            </p>
          </div>
          <p className="scroll-fade" style={{ marginTop: '20px', fontStyle: 'italic', color: 'var(--muted)' }}>
            Lower Back has reviewed this pricing and confirms it's worth it.
          </p>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="bg-cream">
        <div className="container" style={{ maxWidth: '720px', margin: '0 auto' }}>
          <div className="neo-tag">QUESTIONS THE GROUP CHAT HAD</div>
          <h2 className="scroll-fade" style={{ fontSize: '52px', marginBottom: '48px' }}>Questions answered.</h2>
          <div className="scroll-fade">
            {[
              { q: "When does this ship?", a: "It's available now. Buy it, download it, and start improving your posture today." },
              { q: "Does my webcam footage get sent anywhere?", a: "Never. All AI processing happens on your device. Eyes was personally involved in this decision and will not budge." },
              { q: "Does it work on Mac, Windows, and Linux?", a: "Yes. The group chat does not discriminate by operating system." },
              { q: "What if I wear glasses or have a beard?", a: "PosturePal tracks skeletal keypoints — shoulders, ears, nose — not facial features. Glasses and beards are irrelevant. Neck doesn't care what you look like, only how you sit." },
              { q: "Can I use it on two computers?", a: "Yes. The license covers 2 devices. Lower Back travels with you." },
              { q: "Is this a subscription?", a: "No. One payment. Lifetime access. No subscription drama. Ever." }
            ].map((faq, i) => (
              <div key={i} style={{ border: '2px solid black', marginBottom: '-2px', position: 'relative' }}>
                <div
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  style={{ padding: '20px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontWeight: 600, fontSize: '16px', cursor: 'pointer', background: openFaq === i ? 'var(--accent)' : 'var(--white)', transition: 'background 0.2s' }}
                >
                  {faq.q}
                  <span style={{ fontSize: '20px', fontWeight: 300 }}>{openFaq === i ? '−' : '+'}</span>
                </div>
                {openFaq === i && (
                  <div style={{ padding: '0 24px 20px', fontSize: '15px', color: 'var(--muted)', lineHeight: 1.7, borderTop: '2px solid black', background: 'white' }}>
                    <p style={{ marginTop: '20px' }}>{faq.a}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA FOOTER */}
      <section className="bg-black" style={{ color: 'white', padding: '100px 24px 60px', textAlign: 'center' }}>
        <div className="container scroll-fade">
          <h2 style={{ fontSize: '64px', color: 'white', marginBottom: '32px' }}>Your neck asked us to intervene.</h2>
          <div style={{ display: 'flex', justifyContent: 'center', margin: '40px 0' }}>
            <a href="#pricing" className="neo-btn accent" style={{ fontSize: '16px', padding: '16px 32px', whiteSpace: 'nowrap', display: 'inline-block', textDecoration: 'none' }}>
              Buy Now — Rs. {PRICE}
            </a>
          </div>
          <p style={{ color: 'rgba(255,255,255,0.5)', marginTop: '16px', fontSize: '14px' }}>
            One payment. Lifetime peace. Get PosturePal now.
          </p>
          <hr style={{ border: 'none', borderTop: '1px solid rgba(255,255,255,0.15)', margin: '60px 0 40px' }} />
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '20px' }}>
            <div style={{ fontWeight: 700, fontSize: '16px' }}>PosturePal</div>
            <div style={{ display: 'flex', gap: '24px', fontSize: '14px' }}>
              <a href="#benefits" style={{ color: 'rgba(255,255,255,0.6)', textDecoration: 'none' }}>Benefits</a>
              <a href="#intervention" style={{ color: 'rgba(255,255,255,0.6)', textDecoration: 'none' }}>The Chat</a>
              <a href="#how-it-works" style={{ color: 'rgba(255,255,255,0.6)', textDecoration: 'none' }}>How it works</a>
              <a href="#pricing" style={{ color: 'rgba(255,255,255,0.6)', textDecoration: 'none' }}>Buy</a>
              <a href="#faq" style={{ color: 'rgba(255,255,255,0.6)', textDecoration: 'none' }}>FAQ</a>
            </div>
            <div style={{ fontSize: '13px', color: 'rgba(255,255,255,0.4)' }}>© 2026 PosturePal</div>
          </div>
        </div>
      </section>
    </>
  );
}
