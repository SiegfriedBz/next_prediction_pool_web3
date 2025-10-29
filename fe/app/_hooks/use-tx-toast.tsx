"use client";

import { useEffect } from "react";
import { toast } from "sonner";
import type { BaseError } from "wagmi";

type Params = {
	hash?: string;
	isConfirming?: boolean;
	isConfirmed?: boolean;
	error?: BaseError | null;
};

/** Toasts for transaction hash, confirming, confirmed, error */
export const useTransactionToast = (params: Params) => {
	const { hash, isConfirming, isConfirmed, error } = params;

	useEffect(() => {
		if (hash) {
			toast.info(<div>Transaction Hash: {hash}</div>);
		}
	}, [hash]);

	useEffect(() => {
		if (isConfirming) {
			toast.info(<div>Waiting for confirmation...</div>);
		}
	}, [isConfirming]);

	useEffect(() => {
		if (isConfirmed) {
			toast.success(<div>Transaction confirmed.</div>);
		}
	}, [isConfirmed]);

	useEffect(() => {
		if (error) {
			toast.error(
				<div>Error: {(error as BaseError).shortMessage || error.message}</div>,
			);
		}
	}, [error]);
};
