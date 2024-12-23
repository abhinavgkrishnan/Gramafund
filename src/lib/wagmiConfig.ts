import { createConfig } from 'wagmi';
import { http } from 'viem';
import { mainnet } from 'wagmi/chains';
import { farcasterFrame } from '@farcaster/frame-wagmi-connector';
import { createPublicClient } from 'viem';

export const wagmiConfig = createConfig({
  chains: [mainnet],
  connectors: [
    farcasterFrame(),
  ],
  client({ chain }) {
    return createPublicClient({
      chain,
      transport: http(),
    });
  },
});