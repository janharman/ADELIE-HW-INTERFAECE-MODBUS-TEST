export const PERIPHERAL_SETUP_BASE_ADDRESS = 60000
export const PERIPHERAL_SETUP_ADDRESS_STRIDE = 50
export const PERIPHERAL_SETUP_REGISTER_COUNT = 49
export const PERIPHERAL_SETUP_MAX_COUNT = 100

export const getPeripheralSetupAddress = (peripheralIndex) => (
	PERIPHERAL_SETUP_BASE_ADDRESS + peripheralIndex * PERIPHERAL_SETUP_ADDRESS_STRIDE
)

export const createEmptyPeripheralSetup = () => ({
	peripheralId: 0,
	source: '',
	name: '',
	multiplier: 0,
	offset: 0,
	unit: '',
	flags: {
		E: 0,
		O: 0,
		P: 0,
		L: 0,
		A: 0,
	},
})

export const PERIPHERAL_SETUP_FIELDS = [
	{ name: 'peripheralId', address: 0, type: 'word' },
	{ name: 'multiplierRaw', address: 45, type: 'word' },
	{ name: 'offsetRaw', address: 46, type: 'word' },
	{ name: 'flagsRaw', address: 48, type: 'word' },
]

export const PERIPHERAL_SETUP_STRING_FIELDS = [
	{ name: 'source', startRegister: 1, registerCount: 12 },
	{ name: 'name', startRegister: 13, registerCount: 32 },
	{ name: 'unit', startRegister: 47, registerCount: 2 },
]

export const PERIPHERAL_SETUP_FLAG_BITS = {
	E: 0,
	O: 1,
	P: 2,
	L: 3,
	A: 4,
}

export const buildPeripheralSetupReads = (peripheralCount) => Array.from(
	{ length: Math.min(peripheralCount || 0, PERIPHERAL_SETUP_MAX_COUNT) },
	(_, index) => ({
		name: `Peripheral ${index + 1} Setup`,
		address: getPeripheralSetupAddress(index),
		count: PERIPHERAL_SETUP_REGISTER_COUNT,
		decoder: 'peripheralSetup',
		peripheralIndex: index,
	}))