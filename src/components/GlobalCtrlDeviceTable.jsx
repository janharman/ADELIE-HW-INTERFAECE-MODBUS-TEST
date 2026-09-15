import { GLOBAL_CTRL_DEVICE_SETUP_MAX_COUNT } from '../modbus/setupSchema_GlobalCtrlDevice'
import './GlobalCtrlDeviceTable.css'

const formatRange = (range) => range?.join(' / ') || '---'

function GlobalCtrlDeviceTable({ deviceCount, devices }) {
	const visibleDeviceCount = Math.min(deviceCount || 0, GLOBAL_CTRL_DEVICE_SETUP_MAX_COUNT)

	return (
		<div className="global-ctrl-device-table-wrapper">
			<table className="global-ctrl-device-table">
				<thead>
					<tr>
						<th scope="col">Ref</th>
						<th scope="col">Source</th>
						<th scope="col">Destination</th>
						<th scope="col">Input Range</th>
						<th scope="col">Output Range</th>
						<th scope="col">Steps</th>
						<th scope="col">Delay</th>
					</tr>
				</thead>
				<tbody>
					{Array.from({ length: visibleDeviceCount }).map((_, index) => {
						const device = devices[index]

						return (
							<tr className="global-ctrl-device-table-row" key={index}>
								<td className="global-ctrl-device-ref-cell">{device?.ref || '---'}</td>
								<td className="global-ctrl-device-spec-cell" title={device?.source || ''}>
									{device?.source?.trim() || `Device ${index + 1}`}
								</td>
								<td className="global-ctrl-device-spec-cell" title={device?.destination || ''}>
									{device?.destination?.trim() || '---'}
								</td>
								<td className="global-ctrl-device-range-cell">{formatRange(device?.inputRange)}</td>
								<td className="global-ctrl-device-range-cell">{formatRange(device?.outputRange)}</td>
								<td>{device?.steps ?? '---'}</td>
								<td>{device?.delay ?? '---'}</td>
							</tr>
						)
					})}
				</tbody>
			</table>
			{visibleDeviceCount === 0 && (
				<p className="content-placeholder">No globally controlled devices reported yet.</p>
			)}
		</div>
	)
}

export default GlobalCtrlDeviceTable