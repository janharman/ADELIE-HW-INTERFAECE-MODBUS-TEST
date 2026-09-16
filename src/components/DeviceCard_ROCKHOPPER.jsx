import { ROCKHOPPER_SETUP_MAX_COUNT } from '../modbus/setupSchema_Rockhopper'
import './DeviceCard_ROCKHOPPER.css'

// Compact labels keep the runtime bit fields readable in dense device tiles.
const DIGITAL_INPUT_INDICATORS = [
	{ name: 'digitalInput1', label: 'DI 1', description: 'Digital input 1' },
	{ name: 'digitalInput2', label: 'DI 2', description: 'Digital input 2' },
	{ name: 'digitalInput3', label: 'DI 3', description: 'Digital input 3' },
	{ name: 'digitalInput4', label: 'DI 4', description: 'Digital input 4' },
	{ name: 'digitalInput5', label: 'REMOTE', description: 'Remote input' },
	{ name: 'digitalInput6', label: 'SAFETY', description: 'Safety input' },
	{ name: 'digitalInput7', label: 'STOP', description: 'Stop input' },
	{ name: 'digitalInput8', label: 'START', description: 'Start input' },
]

const STATUS_INDICATORS = [
	{ name: 'relay1', label: 'RLY 1', description: 'Relay 1' },
	{ name: 'relay2', label: 'RLY 2', description: 'Relay 2' },
	{ name: 'relay3', label: 'RLY 3', description: 'Relay 3' },
	{ name: 'relay4', label: 'RLY 4', description: 'Relay 4' },
	{ name: 'relay5', label: 'RLY 5', description: 'Relay 5' },
	{ name: 'semaphoreGreen', label: 'SEM G', description: 'Semaphore green' },
	{ name: 'semaphoreOrange', label: 'SEM O', description: 'Semaphore orange', tone: 'warning' },
	{ name: 'semaphoreRed', label: 'SEM R', description: 'Semaphore red', tone: 'error' },
	{ name: 'semaphoreBuzzer', label: 'BUZZ', description: 'Semaphore buzzer', tone: 'warning' },
]

const formatValue = (value, unit = '', decimalPlaces = 0, scale = 1) => (
	typeof value === 'number' ? `${(value * scale).toFixed(decimalPlaces)}${unit ? ` ${unit}` : ''}` : '---'
)

const RuntimeReading = ({ label, value, unit = '', decimalPlaces = 0, scale = 1 }) => (
	<div className="rockhopper-runtime-reading">
		<span>{label}</span>
		<div><strong>{typeof value === 'number' ? (value * scale).toFixed(decimalPlaces) : '---'}</strong><small>{unit}</small></div>
	</div>
)

const StatusBit = ({ active, label }) => (
	<span className={`rockhopper-error-bit${active ? ' active' : ''}`} title={`${label}: ${active ? 'FALSE' : 'OK'}`}>
		{active ? 'FALSE' : 'OK'}
	</span>
)

const TerminationBadge = ({ label, active }) => (
	<span className="rockhopper-termination-item">
		<span>{label}</span>
		<strong className={`rockhopper-termination-badge${active ? ' active' : ''}`} title={`${label}: ${active ? 'enabled' : 'disabled'}`}>
			{active ? '✓' : 'X'}
		</strong>
	</span>
)

