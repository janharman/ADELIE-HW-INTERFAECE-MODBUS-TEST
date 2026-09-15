import {
	GB_NAME_AND_DESC_FIELDS,
	MAIN_APP_DATA_FIELDS,
	createEmptyGreenBoxSetup,
} from './setupSchema_MainAppData'
import {
	SYSTEM_SETUP_FIELDS,
	SYSTEM_SETUP_STRING_FIELDS,
	createEmptySystemSetup,
} from './setupSchema_System'
import {
	GATE_SETUP_FIELDS,
	GATE_SETUP_STRING_FIELDS,
	createEmptyGateSetup,
} from './setupSchema_GATE'
import {
	VSD_SETUP_FIELDS,
	VSD_SETUP_PARAMETER_FIELDS,
	VSD_SETUP_STRING_FIELDS,
	createEmptyVsdSetup,
} from './setupSchema_VSD'
import {
	VSD_DIGITAL_INPUT_BITS,
	VSD_STATUS_BITS,
	VSD_STATUS_LABELS,
	createEmptyVsdRuntime,
} from './runtimeSchema_VSD'
import {
	INTERFACE_DIGITAL_INPUT_BITS,
	INTERFACE_NO_PC_COMM_FUNCTION_BITS,
	INTERFACE_OUTPUT_STATUS_BITS,
	INTERFACE_POWER_STATUS_BITS,
	INTERFACE_WORKING_BITS,
	createEmptyInterfaceRuntime,
} from './runtimeSchema_Interface'
import {
	WORKSTATION_SETUP_FIELDS,
	WORKSTATION_SETUP_GATE_COUNT,
	WORKSTATION_SETUP_GATE_START_ADDRESS,
	WORKSTATION_SETUP_STRING_FIELDS,
	createEmptyWorkstationSetup,
} from './setupSchema_Workstation'
import {
	MODBUS_DEVICE_SETUP_FIELDS,
	MODBUS_DEVICE_SETUP_STRING_FIELDS,
	createEmptyModbusDeviceSetup,
} from './setupSchema_ModbusDevice'
import {
	INTERFACE_BRANCH_FIELDS,
	INTERFACE_SETUP_FIELDS,
	INTERFACE_SETUP_FAILURE_PORT_BITS,
	INTERFACE_SETUP_TERMINATING_BITS,
	createEmptyInterfaceSetup,
} from './setupSchema_Interface'
import {
	PERIPHERAL_SETUP_FIELDS,
	PERIPHERAL_SETUP_FLAG_BITS,
	PERIPHERAL_SETUP_STRING_FIELDS,
	createEmptyPeripheralSetup,
} from './setupSchema_Peripheral'
import {
	EXTERNAL_SIGNAL_SETUP_FIELDS,
	EXTERNAL_SIGNAL_SETUP_GATE_COUNT,
	EXTERNAL_SIGNAL_SETUP_GATE_START_ADDRESS,
	EXTERNAL_SIGNAL_SETUP_STRING_FIELDS,
	createEmptyExternalSignalSetup,
} from './setupSchema_ExternalSignal'
import {
	ROCKHOPPER_SETUP_FIELDS,
	ROCKHOPPER_SETUP_STRING_FIELDS,
	createEmptyRockhopperSetup,
} from './setupSchema_Rockhopper'
import {
	GLOBAL_CTRL_DEVICE_SETUP_FIELDS,
	GLOBAL_CTRL_DEVICE_SETUP_INPUT_RANGE_START_ADDRESS,
	GLOBAL_CTRL_DEVICE_SETUP_OUTPUT_RANGE_START_ADDRESS,
	GLOBAL_CTRL_DEVICE_SETUP_RANGE_COUNT,
	GLOBAL_CTRL_DEVICE_SETUP_STRING_FIELDS,
	createEmptyGlobalCtrlDeviceSetup,
} from './setupSchema_GlobalCtrlDevice'
import {
	getRegister,
	isValidReadResponse,
	READ_HOLDING_REGISTERS,
	READ_INPUT_REGISTERS,
} from './modbusProtocol'

export const greenBOX_Setup = createEmptyGreenBoxSetup()
export const systemSetups = []
export const gateSetups = []
export const vsdSetups = []
export const vsdRuntimeData = []
export const workstationSetups = []
export const modbusDeviceSetups = []
export const interfaceSetups = []
export const interfaceRuntimeData = []
export const peripheralSetups = []
export const externalSignalSetups = []
export const rockhopperSetups = []
export const globalCtrlDeviceSetups = []

