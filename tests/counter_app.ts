import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { CounterApp } from "../target/types/counter_app";
import { SystemProgram, PublicKey } from "@solana/web3.js";
import { assert } from "chai";

describe("counter_app (PDA)", () => {
  const provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);

  const program = anchor.workspace.CounterApp as Program<CounterApp>;

  const getCounterPda = async (user: PublicKey) => {
    const [pda] = PublicKey.findProgramAddressSync(
      [Buffer.from("counter"), user.toBuffer()],
      program.programId,
    );
    return pda;
  };

  it("Initialize + Increment + Decrement + Reset (PDA)", async () => {
    const user = provider.wallet.publicKey;
    const counterPda = await getCounterPda(user);

    // initialize PDA counter
    await program.methods
      .initialize()
      .accountsStrict({
        counter: counterPda,
        user,
        systemProgram: SystemProgram.programId,
      })
      .rpc();

    let counterAccount = await program.account.counter.fetch(counterPda);
    assert.equal(counterAccount.count.toNumber(), 0);

    // increment
    await program.methods
      .increment()
      .accountsStrict({
        counter: counterPda,
        owner: user,
      })
      .rpc();

    counterAccount = await program.account.counter.fetch(counterPda);
    assert.equal(counterAccount.count.toNumber(), 1);

    // decrement
    await program.methods
      .decrement()
      .accountsStrict({
        counter: counterPda,
        owner: user,
      })
      .rpc();

    counterAccount = await program.account.counter.fetch(counterPda);
    assert.equal(counterAccount.count.toNumber(), 0);

    // reset
    await program.methods
      .reset()
      .accountsStrict({
        counter: counterPda,
        owner: user,
      })
      .rpc();

    counterAccount = await program.account.counter.fetch(counterPda);
    assert.equal(counterAccount.count.toNumber(), 0);
  });
});
