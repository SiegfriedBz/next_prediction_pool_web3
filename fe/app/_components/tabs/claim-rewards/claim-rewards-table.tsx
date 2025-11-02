"use client";

import { useResolvedRoundsWithPlayerDataContext } from "@/app/_hooks/use-resolved-rounds-with-player-data-context";
import { DataTable } from "../bet-on-games/data-table";
import { useColumns } from "./use-columns";

export const ClaimRewardsTable = () => {
	// Fetch resolved rounds with player bets & wins - data
	const { resolvedRoundsWithPlayerBetsAndWins } =
		useResolvedRoundsWithPlayerDataContext();

	// get tanstack-table columns
	const columns = useColumns();

	return (
		<div className="container mx-auto">
			<DataTable columns={columns} data={resolvedRoundsWithPlayerBetsAndWins} />
		</div>
	);
};
