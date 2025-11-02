"use client";

import type { ComponentProps, FC } from "react";
import { useActiveRoundsWithPlayerBetsContext } from "@/app/_hooks/use-active-rounds-with-player-bets-context";
import type { Card } from "@/components/ui/card";
import { StatsCardWithData } from "../stats-card-with-data";

type Props = ComponentProps<typeof Card>;

export const GamesStatsCard: FC<Props> = (props) => {
	const { rounds } = useActiveRoundsWithPlayerBetsContext();

	return <StatsCardWithData {...props} label="Games" count={rounds?.length} />;
};
