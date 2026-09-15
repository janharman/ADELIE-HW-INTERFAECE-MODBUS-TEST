export const EXTERNAL_SIGNAL_SETUP_BASE_ADDRESS = 43000
export const EXTERNAL_SIGNAL_SETUP_ADDRESS_STRIDE = 50
export const EXTERNAL_SIGNAL_SETUP_REGISTER_COUNT = 50
export const EXTERNAL_SIGNAL_SETUP_MAX_COUNT = 26
export const EXTERNAL_SIGNAL_SETUP_GATE_COUNT = 35

export const getExternalSignalSetupAddress = (signalIndex) => (
	EXTERNAL_SIGNAL_SETUP_BASE_ADDRESS + signalIndex * EXTERNAL_SIGNAL_SETUP_ADDRESS_STRIDE
)

export const createEmptyExternalSignalSetup = () => ({
	ref: '',
	source: '',
	functionCode: '',
	gates: Array(EXTERNAL_SIGNAL_SETUP_GATE_COUNT).fill(0),
})

export const EXTERNAL_SIGNAL_SETUP_FIELDS = [
	{ name: 'ref', address: 0, type: 'character' },
]

export const EXTERNAL_SIGNAL_SETUP_STRING_FIELDS = [
	{ name: 'source', startRegister: 1, registerCount: 12 },
	{ name: 'functionCode', startRegister: 13, registerCount: 2 },
]

export const EXTERNAL_SIGNAL_SETUP_GATE_START_ADDRESS = 15

export const buildExternalSignalSetupReads = (signalCount) => Array.from(
	{ length: Math.min(signalCount || 0, EXTERNAL_SIGNAL_SETUP_MAX_COUNT) },
	(_, index) => ({
		name: `External Signal ${index + 1} Setup`,
		address: getExternalSignalSetupAddress(index),
		count: EXTERNAL_SIGNAL_SETUP_REGISTER_COUNT,
		decoder: 'externalSignalSetup',
		externalSignalIndex: index,
	}))