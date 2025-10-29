"use client";

import { useEffect, useMemo } from "react";
import { useChainId, useReadContract } from "wagmi";
import { getPredictionPoolContractConfig } from "../_contracts/prediction-pool";
import type { ContractConfigT } from "../_contracts/types";
import type { HexAddress } from "../_types";

type Params = {
	dataFeedAddress: HexAddress;
};

export const useCurrentPrice = (params: Params): bigint | undefined => {
	const { dataFeedAddress } = params;

	const chainId = useChainId();
	const contractConfig: ContractConfigT = useMemo(
		() => getPredictionPoolContractConfig(chainId),
		[chainId],
	);

	const { data: currentPrice, refetch } = useReadContract({
		...contractConfig,
		functionName: "getChainlinkDataFeedNormalizedPrice",
		args: [dataFeedAddress],
		query: {
			enabled: !!dataFeedAddress,
		},
	});

	useEffect(() => {
		refetch();
	}, [refetch]);

	return currentPrice as unknown as bigint | undefined;
};
