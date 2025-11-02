"use client";

import type { ReadContractsErrorType } from "@wagmi/core";
import { useMemo } from "react";
import { useRounds } from "@/app/_hooks/use-rounds";
import { type Round, RoundStatus } from "@/app/_types";
import type { RefetchType } from "./type";

type ReturnType = {
	resolvedRounds: Round[];
	isLoadingRounds: boolean;
	errorFetchingRounds: ReadContractsErrorType | null;
	refetchRounds: RefetchType<ReadContractsErrorType>;
};

export const useResolvedRounds = (): ReturnType => {
	// 1. fetch all rounds data
	const { rounds, isLoadingRounds, errorFetchingRounds, refetchRounds } =
		useRounds();

	// 2. filter resolved rounds
	const resolvedRounds = useMemo(() => {
		return (
			rounds
				?.filter((round) => round.status === RoundStatus.Resolved)
				.map((round) => round as Round) ?? []
		);
	}, [rounds]);

	return {
		resolvedRounds,
		isLoadingRounds,
		errorFetchingRounds,
		refetchRounds,
	};
};
