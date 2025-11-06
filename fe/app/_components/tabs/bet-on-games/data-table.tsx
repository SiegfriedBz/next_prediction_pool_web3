"use client";

import {
	type ColumnDef,
	getCoreRowModel,
	getPaginationRowModel,
	getSortedRowModel,
	type PaginationState,
	type SortingState,
	useReactTable,
} from "@tanstack/react-table";
import { type PropsWithChildren, useState } from "react";
import { BaseDataTable } from "../table/base-data-table";

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
