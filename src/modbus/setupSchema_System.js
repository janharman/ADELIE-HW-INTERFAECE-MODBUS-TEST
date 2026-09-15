export const SYSTEM_SETUP_BASE_ADDRESS = 1000
export const SYSTEM_SETUP_ADDRESS_STRIDE = 100
export const SYSTEM_SETUP_REGISTER_COUNT = 56

export const getSystemSetupAddress = (systemIndex) => (
	SYSTEM_SETUP_BASE_ADDRESS + systemIndex * SYSTEM_SETUP_ADDRESS_STRIDE
)

export const createEmptySystemSetup = () => ({
	systemId: 0,
	systemName: '',
	systemCharacter: '',
	delayOn: 0,
	delayOff: 0,
	cleaningOn: 0,
	cleaningAtStop: 0,
	byZone: 0,
	runMin: 0,
	cleaningRunMin: 0,
	cleaningDuration: 0,
	cleaningInterval: 0,
	powerMin: 0,
	powerMax: 0,
	powerFull: 0,
	powerCleaning: 0,
	powerCleanUp: 0,
	powerBypass: 0,
	powerDelayOff: 0,
	powerAtError: 0,
	powerWinter: 0,
	powerReserved: 0,
	openAtError: 0,
	openAtIdle: 0,
	extSecurityDis: 0,
	mainDuctDiameter: 0,
	mainDuctAirVolumeSelector: 0,
	mainDuctAirVelDiam: 0,
	gatesError: 0,
	gatesWarning: 0,
	vsdMode: 0,
})

// Single/double-byte and single-bit fields, addressed by offset within one system's block.
export const SYSTEM_SETUP_FIELDS = [
	{ name: 'systemId', address: 0, type: 'word' },
	{ name: 'delayOn', address: 35, type: 'highByte' },
	{ name: 'delayOff', address: 35, type: 'lowByte' },
	{ name: 'cleaningOn', address: 36, type: 'highBit', bit: 7 },
	{ name: 'cleaningAtStop', address: 36, type: 'highBit', bit: 4 },
	{ name: 'byZone', address: 36, type: 'highBit', bit: 0 },
	{ name: 'runMin', address: 36, type: 'lowByte' },
	{ name: 'cleaningRunMin', address: 37, type: 'word' },
	{ name: 'cleaningDuration', address: 38, type: 'word' },
	{ name: 'cleaningInterval', address: 39, type: 'word' },
	{ name: 'powerMin', address: 40, type: 'word' },
	{ name: 'powerMax', address: 41, type: 'word' },
	{ name: 'powerFull', address: 42, type: 'word' },
	{ name: 'powerCleaning', address: 43, type: 'word' },
	{ name: 'powerCleanUp', address: 44, type: 'word' },
	{ name: 'powerBypass', address: 45, type: 'word' },
	{ name: 'powerDelayOff', address: 46, type: 'word' },
	{ name: 'powerAtError', address: 47, type: 'word' },
	{ name: 'powerWinter', address: 48, type: 'word' },
	{ name: 'powerReserved', address: 49, type: 'word' },
	{ name: 'openAtError', address: 50, type: 'highBit', bit: 7 },
	{ name: 'openAtIdle', address: 50, type: 'highBit', bit: 6 },
	{ name: 'extSecurityDis', address: 50, type: 'highBit', bit: 5 },
	{ name: 'mainDuctDiameter', address: 51, type: 'word' },
	{ name: 'mainDuctAirVolumeSelector', address: 52, type: 'word' },
	{ name: 'mainDuctAirVelDiam', address: 53, type: 'word' },
	{ name: 'gatesError', address: 54, type: 'highByte' },
	{ name: 'gatesWarning', address: 54, type: 'lowByte' },
	{ name: 'vsdMode', address: 55, type: 'word' },
]

export const SYSTEM_SETUP_STRING_FIELDS = [
	{ name: 'systemName', startRegister: 1, registerCount: 32 },
	{ name: 'systemCharacter', startRegister: 33, registerCount: 2 },
]

// System ID/Name/Character are shown in the panel header, always visible.
export const SYSTEM_SETUP_GROUPS = [
	{ label: 'Delay', fields: ['delayOn', 'delayOff'] },
	{
		label: 'Cleaning',
		fields: ['cleaningOn', 'cleaningAtStop', 'byZone', 'runMin', 'cleaningRunMin', 'cleaningDuration', 'cleaningInterval'],
	},
	{
		label: 'Power',
		fields: ['powerMin', 'powerMax', 'powerFull', 'powerCleaning', 'powerCleanUp', 'powerBypass', 'powerDelayOff', 'powerAtError', 'powerWinter', 'powerReserved'],
	},
	{ label: 'Main Duct', fields: ['mainDuctDiameter', 'mainDuctAirVolumeSelector', 'mainDuctAirVelDiam'] },
	{ label: 'Other', fields: ['openAtError', 'openAtIdle', 'extSecurityDis', 'gatesError', 'gatesWarning', 'vsdMode'] },
]

// "delayOn" in group "Delay" -> "On"; falls back to a spaced-out field name when there's no shared prefix.
const splitCamelCase = (value) => value
	.replace(/([a-z0-9])([A-Z])/g, '$1 $2')
	.replace(/^./, (char) => char.toUpperCase())

export const getFieldShortLabel = (groupLabel, fieldName) => {
	const prefix = groupLabel.replace(/\s+/g, '').toLowerCase()
	if (fieldName.toLowerCase().startsWith(prefix) && fieldName.length > prefix.length) {
		return splitCamelCase(fieldName.slice(prefix.length))
	}
	return splitCamelCase(fieldName)
}

// Builds one holding-register read per known system, used only once numberOfSystems is known.
export const buildSystemSetupReads = (systemCount) => Array.from(
	{ length: systemCount || 0 },
	(_, index) => ({
		name: `System ${index + 1} Setup`,
		address: getSystemSetupAddress(index),
		count: SYSTEM_SETUP_REGISTER_COUNT,
		decoder: 'systemSetup',
		systemIndex: index,
	}),
)
