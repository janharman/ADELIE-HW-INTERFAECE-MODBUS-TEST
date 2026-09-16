export const ROCKHOPPER_RUNTIME_BASE_ADDRESS = 45000
export const ROCKHOPPER_RUNTIME_ADDRESS_STRIDE = 100
export const ROCKHOPPER_RUNTIME_REGISTER_COUNT = 19
export const ROCKHOPPER_RUNTIME_MAX_COUNT = 10

export const ROCKHOPPER_DIGITAL_INPUT_BITS = {
	digitalInput1: 0,
	digitalInput2: 1,
	digitalInput3: 2,
	digitalInput4: 3,
	digitalInput5: 4,
	digitalInput6: 5,
	digitalInput7: 6,
	digitalInput8: 7,
}

export const ROCKHOPPER_STATUS_BITS = {
	relay1: 0,
	relay2: 1,
	relay3: 2,
	relay4: 3,
	relay5: 4,
	semaphoreGreen: 5,
	semaphoreOrange: 6,
	semaphoreRed: 7,
	semaphoreBuzzer: 8,
}

export const ROCKHOPPER_ERROR_BITS = {
	currentSensor1RangeFalse: 0,
	currentSensor2RangeFalse: 1,
	currentSensor3RangeFalse: 2,
	pressureSensor1CommFalse: 3,
	pressureSensor2CommFalse: 4,
	pressureSensor3CommFalse: 5,
	extHiPressureCommFalse: 6,
	boschSensorCommFalse: 7,
	power24VFalse: 9,
	power5VFalse: 10,
}

export const getRockhopperRuntimeAddress = (rockhopperIndex) => (
	ROCKHOPPER_RUNTIME_BASE_ADDRESS + rockhopperIndex * ROCKHOPPER_RUNTIME_ADDRESS_STRIDE
)

export const createEmptyRockhopperRuntime = () => ({
	communicationQuality: 0,
	digitalInputs: {},
	statusBits: {},
	errorBits: {},
	pressureSensors: [0, 0, 0],
	currentSensors: [0, 0, 0],
	extTemperature: 0,
	extHumidity: 0,
	extAtmPressure: 0,
	extHiPressure: 0,
	mcuTemperature: 0,
	power24Vdc: 0,
	power5Vdc: 0,
})

export const buildRockhopperRuntimeReads = (rockhopperCount) => Array.from(
	{ length: Math.min(rockhopperCount || 0, ROCKHOPPER_RUNTIME_MAX_COUNT) },
	(_, index) => ({
		name: `Rockhopper ${index + 1} Runtime`,
		address: getRockhopperRuntimeAddress(index),
		count: ROCKHOPPER_RUNTIME_REGISTER_COUNT,
		decoder: 'rockhopperRuntime',
		rockhopperIndex: index,
	}),
)