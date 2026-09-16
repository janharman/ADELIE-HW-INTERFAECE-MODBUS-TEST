export const GATE_RUNTIME_BASE_ADDRESS = 10000
export const GATE_RUNTIME_ADDRESS_STRIDE = 12
export const GATE_RUNTIME_REGISTER_COUNT = 10

export const GATE_STATUS_BITS = {
	open: 0,
	closed: 1,
	error: 2,
	opening: 3,
	closing: 4,
	manualMode: 7,
}

export const GATE_INPUT_STATUS_BITS = {
	limitSwitchOpen: 0,
	limitSwitchClosed: 1,
	button: 2,
	serviceMode: 3,
	regulatorMode: 4,
	relayStatus: 5,
	signal: 6,
	signalActive: 7,
}

export const GATE_ERROR_TYPE_BITS = {
	undervoltage: 4,
	bothLimitSwitchesOn: 5,
	overcurrent: 6,
	notOnLimitSwitch: 7,
}

export const GATE_JUMPER_FUNCTION_LABELS = {
	0: 'No function active',
	1: 'Sensitivity Opening',
	2: 'Sensitivity Closing',
	3: 'No Communication Operation',
	4: '-',
	5: 'Zero offset calibration for pressure sensor and current sensor',
	6: 'Factory settings',
}

export const getGateRuntimeAddress = (gateIndex) => (
	GATE_RUNTIME_BASE_ADDRESS + gateIndex * GATE_RUNTIME_ADDRESS_STRIDE
)

export const createEmptyGateRuntime = () => ({
	communicationStatus: 0,
	gateStatusBits: {},
	inputStatusBits: {},
	pressure: 0,
	current: 0,
	errorTypeBits: {},
	jumperFunction: 0,
	jumperFunctionLabel: GATE_JUMPER_FUNCTION_LABELS[0],
	openCloseTime: 0,
	openCloseTimeSeconds: 0,
	supplyVoltage: 0,
	openCloseEnergy: 0,
	openCloseEnergyJoules: 0,
	chipTemperature: 0,
	chipTemperatureCelsius: 0,
	position: 0,
})

export const buildGateRuntimeReads = (gateCount) => Array.from(
	{ length: gateCount || 0 },
	(_, index) => ({
		name: `Gate ${index + 1} Runtime`,
		address: getGateRuntimeAddress(index),
		count: GATE_RUNTIME_REGISTER_COUNT,
		decoder: 'gateRuntime',
		gateIndex: index,
	}),
)