const readField = (response, field) => {
	const value = getRegister(response, field.address)
	let decodedValue

	switch (field.type) {
		case 'doubleWord':
			decodedValue = (value * 0x10000) + getRegister(response, field.address + 1)
			break
		case 'highByte':
			decodedValue = (value >> 8) & 0xff
			break
		case 'lowByte':
			decodedValue = value & 0xff
			break
		case 'highBit':
			decodedValue = ((value >> 8) >> field.bit) & 1
			break
		case 'lowBit':
			decodedValue = (value >> field.bit) & 1
			break
		case 'character':
			decodedValue = String.fromCharCode(value & 0xff)
			break
		default:
			decodedValue = value
	}

	return field.mask === undefined ? decodedValue : decodedValue & field.mask
}

const decodeFields = (response, fields) => {
	const values = fields.reduce((data, field) => ({
		...data,
		[field.name]: readField(response, field),
	}), {})

	Object.assign(greenBOX_Setup, values)
	return { ...greenBOX_Setup }
}

const decodeRegisterString = (response, startRegister, registerCount) => {
	const bytes = []
	for (let index = startRegister; index < startRegister + registerCount; index += 1) {
		const value = getRegister(response, index)
		bytes.push(value >> 8, value & 0xff)
	}

	return new TextDecoder().decode(new Uint8Array(bytes)).split('\0')[0]
}

const decodeMainAppData = (response, frame) => {
	if (!isValidReadResponse(response, frame)) return null
	return decodeFields(response, MAIN_APP_DATA_FIELDS)
}

const decodeGbNameAndDescription = (response, frame) => {
	if (!isValidReadResponse(response, frame)) return null

	for (const field of GB_NAME_AND_DESC_FIELDS) {
		greenBOX_Setup[field.name] = decodeRegisterString(
			response,
			field.startRegister,
			field.registerCount,
		)
	}

	return { ...greenBOX_Setup }
}

const decodeSystemSetup = (response, frame) => {
	if (!isValidReadResponse(response, frame)) return null

	const values = SYSTEM_SETUP_FIELDS.reduce((data, field) => ({
		...data,
		[field.name]: readField(response, field),
	}), {})

	for (const field of SYSTEM_SETUP_STRING_FIELDS) {
		values[field.name] = decodeRegisterString(response, field.startRegister, field.registerCount)
	}

	systemSetups[frame.systemIndex] = { ...createEmptySystemSetup(), ...values }

	return { systemIndex: frame.systemIndex, systemSetup: systemSetups[frame.systemIndex] }
}

const decodeGateSetup = (response, frame) => {
	if (!isValidReadResponse(response, frame)) return null

	const values = GATE_SETUP_FIELDS.reduce((data, field) => ({
		...data,
		[field.name]: readField(response, field),
	}), {})

	for (const field of GATE_SETUP_STRING_FIELDS) {
		values[field.name] = decodeRegisterString(response, field.startRegister, field.registerCount)
	}

	gateSetups[frame.gateIndex] = { ...createEmptyGateSetup(), ...values }

	return { gateIndex: frame.gateIndex, gateSetup: gateSetups[frame.gateIndex] }
}

const decodeVsdSetup = (response, frame) => {
	if (!isValidReadResponse(response, frame)) return null

	const values = VSD_SETUP_FIELDS.reduce((data, field) => ({
		...data,
		[field.name]: readField(response, field),
	}), {})

	values.parameters = VSD_SETUP_PARAMETER_FIELDS.map((field) => readField(response, field))
	for (const field of VSD_SETUP_STRING_FIELDS) {
		values[field.name] = decodeRegisterString(response, field.startRegister, field.registerCount)
	}

	vsdSetups[frame.vsdIndex] = { ...createEmptyVsdSetup(), ...values }
	return { vsdIndex: frame.vsdIndex, vsdSetup: vsdSetups[frame.vsdIndex] }
}

