"use client";

import { type FC, type PropsWithChildren, useMemo } from "react";
import { useRounds } from "../_hooks/use-rounds";
import { RoundsContext } from "../_hooks/use-rounds-context";

export const RoundsProvider: FC<PropsWithChildren> = (props) => {
	const { children } = props;
	const { rounds, isLoadingRounds, errorFetchingRounds, refetchRounds } =
		useRounds();

	const value = useMemo(() => {
		return { rounds, isLoadingRounds, errorFetchingRounds, refetchRounds };
	}, [rounds, isLoadingRounds, errorFetchingRounds, refetchRounds]);

	return (
		<RoundsContext.Provider value={value}>{children}</RoundsContext.Provider>
	);
};
