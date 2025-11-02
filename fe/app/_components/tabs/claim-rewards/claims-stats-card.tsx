"use client";

import type { ComponentProps, FC } from "react";
import { useResolvedRoundsWithPlayerBetsAndWinsContext } from "@/app/_hooks/use-resolved-rounds-with-player-bets-and-wins-context";
import type { Card } from "@/components/ui/card";
import { StatsCardWithData } from "../stats-card-with-data";

type Props = ComponentProps<typeof Card>;

export const ClaimsStatsCard: FC<Props> = (props) => {
	// Fetch resolved rounds
	const { resolvedRounds } = useResolvedRoundsWithPlayerBetsAndWinsContext();

	return (
		<StatsCardWithData
			{...props}
			label="Resolved Games"
			count={resolvedRounds?.length}
		/>
	);
};
