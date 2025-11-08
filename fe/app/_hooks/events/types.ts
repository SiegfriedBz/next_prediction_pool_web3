import {
  type LucideIcon,
} from "lucide-react";
import { z } from "zod";

// PredictionPool SC Events
export const PPoolEvents = z.enum([
  "RoundCreated",
  "NewBet",
  "RoundResolved"
]);
export type PPoolEventsT = z.infer<typeof PPoolEvents>;

// PredictionPoolToken SC Events
export const PPoolTokenEvents = z.enum([
  "NewNFTMinted",
]);
export type PPoolTokenEventsT = z.infer<typeof PPoolTokenEvents>;

// event toast
export type SCEventToast = {
  eventName: string;
  eventDefinition: string;
  displayName?: string;
  icon: LucideIcon;
};