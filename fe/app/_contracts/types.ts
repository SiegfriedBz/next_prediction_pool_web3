import { Abi } from "viem";
import { HexAddress } from "../_types"

export type ContractConfigT = {
  address: HexAddress
  abi:  Abi;
}
