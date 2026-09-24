import { useRef, useState } from 'react'
import './App.css'
import logo from './assets/logo-ecogate.png'
import ModbusManager from './components/ModbusManager'
import SerialManager from './components/SerialManager'
import GlobalCtrlDeviceTable from './components/GlobalCtrlDeviceTable'
import DeviceCard_VSD from './components/DeviceCard_VSD'
import DeviceCard_GATE from './components/DeviceCard_GATE'
import DeviceCard_SYSTEM from './components/DeviceCard_SYSTEM'
import DeviceCard_INTERFACE from './components/DeviceCard_INTERFACE'
import DeviceCard_MODBUS_DEVICE from './components/DeviceCard_MODBUS_DEVICE'
import DeviceCard_ROCKHOPPER from './components/DeviceCard_ROCKHOPPER'
import DeviceCard_WORKSTATION from './components/DeviceCard_WORKSTATION'
import RegisterTablePanel from './components/RegisterTablePanel'
import GlobalRuntimePanel from './components/GlobalRuntimePanel'
import { resetSetupData } from './modbus/decoders'
import { resetRegisterStore } from './modbus/registerStore'
import { REGISTER_CATALOG } from './modbus/registerCatalog'
import {
	WRITE_SINGLE_COIL_OFF,
	WRITE_SINGLE_COIL_ON,
	WRITE_SINGLE_COIL_RESPONSE_LENGTH,
	WRITE_MULTIPLE_COILS_RESPONSE_LENGTH,
	createWriteMultipleCoilsFrame,
	createWriteSingleCoilFrame,
	isValidWriteMultipleCoilsResponse,
	isValidWriteSingleCoilResponse,
} from './modbus/modbusProtocol'
import {
	DEFAULT_MODBUS_SLAVE_ADDRESS,
	HOLDING_REGISTER_READS,
	MODBUS_SLAVE_ADDRESS_STORAGE_KEY,
} from './modbus/frameDefinitions'
import {
	SYSTEM_SETUP_FIELDS,
	SYSTEM_SETUP_GROUPS,
	getFieldShortLabel,
} from './modbus/setupSchema_System'
import {
	GATE_SETUP_FIELD_LABELS,
} from './modbus/setupSchema_GATE'
import { PERIPHERAL_SETUP_MAX_COUNT } from './modbus/setupSchema_Peripheral'
import { EXTERNAL_SIGNAL_SETUP_MAX_COUNT } from './modbus/setupSchema_ExternalSignal'

const readStoredSlaveAddress = () => {
	const stored = Number(localStorage.getItem(MODBUS_SLAVE_ADDRESS_STORAGE_KEY))
	return Number.isInteger(stored) && stored >= 1 && stored <= 247
		? stored
		: DEFAULT_MODBUS_SLAVE_ADDRESS
}

const formatVersionSuffix = (value) => {
	const unsignedValue = value >>> 0
	const hexadecimalValue = unsignedValue.toString(16).padStart(8, '0').toUpperCase()
	return `${hexadecimalValue.slice(0, 6)}.${String.fromCharCode(unsignedValue & 0xff)}`
}

// Device categories shown as cards; Systems and Gates have setup tables.
const CATEGORY_DEFINITIONS = [
	{ id: 'systems', label: 'Systems', icon: 'systems', countField: 'numberOfSystems', enabled: true },
	{ id: 'vfds', label: 'VSDs', icon: 'vfds', countField: 'numberOfVfds', enabled: true },
	{ id: 'workstations', label: 'Workstations', icon: 'workstations', countField: 'nubmerOfWorkstations', enabled: true },
	{ id: 'gates', label: 'Gates', icon: 'gates', countField: 'numberOfGates', enabled: true },
	{ id: 'modbusDevices', label: 'Modbus Devices', icon: 'modbusDevices', countField: 'numberOfModbusDevices', enabled: true },
	{ id: 'peripherals', label: 'Peripherals', icon: 'peripherals', countField: 'numberOfPeripherals', enabled: true },
	{ id: 'extSignals', label: 'Ext Signals', icon: 'extSignals', countField: 'nubmberOfExtSignals', enabled: true },
	{ id: 'interfaces', label: 'Interfaces', icon: 'interfaces', countField: 'numberOfInterfaces', enabled: true },
	{ id: 'rockhoppers', label: 'Rockhoppers', icon: 'rockhoppers', countField: 'numberOfRockhoppers', enabled: true },
	{ id: 'globalCtrlDevices', label: 'Glob. Ctrl Devices', icon: 'globalCtrlDevices', countField: 'numberOfGlobalCtrlDevices', enabled: true },
]

