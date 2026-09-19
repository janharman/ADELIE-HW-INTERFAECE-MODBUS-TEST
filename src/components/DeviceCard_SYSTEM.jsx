import './DeviceCard_SYSTEM.css'

const SYSTEM_STATUS_LABELS = {
	S: 'Stop',
	I: 'Idle',
	D: 'Delay',
	R: 'Running',
	F: 'Delay Off',
	C: 'Cleaning',
	U: 'Clean-Up',
	B: 'Bypass',
	P: 'Full-Power',
	E: 'Error',
	T: 'Test',
	M: 'VFD Manual',
	G: 'External Cleaning',
}

const formatSystemStatus = (status) => {
	if (!status) return '-'
	return SYSTEM_STATUS_LABELS[status] ? `${status} - ${SYSTEM_STATUS_LABELS[status]}` : status
}

// Runtime fields grouped for display, mirroring the setup groups layout below them.
const RUNTIME_DATA_GROUP = [
	{ label: 'Total Time', field: 'totalTime', unit: 's' },
	{ label: 'Run Time', field: 'runningTime', unit: 's' },
	{ label: 'Delay Time', field: 'delayTime', unit: 's' },
	{ label: 'Active Run Signals', field: 'activeRunSignals' },
	{ label: 'Gates Open', field: 'gatesOpen' },
	{ label: 'Gates Requested', field: 'gatesRequested' },
	{ label: 'Gates Error', field: 'gatesError' },
	{ label: 'Vfd Power (Kernel)', field: 'vfdPowerKernelPercent', unit: '%' },
	{ label: 'Cleaning Time', field: 'cleaningTime', unit: 's' },
	{ label: 'Cleaning Zone', field: 'cleaningZone' },
]

const RUNTIME_AIR_GROUP = [
	{ label: 'Required Vel.', field: 'qVel', unit: 'mm/s' },
	{ label: 'Required Vol.', field: 'qVolCubicMetersPerSecond', unit: 'm³/s' },
	{ label: 'Actual Vel.', field: 'aVel', unit: 'mm/s' },
	{ label: 'Actual Vol.', field: 'aVolCubicMetersPerSecond', unit: 'm³/s' },
	{ label: 'Gate Vel.', field: 'gVel', unit: 'mm/s' },
	{ label: 'Gate Vol.', field: 'gVolCubicMetersPerSecond', unit: 'm³/s' },
	{ label: 'Measured Vel.', field: 'mVel', unit: 'mm/s' },
	{ label: 'Measured Vol.', field: 'mVolCubicMetersPerSecond', unit: 'm³/s' },
	{ label: 'Calculated Vel.', field: 'cVel', unit: 'mm/s' },
	{ label: 'Calculated Vol.', field: 'cVolCubicMetersPerSecond', unit: 'm³/s' },
	{ label: 'Volume Surplus', field: 'sVolPercent', unit: '%' },
	{ label: 'Underflow Warning', field: 'systemUnderflowWarningPercent', unit: '%' },
	{ label: 'Overflow Warning', field: 'systemOverflowWarningPercent', unit: '%' },
]

// Zones with an active overflow warning bit, formatted as "0, 3, 7".
const getActiveZones = (zoneOverflowWarningBits = {}) => Object.entries(zoneOverflowWarningBits)
	.filter(([, value]) => value === 1)
	.map(([name]) => name.replace('zone', ''))
	.join(', ')

