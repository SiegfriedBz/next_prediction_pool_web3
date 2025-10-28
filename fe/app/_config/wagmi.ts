import {
	cookieStorage,
	createConfig,
	createStorage,
	http,
	webSocket,
} from "wagmi";
import { sepolia } from "wagmi/chains";

const ETH_SEPOLIA_ALCHEMY_HTTP_URL =
	process.env.NEXT_PUBLIC_ETH_SEPOLIA_ALCHEMY_HTTP_URL_URL;
const ETH_SEPOLIA_ALCHEMY_WS_URL =
	process.env.NEXT_PUBLIC_ETH_SEPOLIA_ALCHEMY_WS_URL_URL;

// Used for reading, writing, connecting wallets, etc.
export const wagmiHttpConfig = createConfig({
	chains: [sepolia],
	ssr: true,
	storage: createStorage({
		storage: cookieStorage,
	}),
	transports: {
		[sepolia.id]: http(ETH_SEPOLIA_ALCHEMY_HTTP_URL ?? ""),
	},
});

// Used ONLY for listening to events
export const wagmiWsConfig = createConfig({
	chains: [sepolia],
	ssr: true,
	transports: {
		[sepolia.id]: webSocket(ETH_SEPOLIA_ALCHEMY_WS_URL ?? ""),
	},
});
