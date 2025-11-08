"use client";

import { useMemo } from "react";
import { type Round, RoundStatus } from "@/app/_types";

type Params = {
	rounds: Round[];
};

type ReturnType = {
	activeRounds: Round[];
};

export const useActiveRounds = (params: Params): ReturnType => {
	const { rounds } = params;

	// filter active rounds
	const activeRounds = useMemo(() => {
		return (
			rounds
				?.filter((round) => round.status === RoundStatus.Active)
				.map((round) => round as Round) ?? []
		);
	}, [rounds]);

	return {
		activeRounds,
	};
};
