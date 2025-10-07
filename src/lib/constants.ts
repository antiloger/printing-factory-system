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
  { label: "1-1000 sheets", value: "1-1000", speed: 16 },
  { label: "1001-2500 sheets", value: "1001-2500", speed: 50 },
  { label: "2501-5000 sheets", value: "2501-5000", speed: 60 },
  { label: "5001-10000 sheets", value: "5001-10000", speed: 75 },
  { label: "10001-50000 sheets", value: "10001-50000", speed: 117 },
  { label: "50000+ sheets", value: "50000+", speed: 140 },
] as const
