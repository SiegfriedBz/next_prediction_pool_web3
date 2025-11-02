import type {
	QueryObserverResult,
	RefetchOptions,
} from "@tanstack/react-query";

export type RefetchType<ErrorT> = (
	options?: RefetchOptions | undefined,
) => Promise<
	QueryObserverResult<
		(
			| {
					error?: undefined;
					result: unknown;
					status: "success";
			  }
			| {
					error: Error;
					result?: undefined;
					status: "failure";
			  }
		)[],
		ErrorT
	>
>;
