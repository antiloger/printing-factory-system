// Shift Configuration
export const SHIFT_DURATION = 660 // minutes

export const SETUP_TIME_OFFSET = 20 // minutes (constant per shift for Off-set)
export const SETUP_TIME_DIECUT = 15 // minutes (constant per shift for Die-cut)

// Off-set Configuration
export const PLATE_SETUP_TIME_PER_PLATE = 8 // minutes per plate
export const VARNISH_BLANKET_TIME_PER_BLANKET = 15 // minutes per blanket

export const COLOR_WASH_TYPES = [
  { label: "1 unit", value: "1-unit", multiplier: 8 },
  { label: "1-3 unit", value: "1-3-unit", multiplier: 15 },
  { label: "1-6 unit", value: "1-6-unit", multiplier: 30 },
] as const

export const SHEET_RANGES = [
  { label: "1-1000 sheets", value: "1-1000", speed: 16, min: 1, max: 1000 },
  { label: "1001-2500 sheets", value: "1001-2500", speed: 50, min: 1001, max: 2500 },
  { label: "2501-5000 sheets", value: "2501-5000", speed: 60, min: 2501, max: 5000 },
  { label: "5001-10000 sheets", value: "5001-10000", speed: 75, min: 5001, max: 10000 },
  { label: "10001-50000 sheets", value: "10001-50000", speed: 117, min: 10001, max: 50000 },
  { label: "50000+ sheets", value: "50000+", speed: 140, min: 50001, max: Number.POSITIVE_INFINITY },
] as const

export function getSheetRangeByCount(count: number) {
  return SHEET_RANGES.find((range) => count >= range.min && count <= range.max)
}

// Die-cut New MR Configuration
export const DIECUT_NEW_MR_BASE_TIME = 60 // minutes for 1-10 ups
export const DIECUT_NEW_MR_THRESHOLD = 10 // threshold for base time
export const DIECUT_NEW_MR_ADDITIONAL_TIME_PER_UP = 4 // minutes per up above threshold

// Die-cut Emboss Configuration
export const DIECUT_EMBOSS_TIME_PER_UP = 4 // minutes per up

// Die-cut Repeated MR Configuration
export const DIECUT_REPEATED_MR_TIME = 30 // minutes

// Die-cut MR Sheets Configuration
export const DIECUT_MR_SHEETS_TIME = 15 // minutes

// Die-cut Striping Configuration
export const DIECUT_STRIPING_RANGES = [
  { min: 1, max: 40, multiplier: 1.5 },
  { min: 41, max: 80, multiplier: 1.15 },
] as const

// Die-cut Run Length Configuration
export const DIECUT_RUN_LENGTH_RANGES = [
  { label: "1-2000", min: 1, max: 2000, speed: 50 },
  { label: "2001-4000", min: 2001, max: 4000, speed: 60 },
  { label: "4001-6000", min: 4001, max: 6000, speed: 65 },
  { label: "6001-10000", min: 6001, max: 10000, speed: 70 },
  { label: "10001-49999", min: 10001, max: 49999, speed: 76 },
  { label: "50000+", min: 50000, max: Number.POSITIVE_INFINITY, speed: 100 },
] as const

export function calculateDiecutNewMR(ups: number): number {
  if (ups <= DIECUT_NEW_MR_THRESHOLD) {
    return DIECUT_NEW_MR_BASE_TIME
  }
  const additionalUps = ups - DIECUT_NEW_MR_THRESHOLD
  return DIECUT_NEW_MR_BASE_TIME + additionalUps * DIECUT_NEW_MR_ADDITIONAL_TIME_PER_UP
}

export function calculateDiecutStriping(count: number): number {
  const range = DIECUT_STRIPING_RANGES.find((r) => count >= r.min && count <= r.max)
  return range ? count * range.multiplier : 0
}

export function getDiecutRunLengthRange(count: number) {
  return DIECUT_RUN_LENGTH_RANGES.find((range) => count >= range.min && count <= range.max)
}
