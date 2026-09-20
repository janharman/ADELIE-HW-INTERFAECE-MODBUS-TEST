// External signal runtime data (input registers). Unlike other categories, this is a single
// global 32-bit register at address 43000 shared by all external signals - one bit per letter
// (bit0='A' .. bit25='Z') marks the signal whose REF is that letter as active.
export const EXTERNAL_SIGNAL_RUNTIME_ADDRESS = 43000
export const EXTERNAL_SIGNAL_RUNTIME_REGISTER_COUNT = 2
export const EXTERNAL_SIGNAL_RUNTIME_LETTER_COUNT = 26

export const createEmptyExternalSignalRuntime = () => ({
	activeLetters: '',
})

// One shared read frame, as long as at least one external signal is configured.
export const buildExternalSignalRuntimeReads = (signalCount) => (
	signalCount > 0
		? [{
			name: 'External Signals Runtime',
			address: EXTERNAL_SIGNAL_RUNTIME_ADDRESS,
			count: EXTERNAL_SIGNAL_RUNTIME_REGISTER_COUNT,
			decoder: 'externalSignalRuntime',
		}]
		: []
)