const SYSTEM_SETUP_BIT_FIELDS = new Set(
	SYSTEM_SETUP_FIELDS.filter((field) => field.type === 'highBit').map((field) => field.name),
)

const GATE_SIGNAL_COIL_BASE_ADDRESS = 10000

const getVsdStatusClassName = (runtimeData) => {
	if (!runtimeData) return 'unknown'
	if (runtimeData.statusBits?.error || runtimeData.statusBits?.immediateStop) return 'error'
	if (runtimeData.statusBits?.warning) return 'warning'
	if (runtimeData.statusBits?.run) return 'running'
	return 'idle'
}

const CategoryIcon = ({ name }) => {
	const commonProps = {
		className: 'category-card-icon',
		viewBox: '0 0 48 48',
		'aria-hidden': true,
		focusable: false,
	}

	if (name === 'systems') {
		return <svg {...commonProps}><path d="M6 24h7l4-10h8l4 20h8l5-10h6M10 18v12M38 18v12" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" /></svg>
	}
	if (name === 'vfds') {
		return <svg {...commonProps}><circle cx="21" cy="24" r="12" fill="none" stroke="currentColor" strokeWidth="3" /><path d="M21 12c5 4 6 8 0 12 6 4 5 8 0 12M21 12c-5 4-6 8 0 12-6 4-5 8 0 12M33 24h9M38 19l5 5-5 5" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" /></svg>
	}
	if (name === 'workstations') {
		return <svg {...commonProps}><circle cx="24" cy="24" r="14" fill="none" stroke="currentColor" strokeWidth="3" /><path d="m24 10 3 10 7 4-7 4-3 10-3-10-7-4 7-4 3-10ZM7 7l4 4M41 7l-4 4" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" /></svg>
	}
	if (name === 'gates') {
		return <svg {...commonProps}><circle cx="24" cy="25" r="14" fill="none" stroke="currentColor" strokeWidth="3" /><path d="M10 25H4m40 0h-6M24 11V5m0 34v4" fill="none" stroke="currentColor" strokeLinecap="round" strokeWidth="3" /><path d="M15 32 33 18" fill="none" stroke="currentColor" strokeLinecap="round" strokeWidth="5" /><path d="M24 11V5h8" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" /></svg>
	}
	if (name === 'modbusDevices') {
		return <svg {...commonProps}><path d="M8 32a16 16 0 1 1 32 0" fill="none" stroke="currentColor" strokeLinecap="round" strokeWidth="3" /><path d="M12 25l-4-2m10-8-2-4m8 3V8m8 7 2-4m6 14 4-2M14 32h20" fill="none" stroke="currentColor" strokeLinecap="round" strokeWidth="2.5" /><path d="m24 32 8-10" fill="none" stroke="currentColor" strokeLinecap="round" strokeWidth="3" /><circle cx="24" cy="32" r="3" fill="currentColor" /></svg>
	}
	if (name === 'peripherals') {
		return <svg {...commonProps}><path d="M24 35V18M18 35h12M20 42h8" fill="none" stroke="currentColor" strokeLinecap="round" strokeWidth="3" /><circle cx="24" cy="12" r="5" fill="none" stroke="currentColor" strokeWidth="3" /><path d="M13 10a16 16 0 0 0 0 8M35 10a16 16 0 0 1 0 8M7 6a23 23 0 0 0 0 16M41 6a23 23 0 0 1 0 16" fill="none" stroke="currentColor" strokeLinecap="round" strokeWidth="2" /></svg>
	}
	if (name === 'extSignals') {
		return <svg {...commonProps}><path d="M7 31c4-10 9-10 13 0s9 10 13 0 6-10 8-5M8 39h32M8 9v30" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" /></svg>
	}
	if (name === 'interfaces') {
		return <svg {...commonProps}><path d="M8 16h12v8h8v8h12M8 32h12v-8" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" /><circle cx="8" cy="16" r="3" fill="currentColor" /><circle cx="8" cy="32" r="3" fill="currentColor" /><circle cx="40" cy="32" r="3" fill="currentColor" /></svg>
	}
	if (name === 'rockhoppers') {
		return <svg {...commonProps}><rect x="11" y="8" width="26" height="32" rx="2" fill="none" stroke="currentColor" strokeWidth="3" /><path d="M16 17h16M16 22l3-3 3 3 3-3 3 3" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" /><path d="M16 29h5m6 0h5M16 34h5m6 0h5" fill="none" stroke="currentColor" strokeLinecap="round" strokeWidth="3" /><path d="M11 14H6m5 10H6m31-10h5m-5 10h5" fill="none" stroke="currentColor" strokeLinecap="round" strokeWidth="2.5" /><circle cx="8" cy="14" r="1.5" fill="currentColor" /><circle cx="40" cy="14" r="1.5" fill="currentColor" /></svg>
	}
	return <svg {...commonProps}><circle cx="24" cy="10" r="4" fill="none" stroke="currentColor" strokeWidth="3" /><circle cx="10" cy="36" r="4" fill="none" stroke="currentColor" strokeWidth="3" /><circle cx="38" cy="36" r="4" fill="none" stroke="currentColor" strokeWidth="3" /><path d="M24 14v10M24 24 10 32M24 24l14 8" fill="none" stroke="currentColor" strokeLinecap="round" strokeWidth="3" /></svg>
}

