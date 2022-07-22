import * as anchor from "@project-serum/anchor";
import { Program, Wallet } from "@project-serum/anchor";
import { SolanaTweet } from "../target/types/solana_tweet";
import { expect, assert } from 'chai';

describe("solana-tweet", () => {
  // Configure the client to use the local cluster.
  const provider = anchor.AnchorProvider.env();
  const wallet = provider.wallet as Wallet;
  anchor.setProvider(provider);

  const program = anchor.workspace.SolanaTweet as Program<SolanaTweet>;

  it("setup tweet platform", async () => {
    // Add your test here.
    const tweetKeypair = anchor.web3.Keypair.generate();
    
    await program.rpc.setupPlatform({
      accounts : {
        tweet: tweetKeypair.publicKey,
        user: wallet.publicKey,
        systemProgram: anchor.web3.SystemProgram.programId,
      },
      signers: [tweetKeypair]
    });

    let tweet = await program.account.tweet.fetch(tweetKeypair.publicKey);
    
    expect(tweet.likes).to.equal(0);
    expect(tweet.message).to.equal('');
  });

  it('write a tweet', async () => {
    const tweetKeypair = anchor.web3.Keypair.generate();

    await program.rpc.setupPlatform({
      accounts : {
        tweet: tweetKeypair.publicKey,
        user: wallet.publicKey,
        systemProgram: anchor.web3.SystemProgram.programId,
      },
      signers: [tweetKeypair]
    });

    await program.rpc.writeTweet(
      'Hello World!',
      wallet.publicKey, {
        accounts: {
          tweet: tweetKeypair.publicKey,
        },
        signers: [],
      }
    );

    let tweet = await program.account.tweet.fetch(tweetKeypair.publicKey);

    expect(tweet.likes).to.equal(0);
    expect(tweet.message).to.equal('Hello World!');
    expect(tweet.creator.toString()).to.equal(wallet.publicKey.toString());
  });
});
