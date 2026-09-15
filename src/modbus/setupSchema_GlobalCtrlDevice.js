export const GLOBAL_CTRL_DEVICE_SETUP_BASE_ADDRESS = 47000
export const GLOBAL_CTRL_DEVICE_SETUP_ADDRESS_STRIDE = 50
export const GLOBAL_CTRL_DEVICE_SETUP_REGISTER_COUNT = 50
export const GLOBAL_CTRL_DEVICE_SETUP_MAX_COUNT = 26
export const GLOBAL_CTRL_DEVICE_SETUP_RANGE_COUNT = 4

export const getGlobalCtrlDeviceSetupAddress = (deviceIndex) => (
	GLOBAL_CTRL_DEVICE_SETUP_BASE_ADDRESS + deviceIndex * GLOBAL_CTRL_DEVICE_SETUP_ADDRESS_STRIDE
)

export const createEmptyGlobalCtrlDeviceSetup = () => ({
	ref: '',
	source: '',
	destination: '',
	inputRange: Array(GLOBAL_CTRL_DEVICE_SETUP_RANGE_COUNT).fill(0),
	outputRange: Array(GLOBAL_CTRL_DEVICE_SETUP_RANGE_COUNT).fill(0),
	steps: 0,
	delay: 0,
})

export const GLOBAL_CTRL_DEVICE_SETUP_FIELDS = [
	{ name: 'ref', address: 0, type: 'character' },
	{ name: 'steps', address: 30, type: 'highByte' },
	{ name: 'delay', address: 30, type: 'lowByte' },
]

export const GLOBAL_CTRL_DEVICE_SETUP_STRING_FIELDS = [
	{ name: 'source', startRegister: 1, registerCount: 12 },
	{ name: 'destination', startRegister: 13, registerCount: 12 },
]

export const GLOBAL_CTRL_DEVICE_SETUP_INPUT_RANGE_START_ADDRESS = 25
export const GLOBAL_CTRL_DEVICE_SETUP_OUTPUT_RANGE_START_ADDRESS = 29

export const buildGlobalCtrlDeviceSetupReads = (deviceCount) => Array.from(
	{ length: Math.min(deviceCount || 0, GLOBAL_CTRL_DEVICE_SETUP_MAX_COUNT) },
	(_, index) => ({
		name: `Global Ctrl Device ${index + 1} Setup`,
		address: getGlobalCtrlDeviceSetupAddress(index),
		count: GLOBAL_CTRL_DEVICE_SETUP_REGISTER_COUNT,
		decoder: 'globalCtrlDeviceSetup',
		globalCtrlDeviceIndex: index,
	}))