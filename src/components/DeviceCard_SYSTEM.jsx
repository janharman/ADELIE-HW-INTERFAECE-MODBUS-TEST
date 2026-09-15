import './DeviceCard_SYSTEM.css'

function DeviceCard_SYSTEM({ deviceCount, devices, expandedDevices, onToggle, setupGroups, setupBitFields, getFieldShortLabel }) {
	return (
		<div className="system-panel-list">
			{Array.from({ length: deviceCount || 0 }).map((_, index) => {
				const device = devices[index]
				const isExpanded = expandedDevices.has(index)

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
						<p className="content-placeholder">Runtime data not available yet</p>
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
