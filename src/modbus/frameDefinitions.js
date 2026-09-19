import { buildVsdRuntimeReads } from './runtimeSchema_VSD'
import { buildInterfaceRuntimeReads } from './runtimeSchema_Interface'
import { buildGateRuntimeReads } from './runtimeSchema_GATE'
import { buildModbusDeviceRuntimeReads } from './runtimeSchema_ModbusDevice'
import { buildRockhopperRuntimeReads } from './runtimeSchema_Rockhopper'
import { buildSystemRuntimeReads } from './runtimeSchema_System'

export const DEFAULT_MODBUS_SLAVE_ADDRESS = 1
export const MODBUS_SLAVE_ADDRESS_STORAGE_KEY = 'modbus_slave_address'
export const READ_HOLDING_REGISTERS = 0x03
export const READ_INPUT_REGISTERS = 0x04

// Read once at startup, in order, before switching to the running (input-register) phase.
export const HOLDING_REGISTER_READS = [
	{ name: 'Main App Data', address: 0, count: 13, decoder: 'mainAppData' },
	{ name: 'gb Name and Desc', address: 100, count: 96, decoder: 'gbNameAndDescription' },
]

// Runtime (input-register) reads per active UI category. Each entry is a factory function so
// it can build addresses dynamically (e.g. per system index) once that category's table exists.
const CATEGORY_RUNTIME_READS = {
	systems: (setup) => buildSystemRuntimeReads(setup?.numberOfSystems),
	vfds: (setup) => buildVsdRuntimeReads(setup?.numberOfVfds),
	interfaces: (setup) => buildInterfaceRuntimeReads(setup?.numberOfInterfaces),
	gates: (setup) => buildGateRuntimeReads(setup?.numberOfGates),
	modbusDevices: (setup) => buildModbusDeviceRuntimeReads(setup?.numberOfModbusDevices),
	rockhoppers: (setup) => buildRockhopperRuntimeReads(setup?.numberOfRockhoppers),
}

export const getInputRegisterReads = (category, setup) => {
	const factory = category && CATEGORY_RUNTIME_READS[category]
	return factory ? factory(setup) : []
}

