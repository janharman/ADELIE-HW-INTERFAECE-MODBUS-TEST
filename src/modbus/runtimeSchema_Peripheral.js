export const PERIPHERAL_RUNTIME_BASE_ADDRESS = 60000
export const PERIPHERAL_RUNTIME_ADDRESS_STRIDE = 4
export const PERIPHERAL_RUNTIME_REGISTER_COUNT = 4
export const PERIPHERAL_RUNTIME_MAX_COUNT = 100

export const getPeripheralRuntimeAddress = (peripheralIndex) => (
	PERIPHERAL_RUNTIME_BASE_ADDRESS + peripheralIndex * PERIPHERAL_RUNTIME_ADDRESS_STRIDE
)

export const createEmptyPeripheralRuntime = () => ({
	signedValue: 0,
	unsignedValue: 0,
})

export const buildPeripheralRuntimeReads = (peripheralCount) => Array.from(
	{ length: Math.min(peripheralCount || 0, PERIPHERAL_RUNTIME_MAX_COUNT) },
	(_, index) => ({
		name: `Peripheral ${index + 1} Runtime`,
		address: getPeripheralRuntimeAddress(index),
		count: PERIPHERAL_RUNTIME_REGISTER_COUNT,
		decoder: 'peripheralRuntime',
		peripheralIndex: index,
	}),
)