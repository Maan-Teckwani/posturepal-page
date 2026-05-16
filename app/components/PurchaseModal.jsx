import React from 'react';
import { createPortal } from 'react-dom';

const modalRoot = typeof document !== 'undefined' ? document.body : null;

export default function PurchaseModal({
  onClose,
  loading,
  customer,
  handleChange,
  handlePayment,
  error,
  setError,
  amount
}) {
  if (!modalRoot) return null;

  return createPortal(
    <div
      onClick={onClose}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 9999,
        background: 'rgba(0,0,0,0.52)',
        backdropFilter: 'blur(8px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '24px',
        overflowY: 'auto',
        WebkitOverflowScrolling: 'touch'
      }}
    >
      <div
        onClick={e => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        style={{
          width: 'min(100%, 540px)',
          maxHeight: 'calc(100vh - 48px)',
          background: '#ffffff',
          border: '1px solid rgba(0,0,0,0.14)',
          padding: '32px',
          position: 'relative',
          borderRadius: '24px',
          boxSizing: 'border-box',
          overflow: 'auto',
          boxShadow: '0 28px 80px rgba(0,0,0,0.18)'
        }}
      >
        <button
          onClick={onClose}
          style={{
            position: 'absolute',
            top: '18px',
            right: '18px',
            width: '36px',
            height: '36px',
            borderRadius: '50%',
            background: 'rgba(0,0,0,0.06)',
            border: 'none',
            fontSize: '20px',
            fontWeight: '700',
            cursor: loading ? 'not-allowed' : 'pointer',
            lineHeight: 1,
            color: '#111'
          }}
          aria-label="Close"
        >
          ×
        </button>
        <div style={{ marginBottom: '24px' }}>
          <div className="neo-tag" style={{ marginBottom: '16px' }}>ENTER DETAILS</div>
          <h2 style={{ fontSize: '30px', lineHeight: 1.1, margin: 0 }}>Complete your purchase</h2>
          <p style={{ color: '#4b5563', marginTop: '12px', fontSize: '15px' }}>
            Add your name and email so we can create your license record and complete the payment.
          </p>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
          <label style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '14px' }}>
            First name
            <input
              type="text"
              value={customer.first_name}
              onChange={handleChange('first_name')}
              style={{ padding: '14px 16px', border: '2px solid black', borderRadius: '0', fontSize: '15px' }}
              disabled={loading}
            />
          </label>
          <label style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '14px' }}>
            Last name
            <input
              type="text"
              value={customer.last_name}
              onChange={handleChange('last_name')}
              style={{ padding: '14px 16px', border: '2px solid black', borderRadius: '0', fontSize: '15px' }}
              disabled={loading}
            />
          </label>
        </div>
        <label style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '14px', marginBottom: '24px' }}>
          Email address
          <input
            type="email"
            value={customer.email}
            onChange={handleChange('email')}
            style={{ padding: '14px 16px', border: '2px solid black', borderRadius: '0', fontSize: '15px' }}
            disabled={loading}
          />
        </label>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }}>
          <button
            onClick={handlePayment}
            className="neo-btn accent"
            style={{ padding: '16px 32px', fontSize: '16px', whiteSpace: 'nowrap', cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.7 : 1 }}
            disabled={loading}
          >
            {loading ? 'Processing…' : `Pay Rs. ${amount} →`}
          </button>
          <div style={{ color: '#4b5563', fontSize: '14px', maxWidth: '260px' }}>
            After payment, you will be taken to the success page and see your license key there.
          </div>
        </div>
        {error && (
          <div style={{ marginTop: '20px', color: '#b91c1c', fontSize: '14px' }}>{error}</div>
        )}
      </div>
    </div>,
    modalRoot
  );
}
