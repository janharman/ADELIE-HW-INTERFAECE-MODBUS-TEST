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

function DeviceCard_GATE({ deviceCount, devices, runtimeData = [] }) {
	return (
		<div className="gate-table-wrapper">
			<table className="gate-table">
				<colgroup>
					<col className="gate-col-id" />
					<col className="gate-col-mid" />
					<col className="gate-col-standard" />
					<col className="gate-col-standard" />
					<col className="gate-col-name" />
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
						<th scope="col">Status</th>
						<th scope="col">PRESSURE</th>
						<th scope="col">Name</th>
						<th scope="col">Zone</th>
						<th scope="col">Size</th>
						<th scope="col">Port</th>
						<th scope="col">Addr.</th>
						<th scope="col">Ver.</th>
						<th scope="col">Opn.Mode</th>
						<th scope="col">Air.Vel.</th>
						<th scope="col">Cal.</th>
						<th scope="col">Runtime Data</th>
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
								<td className="gate-secondary-cell">
									{runtime ? (
										<span className={`gate-status-chip ${status?.tone ?? 'unknown'}`}>
											{status?.label ?? 'Unknown'}
										</span>
									) : (
										<span className="gate-runtime-placeholder">---</span>
									)}
								</td>
								<td className="gate-pressure-cell">
									{showPressure ? (
										<span className="gate-pressure-content">
											<span className="gate-pressure-value">{runtime.pressure ?? 0}</span>
											<span className="gate-pressure-unit">Pa</span>
										</span>
									) : ''}
								</td>
								<td className="gate-table-name">
									{device?.gateName?.trim() || `Gate ${index + 1}`}
								</td>
								<td className="gate-zone-cell">{device?.zone ?? '---'}</td>
								<td>{device?.size ?? '---'}</td>
								<td>{device?.port ?? '---'}</td>
								<td>{device?.address ?? '---'}</td>
								<td className="gate-secondary-cell">{device?.version ?? '---'}</td>
								<td className="gate-secondary-cell">{device?.openMode ?? '---'}</td>
								<td className="gate-secondary-cell">{device?.airVelocity ?? '---'}</td>
								<td className="gate-secondary-cell">{device?.calibrationConstant ?? '---'}</td>
								<td className="gate-runtime-cell">
									{runtime ? (
										<div className="gate-runtime-summary">
											<span className="gate-runtime-value" title="Blade position">
												{runtime.position}%
											</span>
											<span className="gate-runtime-value" title="Motor current">
												{runtime.current} mA
											</span>
											<span className="gate-runtime-value" title="Communication status">
												Comm {runtime.communicationStatus}%
											</span>
										</div>
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
