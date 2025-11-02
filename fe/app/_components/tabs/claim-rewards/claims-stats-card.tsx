"use client";

import type { ComponentProps, FC } from "react";
import { useResolvedRoundsWithPlayerDataContext } from "@/app/_hooks/use-resolved-rounds-with-player-data-context";
import type { Card } from "@/components/ui/card";
import { StatsCardWithData } from "../stats-card-with-data";

type Props = ComponentProps<typeof Card>;

export const ClaimsStatsCard: FC<Props> = (props) => {
	// Fetch resolved rounds
	const { resolvedRounds } = useResolvedRoundsWithPlayerDataContext();

	return (
		<StatsCardWithData
			{...props}
			label="Resolved Games"
			count={resolvedRounds?.length}
		/>
	);
};
