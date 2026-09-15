export const VSD_RUNTIME_BASE_ADDRESS = 4000
export const VSD_RUNTIME_ADDRESS_STRIDE = 20
export const VSD_RUNTIME_REGISTER_COUNT = 16

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