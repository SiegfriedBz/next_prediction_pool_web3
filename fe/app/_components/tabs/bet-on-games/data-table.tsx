"use client";

import {
	type ColumnDef,
	getCoreRowModel,
	getPaginationRowModel,
	getSortedRowModel,
	type PaginationState,
	type SortingFn,
	type SortingState,
	useReactTable,
} from "@tanstack/react-table";
import { type PropsWithChildren, useState } from "react";
import type { Round } from "@/app/_types";
import { BaseDataTable } from "../table/base-data-table";

//custom sorting logic for end column (soonest → latest)
export const sortEndFn: SortingFn<Round> = (rowA, rowB) => {
	const endA = rowA.original.end;
	const endB = rowB.original.end;
	return Number(endA) - Number(endB);
};

type DataTableProps<TData, TValue> = {
	columns: ColumnDef<TData, TValue>[];
	data: TData[];
};

export function DataTable<TData, TValue>(
	props: PropsWithChildren<DataTableProps<TData, TValue>>,
) {
	const { columns, data } = props;

	const [sorting, setSorting] = useState<SortingState>([
		{ id: "end", desc: true },
	]);

	const [pagination, setPagination] = useState<PaginationState>({
		pageIndex: 0,
		pageSize: 12,
	});

	// eslint-disable-next-line react-hooks/incompatible-library
	const table = useReactTable({
		data,
		columns,
		getCoreRowModel: getCoreRowModel(),
		getSortedRowModel: getSortedRowModel(), //client-side sorting
		onSortingChange: setSorting, //optionally control sorting state in your own scope for easy access
		getPaginationRowModel: getPaginationRowModel(),
		onPaginationChange: setPagination,
		state: {
			sorting,
			pagination,
		},
		enableSortingRemoval: false, // disables the "unsorted" state
	});

	return <BaseDataTable table={table} />;
}
