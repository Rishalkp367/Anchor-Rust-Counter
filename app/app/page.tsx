"use client";

import ClientOnly from "./components/ClientOnly";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import { PublicKey, SystemProgram } from "@solana/web3.js";
import * as anchor from "@coral-xyz/anchor";
import { useEffect, useMemo, useState } from "react";
import toast, { Toaster } from "react-hot-toast";
import type { CounterApp } from "../src/types/counter_app";
import idl from "../src/idl/counter_app.json";

// ✅ Your program id (already correct from your Rust code)
const PROGRAM_ID = new PublicKey(
  "2CtNPDTHjvsPJZ9rX4R8EpVpU37FgL1G4UXCXqBeqStQ",
);

export default function Home() {
  const { connection } = useConnection();
  const wallet = useWallet();

  const [counterPda, setCounterPda] = useState<PublicKey | null>(null);
  const [count, setCount] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);

  // Provider
  const provider = useMemo(() => {
    if (!wallet.publicKey) return null;

    return new anchor.AnchorProvider(connection, wallet as any, {
      commitment: "confirmed",
    });
  }, [connection, wallet]);

  const program = useMemo(() => {
    if (!provider) return null;

    return new anchor.Program<CounterApp>(idl as anchor.Idl, provider);
  }, [provider]);

  // Derive PDA = ["counter", user_pubkey]
  const deriveCounterPda = () => {
    if (!wallet.publicKey) return null;

    const [pda] = PublicKey.findProgramAddressSync(
      [Buffer.from("counter"), wallet.publicKey.toBuffer()],
      PROGRAM_ID,
    );

    return pda;
  };

  const fetchCounter = async (pda: PublicKey) => {
    if (!program) return;

    try {
      const account: any = await program.account.counter.fetch(pda);
      setCount(account.count.toNumber());
    } catch (e) {
      // PDA account not initialized yet
      setCount(null);
    }
  };

  const handleInitialize = async () => {
    if (!program || !wallet.publicKey || !counterPda) return;

    setLoading(true);
    try {
      await program.methods
        .initialize()
        .accountsStrict({
          counter: counterPda,
          user: wallet.publicKey,
          systemProgram: SystemProgram.programId,
        })
        .rpc();

      toast.success("Counter initialized!");
      await fetchCounter(counterPda);
    } catch (e: any) {
      console.log(e);
      toast.error("Initialize failed");
    } finally {
      setLoading(false);
    }
  };

  const handleIncrement = async () => {
    if (!program || !wallet.publicKey || !counterPda) return;

    setLoading(true);
    try {
      await program.methods
        .increment()
        .accountsStrict({
          counter: counterPda,
          owner: wallet.publicKey,
        })
        .rpc();

      await fetchCounter(counterPda);
    } catch (e: any) {
      console.log(e);
      toast.error("Increment failed");
    } finally {
      setLoading(false);
    }
  };

  const handleDecrement = async () => {
    if (!program || !wallet.publicKey || !counterPda) return;

    setLoading(true);
    try {
      await program.methods
        .decrement()
        .accountsStrict({
          counter: counterPda,
          owner: wallet.publicKey,
        })
        .rpc();

      await fetchCounter(counterPda);
    } catch (e: any) {
      console.log(e);
      toast.error("Decrement failed");
    } finally {
      setLoading(false);
    }
  };

  const handleReset = async () => {
    if (!program || !wallet.publicKey || !counterPda) return;

    setLoading(true);
    try {
      await program.methods
        .reset()
        .accountsStrict({
          counter: counterPda,
          owner: wallet.publicKey,
        })
        .rpc();

      await fetchCounter(counterPda);
    } catch (e: any) {
      console.log(e);
      toast.error("Reset failed");
    } finally {
      setLoading(false);
    }
  };

  // On wallet connect -> derive PDA + fetch account
  useEffect(() => {
    if (!wallet.publicKey) {
      setCounterPda(null);
      setCount(null);
      return;
    }

    const pda = deriveCounterPda();
    if (!pda) return;

    setCounterPda(pda);
    fetchCounter(pda);
  }, [wallet.publicKey, program]);

  return (
    <main style={{ padding: 24, maxWidth: 720, margin: "0 auto" }}>
      <Toaster />

      <h1 style={{ fontSize: 30, fontWeight: 800 }}>
        PDA Counter (Rust + Anchor)
      </h1>

      <p style={{ marginTop: 8, opacity: 0.8 }}>
        1 counter per wallet using PDA seeds: <code>["counter", user]</code>
      </p>

      <div style={{ marginTop: 16 }}>
        <ClientOnly>
          <WalletMultiButton />
        </ClientOnly>
      </div>

      <div
        style={{
          marginTop: 24,
          padding: 16,
          border: "1px solid #ddd",
          borderRadius: 12,
        }}
      >
        <p>
          <b>Program:</b> {PROGRAM_ID.toBase58()}
        </p>
        <p>
          <b>Wallet:</b> {wallet.publicKey?.toBase58() || "Not connected"}
        </p>
        <p>
          <b>Counter PDA:</b> {counterPda?.toBase58() || "-"}
        </p>

        <div style={{ marginTop: 12, fontSize: 20 }}>
          <b>Count:</b> {count === null ? "Not initialized" : count}
        </div>
      </div>

      <div
        style={{ marginTop: 20, display: "flex", gap: 10, flexWrap: "wrap" }}
      >
        <button
          onClick={handleInitialize}
          disabled={!wallet.publicKey || loading || count !== null}
          style={{ padding: "10px 14px", borderRadius: 10 }}
        >
          Initialize
        </button>

        <button
          onClick={handleIncrement}
          disabled={!wallet.publicKey || loading || count === null}
          style={{ padding: "10px 14px", borderRadius: 10 }}
        >
          + Increment
        </button>

        <button
          onClick={handleDecrement}
          disabled={!wallet.publicKey || loading || count === null}
          style={{ padding: "10px 14px", borderRadius: 10 }}
        >
          - Decrement
        </button>

        <button
          onClick={handleReset}
          disabled={!wallet.publicKey || loading || count === null}
          style={{ padding: "10px 14px", borderRadius: 10 }}
        >
          Reset
        </button>
      </div>
    </main>
  );
}