const decodeVsdRuntime = (response, frame) => {
	if (!isValidReadResponse(response, frame)) return null

	const statusBits = getRegister(response, 2)
	const digitalInputs = getRegister(response, 8)
	const values = {
		communicationStatus: getRegister(response, 0),
		status: getRegister(response, 1),
		statusBits: Object.fromEntries(
			Object.entries(VSD_STATUS_BITS).map(([name, bit]) => [name, (statusBits >> bit) & 1]),
		),
		frequencyReference: getRegister(response, 3),
		frequencyReferencePercent: getRegister(response, 3) / 100,
		outputFrequency: getRegister(response, 4),
		outputFrequencyHertz: getRegister(response, 4) / 100,
		outputPower: getRegister(response, 5),
		outputPowerWatts: getRegister(response, 5) / 10,
		outputVoltage: getRegister(response, 6),
		outputCurrent: getRegister(response, 7) / 1000,
		digitalInputs: Object.fromEntries(
			Object.entries(VSD_DIGITAL_INPUT_BITS).map(([name, bit]) => [name, (digitalInputs >> bit) & 1]),
		),
		analogInput1: getRegister(response, 9),
		analogInput2: getRegister(response, 10),
		temperature: getRegister(response, 13),
		latestFault: getRegister(response, 14),
		latestWarning: getRegister(response, 15),
	}
	values.statusLabel = VSD_STATUS_LABELS[values.status] ?? `Unknown (${values.status})`

	vsdRuntimeData[frame.vsdIndex] = { ...createEmptyVsdRuntime(), ...values }
	return { vsdIndex: frame.vsdIndex, vsdRuntime: vsdRuntimeData[frame.vsdIndex] }
}

const decodeWorkstationSetup = (response, frame) => {
	if (!isValidReadResponse(response, frame)) return null

	const values = WORKSTATION_SETUP_FIELDS.reduce((data, field) => ({
		...data,
		[field.name]: readField(response, field),
	}), {})

	for (const field of WORKSTATION_SETUP_STRING_FIELDS) {
		values[field.name] = decodeRegisterString(response, field.startRegister, field.registerCount)
	}

	values.gates = Array.from(
		{ length: WORKSTATION_SETUP_GATE_COUNT },
		(_, index) => getRegister(response, WORKSTATION_SETUP_GATE_START_ADDRESS + index),
	)

	workstationSetups[frame.workstationIndex] = {
		...createEmptyWorkstationSetup(),
		...values,
	}

	return {
		workstationIndex: frame.workstationIndex,
		workstationSetup: workstationSetups[frame.workstationIndex],
	}
}

const decodeModbusDeviceSetup = (response, frame) => {
	if (!isValidReadResponse(response, frame)) return null

	const values = MODBUS_DEVICE_SETUP_FIELDS.reduce((data, field) => ({
		...data,
		[field.name]: readField(response, field),
	}), {})

	for (const field of MODBUS_DEVICE_SETUP_STRING_FIELDS) {
		values[field.name] = decodeRegisterString(response, field.startRegister, field.registerCount)
	}

	modbusDeviceSetups[frame.modbusDeviceIndex] = {
		...createEmptyModbusDeviceSetup(),
		...values,
	}

	return {
		modbusDeviceIndex: frame.modbusDeviceIndex,
		modbusDeviceSetup: modbusDeviceSetups[frame.modbusDeviceIndex],
	}
}

const decodeInterfaceSetup = (response, frame) => {
	if (!isValidReadResponse(response, frame)) return null

	const values = INTERFACE_SETUP_FIELDS.reduce((data, field) => ({
		...data,
		[field.name]: readField(response, field),
	}), {})

	values.branches = INTERFACE_BRANCH_FIELDS.map((field) => {
		const value = getRegister(response, field.address)
		const limitCurrent = (value >> 8) & 0xff
		return {
			limitCurrent,
			limitCurrentAmps: limitCurrent / 10,
			limitCurrentTimeout: value & 0xff,
		}
	})

	const terminatingRegister = getRegister(response, 8)
	values.terminatingResistors = INTERFACE_SETUP_TERMINATING_BITS.map((bit) => (
		(terminatingRegister >> bit) & 1
	))

	const failurePortRegister = getRegister(response, 9)
	values.failurePorts = INTERFACE_SETUP_FAILURE_PORT_BITS.map(({ shift, mask }) => (
		(failurePortRegister >> shift) & mask
	))

	interfaceSetups[frame.interfaceIndex] = {
		...createEmptyInterfaceSetup(),
		...values,
	}

	return {
		interfaceIndex: frame.interfaceIndex,
		interfaceSetup: interfaceSetups[frame.interfaceIndex],
	}
}

const decodeBits = (value, bitMap) => Object.fromEntries(
	Object.entries(bitMap).map(([name, bit]) => [name, (value >> bit) & 1]),
)

