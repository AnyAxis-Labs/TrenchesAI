import { mantle, mantleSepoliaTestnet } from "viem/chains";

export const AGNI_ROUTER_ADDRESS: Record<number, `0x${string}`> = {
  [mantle.id]: "0x319B69888b0d11cEC22caA5034e25FfFBDc88421",
  [mantleSepoliaTestnet.id]: "0xe38cfa32cCd918d94E2e20230dFaD1A4Fd8aEF16",
};

export const WRAPPED_NATIVE: Record<number, `0x${string}`> = {
  [mantle.id]: "0x78c1b0c915c4faa5fffa6cabf0219da63d7f4cb8",
  [mantleSepoliaTestnet.id]: "0x67A1f4A939b477A6b7c5BF94D97E45dE87E608eF",
};
