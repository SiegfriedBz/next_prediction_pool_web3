"use client";

import type { FC, PropsWithChildren } from "react";
import { useAllRoundsData } from "../_hooks/use-all-rounds-data";
import { RoundDataContext } from "../_hooks/use-round-data-context";

export const RoundDataProvider: FC<PropsWithChildren> = (props) => {
	const { children } = props;
	const {
		allRoundsData,
		isLoadingAllRoundsData,
		errorFetchingAllRoundsData,
		refetchAllRoundsData,
	} = useAllRoundsData();

	return (
		<RoundDataContext.Provider
			value={{
				allRoundsData,
				isLoadingAllRoundsData,
				errorFetchingAllRoundsData,
				refetchAllRoundsData,
			}}
		>
			{children}
		</RoundDataContext.Provider>
	);
};