function App() {
	const serialRef = useRef(null)
	const [isConnected, setIsConnected] = useState(false)
	const [isReading, setIsReading] = useState(false)
	const [greenBoxSetup, setGreenBoxSetup] = useState(null)
	const [systemSetups, setSystemSetups] = useState([])
	const [systemRuntimeData, setSystemRuntimeData] = useState([])
	const [gateSetups, setGateSetups] = useState([])
	const [gateRuntimeData, setGateRuntimeData] = useState([])
	const [vsdSetups, setVsdSetups] = useState([])
	const [vsdRuntimeData, setVsdRuntimeData] = useState([])
	const [workstationSetups, setWorkstationSetups] = useState([])
	const [workstationRuntimeData, setWorkstationRuntimeData] = useState([])
	const [modbusDeviceSetups, setModbusDeviceSetups] = useState([])
	const [modbusDeviceRuntimeData, setModbusDeviceRuntimeData] = useState([])
	const [interfaceSetups, setInterfaceSetups] = useState([])
	const [interfaceRuntimeData, setInterfaceRuntimeData] = useState([])
	const [peripheralSetups, setPeripheralSetups] = useState([])
	const [peripheralRuntimeData, setPeripheralRuntimeData] = useState([])
	const [externalSignalSetups, setExternalSignalSetups] = useState([])
	const [externalSignalRuntime, setExternalSignalRuntime] = useState(null)
	const [globalRuntime, setGlobalRuntime] = useState(null)
	const [rockhopperSetups, setRockhopperSetups] = useState([])
	const [rockhopperRuntimeData, setRockhopperRuntimeData] = useState([])
	const [globalCtrlDeviceSetups, setGlobalCtrlDeviceSetups] = useState([])
	const [communicationStatus, setCommunicationStatus] = useState([])
	const [slaveAddress, setSlaveAddress] = useState(readStoredSlaveAddress)
	const [setupProgress, setSetupProgress] = useState({ loaded: 0, total: HOLDING_REGISTER_READS.length })
	const [setupReloadToken, setSetupReloadToken] = useState(0)
	const [activeCategory, setActiveCategory] = useState(null)
	const [expandedSystems, setExpandedSystems] = useState(() => new Set())
	const [registerPanelMode, setRegisterPanelMode] = useState(null)
	const [registerValueMode, setRegisterValueMode] = useState('dec')

	const setupComplete = setupProgress.total > 0 && setupProgress.loaded >= setupProgress.total

	const getLoadedSetupCount = (categoryId) => {
		if (categoryId === 'systems') return systemSetups.filter(Boolean).length
		if (categoryId === 'gates') return gateSetups.filter(Boolean).length
		if (categoryId === 'vfds') return vsdSetups.filter(Boolean).length
		if (categoryId === 'workstations') return workstationSetups.filter(Boolean).length
		if (categoryId === 'modbusDevices') return modbusDeviceSetups.filter(Boolean).length
		if (categoryId === 'interfaces') return interfaceSetups.filter(Boolean).length
		if (categoryId === 'peripherals') return peripheralSetups.filter(Boolean).length
		if (categoryId === 'extSignals') return externalSignalSetups.filter(Boolean).length
		if (categoryId === 'rockhoppers') return rockhopperSetups.filter(Boolean).length
		if (categoryId === 'globalCtrlDevices') return globalCtrlDeviceSetups.filter(Boolean).length
		return 0
	}

	const resetSetupState = () => {
		setGreenBoxSetup(null)
		setSystemSetups([])
		setSystemRuntimeData([])
		setGateSetups([])
		setGateRuntimeData([])
		setVsdSetups([])
		setVsdRuntimeData([])
		setWorkstationSetups([])
		setWorkstationRuntimeData([])
		setModbusDeviceSetups([])
		setModbusDeviceRuntimeData([])
		setInterfaceSetups([])
		setInterfaceRuntimeData([])
		setPeripheralSetups([])
		setPeripheralRuntimeData([])
		setExternalSignalSetups([])
		setExternalSignalRuntime(null)
		setGlobalRuntime(null)
		setRockhopperSetups([])
		setRockhopperRuntimeData([])
		setGlobalCtrlDeviceSetups([])
		resetSetupData()
		resetRegisterStore()
		setSetupProgress({ loaded: 0, total: HOLDING_REGISTER_READS.length })
	}

	const handleSlaveAddressChange = (event) => {
		const value = Number(event.target.value)
		setSlaveAddress(value)
		localStorage.setItem(MODBUS_SLAVE_ADDRESS_STORAGE_KEY, String(value))
	}

	const handleConnectionChange = (connected) => {
		setIsConnected(connected)
		if (!connected) {
			setIsReading(false)
			resetSetupState()
		}
	}

	const handleModbusError = (error) => {
		console.warn('Modbus communication failed:', error)
		resetSetupState()
	}

	const handleCommunicationStatus = (name, successful, byteCount = 0, error = '') => {
		setCommunicationStatus((current) => [
			...current,
			{ name, successful, byteCount, error },
		].slice(-20))
	}

	const handleSetupProgress = (loaded, total) => {
		setSetupProgress({ loaded, total })
	}

	const handleSetupReload = () => {
		resetSetupState()
		setSetupReloadToken((current) => current + 1)
	}

	const handleGateSignalSimulation = async (gateIndex, enabled) => {
		const coilAddress = GATE_SIGNAL_COIL_BASE_ADDRESS + gateIndex
		const coilValue = enabled ? WRITE_SINGLE_COIL_ON : WRITE_SINGLE_COIL_OFF
		const frame = createWriteSingleCoilFrame(slaveAddress, coilAddress, coilValue)
		const commandName = `Gate ${gateIndex + 1} Signal ${enabled ? 'ON' : 'OFF'}`

		try {
			const response = await serialRef.current.sendAndReceive(frame, 500, WRITE_SINGLE_COIL_RESPONSE_LENGTH)
			const successful = isValidWriteSingleCoilResponse(
				response,
				slaveAddress,
				coilAddress,
				coilValue,
			)
			const errorMessage = successful ? '' : 'Invalid Write Single Coil response'

			handleCommunicationStatus(commandName, successful, response.length, errorMessage)
			if (!successful) console.warn('Gate signal simulation failed:', errorMessage)
		} catch (error) {
			handleCommunicationStatus(commandName, false, 0, error.message)
			console.warn('Gate signal simulation failed:', error)
		}
	}

	// Clears every simulated gate signal with one Write Multiple Coils command.
	const handleClearAllGateSignals = async (gateCount) => {
		if (!gateCount) return

		const frame = createWriteMultipleCoilsFrame(
			slaveAddress,
			GATE_SIGNAL_COIL_BASE_ADDRESS,
			Array(gateCount).fill(false),
		)
		const commandName = 'Clear All Gate Signals'

		try {
			const response = await serialRef.current.sendAndReceive(frame, 500, WRITE_MULTIPLE_COILS_RESPONSE_LENGTH)
			const successful = isValidWriteMultipleCoilsResponse(
				response,
				slaveAddress,
				GATE_SIGNAL_COIL_BASE_ADDRESS,
				gateCount,
			)
			const errorMessage = successful ? '' : 'Invalid Write Multiple Coils response'

			handleCommunicationStatus(commandName, successful, response.length, errorMessage)
			if (!successful) console.warn('Clearing gate signals failed:', errorMessage)
		} catch (error) {
			handleCommunicationStatus(commandName, false, 0, error.message)
			console.warn('Clearing gate signals failed:', error)
		}
	}

	const handleModbusResponse = (response, read, decodedData) => {
		if (!decodedData) return

		if (read.decoder === 'systemSetup') {
			setSystemSetups((current) => {
				const next = [...current]
				next[decodedData.systemIndex] = decodedData.systemSetup
				return next
			})
		} else if (read.decoder === 'systemRuntime') {
			setSystemRuntimeData((current) => {
				const next = [...current]
				next[decodedData.systemIndex] = decodedData.systemRuntime
				return next
			})
		} else if (read.decoder === 'gateSetup') {
			setGateSetups((current) => {
				const next = [...current]
				next[decodedData.gateIndex] = decodedData.gateSetup
				return next
			})
		} else if (read.decoder === 'gateRuntime') {
			setGateRuntimeData((current) => {
				const next = [...current]
				next[decodedData.gateIndex] = decodedData.gateRuntime
				return next
			})
		} else if (read.decoder === 'vsdSetup') {
			setVsdSetups((current) => {
				const next = [...current]
				next[decodedData.vsdIndex] = decodedData.vsdSetup
				return next
			})
		} else if (read.decoder === 'vsdRuntime') {
			setVsdRuntimeData((current) => {
				const next = [...current]
				next[decodedData.vsdIndex] = decodedData.vsdRuntime
				return next
			})
		} else if (read.decoder === 'workstationSetup') {
			setWorkstationSetups((current) => {
				const next = [...current]
				next[decodedData.workstationIndex] = decodedData.workstationSetup
				return next
			})
		} else if (read.decoder === 'workstationRuntime') {
			setWorkstationRuntimeData([...decodedData.workstationRuntimeData])
		} else if (read.decoder === 'modbusDeviceSetup') {
			setModbusDeviceSetups((current) => {
				const next = [...current]
				next[decodedData.modbusDeviceIndex] = decodedData.modbusDeviceSetup
				return next
			})
		} else if (read.decoder === 'modbusDeviceRuntime') {
			setModbusDeviceRuntimeData((current) => {
				const next = [...current]
				next[decodedData.modbusDeviceIndex] = decodedData.modbusDeviceRuntime
				return next
			})
		} else if (read.decoder === 'interfaceSetup') {
			setInterfaceSetups((current) => {
				const next = [...current]
				next[decodedData.interfaceIndex] = decodedData.interfaceSetup
				return next
			})
		} else if (read.decoder === 'interfaceRuntime') {
			setInterfaceRuntimeData((current) => {
				const next = [...current]
				next[decodedData.interfaceIndex] = decodedData.interfaceRuntime
				return next
			})
		} else if (read.decoder === 'peripheralSetup') {
			setPeripheralSetups((current) => {
				const next = [...current]
				next[decodedData.peripheralIndex] = decodedData.peripheralSetup
				return next
			})
		} else if (read.decoder === 'peripheralRuntime') {
			setPeripheralRuntimeData((current) => {
				const next = [...current]
				next[decodedData.peripheralIndex] = decodedData.peripheralRuntime
				return next
			})
		} else if (read.decoder === 'externalSignalSetup') {
			setExternalSignalSetups((current) => {
				const next = [...current]
				next[decodedData.externalSignalIndex] = decodedData.externalSignalSetup
				return next
			})
		} else if (read.decoder === 'externalSignalRuntime') {
			setExternalSignalRuntime(decodedData.externalSignalRuntime)
		} else if (read.decoder === 'globalRuntime') {
			setGlobalRuntime(decodedData.globalRuntime)
		} else if (read.decoder === 'rockhopperSetup') {
			setRockhopperSetups((current) => {
				const next = [...current]
				next[decodedData.rockhopperIndex] = decodedData.rockhopperSetup
				return next
			})
		} else if (read.decoder === 'rockhopperRuntime') {
			setRockhopperRuntimeData((current) => {
				const next = [...current]
				next[decodedData.rockhopperIndex] = decodedData.rockhopperRuntime
				return next
			})
		} else if (read.decoder === 'globalCtrlDeviceSetup') {
			setGlobalCtrlDeviceSetups((current) => {
				const next = [...current]
				next[decodedData.globalCtrlDeviceIndex] = decodedData.globalCtrlDeviceSetup
				return next
			})
		} else {
			setGreenBoxSetup(decodedData)
		}
	}

	const toggleSystemSetup = (index) => {
		setExpandedSystems((current) => {
			const next = new Set(current)
			if (next.has(index)) {
				next.delete(index)
			} else {
				next.add(index)
			}
			return next
		})
	}

	// Toggle the holding/input registers panel; clicking the active button hides it again.
	const toggleRegisterPanel = (mode) => {
		setRegisterPanelMode((current) => (current === mode ? null : mode))
	}

	return (
		<div className="app-container">
			<ModbusManager
				serialRef={serialRef}
				isRunning={isReading}
				slaveAddress={slaveAddress}
				activeCategory={activeCategory}
				setupReloadToken={setupReloadToken}
				onResponse={handleModbusResponse}
				onCommunicationStatus={handleCommunicationStatus}
				onSetupProgress={handleSetupProgress}
				onError={handleModbusError}
			/>
			<header className="app-main-header">
				<div className="header-content">
					<div className="logo-container">
						<div className="logo-wrapper">
							<img src={logo} alt="Ecogate" className="company-logo" />
						</div>
					</div>
					<h1>greenBOX Modbus-Master Tester</h1>
					<div className="header-spacer" />
				</div>
			</header>

			<main className="main-dashboard-grid">
				<aside className="left-panel">
					<section className="panel-section">
						<h2 className="section-title">Connection &amp; Polling</h2>
						<div className="comm-group">
							<SerialManager
								ref={serialRef}
								onConnectionChange={handleConnectionChange}
							/>
							<label className="slave-address-field">
								Modbus slave address
								<input
									type="number"
									min="1"
									max="247"
									value={slaveAddress}
									onChange={handleSlaveAddressChange}
								/>
							</label>
							<div className="reading-controls">
								<button
									className={`button-start-comm${isReading ? ' stop' : ''}`}
									type="button"
									disabled={!isConnected}
									onClick={() => setIsReading(!isReading)}
								>
									{isReading ? 'STOP READING' : 'START READING'}
								</button>
								<button
									className="button-reread-setup"
									type="button"
									disabled={!isConnected || !isReading}
									onClick={handleSetupReload}
								>
									REREAD SETUP
								</button>
							</div>
							<div className="communication-status-window">
								{communicationStatus.length > 0 ? (
									communicationStatus.map((entry, index) => (
										<div className="communication-status-row" key={`${entry.name}-${index}`}>
											<span>
												{entry.name} ...
												{entry.error ? <small className="communication-status-error">{entry.error}</small> : null}
											</span>
												<strong className={entry.successful === null ? 'status-pending' : entry.successful ? 'status-ok' : 'status-false'}>
													{entry.successful === null ? 'WAITING' : entry.error ? 'NO RESPONSE' : `${entry.byteCount} B`}
												</strong>
											</div>
										))
									) : (
										<div className="communication-status-empty">No communication yet</div>
									)}
								</div>
							<div className="version-row">
								<span className="control-label">AdeCom</span>
								<span className="version-value">
									{greenBoxSetup
										? `${greenBoxSetup.adeComVersion}-${formatVersionSuffix(greenBoxSetup.adeComVersionDate)}`
										: '---'}
								</span>
							</div>
							<div className="version-row">
								<span className="control-label">AdeKer</span>
								<span className="version-value">
									{globalRuntime
										? `${globalRuntime.adeKerVersionNumber}-${formatVersionSuffix(globalRuntime.adeKerVersionDate)}`
										: '---'}
								</span>
							</div>
							<div className="register-view-buttons">
								<button
									className={`register-view-button${registerPanelMode === 'holding' ? ' active' : ''}`}
									type="button"
									onClick={() => toggleRegisterPanel('holding')}
								>
									HOLDING REGISTERS
								</button>
								<button
									className={`register-view-button${registerPanelMode === 'input' ? ' active' : ''}`}
									type="button"
									onClick={() => toggleRegisterPanel('input')}
								>
									INPUT REGISTERS
								</button>
							</div>
						</div>
					</section>
				</aside>

				<section className="right-panel">
					<div className="gb-header-panel">
						<div className="gb-header-info">
							<div className="gb-serial-number">
								<span className="gb-serial-label">Serial number</span>
								<strong>
									{greenBoxSetup ? greenBoxSetup.gbSerialNumber + 2000000 : '---'}
								</strong>
							</div>
							<div className="gb-identity">
								<h2 className="gb-name">{greenBoxSetup?.gbName?.trim() || 'greenBOX'}</h2>
								{greenBoxSetup?.gbDescription ? (
									<p className="gb-description">{greenBoxSetup.gbDescription}</p>
								) : null}
							</div>
						</div>
						<GlobalRuntimePanel runtime={globalRuntime} />
						{!setupComplete && (
							<div className="setup-progress">
								<div className="setup-progress-track">
									<div
										className="setup-progress-bar"
										style={{
											width: `${setupProgress.total ? (setupProgress.loaded / setupProgress.total) * 100 : 0}%`,
										}}
									/>
								</div>
								<span className="setup-progress-label">
									Loading setup {setupProgress.loaded}/{setupProgress.total}
								</span>
							</div>
						)}
					</div>

					<nav className="category-card-bar">
						{CATEGORY_DEFINITIONS.map((category) => (
							<button
								key={category.id}
								type="button"
								className={`category-card${activeCategory === category.id ? ' active' : ''}${!category.enabled ? ' disabled' : ''}`}
								disabled={!category.enabled}
								onClick={() => setActiveCategory(category.id)}
							>
								<CategoryIcon name={category.icon} />
								<span className="category-card-name">{category.label}</span>
								<span className="category-card-count">
									<strong>{greenBoxSetup?.[category.countField] ?? 0}</strong>
									<span className="category-card-count-loaded">/{getLoadedSetupCount(category.id)}</span>
								</span>
							</button>
						))}
					</nav>

					<div className="category-content">
						{!activeCategory && (
							<p className="content-placeholder">Select a category above to view its data.</p>
						)}

						{activeCategory === 'systems' && (
							<DeviceCard_SYSTEM
								deviceCount={greenBoxSetup?.numberOfSystems}
								devices={systemSetups}
								runtimeData={systemRuntimeData}
								expandedDevices={expandedSystems}
								onToggle={toggleSystemSetup}
								setupGroups={SYSTEM_SETUP_GROUPS}
								setupBitFields={SYSTEM_SETUP_BIT_FIELDS}
								getFieldShortLabel={getFieldShortLabel}
							/>
						)}

						{activeCategory === 'gates' && (
							<DeviceCard_GATE
								deviceCount={gateSetups.length || greenBoxSetup?.numberOfGates}
								devices={gateSetups}
								runtimeData={gateRuntimeData}
								systemCount={greenBoxSetup?.numberOfSystems}
								systems={systemSetups}
								onSimulateSignal={handleGateSignalSimulation}
								onClearAllSignals={handleClearAllGateSignals}
							/>
						)}

						{activeCategory === 'vfds' && (
							<div className="vsd-card-grid">
								{Array.from({ length: greenBoxSetup?.numberOfVfds || 0 }).map((_, index) => (
									<DeviceCard_VSD
										key={index}
										index={index}
										setup={vsdSetups[index]}
										runtimeData={vsdRuntimeData[index]}
										statusClassName={getVsdStatusClassName(vsdRuntimeData[index])}
									/>
								))}
								{!greenBoxSetup?.numberOfVfds && (
									<p className="content-placeholder">No VSDs reported yet.</p>
								)}
							</div>
						)}

						{activeCategory === 'workstations' && (
							<DeviceCard_WORKSTATION
								deviceCount={greenBoxSetup?.nubmerOfWorkstations}
								workstations={workstationSetups}
								runtimeData={workstationRuntimeData}
							/>
						)}

						{activeCategory === 'modbusDevices' && (
							<DeviceCard_MODBUS_DEVICE
								deviceCount={greenBoxSetup?.numberOfModbusDevices}
								devices={modbusDeviceSetups}
								runtimeData={modbusDeviceRuntimeData}
							/>
						)}

						{activeCategory === 'interfaces' && (
							<DeviceCard_INTERFACE
								deviceCount={greenBoxSetup?.numberOfInterfaces}
								devices={interfaceSetups}
								runtimeData={interfaceRuntimeData}
							/>
						)}

						{activeCategory === 'peripherals' && (
							<div className="peripheral-table-wrapper">
								<table className="peripheral-table">
									<thead>
										<tr>
											<th scope="col">ID</th>
											<th scope="col">Name</th>
											<th scope="col">Value</th>
											<th scope="col">Error</th>
											<th scope="col">Source</th>
											<th scope="col">Multiplier</th>
											<th scope="col">Offset</th>
											<th scope="col">Unit</th>
											<th scope="col">Flags</th>
										</tr>
									</thead>
									<tbody>
										{Array.from({ length: Math.min(greenBoxSetup?.numberOfPeripherals || 0, PERIPHERAL_SETUP_MAX_COUNT) }).map((_, index) => {
											const peripheral = peripheralSetups[index]
											const runtime = peripheralRuntimeData[index]

											return (
												<tr className="peripheral-table-row" key={index}>
													<td className="peripheral-id-cell">{peripheral?.peripheralId ?? '---'}</td>
													<td className="peripheral-name-cell">{peripheral?.name?.trim() || `Peripheral ${index + 1}`}</td>
													<td>{runtime?.signedValue ?? '---'}</td>
													<td>{runtime?.unsignedValue ?? '---'}</td>
														<td>{peripheral?.source?.trim() || '---'}</td>
													<td>{peripheral ? peripheral.multiplier.toFixed(3) : '---'}</td>
													<td>{peripheral ? peripheral.offset.toFixed(3) : '---'}</td>
													<td>{peripheral?.unit?.trim() || '---'}</td>
													<td className="peripheral-flags-cell">
														{peripheral ? Object.entries(peripheral.flags).map(([flag, value]) => (
															<span className={`peripheral-flag-chip ${value ? 'active' : ''}`} key={flag} title={value ? 'ON' : 'OFF'}>
																{flag}
															</span>
														)) : '---'}
													</td>
												</tr>
											)
										})}
									</tbody>
								</table>
								{!greenBoxSetup?.numberOfPeripherals && (
									<p className="content-placeholder">No peripherals reported yet.</p>
								)}
							</div>
						)}

						{activeCategory === 'extSignals' && (
							<div className="external-signal-table-wrapper">
								<table className="external-signal-table">
									<thead>
										<tr>
											<th scope="col">Ref</th>
											<th scope="col">Active</th>
											<th scope="col">Source</th>
											<th scope="col">Fnc</th>
											<th scope="col">Gates</th>
										</tr>
									</thead>
									<tbody>
										{Array.from({ length: Math.min(greenBoxSetup?.nubmberOfExtSignals || 0, EXTERNAL_SIGNAL_SETUP_MAX_COUNT) }).map((_, index) => {
											const signal = externalSignalSetups[index]
											const gateIds = getWorkstationGateIds(signal?.gates)
											const isActive = signal?.ref && externalSignalRuntime?.activeLetters?.includes(signal.ref)

											return (
												<tr className="external-signal-table-row" key={index}>
													<td className="external-signal-ref-cell">{signal?.ref || '---'}</td>
													<td>
														<span className={`external-signal-active-led${isActive ? ' active' : ''}`} />
													</td>
													<td className="external-signal-source-cell">{signal?.source?.trim() || `Signal ${index + 1}`}</td>
													<td>{signal?.functionCode?.trim() || '---'}</td>
													<td className="external-signal-gates-cell">
														{gateIds.length > 0 ? (
															<div className="external-signal-gate-chips">
																{gateIds.map((gateId, gateIndex) => (
																	<span className="external-signal-gate-chip" key={`${gateId}-${gateIndex}`}>
																		{gateId}
																	</span>
																))}
															</div>
														) : '---'}
													</td>
												</tr>
											)
										})}
									</tbody>
								</table>
								{!greenBoxSetup?.nubmberOfExtSignals && (
									<p className="content-placeholder">No external signals reported yet.</p>
								)}
							</div>
						)}

						{activeCategory === 'rockhoppers' && (
							<DeviceCard_ROCKHOPPER
								deviceCount={greenBoxSetup?.numberOfRockhoppers}
								devices={rockhopperSetups}
								runtimeData={rockhopperRuntimeData}
							/>
						)}

						{activeCategory === 'globalCtrlDevices' && (
							<GlobalCtrlDeviceTable
								deviceCount={greenBoxSetup?.numberOfGlobalCtrlDevices}
								devices={globalCtrlDeviceSetups}
							/>
						)}

						{activeCategory && activeCategory !== 'systems' && activeCategory !== 'gates' && activeCategory !== 'vfds' && activeCategory !== 'workstations' && activeCategory !== 'modbusDevices' && activeCategory !== 'interfaces' && activeCategory !== 'peripherals' && activeCategory !== 'extSignals' && activeCategory !== 'rockhoppers' && activeCategory !== 'globalCtrlDevices' && (
							<p className="content-placeholder">Coming soon.</p>
						)}

						{registerPanelMode && activeCategory && (
							<div className="register-panel">
								<div className="register-panel-header">
									<h3 className="register-panel-title">
										{registerPanelMode === 'holding' ? 'Holding Registers' : 'Input Registers'}
										{' · '}
										{CATEGORY_DEFINITIONS.find((category) => category.id === activeCategory)?.label}
									</h3>
									<div className="register-panel-toolbar">
										<span className="register-panel-toolbar-label">Values</span>
										<button
											type="button"
											className={`register-table-mode-button${registerValueMode === 'dec' ? ' active' : ''}`}
											onClick={() => setRegisterValueMode('dec')}
										>
											DECIMAL
										</button>
										<button
											type="button"
											className={`register-table-mode-button${registerValueMode === 'hex' ? ' active' : ''}`}
											onClick={() => setRegisterValueMode('hex')}
										>
											HEX
										</button>
									</div>
								</div>
								{(() => {
									const catalogEntry = REGISTER_CATALOG[activeCategory]?.[registerPanelMode]
									if (!catalogEntry) return <p className="content-placeholder">No data yet.</p>

									const deviceCount = catalogEntry.sharedBlock
										? 1
										: Math.min(
											greenBoxSetup?.[catalogEntry.countField] || 0,
											catalogEntry.maxCount ?? Infinity,
										)

									return (
										<RegisterTablePanel
											space={registerPanelMode}
											deviceCount={deviceCount}
											getAddress={catalogEntry.getAddress}
											registerCount={catalogEntry.registerCount}
											valueMode={registerValueMode}
										/>
									)
								})()}
							</div>
						)}
					</div>
				</section>
			</main>

			<footer className="app-footer">
				greenBOX Modbus-Master Tester (version 1 - 16.9.2026) | Ecogate Inc.
			</footer>
		</div>
	)
}

export default App
