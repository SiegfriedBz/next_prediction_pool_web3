"use client";

import { useEffect, useMemo } from "react";
import { useChainId, useReadContract } from "wagmi";
import { getPredictionPoolTokenContractConfig } from "../_contracts/prediction-pool-token";
import type { ContractConfigT } from "../_contracts/types";

type Params = {
	tokenId: string;
};

/**
 * Requires WagmiProvider context.
 * Throws WagmiProviderNotFoundError if called outside.
 */
export const useTokenUri = (params: Params): string | undefined => {
	const { tokenId } = params;

	const chainId = useChainId();
	const contractConfig: ContractConfigT = useMemo(
		() => getPredictionPoolTokenContractConfig(chainId),
		[chainId],
	);

	const { data: tokenUri, refetch } = useReadContract({
		...contractConfig,
		functionName: "uri",
		args: [tokenId],
		query: {
			enabled: !!tokenId,
		},
	});

	useEffect(() => {
		if (!tokenId) return;

		refetch();
	}, [refetch, tokenId]);

	return tokenUri as unknown as string | undefined;
};
