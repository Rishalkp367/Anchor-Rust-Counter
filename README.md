# Anchor Rust Counter App 🦀⚓

A **PDA-based Counter program** built using **Rust + Anchor (Solana)**.

![CI](https://github.com/Rishalkp367/Anchor-Rust-Counter/actions/workflows/anchor-ci.yml/badge.svg)

## ✨ Features

- PDA-based counter account (1 counter per wallet)
- Initialize / Increment / Decrement / Reset
- TypeScript tests (`anchor test`)
- GitHub Actions CI

## 🧠 PDA Design

Counter PDA is derived using:

- seed: `"counter"`
- wallet pubkey

This makes the counter deterministic and removes the need for random keypair accounts.

## 🛠️ Run locally

anchor test


📦 Tech Stack
Rust
Anchor
Solana
TypeScript
