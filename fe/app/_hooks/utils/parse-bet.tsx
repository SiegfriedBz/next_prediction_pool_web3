import type { Bet, RawBet } from "@/app/_types";

export const parseBet = (betArray: RawBet): Bet => {
	return {
		amount: betArray[0],
		time: betArray[1],
		claimed: betArray[2],
	};
};
