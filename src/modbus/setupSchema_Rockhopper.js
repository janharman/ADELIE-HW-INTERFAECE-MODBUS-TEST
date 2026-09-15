export const ROCKHOPPER_SETUP_BASE_ADDRESS = 45000
export const ROCKHOPPER_SETUP_ADDRESS_STRIDE = 100
export const ROCKHOPPER_SETUP_REGISTER_COUNT = 36
export const ROCKHOPPER_SETUP_MAX_COUNT = 10

export const getRockhopperSetupAddress = (rockhopperIndex) => (
	ROCKHOPPER_SETUP_BASE_ADDRESS + rockhopperIndex * ROCKHOPPER_SETUP_ADDRESS_STRIDE
)

export const createEmptyRockhopperSetup = () => ({
	rockhopperId: 0,
	port: 0,
	address: 0,
	version: 0,
	name: '',
	terminatingMaster: 0,
	terminatingSlave: 0,
})

export const ROCKHOPPER_SETUP_FIELDS = [
	{ name: 'rockhopperId', address: 0, type: 'word' },
	{ name: 'port', address: 1, type: 'highByte' },
	{ name: 'address', address: 1, type: 'lowByte' },
	{ name: 'version', address: 2, type: 'word' },
	{ name: 'terminatingMaster', address: 35, type: 'lowBit', bit: 0 },
	{ name: 'terminatingSlave', address: 35, type: 'lowBit', bit: 1 },
]

export const ROCKHOPPER_SETUP_STRING_FIELDS = [
	{ name: 'name', startRegister: 3, registerCount: 32 },
]

export const buildRockhopperSetupReads = (rockhopperCount) => Array.from(
	{ length: Math.min(rockhopperCount || 0, ROCKHOPPER_SETUP_MAX_COUNT) },
	(_, index) => ({
		name: `Rockhopper ${index + 1} Setup`,
		address: getRockhopperSetupAddress(index),
		count: ROCKHOPPER_SETUP_REGISTER_COUNT,
		decoder: 'rockhopperSetup',
		rockhopperIndex: index,
	}))