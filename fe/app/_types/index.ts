import { z } from "zod"

export type HexAddress = `0x${string}`

export enum Network {
  SEPOLIA = 11155111,
  MUMBAI = 80001,
}
export const NetworkSchema = z.nativeEnum(Network)
export type NetworkT = z.infer<typeof NetworkSchema>

export enum RoundStatus {
  NotStarted,
  Active,
  Ended,
  Resolved
}

export type Round = {
  id: bigint
  creator: HexAddress
  priceFeed: HexAddress
  target: bigint // target price
  gteTotal: bigint
  ltTotal: bigint
  status: RoundStatus
  end: bigint
}

export type RawBid = [bigint, bigint, boolean]

export type Bid = {
  amount: bigint // eth amount placed for this bid
  time:  bigint// timestamp when user placed its bid on roundId
  claimed: boolean
}

export type RoundWithPlayerBid = Round & {
  playerBid: Bid | null
  playerIsWinner: boolean | null
}
