export const VSD_SETUP_BASE_ADDRESS = 4000
export const VSD_SETUP_ADDRESS_STRIDE = 60
export const VSD_SETUP_REGISTER_COUNT = 50

export const getVsdSetupAddress = (vsdIndex) => (
	VSD_SETUP_BASE_ADDRESS + vsdIndex * VSD_SETUP_ADDRESS_STRIDE
)

export const createEmptyVsdSetup = () => ({
	vsdId: 0,
	model: '',
	parameters: [0, 0, 0, 0],
	port: 0,
	address: 0,
	name: '',
})

export const VSD_SETUP_FIELDS = [
	{ name: 'vsdId', address: 0, type: 'word' },
	{ name: 'port', address: 17, type: 'highByte' },
	{ name: 'address', address: 17, type: 'lowByte' },
]

export const VSD_SETUP_PARAMETER_FIELDS = [
	{ name: 'parameter0', address: 13, type: 'word' },
	{ name: 'parameter1', address: 14, type: 'word' },
	{ name: 'parameter2', address: 15, type: 'word' },
	{ name: 'parameter3', address: 16, type: 'word' },
]

export const VSD_SETUP_STRING_FIELDS = [
	{ name: 'model', startRegister: 1, registerCount: 12 },
	{ name: 'name', startRegister: 18, registerCount: 32 },
]

export const buildVsdSetupReads = (vsdCount) => Array.from(
	{ length: vsdCount || 0 },
	(_, index) => ({
		name: `VSD ${index + 1} Setup`,
		address: getVsdSetupAddress(index),
		count: VSD_SETUP_REGISTER_COUNT,
		decoder: 'vsdSetup',
		vsdIndex: index,
	}))