import './DeviceCard_GATE.css'

function DeviceCard_GATE({ deviceCount, devices }) {
	return (
		<div className="gate-table-wrapper">
			<table className="gate-table">
				<colgroup>
					<col className="gate-col-id" />
					<col className="gate-col-mid" />
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

						return (
							<tr className="gate-table-row" key={index}>
								<td className="gate-id-cell">{device?.gateId ?? '---'}</td>
								<td className="gate-mid-cell">{device?.motorId ?? '---'}</td>
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
								<td className="gate-runtime-placeholder">Not available yet</td>
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
