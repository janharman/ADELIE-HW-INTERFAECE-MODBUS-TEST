import { INTERFACE_SETUP_MAX_COUNT } from '../modbus/setupSchema_Interface'
import './DeviceCard_INTERFACE.css'

// Compact labels keep the runtime status matrix readable on narrow screens.
const DIGITAL_INPUT_INDICATORS = [
	{ name: 'digitalInput1', label: 'DI 1', description: 'Digital input 1' },
	{ name: 'digitalInput2', label: 'DI 2', description: 'Digital input 2' },
	{ name: 'digitalInput3', label: 'DI 3', description: 'Digital input 3' },
	{ name: 'digitalInput4', label: 'DI 4', description: 'Digital input 4' },
]

const OUTPUT_INDICATORS = [
	{ name: 'relay1', label: 'RLY 1', description: 'Relay 1' },
	{ name: 'relay2', label: 'RLY 2', description: 'Relay 2' },
	{ name: 'relay3', label: 'RLY 3', description: 'Relay 3' },
	{ name: 'relay4', label: 'RLY 4', description: 'Relay 4' },
	{ name: 'semaphoreGreen', label: 'SEM G', description: 'Semaphore green' },
	{ name: 'semaphoreOrange', label: 'SEM O', description: 'Semaphore orange', tone: 'warning' },
	{ name: 'semaphoreRed', label: 'SEM R', description: 'Semaphore red', tone: 'error' },
	{ name: 'semaphoreBuzzer', label: 'BUZZ', description: 'Semaphore buzzer', tone: 'warning' },
]

const POWER_INDICATORS = [
	{ name: 'branchVoltageOk1', label: 'B1 V', description: 'Branch 1 voltage OK' },
	{ name: 'branchVoltageOk2', label: 'B2 V', description: 'Branch 2 voltage OK' },
	{ name: 'branchVoltageOk3', label: 'B3 V', description: 'Branch 3 voltage OK' },
	{ name: 'branchCurrentOk1', label: 'B1 A', description: 'Branch 1 current OK' },
	{ name: 'branchCurrentOk2', label: 'B2 A', description: 'Branch 2 current OK' },
	{ name: 'branchCurrentOk3', label: 'B3 A', description: 'Branch 3 current OK' },
	{ name: 'onboard24VdcOk', label: '24 V', description: 'On-board 24 VDC OK' },
	{ name: 'onboard5VdcOk', label: '5 V', description: 'On-board 5 VDC OK' },
	{ name: 'onboard19VdcOk', label: '19 V', description: 'On-board 19 VDC OK' },
	{ name: 'powerOk1', label: 'PWR 1', description: 'Power OK input 1' },
	{ name: 'powerOk2', label: 'PWR 2', description: 'Power OK input 2' },
]

const WORKING_INDICATORS = [
	{ name: 'ledOk', label: 'LED OK', description: 'LED OK' },
	{ name: 'ledWarning', label: 'LED WARN', description: 'LED warning', tone: 'warning' },
	{ name: 'ledError', label: 'LED ERR', description: 'LED error', tone: 'error' },
	{ name: 'fanOn', label: 'FAN', description: 'Fan on' },
	{ name: 'overtemperature', label: 'OVER TEMP', description: 'Overtemperature', tone: 'error' },
	{ name: 'coolingFan1Rotation', label: 'FAN 1', description: 'Cooling fan 1 rotation' },
	{ name: 'coolingFan2Rotation', label: 'FAN 2', description: 'Cooling fan 2 rotation' },
	{ name: 'terminatingResistor1', label: 'TERM 1', description: 'Port 1 terminating resistor' },
	{ name: 'terminatingResistor2', label: 'TERM 2', description: 'Port 2 terminating resistor' },
	{ name: 'terminatingResistor3', label: 'TERM 3', description: 'Port 3 terminating resistor' },
	{ name: 'buttonLongPress', label: 'BUTTON', description: 'Button pressed for at least 5 seconds' },
]

const RuntimeReading = ({ label, value, unit = '', decimalPlaces = 0 }) => (
	<div className="interface-runtime-reading">
		<span>{label}</span>
		<div><strong>{typeof value === 'number' ? value.toFixed(decimalPlaces) : '---'}</strong><small>{unit}</small></div>
	</div>
)

const IndicatorGroup = ({ label, values, indicators }) => (
	<div className="interface-indicator-group">
		<span className="interface-indicator-caption">{label}</span>
		<div className="interface-indicator-list">
			{indicators.map(({ name, label: indicatorLabel, description, tone = 'normal' }) => {
				const isActive = values?.[name] === 1

				return (
					<span
						className={`interface-indicator ${tone}${isActive ? ' active' : ''}`}
						key={name}
						title={`${description}: ${isActive ? 'ON' : 'OFF'}`}
					>
						{indicatorLabel}
					</span>
				)
			})}
		</div>
	</div>
)

