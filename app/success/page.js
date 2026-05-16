import React, { Suspense } from 'react';
import SuccessClient from './SuccessClient';

export default function Page() {
  return (
    <Suspense fallback={<div style={{minHeight: '100vh'}}>Loading…</div>}>
      <SuccessClient />
    </Suspense>
  );
}
