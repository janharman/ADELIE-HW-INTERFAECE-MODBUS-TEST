export const GATE_RUNTIME_BASE_ADDRESS = 10000
export const GATE_RUNTIME_ADDRESS_STRIDE = 20
export const GATE_RUNTIME_REGISTER_COUNT = 18

export const GATE_STATUS_BITS = {
	open: 0,
	closed: 1,
	error: 2,
	opening: 3,
	closing: 4,
	simulatedSignal: 6,
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

export const GATE_OPEN_REQUEST_BITS = {
	openAtIdle: 0,
	signalActive: 1,
	bypass: 2,
	alwaysOpen: 3,
	minimumAirflow: 4,
	cleaning: 5,
	openAtError: 6,
	vfdInManual: 7,
	testSignal: 8,
	winterMode: 9,
	extSignal: 10,
	workstation: 11,
	minimumAirflowMainDuct: 12,
}

export const GATE_OPEN_REQUEST_LABELS = {
	none: 'OPEN_GATE_BY__NONE',
	openAtIdle: 'OPEN_GATE_BY__OPEN_AT_IDLE',
	signalActive: 'OPEN_GATE_BY__SIGNAL_ACTIVE',
	bypass: 'OPEN_GATE_BY__BYPASS',
	alwaysOpen: 'OPEN_GATE_BY__ALWAYS_OPEN',
	minimumAirflow: 'OPEN_GATE_BY__MINIMUM_AIRFLOW',
	cleaning: 'OPEN_GATE_BY__CLEANING',
	openAtError: 'OPEN_GATE_BY__OPEN_AT_ERROR',
	vfdInManual: 'OPEN_GATE_BY__VFD_IN_MANUAL',
	testSignal: 'OPEN_GATE_BY__TEST_SIGNAL',
	winterMode: 'OPEN_GATE_BY__WINTER_MODE',
	extSignal: 'OPEN_GATE_BY__EXT_SIGNAL',
	workstation: 'OPEN_GATE_BY__WORKSTATION',
	minimumAirflowMainDuct: 'OPEN_GATE_BY__MIN_AF_MAIN_DUCT',
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
	openRequest: 0,
	openRequestBits: {},
	openRequestLabel: '',
	gateAirVelocity: 0,
	gateAirVolume: 0,
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
