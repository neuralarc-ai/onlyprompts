'use client';

import AdminFloatingButton from './AdminFloatingButton';

export function ClientWrapper({ children }: { children: React.ReactNode }) {
  return (
    <>
      {children}
      <AdminFloatingButton />
    </>
  );
}
