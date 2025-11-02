"use client";

import type { FC } from "react";
import { useRoundsContext } from "@/app/_hooks/use-rounds-context";
import { DataTable } from "./data-table";
import { useColumns } from "./use-columns";

export const GamesTable: FC = () => {
	const { rounds } = useRoundsContext();

	// get tanstack-table columns
	const columns = useColumns();

	return (
		<div className="container mx-auto">
			<DataTable columns={columns} data={rounds} />
		</div>
	);
};