const INTERFACE_32_BIT_OFFSETS = new Set([2, 4, 25])

const getInterfaceRuntimeValue = (response, offset) => {
	const value = getRegister(response, offset)
	if (!INTERFACE_32_BIT_OFFSETS.has(offset)) return value

	return (value * 0x10000) + getRegister(response, offset + 1)
}

const decodeInterfaceRuntime = (response, frame) => {
	if (!isValidReadResponse(response, frame)) return null

	const noPcCommunication = getInterfaceRuntimeValue(response, 28)
	const values = {
		communicationStatus: getInterfaceRuntimeValue(response, 0),
		digitalInputs: decodeBits(getInterfaceRuntimeValue(response, 1), INTERFACE_DIGITAL_INPUT_BITS),
		outputStatus: decodeBits(getInterfaceRuntimeValue(response, 2), INTERFACE_OUTPUT_STATUS_BITS),
		powerStatus: decodeBits(getInterfaceRuntimeValue(response, 4), INTERFACE_POWER_STATUS_BITS),
		branchCurrents: [6, 7, 8].map((address) => getInterfaceRuntimeValue(response, address)),
		power24Voltage: getInterfaceRuntimeValue(response, 9),
		power5Voltage: getInterfaceRuntimeValue(response, 10),
		mcuTemperature: getInterfaceRuntimeValue(response, 11) / 10,
		bandgapReference: getInterfaceRuntimeValue(response, 12),
		vrefhVoltage: getInterfaceRuntimeValue(response, 13),
		branchVoltages: [14, 15, 16].map((address) => getInterfaceRuntimeValue(response, address)),
		limitCurrents: [17, 18, 19].map((address) => getInterfaceRuntimeValue(response, address)),
		limitCurrentTimeouts: [20, 21, 22].map((address) => getInterfaceRuntimeValue(response, address)),
		powerDeliveryVoltageOut: getInterfaceRuntimeValue(response, 23),
		psu19Voltage: getInterfaceRuntimeValue(response, 24),
		workingBits: decodeBits(getInterfaceRuntimeValue(response, 25), INTERFACE_WORKING_BITS),
		fanTriggerTemperature: getInterfaceRuntimeValue(response, 27),
		noPcCommunication: {
			raw: noPcCommunication,
			timeout: noPcCommunication & 0xff,
			functions: decodeBits((noPcCommunication >> 8) & 0xff, INTERFACE_NO_PC_COMM_FUNCTION_BITS),
		},
		debug: [29, 30, 31].map((address) => getInterfaceRuntimeValue(response, address)),
	}

	interfaceRuntimeData[frame.interfaceIndex] = {
		...createEmptyInterfaceRuntime(),
		...values,
	}

	return {
		interfaceIndex: frame.interfaceIndex,
		interfaceRuntime: interfaceRuntimeData[frame.interfaceIndex],
	}
}

const decodePeripheralSetup = (response, frame) => {
	if (!isValidReadResponse(response, frame)) return null

	const values = PERIPHERAL_SETUP_FIELDS.reduce((data, field) => ({
		...data,
		[field.name]: readField(response, field),
	}), {})

	for (const field of PERIPHERAL_SETUP_STRING_FIELDS) {
		values[field.name] = decodeRegisterString(response, field.startRegister, field.registerCount)
	}

	values.multiplier = values.multiplierRaw * 0.001
	values.offset = values.offsetRaw * 0.001
	values.flags = Object.fromEntries(
		Object.entries(PERIPHERAL_SETUP_FLAG_BITS).map(([name, bit]) => [
			name,
			(values.flagsRaw >> bit) & 1,
		]),
	)

	peripheralSetups[frame.peripheralIndex] = {
		...createEmptyPeripheralSetup(),
		...values,
	}

	return {
		peripheralIndex: frame.peripheralIndex,
		peripheralSetup: peripheralSetups[frame.peripheralIndex],
	}
}

const decodeExternalSignalSetup = (response, frame) => {
	if (!isValidReadResponse(response, frame)) return null

	const values = EXTERNAL_SIGNAL_SETUP_FIELDS.reduce((data, field) => ({
		...data,
		[field.name]: readField(response, field),
	}), {})

	for (const field of EXTERNAL_SIGNAL_SETUP_STRING_FIELDS) {
		values[field.name] = decodeRegisterString(response, field.startRegister, field.registerCount)
	}

	values.gates = Array.from(
		{ length: EXTERNAL_SIGNAL_SETUP_GATE_COUNT },
		(_, index) => getRegister(response, EXTERNAL_SIGNAL_SETUP_GATE_START_ADDRESS + index),
	)

	externalSignalSetups[frame.externalSignalIndex] = {
		...createEmptyExternalSignalSetup(),
		...values,
	}

	return {
		externalSignalIndex: frame.externalSignalIndex,
		externalSignalSetup: externalSignalSetups[frame.externalSignalIndex],
	}
}

