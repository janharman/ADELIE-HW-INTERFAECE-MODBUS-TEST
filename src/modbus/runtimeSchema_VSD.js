export const VSD_RUNTIME_BASE_ADDRESS = 4000
export const VSD_RUNTIME_ADDRESS_STRIDE = 22
export const VSD_RUNTIME_REGISTER_COUNT = 20

export const VSD_KER_STATUS_LABELS = {
	0x2E: { label: 'RESETTING ERROR', group: 'warning' },
	0x48: { label: 'DATA ERROR', group: 'error' },
	0x49: { label: 'COMM ERROR', group: 'error' },
	0x23: { label: 'VFD OFF WARN', group: 'warning' },
	0x00: { label: 'VFD OFF', group: 'normal' },
	0x4C: { label: 'IMMEDIATE STOP', group: 'error' },
	0x4A: { label: 'VFD IN ERROR', group: 'error' },
	0x4B: { label: 'ERR NOT READY', group: 'error' },
	0x24: { label: 'VFD NOT ENABLED', group: 'warning' },
	0x2D: { label: 'OTHER ALARM', group: 'error' },
	0x26: { label: 'MANUAL', group: 'warning' },
	0x25: { label: 'STOP MODE', group: 'warning' },
	0x27: { label: 'LOCAL CTRL', group: 'warning' },
	0x02: { label: 'RUNNING', group: 'normal' },
	0x01: { label: 'STOP', group: 'normal' },
}

export const VSD_STATUS_LABELS = {
	0: 'Communication Error',
	1: 'Immediate Stop',
	2: 'VSD Error',
	3: 'Not Enabled',
	4: 'Error Not Ready',
	5: 'Other Alarm',
	6: 'Manual',
	7: 'Stop Mode',
	8: 'Local Control',
	9: 'Running',
	10: 'In Stop',
}

export const VSD_STATUS_BITS = {
	enabled: 0,
	ready: 1,
	run: 2,
	manual: 3,
	localControl: 4,
	warning: 5,
	error: 6,
	immediateStop: 7,
	automatic: 8,
}

export const VSD_DIGITAL_INPUT_BITS = {
	manual: 0,
	automatic: 1,
	airlockOk: 2,
	transportOk: 3,
	immediateStop: 4,
	enable: 5,
}

export const getVsdRuntimeAddress = (vsdIndex) => (
	VSD_RUNTIME_BASE_ADDRESS + vsdIndex * VSD_RUNTIME_ADDRESS_STRIDE
)

export const createEmptyVsdRuntime = () => ({
	kerStatus: 0,
	kerStatusLabel: 'UNKNOWN',
	kerStatusGroup: 'unknown',
	kerPwrRequest: 0,
	communicationStatus: 0,
	status: 0,
	statusLabel: VSD_STATUS_LABELS[0],
	statusBits: {},
	frequencyReference: 0,
	frequencyReferencePercent: 0,
	outputFrequency: 0,
	outputFrequencyHertz: 0,
	outputPower: 0,
	outputPowerWatts: 0,
	outputVoltage: 0,
	outputCurrent: 0,
	digitalInputs: {},
	analogInput1: 0,
	analogInput2: 0,
	temperature: 0,
	latestFault: 0,
	latestWarning: 0,
})

export const buildVsdRuntimeReads = (vsdCount) => Array.from(
	{ length: vsdCount || 0 },
	(_, index) => ({
		name: `VSD ${index + 1} Runtime`,
		address: getVsdRuntimeAddress(index),
		count: VSD_RUNTIME_REGISTER_COUNT,
		decoder: 'vsdRuntime',
		vsdIndex: index,
	}),
)