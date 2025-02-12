import {
  type Provider,
  useAppKitConnection,
} from "@reown/appkit-adapter-solana/react";
import { useAppKitAccount, useAppKitProvider } from "@reown/appkit/react";
import {
  ASSOCIATED_TOKEN_PROGRAM_ID,
  MINT_SIZE,
  TOKEN_PROGRAM_ID,
  createAssociatedTokenAccountInstruction,
  createInitializeInstruction,
  createInitializeMintInstruction,
  createMintToInstruction,
  getAssociatedTokenAddress,
  getMinimumBalanceForRentExemptMint,
} from "@solana/spl-token";
import {
  Keypair,
  PublicKey,
  SystemProgram,
  Transaction,
} from "@solana/web3.js";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { createCreateMetadataAccountV3Instruction } from "@solana/spl-token-metadata";

// Types
export interface CreateTokenParams {
  name: string;
  symbol: string;
  description: string;
  url: string;
}

export interface TokenCreationResult {
  mint: PublicKey;
  signature: string;
}

// Constants
const TOKEN_DECIMALS = 9;
const MINT_AMOUNT = 10_000_000_000;

// Main hook
export const useCreateTokenSc = () => {
  const { address } = useAppKitAccount();
  const { connection } = useAppKitConnection();
  const { walletProvider } = useAppKitProvider<Provider>("solana");
  return useMutation({
    mutationFn: async ({
      name,
      symbol,
      url,
    }: CreateTokenParams): Promise<TokenCreationResult> => {
      if (!connection || !address) {
        throw new Error("Connection or address not found");
      }
      toast.loading("Creating token...");

      const publicKey = walletProvider.publicKey;

      if (!publicKey) {
        throw new Error("Public key not found");
      }

      try {
        const latestBlockhash = await connection.getLatestBlockhash();

        const mintKeypair = Keypair.generate();
        const lamports = await getMinimumBalanceForRentExemptMint(connection);
        const transaction = new Transaction({
          recentBlockhash: latestBlockhash?.blockhash,
          feePayer: publicKey,
        });

        const tokenATA = await getAssociatedTokenAddress(
          mintKeypair.publicKey,
          publicKey,
          false,
          TOKEN_PROGRAM_ID,
          ASSOCIATED_TOKEN_PROGRAM_ID
        );

        PublicKey.findProgramAddressSync;

        transaction.add(
          // Create mint account
          SystemProgram.createAccount({
            fromPubkey: publicKey,
            newAccountPubkey: mintKeypair.publicKey,
            space: MINT_SIZE,
            lamports: lamports,
            programId: TOKEN_PROGRAM_ID,
          }),
          // Initialize mint account
          createInitializeMintInstruction(
            mintKeypair.publicKey,
            TOKEN_DECIMALS,
            publicKey,
            publicKey,
            TOKEN_PROGRAM_ID
          ),
          // Create associated token account
          createAssociatedTokenAccountInstruction(
            publicKey,
            tokenATA,
            publicKey,
            mintKeypair.publicKey
          ),
          // Mint tokens to associated token account
          createMintToInstruction(
            mintKeypair.publicKey,
            tokenATA,
            publicKey,
            MINT_AMOUNT * Math.pow(10, TOKEN_DECIMALS)
          ),
          createCreateMetadataAccountV3Instruction
          // createInitializeInstruction({
          //   programId: TOKEN_PROGRAM_ID,
          //   mint: mintKeypair.publicKey,
          //   metadata: mintKeypair.publicKey,
          //   name: name,
          //   symbol: symbol,
          //   uri: url,
          //   mintAuthority: publicKey,
          //   updateAuthority: publicKey,
          // })
        );

        const signature = await walletProvider.sendTransaction(
          transaction,
          connection,
          {
            signers: [mintKeypair],
          }
        );

        toast.dismiss();
        toast.success(`Created token ${mintKeypair.publicKey.toBase58()}`);

        return {
          mint: mintKeypair.publicKey,
          signature,
        };
      } catch (error) {
        toast.dismiss();
        toast.error("Failed to create token");
        console.error(error);
        throw error;
      }
    },
  });
};
