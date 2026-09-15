export const MODBUS_DEVICE_SETUP_BASE_ADDRESS = 50000
export const MODBUS_DEVICE_SETUP_ADDRESS_STRIDE = 50
export const MODBUS_DEVICE_SETUP_REGISTER_COUNT = 46

export const getModbusDeviceSetupAddress = (deviceIndex) => (
	MODBUS_DEVICE_SETUP_BASE_ADDRESS + deviceIndex * MODBUS_DEVICE_SETUP_ADDRESS_STRIDE
)

export const createEmptyModbusDeviceSetup = () => ({
	modbusDeviceId: 0,
	model: '',
	port: 0,
	address: 0,
	name: '',
})

export const MODBUS_DEVICE_SETUP_FIELDS = [
	{ name: 'modbusDeviceId', address: 0, type: 'word' },
	{ name: 'port', address: 13, type: 'highByte' },
	{ name: 'address', address: 13, type: 'lowByte' },
]

export const MODBUS_DEVICE_SETUP_STRING_FIELDS = [
	{ name: 'model', startRegister: 1, registerCount: 12 },
	{ name: 'name', startRegister: 14, registerCount: 32 },
]

export const buildModbusDeviceSetupReads = (deviceCount) => Array.from(
	{ length: deviceCount || 0 },
	(_, index) => ({
		name: `Modbus Device ${index + 1} Setup`,
		address: getModbusDeviceSetupAddress(index),
		count: MODBUS_DEVICE_SETUP_REGISTER_COUNT,
		decoder: 'modbusDeviceSetup',
		modbusDeviceIndex: index,
	}))