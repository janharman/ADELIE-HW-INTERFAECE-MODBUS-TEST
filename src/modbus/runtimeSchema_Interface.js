export const INTERFACE_RUNTIME_BASE_ADDRESS = 6000
export const INTERFACE_RUNTIME_ADDRESS_STRIDE = 50
export const INTERFACE_RUNTIME_REGISTER_COUNT = 32
export const INTERFACE_RUNTIME_MAX_COUNT = 4

export const INTERFACE_DIGITAL_INPUT_BITS = {
	digitalInput1: 0,
	digitalInput2: 1,
	digitalInput3: 2,
	digitalInput4: 3,
}

export const INTERFACE_OUTPUT_STATUS_BITS = {
	relay1: 0,
	relay2: 1,
	relay3: 2,
	relay4: 3,
	powerBranch1: 8,
	powerBranch2: 9,
	powerBranch3: 10,
	semaphoreGreen: 16,
	semaphoreOrange: 17,
	semaphoreRed: 18,
	semaphoreBuzzer: 19,
}

export const INTERFACE_POWER_STATUS_BITS = {
	branchVoltageOk1: 0,
	branchVoltageOk2: 1,
	branchVoltageOk3: 2,
	branchCurrentOk1: 8,
	branchCurrentOk2: 9,
	branchCurrentOk3: 10,
	onboard24VdcOk: 16,
	onboard5VdcOk: 17,
	onboard19VdcOk: 18,
	powerOk1: 24,
	powerOk2: 25,
}

export const INTERFACE_WORKING_BITS = {
	ledOk: 0,
	ledWarning: 1,
	ledError: 2,
	fanOn: 8,
	overtemperature: 9,
	coolingFan1Rotation: 10,
	coolingFan2Rotation: 11,
	buttonLongPress: 15,
	terminatingResistor1: 16,
	terminatingResistor2: 17,
	terminatingResistor3: 18,
}

export const INTERFACE_NO_PC_COMM_FUNCTION_BITS = {
	semaphoreRed: 0,
	semaphoreOrange: 1,
	semaphoreGreen: 2,
	ledError: 4,
	ledWarning: 5,
	ledOk: 6,
	relay1: 8,
	relay2: 9,
	relay3: 10,
	relay4: 11,
	fastFlashing: 12,
	flashingPeriod: 13,
}

export const getInterfaceRuntimeAddress = (interfaceIndex) => (
	INTERFACE_RUNTIME_BASE_ADDRESS + interfaceIndex * INTERFACE_RUNTIME_ADDRESS_STRIDE
)

export const createEmptyInterfaceRuntime = () => ({
	communicationStatus: 0,
	digitalInputs: {},
	outputStatus: {},
	powerStatus: {},
	branchCurrents: [0, 0, 0],
	power24Voltage: 0,
	power5Voltage: 0,
	mcuTemperature: 0,
	bandgapReference: 0,
	vrefhVoltage: 0,
	branchVoltages: [0, 0, 0],
	limitCurrents: [0, 0, 0],
	limitCurrentTimeouts: [0, 0, 0],
	powerDeliveryVoltageOut: 0,
	psu19Voltage: 0,
	workingBits: {},
	fanTriggerTemperature: 0,
	noPcCommunication: {
		timeout: 0,
		functions: {},
	},
	debug: [0, 0, 0],
})

export const buildInterfaceRuntimeReads = (interfaceCount) => Array.from(
	{ length: Math.min(interfaceCount || 0, INTERFACE_RUNTIME_MAX_COUNT) },
	(_, index) => ({
		name: `Interface ${index + 1} Runtime`,
		address: getInterfaceRuntimeAddress(index),
		count: INTERFACE_RUNTIME_REGISTER_COUNT,
		decoder: 'interfaceRuntime',
		interfaceIndex: index,
	}),
)