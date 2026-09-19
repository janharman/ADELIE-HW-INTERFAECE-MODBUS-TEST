// Maps each device category to the address/count info needed to look up its raw registers,
// for both the holding (setup) and input (runtime) register spaces. Used only by the Holding/
// Input Registers viewer - decoding of individual fields still happens in decoders.js.
import { getSystemSetupAddress, SYSTEM_SETUP_REGISTER_COUNT } from './setupSchema_System'
import { getSystemRuntimeAddress, SYSTEM_RUNTIME_REGISTER_COUNT } from './runtimeSchema_System'
import { getGateSetupAddress, GATE_SETUP_REGISTER_COUNT } from './setupSchema_GATE'
import { getGateRuntimeAddress, GATE_RUNTIME_REGISTER_COUNT } from './runtimeSchema_GATE'
import { getVsdSetupAddress, VSD_SETUP_REGISTER_COUNT } from './setupSchema_VSD'
import { getVsdRuntimeAddress, VSD_RUNTIME_REGISTER_COUNT } from './runtimeSchema_VSD'
import { getWorkstationSetupAddress, WORKSTATION_SETUP_REGISTER_COUNT } from './setupSchema_Workstation'
import { getModbusDeviceSetupAddress, MODBUS_DEVICE_SETUP_REGISTER_COUNT } from './setupSchema_ModbusDevice'
import { getModbusDeviceRuntimeAddress, MODBUS_DEVICE_RUNTIME_REGISTER_COUNT } from './runtimeSchema_ModbusDevice'
import { getInterfaceSetupAddress, INTERFACE_SETUP_REGISTER_COUNT, INTERFACE_SETUP_MAX_COUNT } from './setupSchema_Interface'
import { getInterfaceRuntimeAddress, INTERFACE_RUNTIME_REGISTER_COUNT, INTERFACE_RUNTIME_MAX_COUNT } from './runtimeSchema_Interface'
import { getPeripheralSetupAddress, PERIPHERAL_SETUP_REGISTER_COUNT, PERIPHERAL_SETUP_MAX_COUNT } from './setupSchema_Peripheral'
import { getExternalSignalSetupAddress, EXTERNAL_SIGNAL_SETUP_REGISTER_COUNT, EXTERNAL_SIGNAL_SETUP_MAX_COUNT } from './setupSchema_ExternalSignal'
import { getRockhopperSetupAddress, ROCKHOPPER_SETUP_REGISTER_COUNT, ROCKHOPPER_SETUP_MAX_COUNT } from './setupSchema_Rockhopper'
import { getRockhopperRuntimeAddress, ROCKHOPPER_RUNTIME_REGISTER_COUNT, ROCKHOPPER_RUNTIME_MAX_COUNT } from './runtimeSchema_Rockhopper'
import { getGlobalCtrlDeviceSetupAddress, GLOBAL_CTRL_DEVICE_SETUP_REGISTER_COUNT, GLOBAL_CTRL_DEVICE_SETUP_MAX_COUNT } from './setupSchema_GlobalCtrlDevice'

// Each entry: { getAddress(index), registerCount, countField (key on greenBoxSetup), maxCount? }
export const REGISTER_CATALOG = {
	systems: {
		holding: { getAddress: getSystemSetupAddress, registerCount: SYSTEM_SETUP_REGISTER_COUNT, countField: 'numberOfSystems' },
		input: { getAddress: getSystemRuntimeAddress, registerCount: SYSTEM_RUNTIME_REGISTER_COUNT, countField: 'numberOfSystems' },
	},
	gates: {
		holding: { getAddress: getGateSetupAddress, registerCount: GATE_SETUP_REGISTER_COUNT, countField: 'numberOfGates' },
		input: { getAddress: getGateRuntimeAddress, registerCount: GATE_RUNTIME_REGISTER_COUNT, countField: 'numberOfGates' },
	},
	vfds: {
		holding: { getAddress: getVsdSetupAddress, registerCount: VSD_SETUP_REGISTER_COUNT, countField: 'numberOfVfds' },
		input: { getAddress: getVsdRuntimeAddress, registerCount: VSD_RUNTIME_REGISTER_COUNT, countField: 'numberOfVfds' },
	},
	workstations: {
		holding: { getAddress: getWorkstationSetupAddress, registerCount: WORKSTATION_SETUP_REGISTER_COUNT, countField: 'nubmerOfWorkstations' },
	},
	modbusDevices: {
		holding: { getAddress: getModbusDeviceSetupAddress, registerCount: MODBUS_DEVICE_SETUP_REGISTER_COUNT, countField: 'numberOfModbusDevices' },
		input: { getAddress: getModbusDeviceRuntimeAddress, registerCount: MODBUS_DEVICE_RUNTIME_REGISTER_COUNT, countField: 'numberOfModbusDevices' },
	},
	interfaces: {
		holding: { getAddress: getInterfaceSetupAddress, registerCount: INTERFACE_SETUP_REGISTER_COUNT, countField: 'numberOfInterfaces', maxCount: INTERFACE_SETUP_MAX_COUNT },
		input: { getAddress: getInterfaceRuntimeAddress, registerCount: INTERFACE_RUNTIME_REGISTER_COUNT, countField: 'numberOfInterfaces', maxCount: INTERFACE_RUNTIME_MAX_COUNT },
	},
	peripherals: {
		holding: { getAddress: getPeripheralSetupAddress, registerCount: PERIPHERAL_SETUP_REGISTER_COUNT, countField: 'numberOfPeripherals', maxCount: PERIPHERAL_SETUP_MAX_COUNT },
	},
	extSignals: {
		holding: { getAddress: getExternalSignalSetupAddress, registerCount: EXTERNAL_SIGNAL_SETUP_REGISTER_COUNT, countField: 'nubmberOfExtSignals', maxCount: EXTERNAL_SIGNAL_SETUP_MAX_COUNT },
	},
	rockhoppers: {
		holding: { getAddress: getRockhopperSetupAddress, registerCount: ROCKHOPPER_SETUP_REGISTER_COUNT, countField: 'numberOfRockhoppers', maxCount: ROCKHOPPER_SETUP_MAX_COUNT },
		input: { getAddress: getRockhopperRuntimeAddress, registerCount: ROCKHOPPER_RUNTIME_REGISTER_COUNT, countField: 'numberOfRockhoppers', maxCount: ROCKHOPPER_RUNTIME_MAX_COUNT },
	},
	globalCtrlDevices: {
		holding: { getAddress: getGlobalCtrlDeviceSetupAddress, registerCount: GLOBAL_CTRL_DEVICE_SETUP_REGISTER_COUNT, countField: 'numberOfGlobalCtrlDevices', maxCount: GLOBAL_CTRL_DEVICE_SETUP_MAX_COUNT },
	},
}
