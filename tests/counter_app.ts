import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { CounterApp } from "../target/types/counter_app";
import { Keypair, SystemProgram } from "@solana/web3.js";
import { assert } from "chai";

describe("counter_app", () => {
  const provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);

  const program = anchor.workspace.CounterApp as Program<CounterApp>;

  it("Initialize + Increment + Decrement + Reset", async () => {
    const counterKeypair = Keypair.generate();

    // initialize
    await program.methods
      .initialize()
      .accountsStrict({
        counter: counterKeypair.publicKey,
        user: provider.wallet.publicKey,
        systemProgram: SystemProgram.programId,
      })
      .signers([counterKeypair])
      .rpc();

    let counterAccount = await program.account.counter.fetch(
      counterKeypair.publicKey,
    );
    assert.equal(counterAccount.count.toNumber(), 0);
    console.log("Counter:", counterAccount.count.toNumber());

    // increment
    await program.methods
      .increment()
      .accountsStrict({
        counter: counterKeypair.publicKey,
        owner: provider.wallet.publicKey,
      })
      .rpc();

    counterAccount = await program.account.counter.fetch(
      counterKeypair.publicKey,
    );
    assert.equal(counterAccount.count.toNumber(), 1);
    console.log("Counter after increment:", counterAccount.count.toNumber());
    // decrement
    await program.methods
      .decrement()
      .accountsStrict({
        counter: counterKeypair.publicKey,
        owner: provider.wallet.publicKey,
      })
      .rpc();

    counterAccount = await program.account.counter.fetch(
      counterKeypair.publicKey,
    );
    assert.equal(counterAccount.count.toNumber(), 0);
    console.log("Counter after decrement:", counterAccount.count.toNumber());
    // reset
    await program.methods
      .reset()
      .accountsStrict({
        counter: counterKeypair.publicKey,
        owner: provider.wallet.publicKey,
      })
      .rpc();

    counterAccount = await program.account.counter.fetch(
      counterKeypair.publicKey,
    );
    assert.equal(counterAccount.count.toNumber(), 0);
    console.log("Counter after reset:", counterAccount.count.toNumber());
  });
});