const IndicatorGroup = ({ label, values, indicators }) => (
	<div className="rockhopper-indicator-group">
		<span className="rockhopper-indicator-caption">{label}</span>
		<div className="rockhopper-indicator-list">
			{indicators.map(({ name, label: indicatorLabel, description, tone = 'normal' }) => {
				const isActive = values?.[name] === 1

				return (
					<span
						className={`rockhopper-indicator ${tone}${isActive ? ' active' : ''}`}
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

function DeviceCard_ROCKHOPPER({ deviceCount, devices, runtimeData = [] }) {
	const visibleDeviceCount = Math.min(deviceCount || 0, ROCKHOPPER_SETUP_MAX_COUNT)

	return (
		<div className="rockhopper-tile-grid">
			{Array.from({ length: visibleDeviceCount }).map((_, index) => {
				const device = devices[index]
				const runtime = runtimeData[index]

				return (
					<article className="rockhopper-tile" key={index}>
						<header className="rockhopper-tile-header">
							<div className="rockhopper-title-row">
								<strong className="rockhopper-tile-id">{device?.rockhopperId ?? '---'}</strong>
								<span className="rockhopper-tile-label">{device?.name?.trim() || `Rockhopper ${index + 1}`}</span>
							</div>
							<div className="rockhopper-termination-status">
								<TerminationBadge label="Master Term." active={device?.terminatingMaster === 1} />
								<TerminationBadge label="Slave Term." active={device?.terminatingSlave === 1} />
							</div>
							<div className="rockhopper-header-communication">
								<span>Comm</span>
								<strong>{runtime ? `${runtime.communicationQuality}%` : '---'}</strong>
							</div>
							<div className="rockhopper-tile-meta">
								<span>Port {device?.port ?? '---'}</span>
								<span>Addr. {device?.address ?? '---'}</span>
								<span>Ver. {device?.version ?? '---'}</span>
							</div>
						</header>

						<section className="rockhopper-runtime-section">
							<table className="rockhopper-sensor-table">
								<thead>
									<tr>
										<th scope="col">Sensor</th>
										<th scope="col">Pressure</th>
										<th scope="col">Pressure Error</th>
										<th scope="col">Current</th>
										<th scope="col">Current Error</th>
									</tr>
								</thead>
								<tbody>
									{[0, 1, 2].map((sensorIndex) => (
										<tr key={sensorIndex}>
											<th scope="row">#{sensorIndex + 1}</th>
											<td className="rockhopper-analog-cell">{formatValue(runtime?.pressureSensors?.[sensorIndex], 'Pa')}</td>
											<td>
												<StatusBit
													active={runtime?.errorBits?.[`pressureSensor${sensorIndex + 1}CommFalse`] === 1}
													label={`Pressure sensor ${sensorIndex + 1} communication`}
												/>
											</td>
											<td className="rockhopper-analog-cell">{formatValue(runtime?.currentSensors?.[sensorIndex], 'mA', 2, 0.001)}</td>
											<td>
												<StatusBit
													active={runtime?.errorBits?.[`currentSensor${sensorIndex + 1}RangeFalse`] === 1}
													label={`Current sensor ${sensorIndex + 1} range`}
												/>
											</td>
										</tr>
									))}
								</tbody>
							</table>

							<div className="rockhopper-runtime-indicators">
								<IndicatorGroup label="Digital inputs" values={runtime?.digitalInputs} indicators={DIGITAL_INPUT_INDICATORS} />
								<IndicatorGroup label="Outputs" values={runtime?.statusBits} indicators={STATUS_INDICATORS} />
							</div>

							<section className="rockhopper-extended-panel">
								<div className="rockhopper-panel-heading">
									<h3>Extended Sensors</h3>
									<div className="rockhopper-panel-errors">
										<span>ExtHiPressure <StatusBit active={runtime?.errorBits?.extHiPressureCommFalse === 1} label="ExtHiPressure communication" /></span>
										<span>Bosch <StatusBit active={runtime?.errorBits?.boschSensorCommFalse === 1} label="Bosch sensor communication" /></span>
									</div>
								</div>
								<div className="rockhopper-runtime-reading-grid">
									<RuntimeReading label="Ext temperature" value={runtime?.extTemperature} unit="°C" decimalPlaces={1} />
									<RuntimeReading label="Ext humidity" value={runtime?.extHumidity} unit="%" decimalPlaces={2} />
									<RuntimeReading label="Ext atm. pressure" value={runtime?.extAtmPressure} unit="kPa" decimalPlaces={2} scale={0.001} />
									<RuntimeReading label="Ext high pressure" value={runtime?.extHiPressure} unit="Pa" />
									<RuntimeReading label="MCU temperature" value={runtime?.mcuTemperature} unit="°C" decimalPlaces={1} />
									<RuntimeReading label="24 VDC" value={runtime?.power24Vdc} unit="V" decimalPlaces={2} scale={0.001} />
									<RuntimeReading label="5 VDC" value={runtime?.power5Vdc} unit="V" decimalPlaces={2} scale={0.001} />
								</div>
							</section>
						</section>
					</article>
				)
			})}
			{visibleDeviceCount === 0 && (
				<p className="content-placeholder">No Rockhoppers reported yet.</p>
			)}
		</div>
	)
}

export default DeviceCard_ROCKHOPPER