function DeviceCard_SYSTEM({ deviceCount, devices, runtimeData = [], expandedDevices, onToggle, setupGroups, setupBitFields, getFieldShortLabel }) {
	return (
		<div className="system-panel-list">
			{Array.from({ length: deviceCount || 0 }).map((_, index) => {
				const device = devices[index]
				const runtime = runtimeData[index]
				const isExpanded = expandedDevices.has(index)
				const activeZones = getActiveZones(runtime?.zoneOverflowWarningBits)

				return (
					<div className="system-panel" key={index}>
						<div className="system-panel-header">
							<div className="system-panel-heading">
								<span className="system-panel-id">{device?.systemId ?? '---'}</span>
								<span className="system-panel-character">{device?.systemCharacter || '--'}</span>
								<span className="system-panel-name">
									{device?.systemName?.trim() || `System ${index + 1}`}
								</span>
							</div>
							<button
								type="button"
								className="system-panel-toggle"
								onClick={() => onToggle(index)}
							>
								⚙️
							</button>
						</div>

						{runtime ? (
							<div className="system-runtime-groups">
								<div className="system-runtime-group">
									<span className="system-setup-group-title">Status:</span>
									<span className="system-setup-item">
										<span className="system-setup-item-label">Sts</span>
										<span className="system-setup-item-value">{formatSystemStatus(runtime.status)}</span>
									</span>
									<span className="system-setup-item">
										<span className="system-setup-item-label">Rts</span>
										<span className="system-setup-item-value">{runtime.runTimeStatus || '-'}</span>
									</span>
									<span className="system-setup-item">
										<span className="system-setup-item-label">Warnings</span>
										<span className="system-setup-item-value">{runtime.warnings || '-'}</span>
									</span>
									<span className="system-setup-item">
										<span className="system-setup-item-label">Errors</span>
										<span className="system-setup-item-value">{runtime.errors || '-'}</span>
									</span>
									<span className="system-setup-item">
										<span className="system-setup-item-label">Overflow Zones</span>
										<span className="system-setup-item-value">{activeZones || '-'}</span>
									</span>
								</div>

								<div className="system-runtime-group">
									<span className="system-setup-group-title">Run-Time Data:</span>
									{RUNTIME_DATA_GROUP.map(({ label, field, unit }) => (
										<span className="system-setup-item" key={field}>
											<span className="system-setup-item-label">{label}</span>
											<span className="system-setup-item-value">
												{runtime[field]}{unit ? ` ${unit}` : ''}
											</span>
										</span>
									))}
								</div>

								<div className="system-runtime-group">
									<span className="system-setup-group-title">Air:</span>
									{RUNTIME_AIR_GROUP.map(({ label, field, unit }) => (
										<span className="system-setup-item" key={field}>
											<span className="system-setup-item-label">{label}</span>
											<span className="system-setup-item-value">
												{runtime[field]}{unit ? ` ${unit}` : ''}
											</span>
										</span>
									))}
								</div>

								<div className="system-runtime-group">
									<span className="system-setup-group-title">Monitored Values:</span>
									{runtime.monitorValues.length ? (
										runtime.monitorValues.map((monitorValue, monitorIndex) => (
											<span className="system-setup-item" key={monitorIndex}>
												<span className="system-setup-item-value">{monitorValue.display}</span>
											</span>
										))
									) : (
										<span className="system-setup-item-label">None</span>
									)}
								</div>
							</div>
						) : (
							<p className="content-placeholder">Runtime data not available yet</p>
						)}

						{isExpanded && (
							device ? (
								<div className="system-setup-groups">
									{setupGroups.map((group) => (
										<div className="system-setup-group" key={group.label}>
											<span className="system-setup-group-title">{group.label}:</span>
											{group.fields.map((field) => (
												<span className="system-setup-item" key={field}>
													<span className="system-setup-item-label">
														{getFieldShortLabel(group.label, field)}
													</span>
													{setupBitFields.has(field) ? (
														<span
															className={`system-setup-item-value system-setup-bit-value ${device[field] ? 'on' : 'off'}`}

															title={device[field] ? 'ON' : 'OFF'}
														>
															{device[field] ? '✓' : '✕'}
														</span>
													) : (
														<span className="system-setup-item-value">
															{String(device[field])}
														</span>
													)}
												</span>
											))}
									</div>
								))}
								</div>
							) : (
								<p className="content-placeholder">Setup data not available yet</p>
							)
						)}
					</div>
				)
			})}
			{!deviceCount && (
				<p className="content-placeholder">No systems reported yet.</p>
			)}
		</div>
	)
}

export default DeviceCard_SYSTEM
