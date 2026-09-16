import './DeviceCard_MODBUS_DEVICE.css'

function DeviceCard_MODBUS_DEVICE({ deviceCount, devices, runtimeData = [] }) {
	return (
		<div className="modbus-device-table-wrapper">
			<table className="modbus-device-table">
				<thead>
					<tr>
						<th scope="col">ID</th>
						<th scope="col">Name</th>
						<th scope="col">Pressure</th>
						<th scope="col">Temp. A</th>
						<th scope="col">Temp. B</th>
						<th scope="col">Comm</th>
						<th scope="col">Port</th>
						<th scope="col">Addr.</th>
						<th scope="col">Model</th>
					</tr>
				</thead>
				<tbody>
					{Array.from({ length: deviceCount || 0 }).map((_, index) => {
						const runtime = runtimeData[index]

						return (
							<tr className="modbus-device-table-row" key={index}>
								<td className="modbus-device-id-cell">{devices[index]?.modbusDeviceId ?? '---'}</td>
								<td className="modbus-device-name-cell">
									{devices[index]?.name?.trim() || `Modbus Device ${index + 1}`}
								</td>
								<td>{runtime ? `${runtime.pressure} Pa` : '---'}</td>
								<td>{runtime ? `${runtime.temperatureA.toFixed(1)} °C` : '---'}</td>
								<td>{runtime ? `${runtime.temperatureB.toFixed(1)} °C` : '---'}</td>
								<td>{runtime ? `${runtime.communicationStatus}%` : '---'}</td>
								<td>{devices[index]?.port ?? '---'}</td>
								<td>{devices[index]?.address ?? '---'}</td>
								<td>{devices[index]?.model?.trim() || '---'}</td>
							</tr>
						)
					})}
				</tbody>
			</table>
			{!deviceCount && <p className="content-placeholder">No Modbus devices reported yet.</p>}
		</div>
	)
}

export default DeviceCard_MODBUS_DEVICE