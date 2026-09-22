export const WORKSTATION_RUNTIME_BASE_ADDRESS = 30000
export const WORKSTATION_RUNTIME_REGISTER_COUNT = 32
export const WORKSTATION_RUNTIME_FLAG_REGISTER_COUNT = 16
export const WORKSTATION_RUNTIME_MAX_COUNT = WORKSTATION_RUNTIME_FLAG_REGISTER_COUNT * 16

export const createEmptyWorkstationRuntime = () => ({
	active: 0,
	force: 0,
})

export const buildWorkstationRuntimeReads = (workstationCount) => [{
	name: 'Workstations Runtime',
	address: WORKSTATION_RUNTIME_BASE_ADDRESS,
	count: WORKSTATION_RUNTIME_REGISTER_COUNT,
	decoder: 'workstationRuntime',
	workstationCount: Math.min(workstationCount || 0, WORKSTATION_RUNTIME_MAX_COUNT),
	allowFunctionCodeMismatch: true,
}]
