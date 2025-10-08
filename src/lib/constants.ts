// Shift Configuration
export const SHIFT_DURATION = 660 // minutes
export const SETUP_TIME = 20 // minutes (constant per shift)

// Plate Setup Configuration
export const PLATE_SETUP_TIME_PER_PLATE = 8 // minutes per plate

// Varnish Blanket Configuration
export const VARNISH_BLANKET_TIME_PER_BLANKET = 15 // minutes per blanket

// Color Wash Configuration
export const COLOR_WASH_TYPES = [
  { label: "1 unit", value: "1-unit", multiplier: 8 },
  { label: "1-3 unit", value: "1-3-unit", multiplier: 15 },
  { label: "1-6 unit", value: "1-6-unit", multiplier: 30 },
] as const

// Sheet Range Configuration
export const SHEET_RANGES = [
  { label: "1-1000 sheets", value: "1-1000", speed: 16, min: 1, max: 1000 },
  { label: "1001-2500 sheets", value: "1001-2500", speed: 50, min: 1001, max: 2500 },
  { label: "2501-5000 sheets", value: "2501-5000", speed: 60, min: 2501, max: 5000 },
  { label: "5001-10000 sheets", value: "5001-10000", speed: 75, min: 5001, max: 10000 },
  { label: "10001-50000 sheets", value: "10001-50000", speed: 117, min: 10001, max: 50000 },
  { label: "50000+ sheets", value: "50000+", speed: 140, min: 50001, max: Number.POSITIVE_INFINITY },
] as const

// Helper function to automatically detect sheet range based on count
export function getSheetRangeByCount(count: number) {
  return SHEET_RANGES.find((range) => count >= range.min && count <= range.max)
}
