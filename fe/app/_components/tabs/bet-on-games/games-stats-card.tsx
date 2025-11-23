"use client";

import type { ComponentProps, FC } from "react";
import { useRoundsContext } from "@/app/_hooks/rounds/use-rounds-context";
import type { Card } from "@/components/ui/card";
import { StatsCardWithData } from "../stats-card-with-data";

type Props = ComponentProps<typeof Card>;

// Wrapped in RoundsProvider
export const GamesStatsCard: FC<Props> = (props) => {
	const { rounds } = useRoundsContext();

	return <StatsCardWithData {...props} label="Games" count={rounds?.length} />;
};
