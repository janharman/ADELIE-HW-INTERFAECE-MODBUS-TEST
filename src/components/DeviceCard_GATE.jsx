import './DeviceCard_GATE.css'

// Priority order used to pick the single most relevant status chip for a gate.
const GATE_STATUS_PRIORITY = [
	{ bit: 'error', label: 'Error', tone: 'error' },
	{ bit: 'opening', label: 'Opening', tone: 'busy' },
	{ bit: 'closing', label: 'Closing', tone: 'busy' },
	{ bit: 'open', label: 'Open', tone: 'ok' },
	{ bit: 'closed', label: 'Closed', tone: 'idle' },
	{ bit: 'manualMode', label: 'Manual', tone: 'warning' },
]

const getGateStatus = (statusBits) => {
	if (!statusBits) return null
	return GATE_STATUS_PRIORITY.find(({ bit }) => statusBits[bit] === 1) ?? null
}

const getCommunicationQualityClass = (communicationStatus) => {
	if (communicationStatus === 0) return 'communication-quality-zero'
	if (communicationStatus > 80) return 'communication-quality-good'
	return 'communication-quality-medium'
}

function DeviceCard_GATE({ deviceCount, devices, runtimeData = [] }) {
	return (
		<div className="gate-table-wrapper">
			<table className="gate-table">
				<colgroup>
					<col className="gate-col-id" />
					<col className="gate-col-mid" />
					<col className="gate-col-signal" />
					<col className="gate-col-standard" />
					<col className="gate-col-standard" />
					<col className="gate-col-name" />
					<col className="gate-col-standard" />
					<col className="gate-col-standard" />
					<col className="gate-col-standard" />
					<col className="gate-col-zone" />
					<col className="gate-col-standard" />
					<col className="gate-col-standard" />
					<col className="gate-col-standard" />
					<col className="gate-col-secondary" />
					<col className="gate-col-secondary" />
					<col className="gate-col-secondary" />
					<col className="gate-col-secondary" />
					<col className="gate-col-runtime" />
				</colgroup>
				<thead>
					<tr>
						<th scope="col">ID</th>
						<th scope="col">MID</th>
						<th scope="col">Sig</th>
						<th scope="col">Op.Req.</th>
						<th scope="col">Status</th>
						<th scope="col">Name</th>
						<th scope="col">PRESSURE</th>
						<th scope="col">Volume</th>
						<th scope="col">Velocity</th>
						<th scope="col">Zone</th>
						<th scope="col">Size</th>
						<th scope="col">Port</th>
						<th scope="col">Addr.</th>
						<th scope="col">Ver.</th>
						<th scope="col">MOD</th>
						<th scope="col">Cal.</th>
						<th scope="col">cQ</th>
					</tr>
				</thead>
				<tbody>
					{Array.from({ length: deviceCount || 0 }).map((_, index) => {
						const device = devices[index]
						const runtime = runtimeData[index]
						const status = getGateStatus(runtime?.gateStatusBits)
						const hasPressureDisplay = Number(device?.version ?? 0) >= 5
						const showPressure = !!runtime && hasPressureDisplay

						return (
							<tr className="gate-table-row" key={index}>
								<td className="gate-id-cell">{device?.gateId ?? '---'}</td>
								<td className="gate-mid-cell">{device?.motorId ?? '---'}</td>
								<td className="gate-signal-cell">
									{runtime?.gateStatusBits?.manualMode ? (
										<span className="gate-signal-manual" title="Manual">M</span>
									) : (
										<span
											className={`gate-signal-indicator ${runtime?.inputStatusBits?.signal ? 'signal-present' : ''}`}
											title="Signal"
										>
											{runtime?.inputStatusBits?.signalActive ? (
												<span className="gate-signal-active" />
											) : null}
										</span>
									)}
								</td>
																<td className="gate-secondary-cell">
																	{runtime?.openRequestLabel ?? '---'}
																</td>
								<td className="gate-secondary-cell">
									{runtime ? (
										<span className={`gate-status-chip ${status?.tone ?? 'unknown'}`}>
											{status?.label ?? 'Unknown'}
										</span>
									) : (
										<span className="gate-runtime-placeholder">---</span>
									)}
								</td>
								<td className="gate-table-name">
									{device?.gateName?.trim() || `Gate ${index + 1}`}
								</td>
									<td className="gate-pressure-cell">
										{showPressure ? (
											<span className="gate-pressure-content">
												<span className="gate-pressure-value">{runtime.pressure ?? 0}</span>
												<span className="gate-pressure-unit">Pa</span>
											</span>
										) : ''}
									</td>
									<td className="gate-secondary-cell">{runtime?.gateAirVolume ?? '---'}</td>
									<td className="gate-secondary-cell">{runtime?.gateAirVelocity ?? '---'} mm/s</td>
								<td className="gate-zone-cell">{device?.zone ?? '---'}</td>
								<td>{device?.size ?? '---'}</td>
								<td>{device?.port ?? '---'}</td>
								<td>{device?.address ?? '---'}</td>
								<td className="gate-secondary-cell">{device?.version ?? '---'}</td>
								<td className="gate-secondary-cell">{device?.openMode ?? '---'}</td>
								<td className="gate-secondary-cell">{device?.calibrationConstant ?? '---'}</td>
								<td className="gate-runtime-cell">
									{runtime ? (
										<span
											className={`gate-communication-quality ${getCommunicationQualityClass(runtime.communicationStatus)}`}
											title="Communication Quality"
										>
											{runtime.communicationStatus}%
										</span>
									) : (
										<span className="gate-runtime-placeholder">Not available yet</span>
									)}
								</td>
							</tr>
						)
					})}
				</tbody>

			</table>
			{!deviceCount && (
				<p className="content-placeholder">No gates reported yet.</p>
			)}
		</div>
	)
}

export default DeviceCard_GATE
