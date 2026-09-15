export const INTERFACE_SETUP_BASE_ADDRESS = 6000
export const INTERFACE_SETUP_ADDRESS_STRIDE = 10
export const INTERFACE_SETUP_REGISTER_COUNT = 10
export const INTERFACE_SETUP_MAX_COUNT = 4

export const getInterfaceSetupAddress = (interfaceIndex) => (
	INTERFACE_SETUP_BASE_ADDRESS + interfaceIndex * INTERFACE_SETUP_ADDRESS_STRIDE
)

export const createEmptyInterfaceSetup = () => ({
	interfaceId: 0,
	port: 0,
	version: 0,
	branches: [
		{ limitCurrent: 0, limitCurrentAmps: 0, limitCurrentTimeout: 0 },
		{ limitCurrent: 0, limitCurrentAmps: 0, limitCurrentTimeout: 0 },
		{ limitCurrent: 0, limitCurrentAmps: 0, limitCurrentTimeout: 0 },
	],
	terminatingResistors: [0, 0, 0],
	failurePorts: [0, 0, 0],
})

export const INTERFACE_SETUP_FIELDS = [
	{ name: 'interfaceId', address: 0, type: 'word' },
	{ name: 'port', address: 1, type: 'highByte' },
	{ name: 'version', address: 2, type: 'word' },
]

export const INTERFACE_BRANCH_FIELDS = [
	{ address: 5 },
	{ address: 6 },
	{ address: 7 },
]

export const INTERFACE_SETUP_TERMINATING_BITS = [0, 1, 2]
export const INTERFACE_SETUP_FAILURE_PORT_BITS = [
	{ shift: 0, mask: 0x1f },
	{ shift: 5, mask: 0x1f },
	{ shift: 10, mask: 0x1f },
]

export const buildInterfaceSetupReads = (interfaceCount) => Array.from(
	{ length: Math.min(interfaceCount || 0, INTERFACE_SETUP_MAX_COUNT) },
	(_, index) => ({
		name: `Interface ${index + 1} Setup`,
		address: getInterfaceSetupAddress(index),
		count: INTERFACE_SETUP_REGISTER_COUNT,
		decoder: 'interfaceSetup',
		interfaceIndex: index,
	}))