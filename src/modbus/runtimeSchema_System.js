// System runtime data (input registers). Start address 1000, same stride as System setup (100),
// but this lives in the input-register address space, so it does not collide with the holding-register setup data.
export const SYSTEM_RUNTIME_BASE_ADDRESS = 1000
export const SYSTEM_RUNTIME_ADDRESS_STRIDE = 100
export const SYSTEM_RUNTIME_MAX_COUNT = 10

// Monitor is an array of up to 10 slots, 2 registers each, starting right after runTimeAir.
export const SYSTEM_RUNTIME_MONITOR_START_OFFSET = 40
export const SYSTEM_RUNTIME_MONITOR_SLOT_COUNT = 10
export const SYSTEM_RUNTIME_MONITOR_SLOT_REGISTER_COUNT = 2

// Total registers read per system: runTimeBits/runTimeData/runTimeAir (offset 0-34) + Monitor (offset 40-59).
export const SYSTEM_RUNTIME_REGISTER_COUNT = (
	SYSTEM_RUNTIME_MONITOR_START_OFFSET
	+ SYSTEM_RUNTIME_MONITOR_SLOT_COUNT * SYSTEM_RUNTIME_MONITOR_SLOT_REGISTER_COUNT
)

// Zone Overflow Warning (ZOW, register 8-9) is bit-oriented: bit N indicates zone N is overflowing.
export const SYSTEM_ZONE_OVERFLOW_WARNING_BITS = {
	zone0: 0,
	zone1: 1,
	zone2: 2,
	zone3: 3,
	zone4: 4,
	zone5: 5,
	zone6: 6,
	zone7: 7,
	zone8: 8,
	zone9: 9,
}

// Rts/W/E are 32-bit registers, one bit per letter A..Z (bit0='A' .. bit25='Z').
export const SYSTEM_STATUS_LETTER_COUNT = 26

export const getSystemRuntimeAddress = (systemIndex) => (
	SYSTEM_RUNTIME_BASE_ADDRESS + systemIndex * SYSTEM_RUNTIME_ADDRESS_STRIDE
)

export const createEmptySystemRuntime = () => ({
	// runTimeBits
	status: '',
	runTimeStatus: '',
	warnings: '',
	errors: '',
	zoneOverflowWarningBits: {},
	// runTimeData
	totalTime: 0,
	runningTime: 0,
	delayTime: 0,
	activeRunSignals: 0,
	gatesOpen: 0,
	gatesRequested: 0,
	gatesError: 0,
	vfdPowerKernel: 0,
	vfdPowerKernelPercent: 0,
	cleaningTime: 0,
	cleaningZone: 0,
	// runTimeAir
	qVel: 0,
	qVol: 0,
	qVolCubicMetersPerSecond: 0,
	aVel: 0,
	aVol: 0,
	aVolCubicMetersPerSecond: 0,
	gVel: 0,
	gVol: 0,
	gVolCubicMetersPerSecond: 0,
	mVel: 0,
	mVol: 0,
	mVolCubicMetersPerSecond: 0,
	cVel: 0,
	cVol: 0,
	cVolCubicMetersPerSecond: 0,
	sVol: 0,
	sVolPercent: 0,
	systemUnderflowWarning: 0,
	systemUnderflowWarningPercent: 0,
	systemOverflowWarning: 0,
	systemOverflowWarningPercent: 0,
	// Monitor
	monitorValues: [],
})

export const buildSystemRuntimeReads = (systemCount) => Array.from(
	{ length: Math.min(systemCount || 0, SYSTEM_RUNTIME_MAX_COUNT) },
	(_, index) => ({
		name: `System ${index + 1} Runtime`,
		address: getSystemRuntimeAddress(index),
		count: SYSTEM_RUNTIME_REGISTER_COUNT,
		decoder: 'systemRuntime',
		systemIndex: index,
	}),
)
