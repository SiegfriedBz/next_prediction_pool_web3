"use client";

import { LoaderIcon } from "lucide-react";
import { useEffect } from "react";
import { toast } from "sonner";
import type { BaseError } from "wagmi";

type Params = {
	/** Transaction hash to display */
	hash?: string;
	/** True if the transaction is currently being confirmed */
	isConfirming?: boolean;
	/** True if the transaction has been successfully confirmed */
	isConfirmed?: boolean;
	/** Error object from wagmi or null */
	error?: BaseError | null;
};

/**
 * useTransactionToast
 *
 * Custom React hook to show toast notifications for a blockchain transaction lifecycle.
 *
 * Features:
 * - Info toast for transaction hash
 * - Info toast with loader while transaction is confirming
 * - Success toast when confirmed
 * - Error toast if an error occurs
 *
 * @param {Params} params - Hook parameters
 *
 * Usage example:
 * useTransactionToast({
 *   hash: txHash,
 *   isConfirming: isTxPending,
 *   isConfirmed: isTxConfirmed,
 *   error: txError,
 * });
 *
 * Notes:
 * - Automatically updates toasts on parameter changes.
 * - Works with wagmi and Sonner toast library.
 */
export const useTransactionToast = ({
	hash,
	isConfirming,
	isConfirmed,
	error,
}: Params) => {
	useEffect(() => {
		if (hash) {
			toast.info(<div>Transaction Hash: {hash}</div>);
		}

		if (isConfirming) {
			toast.info(
				<span className="inline-flex gap-2 items-center">
					<span className="animate-spin">
						<LoaderIcon size={16} />
					</span>
					<span>Waiting for confirmation...</span>
				</span>,
			);
		}

		if (isConfirmed) {
			toast.success(<div>Transaction confirmed.</div>);
		}

		if (error) {
			toast.error(<div>Error: {error.shortMessage || error.message}</div>);
		}
	}, [hash, isConfirming, isConfirmed, error]);
};
