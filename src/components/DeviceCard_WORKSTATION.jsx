import './DeviceCard_WORKSTATION.css'

const WORKSTATION_MODE_LABELS = {
	0: 'No Gates affected',
	1: 'Ext.Sign Affect Gates',
	2: 'All Gates',
}

const getWorkstationGateIds = (gates = []) => {
	const terminatorIndex = gates.indexOf(0)
	return terminatorIndex === -1 ? gates : gates.slice(0, terminatorIndex)
}

const isFlagActive = (value) => value === true || value === 1

function DeviceCard_WORKSTATION({ deviceCount = 0, workstations = [], runtimeData = [] }) {
	return (
		<div className="workstation-table-wrapper">
			<table className="workstation-table">
				<thead>
					<tr>
						<th scope="col">ID</th>
						<th scope="col">Active</th>
						<th scope="col">Force</th>
						<th scope="col">Name</th>
						<th scope="col">Mode</th>
						<th scope="col">Ext</th>
						<th scope="col">Gates[32]</th>
					</tr>
				</thead>
				<tbody>
					{Array.from({ length: deviceCount }).map((_, index) => {
						const workstation = workstations[index]
						const runtime = runtimeData[index]
						const gateIds = getWorkstationGateIds(workstation?.gates)

						return (
							<tr className="workstation-table-row" key={index}>
								<td className="workstation-id-cell">{workstation?.workstationId ?? '---'}</td>
														<td className="workstation-flag-cell">
															<span
																className={`workstation-led workstation-led-active${isFlagActive(runtime?.active) ? ' on' : ''}`}
																title={`Active: ${isFlagActive(runtime?.active) ? 'ON' : 'OFF'}`}
															/>
														</td>
														<td className="workstation-flag-cell">
															<span
																className={`workstation-led workstation-led-force${isFlagActive(runtime?.force) ? ' on' : ''}`}
																title={`Force: ${isFlagActive(runtime?.force) ? 'ON' : 'OFF'}`}
															/>
														</td>
								<td className="workstation-name-cell">
									{workstation?.name?.trim() || `Workstation ${index + 1}`}
								</td>
								<td className="workstation-mode-cell">
									{WORKSTATION_MODE_LABELS[workstation?.mode] ?? workstation?.mode ?? '---'}
								</td>
								<td className="workstation-ext-cell">
									<span
										className={`system-setup-item-value system-setup-bit-value ${workstation?.ext ? 'on' : 'off'}`}
										title={workstation?.ext ? 'ON' : 'OFF'}
									>
										{workstation?.ext ? '✓' : '✕'}
									</span>
								</td>
								<td className="workstation-gates-cell">
									{gateIds.length > 0 ? (
										<div className="workstation-gate-chips">
											{gateIds.map((gateId, gateIndex) => (
												<span className="workstation-gate-chip" key={`${gateId}-${gateIndex}`}>
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
			{!deviceCount && <p className="content-placeholder">No workstations reported yet.</p>}
		</div>
	)
}

export default DeviceCard_WORKSTATION
