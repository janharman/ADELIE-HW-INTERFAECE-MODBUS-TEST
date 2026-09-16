export const MODBUS_DEVICE_RUNTIME_BASE_ADDRESS = 50000
export const MODBUS_DEVICE_RUNTIME_ADDRESS_STRIDE = 5
export const MODBUS_DEVICE_RUNTIME_REGISTER_COUNT = 4
export const MODBUS_DEVICE_RUNTIME_MAX_COUNT = 200

export const getModbusDeviceRuntimeAddress = (deviceIndex) => (
	MODBUS_DEVICE_RUNTIME_BASE_ADDRESS + deviceIndex * MODBUS_DEVICE_RUNTIME_ADDRESS_STRIDE
)

export const createEmptyModbusDeviceRuntime = () => ({
	communicationStatus: 0,
	pressure: 0,
	temperatureA: 0,
	temperatureB: 0,
})

export const buildModbusDeviceRuntimeReads = (deviceCount) => Array.from(
	{ length: Math.min(deviceCount || 0, MODBUS_DEVICE_RUNTIME_MAX_COUNT) },
	(_, index) => ({
		name: `Modbus Device ${index + 1} Runtime`,
		address: getModbusDeviceRuntimeAddress(index),
		count: MODBUS_DEVICE_RUNTIME_REGISTER_COUNT,
		decoder: 'modbusDeviceRuntime',
		modbusDeviceIndex: index,
	}),
)