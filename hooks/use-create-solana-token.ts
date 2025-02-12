import {
  createFungible,
  mplTokenMetadata,
} from "@metaplex-foundation/mpl-token-metadata";
import {
  createTokenIfMissing,
  findAssociatedTokenPda,
  getSplAssociatedTokenProgramId,
  mintTokensTo,
  mplToolbox,
} from "@metaplex-foundation/mpl-toolbox";
import {
  generateSigner,
  percentAmount,
  signerIdentity,
} from "@metaplex-foundation/umi";
import { createUmi } from "@metaplex-foundation/umi-bundle-defaults";
import { createSignerFromWalletAdapter } from "@metaplex-foundation/umi-signer-wallet-adapters";
import { mockStorage } from "@metaplex-foundation/umi-storage-mock";
import { base58 } from "@metaplex-foundation/umi/serializers";
import {
  type Provider,
  useAppKitConnection,
} from "@reown/appkit-adapter-solana/react";
import { useAppKitAccount, useAppKitProvider } from "@reown/appkit/react";
import { useMutation } from "@tanstack/react-query";
import BigNumber from "bignumber.js";
import { toast } from "sonner";

// Types
export interface CreateTokenParams {
  name: string;
  symbol: string;
  description: string;
  url: string;
}

export interface TokenCreationResult {
  mint: string;
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
      description,
    }: CreateTokenParams): Promise<TokenCreationResult> => {
      if (!connection || !address) {
        throw new Error("Connection or address not found");
      }
      toast.loading("Creating token...");

      if (!walletProvider.publicKey) {
        throw new Error("Public key not found");
      }

      const publicKey = walletProvider.publicKey;

      try {
        const umi = createUmi(connection.rpcEndpoint)
          .use(mockStorage())
          .use(mplTokenMetadata())
          .use(mplToolbox())
          .use(
            signerIdentity(
              createSignerFromWalletAdapter({
                publicKey,
                signTransaction: async (tx) => {
                  return walletProvider.signTransaction(tx);
                },
                signMessage: async (message) => {
                  return walletProvider.signMessage(message);
                },
                signAllTransactions(transactions) {
                  return walletProvider.signAllTransactions(transactions);
                },
              })
            )
          );

        // const metadataUri = await umi.uploader.uploadJson({
        //   name: name,
        //   symbol: symbol,
        //   description: description,
        //   image: url,
        // },{

        // });
        const metadataUri = await umi.uploader.uploadJson({
          name: name,
          symbol: symbol,
          description: description,
          image: url,
        });

        const mintSigner = generateSigner(umi);

        // Creating the mintIx
        const createFungibleIx = await createFungible(umi, {
          mint: mintSigner,
          name: name,
          uri: metadataUri, // we use the `metadataUri` variable we created earlier that is storing our uri.
          sellerFeeBasisPoints: percentAmount(0),
          decimals: TOKEN_DECIMALS, // set the amount of decimals you want your token to have.
          symbol,
        });

        // This instruction will create a new Token Account if required, if one is found then it skips.
        const createTokenIx = createTokenIfMissing(umi, {
          mint: mintSigner.publicKey,
          owner: umi.identity.publicKey,
          ataProgram: getSplAssociatedTokenProgramId(umi),
        });

        // The final instruction (if required) is to mint the tokens to the token account in the previous ix.

        const mintTokensIx = mintTokensTo(umi, {
          mint: mintSigner.publicKey,
          token: findAssociatedTokenPda(umi, {
            mint: mintSigner.publicKey,
            owner: umi.identity.publicKey,
          }),
          amount: new BigNumber(MINT_AMOUNT)
            .times(10 ** TOKEN_DECIMALS)
            .toNumber(),
        });

        console.log("Sending transaction");
        const tx = await createFungibleIx
          .add(createTokenIx)
          .add(mintTokensIx)
          .sendAndConfirm(umi);

        toast.dismiss();
        toast.success(`Created token ${mintSigner.publicKey}`);

        return {
          mint: mintSigner.publicKey,
          signature: base58.deserialize(tx.signature)[0],
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
