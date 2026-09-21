export const GLOBAL_RUNTIME_ADDRESS = 0
export const GLOBAL_RUNTIME_REGISTER_COUNT = 16

export const createEmptyGlobalRuntime = () => ({
	recordVersion: 0,
	jsonSetupVersion: 0,
	adeKerVersionNumber: 0,
	adeKerVersionDate: 0,
	globalError: 0,
	globalWarning: 0,
	globalStatus: 0,
	globalErrorBits: '--------------------------',
	globalWarningBits: '--------------------------',
	globalStatusBits: '--------------------------',
	semaphore: {
		red: false,
		orange: false,
		green: false,
		buzzer: false,
	},
})

export const buildGlobalRuntimeReads = () => ([
	{
		name: 'Global Runtime Data',
		address: GLOBAL_RUNTIME_ADDRESS,
		count: GLOBAL_RUNTIME_REGISTER_COUNT,
		decoder: 'globalRuntime',
	},
])