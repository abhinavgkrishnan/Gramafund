import { createConfig } from 'wagmi';
import { mainnet } from 'wagmi/chains';
import { http } from 'viem';
import { createPublicClient } from 'viem';

export const wagmiConfig = createConfig({
  chains: [mainnet],
  connectors: [], // We'll add the frame connector dynamically
  client({ chain }) {
    return createPublicClient({
      chain,
      transport: http(),
      batch: {
        multicall: true,
      },
    });
  },
});