const decodeRockhopperSetup = (response, frame) => {
	if (!isValidReadResponse(response, frame)) return null

	const values = ROCKHOPPER_SETUP_FIELDS.reduce((data, field) => ({
		...data,
		[field.name]: readField(response, field),
	}), {})

	for (const field of ROCKHOPPER_SETUP_STRING_FIELDS) {
		values[field.name] = decodeRegisterString(response, field.startRegister, field.registerCount)
	}

	rockhopperSetups[frame.rockhopperIndex] = {
		...createEmptyRockhopperSetup(),
		...values,
	}

	return {
		rockhopperIndex: frame.rockhopperIndex,
		rockhopperSetup: rockhopperSetups[frame.rockhopperIndex],
	}
}

const decodeGlobalCtrlDeviceSetup = (response, frame) => {
	if (!isValidReadResponse(response, frame)) return null

	const values = GLOBAL_CTRL_DEVICE_SETUP_FIELDS.reduce((data, field) => ({
		...data,
		[field.name]: readField(response, field),
	}), {})

	for (const field of GLOBAL_CTRL_DEVICE_SETUP_STRING_FIELDS) {
		values[field.name] = decodeRegisterString(response, field.startRegister, field.registerCount)
	}

	values.inputRange = Array.from(
		{ length: GLOBAL_CTRL_DEVICE_SETUP_RANGE_COUNT },
		(_, index) => getRegister(response, GLOBAL_CTRL_DEVICE_SETUP_INPUT_RANGE_START_ADDRESS + index),
	)
	values.outputRange = Array.from(
		{ length: GLOBAL_CTRL_DEVICE_SETUP_RANGE_COUNT },
		(_, index) => getRegister(response, GLOBAL_CTRL_DEVICE_SETUP_OUTPUT_RANGE_START_ADDRESS + index),
	)

	globalCtrlDeviceSetups[frame.globalCtrlDeviceIndex] = {
		...createEmptyGlobalCtrlDeviceSetup(),
		...values,
	}

	return {
		globalCtrlDeviceIndex: frame.globalCtrlDeviceIndex,
		globalCtrlDeviceSetup: globalCtrlDeviceSetups[frame.globalCtrlDeviceIndex],
	}
}

const DECODERS = {
	mainAppData: decodeMainAppData,
	gbNameAndDescription: decodeGbNameAndDescription,
	systemSetup: decodeSystemSetup,
	gateSetup: decodeGateSetup,
	vsdSetup: decodeVsdSetup,
	vsdRuntime: decodeVsdRuntime,
	workstationSetup: decodeWorkstationSetup,
	modbusDeviceSetup: decodeModbusDeviceSetup,
	interfaceSetup: decodeInterfaceSetup,
	interfaceRuntime: decodeInterfaceRuntime,
	peripheralSetup: decodePeripheralSetup,
	externalSignalSetup: decodeExternalSignalSetup,
	rockhopperSetup: decodeRockhopperSetup,
	globalCtrlDeviceSetup: decodeGlobalCtrlDeviceSetup,
}

export const decodeHoldingResponse = (response, frame) => {
	if (
		(frame.functionCode !== READ_HOLDING_REGISTERS && frame.functionCode !== READ_INPUT_REGISTERS)
		|| !frame.decoder
	) return null
	return DECODERS[frame.decoder]?.(response, frame) ?? null
}

export const resetSetupData = () => {
	Object.assign(greenBOX_Setup, createEmptyGreenBoxSetup())
	systemSetups.length = 0
	gateSetups.length = 0
	vsdSetups.length = 0
	vsdRuntimeData.length = 0
	workstationSetups.length = 0
	modbusDeviceSetups.length = 0
	interfaceSetups.length = 0
	interfaceRuntimeData.length = 0
	peripheralSetups.length = 0
	externalSignalSetups.length = 0
	rockhopperSetups.length = 0
	globalCtrlDeviceSetups.length = 0
}
