"use client";

import { useMemo } from "react";
import { type Round, RoundStatus } from "@/app/_types";

type Params = {
	rounds: Round[];
};

type ReturnType = {
	resolvedRounds: Round[];
};

export const useResolvedRounds = (params: Params): ReturnType => {
	const { rounds } = params;

	// filter resolved rounds
	const resolvedRounds = useMemo(() => {
		return (
			rounds
				?.filter((round) => round.status === RoundStatus.Resolved)
				.map((round) => round as Round) ?? []
		);
	}, [rounds]);

	return {
		resolvedRounds,
	};
};
