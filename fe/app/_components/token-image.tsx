"use client";

import Image from "next/image";
import { type FC, useCallback, useEffect, useState } from "react";
import { useTokenUri } from "../_hooks/use-tokenUri";

type Props = {
	tokenId: string;
	size?: number; // in pixels
};

/**
 * Requires WagmiProvider context for useTokenUri.
 * Throws WagmiProviderNotFoundError if called outside.
 */
export const TokenImage: FC<Props> = (props) => {
	const { tokenId, size = 64 } = props;

	const [imageUrl, setImageUrl] = useState<string>("");

	const tokenUri = useTokenUri({ tokenId });

	const fetchMetadata = useCallback(
		async (uri: string) => {
			try {
				const resolvedUri = uri.replace(
					"{id}",
					tokenId.toString().padStart(64, "0"),
				);
				const metadataUrl = resolvedUri.replace(
					"ipfs://",
					"https://ipfs.io/ipfs/",
				);

				const res = await fetch(metadataUrl);
				const json = await res.json();

				return json.image.replace("ipfs://", "https://ipfs.io/ipfs/");
			} catch (error) {
				console.error("Failed to fetch metadata:", error);
				return "";
			}
		},
		[tokenId],
	);

	useEffect(() => {
		if (!tokenUri) return;

		(async () => {
			const imageGatewayUrl = await fetchMetadata(tokenUri);
			setImageUrl(imageGatewayUrl);
		})();
	}, [tokenUri, fetchMetadata]);

	return imageUrl ? (
		<div
			className="relative rounded-xl overflow-hidden shadow-md"
			style={{ width: size, height: size }}
		>
			<Image src={imageUrl} alt="Token Image" fill className="object-cover" />
		</div>
	) : null;
};
