export const WORKSTATION_SETUP_BASE_ADDRESS = 30000
export const WORKSTATION_SETUP_ADDRESS_STRIDE = 50
export const WORKSTATION_SETUP_REGISTER_COUNT = 50

export const getWorkstationSetupAddress = (workstationIndex) => (
	WORKSTATION_SETUP_BASE_ADDRESS + workstationIndex * WORKSTATION_SETUP_ADDRESS_STRIDE
)

export const createEmptyWorkstationSetup = () => ({
	workstationId: 0,
	mode: 0,
	ext: 0,
	name: '',
	gates: Array(32).fill(0),
})

export const WORKSTATION_SETUP_FIELDS = [
	{ name: 'workstationId', address: 0, type: 'word' },
	{ name: 'mode', address: 1, type: 'word', mask: 0xff },
	{ name: 'ext', address: 1, type: 'highBit', bit: 7 },
]

export const WORKSTATION_SETUP_STRING_FIELDS = [
	{ name: 'name', startRegister: 2, registerCount: 16 },
]

export const WORKSTATION_SETUP_GATE_START_ADDRESS = 18
export const WORKSTATION_SETUP_GATE_COUNT = 32

export const buildWorkstationSetupReads = (workstationCount) => Array.from(
	{ length: workstationCount || 0 },
	(_, index) => ({
		name: `Workstation ${index + 1} Setup`,
		address: getWorkstationSetupAddress(index),
		count: WORKSTATION_SETUP_REGISTER_COUNT,
		decoder: 'workstationSetup',
		workstationIndex: index,
	}))