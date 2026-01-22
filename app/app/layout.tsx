"use client";

import "./globals.css";
import { ReactNode, useMemo } from "react";
import {
  ConnectionProvider,
  WalletProvider,
} from "@solana/wallet-adapter-react";
import { WalletModalProvider } from "@solana/wallet-adapter-react-ui";

import "@solana/wallet-adapter-react-ui/styles.css";

export default function RootLayout({ children }: { children: ReactNode }) {
  const endpoint = "https://api.devnet.solana.com"; // devnet

  const wallets = useMemo(() => [], []);

  return (
    <html lang="en">
      <body>
        <ConnectionProvider endpoint={endpoint}>
          <WalletProvider wallets={wallets}>
            <WalletModalProvider>{children}</WalletModalProvider>
          </WalletProvider>
        </ConnectionProvider>
      </body>
    </html>
  );
}
