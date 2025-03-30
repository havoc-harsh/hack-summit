// app/ClientProvider.tsx
'use client';

import { SessionProvider } from "next-auth/react";
import StoreProvider from "./StoreProvider";

export default function ClientProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SessionProvider>
      <StoreProvider>
        {children}
      </StoreProvider>
    </SessionProvider>
  );
}