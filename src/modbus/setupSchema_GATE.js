export const GATE_SETUP_BASE_ADDRESS = 10000
export const GATE_SETUP_ADDRESS_STRIDE = 50
export const GATE_SETUP_REGISTER_COUNT = 42

export const getGateSetupAddress = (gateIndex) => (
	GATE_SETUP_BASE_ADDRESS + gateIndex * GATE_SETUP_ADDRESS_STRIDE
)

export const createEmptyGateSetup = () => ({
	gateId: 0,
	motorId: 0,
	gateName: '',
	zone: 0,
	size: 0,
	port: 0,
	address: 0,
	version: 0,
	openMode: 0,
	airVelocity: 0,
	calibrationConstant: 0,
	linkedSystems: 0,
})

export const GATE_SETUP_FIELDS = [
	{ name: 'gateId', address: 0, type: 'word' },
	{ name: 'motorId', address: 1, type: 'doubleWord' },
	{ name: 'zone', address: 40, type: 'word' },
	{ name: 'size', address: 35, type: 'word' },
	{ name: 'port', address: 36, type: 'highByte' },
	{ name: 'address', address: 36, type: 'lowByte' },
	{ name: 'version', address: 37, type: 'highByte' },
	{ name: 'openMode', address: 37, type: 'lowByte' },
	{ name: 'airVelocity', address: 38, type: 'word' },
	{ name: 'calibrationConstant', address: 39, type: 'word' },
	{ name: 'linkedSystems', address: 41, type: 'word' },
]

export const GATE_SETUP_STRING_FIELDS = [
	{ name: 'gateName', startRegister: 3, registerCount: 32 },
]

export const GATE_SETUP_GROUPS = [
	{ label: 'Dimensions', fields: ['zone', 'size'] },
	{ label: 'Communication', fields: ['port', 'address', 'version', 'openMode'] },
	{ label: 'Air', fields: ['airVelocity', 'calibrationConstant'] },
]

export const GATE_SETUP_FIELD_LABELS = {
	gateId: 'Gate ID',
	motorId: 'Motor ID',
	zone: 'Zone',
	size: 'Size (mm)',
	port: 'Port',
	address: 'Address',
	version: 'Version',
	openMode: 'Open mode',
	airVelocity: 'Air velocity',
	calibrationConstant: 'Calibration constant',
	linkedSystems: 'Linked systems',
}

export const buildGateSetupReads = (gateCount) => Array.from(
	{ length: gateCount || 0 },
	(_, index) => ({
		name: `Gate ${index + 1} Setup`,
		address: getGateSetupAddress(index),
		count: GATE_SETUP_REGISTER_COUNT,
		decoder: 'gateSetup',
		gateIndex: index,
	}))
