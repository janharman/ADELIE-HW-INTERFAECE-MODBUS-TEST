import { useEffect, useRef } from 'react'
import {
	HOLDING_REGISTER_READS,
	getInputRegisterReads,
} from '../modbus/frameDefinitions'
import {
	createReadFrame,
	isValidReadResponse,
	matchesSlaveAddress,
	getRegister,
	READ_HOLDING_REGISTERS,
	READ_INPUT_REGISTERS,
} from '../modbus/modbusProtocol'
import {
	decodeHoldingResponse,
	greenBOX_Setup,
	resetSetupData,
} from '../modbus/decoders'
import { recordRegisters, resetRegisterStore } from '../modbus/registerStore'
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
import { buildGlobalRuntimeReads } from '../modbus/runtimeSchema_Global'

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
		let runtimeCategoryReadCount = 0
		let lastRuntimeCategory = activeCategoryRef.current
		let appliedSetupReloadToken = setupReloadTokenRef.current

		// Sends one frame and reports its outcome; throws so the caller can restart the cycle.
		const sendRead = async (read) => {
			const frame = createReadFrame(slaveAddressRef.current, read.functionCode, read.address, read.count)
			let response
			//onCommunicationStatusRef.current?.(
			//	read.name,
			//	null,
			//	0,
			//	`Request address ${read.address}, ${read.count} registers`,
			//)

			try {
				response = await serialRef.current.sendAndReceive(frame, 500)
			} catch (error) {
				onCommunicationStatusRef.current?.(read.name, false, 0, error.message)
				throw error
			}

			const decodedData = decodeHoldingResponse(response, read)
			onResponseRef.current?.(response, read, decodedData)

			const successful = matchesSlaveAddress(response, slaveAddressRef.current)
				&& isValidReadResponse(response, read)
			const errorMessage = successful
				? ''
				: `Expected ${read.count * 2 + 5} B, received ${response.length} B (slave ${response[0] ?? '---'}, function ${response[1] ?? '---'})`
			onCommunicationStatusRef.current?.(read.name, successful, response.length, errorMessage)

			if (!successful) throw new Error(errorMessage)

			// Keep the raw register words too, independent of decoding, for the register viewer.
			const space = read.functionCode === READ_HOLDING_REGISTERS ? 'holding' : 'input'
			const values = Array.from({ length: read.count }, (_, offset) => getRegister(response, offset))
			recordRegisters(space, read.address, values)
		}

		const resetCycle = () => {
			phase = 'setup'
			readIndex = 0
			resetSetupData()
			resetRegisterStore()
			runtimeCategoryReadCount = 0
		lastRuntimeCategory = activeCategoryRef.current
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
				runtimeCategoryReadCount = 10
			}
		}

		// Phase 2: poll global runtime while idle, and every tenth category read while active.
		const runRunningStep = async () => {
			const activeRuntimeCategory = activeCategoryRef.current
			if (activeRuntimeCategory !== lastRuntimeCategory) {
				lastRuntimeCategory = activeRuntimeCategory
				runtimeCategoryReadCount = 0
				readIndex = 0
			}

			const categoryReads = getInputRegisterReads(activeRuntimeCategory, greenBOX_Setup)
			if (categoryReads.length === 0) {
				await sendRead({
					...buildGlobalRuntimeReads()[0],
					functionCode: READ_INPUT_REGISTERS,
				})
				return
			}

			if (runtimeCategoryReadCount >= 10) {
				await sendRead({
					...buildGlobalRuntimeReads()[0],
					functionCode: READ_INPUT_REGISTERS,
				})
				runtimeCategoryReadCount = 0
				return
			}

			if (readIndex >= categoryReads.length) readIndex = 0

			const read = {
				...categoryReads[readIndex],
				functionCode: READ_INPUT_REGISTERS,
			}

			await sendRead(read)
			readIndex += 1
			runtimeCategoryReadCount += 1
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
					if (phase === 'setup') {
						resetCycle()
						onErrorRef.current?.(error)
					} else {
						// A runtime frame may be unsupported for one device category; keep the completed setup intact.
						readIndex += 1
					}
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

