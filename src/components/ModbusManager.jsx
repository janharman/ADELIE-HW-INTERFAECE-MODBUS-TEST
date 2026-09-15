import { useEffect, useRef } from 'react'
import {
	HOLDING_REGISTER_READS,
	getInputRegisterReads,
} from '../modbus/frameDefinitions'
import {
	createReadFrame,
	isValidReadResponse,
	matchesSlaveAddress,
	READ_HOLDING_REGISTERS,
	READ_INPUT_REGISTERS,
} from '../modbus/modbusProtocol'
import {
	decodeHoldingResponse,
	greenBOX_Setup,
	resetSetupData,
} from '../modbus/decoders'
import { buildSystemSetupReads } from '../modbus/setupSchema_System'
import { buildGateSetupReads } from '../modbus/setupSchema_GATE'
import { buildVsdSetupReads } from '../modbus/setupSchema_VSD'
import { buildWorkstationSetupReads } from '../modbus/setupSchema_Workstation'
import { buildModbusDeviceSetupReads } from '../modbus/setupSchema_ModbusDevice'
import { buildInterfaceSetupReads } from '../modbus/setupSchema_Interface'
import { buildPeripheralSetupReads } from '../modbus/setupSchema_Peripheral'
import { buildExternalSignalSetupReads } from '../modbus/setupSchema_ExternalSignal'
import { buildRockhopperSetupReads } from '../modbus/setupSchema_Rockhopper'
import { buildGlobalCtrlDeviceSetupReads } from '../modbus/setupSchema_GlobalCtrlDevice'

// The setup phase reads the static frames plus one Setup frame per known system.
const getSetupReads = () => [
	...HOLDING_REGISTER_READS,
	...buildSystemSetupReads(greenBOX_Setup.numberOfSystems),
	...buildGateSetupReads(greenBOX_Setup.numberOfGates),
	...buildVsdSetupReads(greenBOX_Setup.numberOfVfds),
	...buildWorkstationSetupReads(greenBOX_Setup.nubmerOfWorkstations),
	...buildModbusDeviceSetupReads(greenBOX_Setup.numberOfModbusDevices),
	...buildInterfaceSetupReads(greenBOX_Setup.numberOfInterfaces),
	...buildPeripheralSetupReads(greenBOX_Setup.numberOfPeripherals),
	...buildExternalSignalSetupReads(greenBOX_Setup.nubmberOfExtSignals),
	...buildRockhopperSetupReads(greenBOX_Setup.numberOfRockhoppers),
	...buildGlobalCtrlDeviceSetupReads(greenBOX_Setup.numberOfGlobalCtrlDevices),
]

function ModbusManager({
	serialRef,
	isRunning,
	slaveAddress,
	activeCategory,
	setupReloadToken,
	onResponse,
	onCommunicationStatus,
	onSetupProgress,
	onError,
}) {
	const onResponseRef = useRef(onResponse)
	const onCommunicationStatusRef = useRef(onCommunicationStatus)
	const onSetupProgressRef = useRef(onSetupProgress)
	const onErrorRef = useRef(onError)
	const slaveAddressRef = useRef(slaveAddress)
	const activeCategoryRef = useRef(activeCategory)
	const setupReloadTokenRef = useRef(setupReloadToken)

	onResponseRef.current = onResponse
	onCommunicationStatusRef.current = onCommunicationStatus
	onSetupProgressRef.current = onSetupProgress
	onErrorRef.current = onError
	slaveAddressRef.current = slaveAddress
	activeCategoryRef.current = activeCategory
	setupReloadTokenRef.current = setupReloadToken

	useEffect(() => {
		if (!isRunning) return undefined

		let cancelled = false
		let phase = 'setup'
		let readIndex = 0
		let appliedSetupReloadToken = setupReloadTokenRef.current

		// Sends one frame and reports its outcome; throws so the caller can restart the cycle.
		const sendRead = async (read) => {
			const frame = createReadFrame(slaveAddressRef.current, read.functionCode, read.address, read.count)
			let response

			try {
				response = await serialRef.current.sendAndReceive(frame)
			} catch (error) {
				onCommunicationStatusRef.current?.(read.name, false)
				throw error
			}

			const decodedData = decodeHoldingResponse(response, read)
			onResponseRef.current?.(response, read, decodedData)

			const successful = matchesSlaveAddress(response, slaveAddressRef.current)
				&& isValidReadResponse(response, read)
			onCommunicationStatusRef.current?.(read.name, successful, response.length)

			if (!successful) throw new Error(`Invalid response for ${read.name}`)
		}

		const resetCycle = () => {
			phase = 'setup'
			readIndex = 0
			resetSetupData()
			onSetupProgressRef.current?.(0, HOLDING_REGISTER_READS.length)
		}

		// Phase 1: read every known holding-register frame once, in order.
		const runSetupStep = async () => {
			const read = {
				...getSetupReads()[readIndex],
				functionCode: READ_HOLDING_REGISTERS,
			}

			try {
				await sendRead(read)
			} catch (error) {
				// Gate setup is optional for devices that do not expose gate registers.
				if (read.decoder !== 'gateSetup') throw error
			}
			readIndex += 1

			const setupReads = getSetupReads()
			onSetupProgressRef.current?.(readIndex, setupReads.length)

			if (readIndex >= setupReads.length) {
				phase = 'running'
				readIndex = 0
			}
		}

		// Phase 2: cycle only through the input registers needed by the active UI category.
		const runRunningStep = async () => {
			const reads = getInputRegisterReads(activeCategoryRef.current, greenBOX_Setup)
			if (reads.length === 0) return

			if (readIndex >= reads.length) readIndex = 0

			const read = {
				...reads[readIndex],
				functionCode: READ_INPUT_REGISTERS,
			}

			await sendRead(read)
			readIndex += 1
		}

		const tick = async () => {
			if (cancelled || !serialRef.current) return
			if (appliedSetupReloadToken !== setupReloadTokenRef.current) {
				appliedSetupReloadToken = setupReloadTokenRef.current
				resetCycle()
			}

			try {
				if (phase === 'setup') {
					await runSetupStep()
				} else {
					await runRunningStep()
				}
			} catch (error) {
				if (!cancelled) {
					resetCycle()
					onErrorRef.current?.(error)
				}
			}

			if (!cancelled) setTimeout(tick, 10)
		}

		resetCycle()
		tick()

		return () => {
			cancelled = true
		}
	}, [isRunning, serialRef])

	return null
}

export default ModbusManager

