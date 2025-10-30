"use client";

import { useMemo } from "react";
import { useChainId, useReadContract, useReadContracts } from "wagmi";
import { getPredictionPoolContractConfig } from "../_contracts/prediction-pool";
import type { ContractConfigT } from "../_contracts/types";
import type { Round } from "../_types";

// fetch total number of "rounds" (i.e. Games) + all rounds data
export const useAllRoundsData = (): {
	totalRounds: bigint | undefined;
	allRoundsData: Round[];
} => {
	const chainId = useChainId();
	const contractConfig: ContractConfigT = useMemo(
		() => getPredictionPoolContractConfig(chainId),
		[chainId],
	);

	// fetch totalRounds : number of rounds
	const { data: totalRounds } = useReadContract({
		...contractConfig,
		functionName: "nextRoundId",
		args: [],
	}) as { data: bigint | undefined };

	// fetch all rounds data
	const roundCalls = useMemo(() => {
		if (!totalRounds) return [];

		return Array.from({ length: Number(totalRounds) }).map((_, i) => ({
			...contractConfig,
			functionName: "getRound",
			args: [BigInt(i)],
		}));
	}, [contractConfig, totalRounds]);

	const { data: roundData } = useReadContracts({
		contracts: roundCalls,
		query: {
			enabled: roundCalls.length > 0,
		},
	});

	const data = useMemo(() => {
		return (
			roundData?.map((res) => {
				return res.result as Round;
			}) ?? []
		);
	}, [roundData]);

	return { totalRounds, allRoundsData: data };
};
