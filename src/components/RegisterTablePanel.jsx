import './RegisterTablePanel.css'
import { getRegisters } from '../modbus/registerStore'

const COLUMNS_PER_ROW = 10

// Split a system's register block into fixed-width rows for the table view.
const buildRegisterRows = (baseAddress, registers) => {
	const rows = []

	for (let offset = 0; offset < registers.length; offset += COLUMNS_PER_ROW) {
		rows.push({
			address: baseAddress + offset,
			values: registers.slice(offset, offset + COLUMNS_PER_ROW),
		})
	}

	return rows
}

const formatValue = (value, valueMode) => (
	valueMode === 'hex'
		? `0x${value.toString(16).toUpperCase().padStart(4, '0')}`
		: value.toString(10)
)

// Generic viewer for Modbus registers (holding or input): looks up each device's raw registers
// directly from the shared register store (see modbus/registerStore.js), so it works for any
// category described in modbus/registerCatalog.js without touching the setup/runtime decoders.
function RegisterTablePanel({ space, deviceCount, getAddress, registerCount, valueMode }) {
	const blocks = Array.from({ length: deviceCount || 0 }, (_, index) => {
		const address = getAddress(index)
		const values = getRegisters(space, address, registerCount)
		return values ? { index, address, values } : null
	}).filter(Boolean)

	return (
		<div className="register-table-panel">
			{blocks.length === 0 && (
				<p className="content-placeholder">No registers loaded yet.</p>
			)}

			{blocks.map((block) => (
				<div className="register-table-device-block" key={block.index}>
					<h4 className="register-table-device-title">
						Device #{block.index + 1} · base address {block.address}
					</h4>
					<div className="register-table-wrapper">
						<table className="register-table">
							<thead>
								<tr>
									<th scope="col">Address (dec / hex)</th>
									{Array.from({ length: COLUMNS_PER_ROW }).map((_, columnIndex) => (
										<th scope="col" key={columnIndex}>+{columnIndex}</th>
									))}
								</tr>
							</thead>
							<tbody>
								{buildRegisterRows(block.address, block.values).map((row) => (
									<tr key={row.address}>
										<td className="register-table-address-cell">
											{row.address} / 0x{row.address.toString(16).toUpperCase()}
										</td>
										{row.values.map((value, columnIndex) => (
											<td className="register-table-value-cell" key={columnIndex}>
												{formatValue(value, valueMode)}
											</td>
										))}
									</tr>
								))}
							</tbody>
						</table>
					</div>
				</div>
			))}
		</div>
	)
}

export default RegisterTablePanel
