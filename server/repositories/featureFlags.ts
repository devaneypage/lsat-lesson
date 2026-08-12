import {
  getAllFlags as getAllFlagsLegacy,
  setFlagRollout as setFlagRolloutLegacy,
  toggleFlag as toggleFlagLegacy,
} from "../db";

/** Focused feature-rollout persistence boundary. */
export const featureFlagRepository = {
  list() {
    return getAllFlagsLegacy();
  },
  setEnabled(key: string, enabled: boolean) {
    return toggleFlagLegacy(key, enabled);
  },
  setRollout(key: string, rolloutPercentage: number) {
    return setFlagRolloutLegacy(key, rolloutPercentage);
  },
};

export type FeatureFlagRepository = typeof featureFlagRepository;