function DeviceCard_INTERFACE({ deviceCount, devices, runtimeData = [] }) {
	const visibleDeviceCount = Math.min(deviceCount || 0, INTERFACE_SETUP_MAX_COUNT)

	return (
		<div className="interface-tile-grid">
			{Array.from({ length: visibleDeviceCount }).map((_, index) => {
				const device = devices[index]
				const runtime = runtimeData[index]

				return (
					<article className="interface-tile" key={index}>
						<header className="interface-tile-header">
							<div>
								<span className="interface-tile-label">Interface {index + 1}</span>
								<strong className="interface-tile-id">{device?.interfaceId ?? '---'}</strong>
							</div>
							<div className="interface-tile-meta">
								<span>Port {device?.port ?? '---'}</span>
								<span>Ver. {device?.version ?? '---'}</span>
							</div>
						</header>
						<section className="interface-setup-section">
							<h3>Setup</h3>
							<table className="interface-branch-table">
								<thead>
									<tr>
										<th>Branch</th>
										<th>Limit</th>
										<th>Timeout</th>
										<th>Term.</th>
										<th>Failure port</th>
										<th>Voltage</th>
										<th>Current</th>
									</tr>
								</thead>
								<tbody>
									{[0, 1, 2].map((branchIndex) => {
										const branch = device?.branches?.[branchIndex]

										return (
											<tr key={branchIndex}>
												<th scope="row">
													<span
														className={`interface-branch-led${runtime?.outputStatus?.[`powerBranch${branchIndex + 1}`] ? ' active' : ''}`}
													/>
													#{branchIndex + 1}
												</th>
												<td>
													{runtime
														? `${runtime.limitCurrents[branchIndex]} mA`
														: branch ? `${branch.limitCurrentAmps.toFixed(1)} A` : '---'}
												</td>
												<td>
													{runtime
														? `${runtime.limitCurrentTimeouts[branchIndex]} s`
														: branch ? `${branch.limitCurrentTimeout} s` : '---'}
												</td>
												<td>{device ? (device.terminatingResistors[branchIndex] ? 'ON' : 'OFF') : '---'}</td>
												<td>{device?.failurePorts?.[branchIndex] ?? '---'}</td>
												<td className="interface-runtime-cell">
													{runtime ? `${runtime.branchVoltages[branchIndex]} mV` : '---'}
												</td>
												<td className="interface-runtime-cell">
													{runtime ? `${runtime.branchCurrents[branchIndex]} mA` : '---'}
												</td>
											</tr>
										)
									})}
								</tbody>
							</table>
						</section>
						<section className="interface-runtime-section">
							<div className="interface-runtime-heading">
								<h3>Runtime Data</h3>
								<div className="interface-communication-status">
									<span>Communication</span>
									<div className="interface-communication-track" aria-hidden="true">
										<span style={{ width: `${Math.min(runtime?.communicationStatus ?? 0, 100)}%` }} />
									</div>
									<strong>{runtime ? `${runtime.communicationStatus}%` : '---'}</strong>
								</div>
							</div>
							<div className="interface-runtime-reading-grid">
								<RuntimeReading label="24 V rail" value={runtime?.power24Voltage} unit="mV" />
								<RuntimeReading label="5 V rail" value={runtime?.power5Voltage} unit="mV" />
								<RuntimeReading label="MCU temp." value={runtime?.mcuTemperature} unit="°C" decimalPlaces={1} />
								<RuntimeReading label="Fan trigger" value={runtime?.fanTriggerTemperature} unit="°C" />
								<RuntimeReading label="PD output" value={runtime?.powerDeliveryVoltageOut} unit="mV" />
								<RuntimeReading label="19 V PSU" value={runtime?.psu19Voltage} unit="mV" />
								<RuntimeReading label="Bandgap ref." value={runtime?.bandgapReference} unit="mV" />
								<RuntimeReading label="VREFH" value={runtime?.vrefhVoltage} unit="mV" />
							</div>
							<div className="interface-runtime-indicators">
								<IndicatorGroup label="Digital inputs" values={runtime?.digitalInputs} indicators={DIGITAL_INPUT_INDICATORS} />
								<IndicatorGroup label="Outputs" values={runtime?.outputStatus} indicators={OUTPUT_INDICATORS} />
								<IndicatorGroup label="Power health" values={runtime?.powerStatus} indicators={POWER_INDICATORS} />
								<IndicatorGroup label="Interface state" values={runtime?.workingBits} indicators={WORKING_INDICATORS} />
							</div>
							<div className="interface-runtime-footer">
								<span>No PC timeout <strong>{runtime?.noPcCommunication?.timeout ?? '---'}</strong></span>
								<span>Raw <strong>{runtime ? `0x${runtime.noPcCommunication.raw.toString(16).padStart(4, '0').toUpperCase()}` : '---'}</strong></span>
								<span>Debug <strong>{runtime ? runtime.debug.join(' · ') : '---'}</strong></span>
							</div>
						</section>
					</article>
				)
			})}
			{visibleDeviceCount === 0 && (
				<p className="content-placeholder">No interfaces reported yet.</p>
			)}
		</div>
	)
}

export default DeviceCard_INTERFACE
