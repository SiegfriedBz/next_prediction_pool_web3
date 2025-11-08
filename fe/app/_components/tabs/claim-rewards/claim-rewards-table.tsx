"use client";

import { useResolvedRoundsWithPlayerBetsAndWinsContext } from "@/app/_hooks/rounds/use-resolved-rounds-with-player-bets-and-wins-context";
import { DataTable } from "../bet-on-games/data-table";
import { useColumns } from "./use-columns";

// Wrapped in RoundsProvider & ResolvedRoundsWithPlayerBetsAndWinsProvider
export const ClaimRewardsTable = () => {
	// Fetch resolved rounds with player bets & wins - data
	const { resolvedRoundsWithPlayerBetsAndWins } =
		useResolvedRoundsWithPlayerBetsAndWinsContext();

	// get tanstack-table columns
	const columns = useColumns();

	return (
		<div className="container mx-auto">
			<DataTable columns={columns} data={resolvedRoundsWithPlayerBetsAndWins} />
		</div>
	);
};
