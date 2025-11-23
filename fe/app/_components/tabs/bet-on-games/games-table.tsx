"use client";

import type { FC } from "react";
import { usePPoolNewBetEvent } from "@/app/_hooks/events/use-ppool-new-bet-event";
import { usePPoolNewStatusEvent } from "@/app/_hooks/events/use-ppool-new-status-event";
import { useRoundsContext } from "@/app/_hooks/rounds/use-rounds-context";
import { DataTable } from "./data-table";
import { useColumns } from "./use-columns";

// Wrapped in RoundsProvider & ActiveRoundsWithPlayerBetsProvider
export const GamesTable: FC = () => {
	const { rounds } = useRoundsContext();

	// refetch rounds when a new on-chain PredictionPool_NewBet event is emitted
	// refetch is selective (using ReactQuery queyKeys on roundId)
	usePPoolNewBetEvent();

	// refetch rounds when a new on-chain PredictionPool_NewRoundStatus event is emitted
	// refetch is selective (using ReactQuery queyKeys on roundId)
	usePPoolNewStatusEvent();

	// get tanstack-table columns
	const columns = useColumns();

	return (
		<div className="container mx-auto">
			<DataTable columns={columns} data={rounds} />
		</div>
	);
};
