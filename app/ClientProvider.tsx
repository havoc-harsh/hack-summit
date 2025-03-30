// app/ClientProvider.tsx
'use client';

import { SessionProvider } from "next-auth/react";
import StoreProvider from "./StoreProvider";
import { EthProvider } from "@/lib/eth-context";

export default function ClientProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SessionProvider>
      <StoreProvider>
        <EthProvider>
          {children}
        </EthProvider>
      </StoreProvider>
    </SessionProvider>
  );
}