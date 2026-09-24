import { useEffect, useState } from 'react'

import './DeviceCard_GATE.css'

// Priority order used to pick the displayed movement or position status for a gate.
const GATE_STATUS_PRIORITY = [
	{ bit: 'opening', label: 'OPENING', tone: 'busy' },
	{ bit: 'closing', label: 'CLOSING', tone: 'busy' },
	{ bit: 'open', label: 'OPEN', tone: 'ok' },
	{ bit: 'closed', label: 'CLOSE', tone: 'closed' },
]

const getGateStatus = (statusBits) => {
	if (!statusBits) return null

	const status = GATE_STATUS_PRIORITY.find(({ bit }) => statusBits[bit] === 1) ?? null
	return {
		label: status?.label ?? 'UNKNOWN',
		tone: status?.tone ?? 'unknown',
		hasError: statusBits.error === 1,
	}
}

const getCommunicationQualityClass = (communicationStatus) => {
	if (communicationStatus === 0) return 'communication-quality-zero'
	if (communicationStatus > 80) return 'communication-quality-good'
	return 'communication-quality-medium'
}


const getSystemButtonLabel = (system) => (
	system?.systemCharacter?.trim() || '--'
)

const isGateLinkedToActiveSystem = (device, activeSystemIndexes) => {
	const linkedSystems = Number(device?.linkedSystems ?? 0)
	if (!linkedSystems) return false

	return Array.from(activeSystemIndexes).some((systemIndex) => ((linkedSystems >> systemIndex) & 1) === 1)
}

function DeviceCard_GATE({ deviceCount, devices, runtimeData = [], systemCount = 0, systems = [], onSimulateSignal, onClearAllSignals }) {
	const [activeSystemIndexes, setActiveSystemIndexes] = useState(() => new Set(
		Array.from({ length: systemCount || 0 }, (_, index) => index),
	))
	const systemButtons = Array.from({ length: systemCount || 0 }, (_, index) => ({
		key: `system-${index}`,
		index,
		label: getSystemButtonLabel(systems[index]),
	}))
	const allSystemsActive = systemButtons.length > 0 && systemButtons.every((button) => activeSystemIndexes.has(button.index))
	const visibleGateIndexes = Array.from({ length: deviceCount || 0 }, (_, index) => index)
		.filter((index) => allSystemsActive || isGateLinkedToActiveSystem(devices[index], activeSystemIndexes))

	useEffect(() => {
		setActiveSystemIndexes(new Set(systemButtons.map((button) => button.index)))
	}, [systemCount])

	const toggleSystemButton = (index) => {
		setActiveSystemIndexes((current) => {
			const next = new Set(current)
			if (next.has(index)) {
				next.delete(index)
			} else {
				next.add(index)
			}
			return next
		})
	}

	const toggleAllSystemButtons = () => {
		setActiveSystemIndexes((current) => {
			const isEverySystemActive = systemButtons.length > 0 && systemButtons.every((button) => current.has(button.index))
			if (isEverySystemActive) return new Set()
			return new Set(systemButtons.map((button) => button.index))
		})
	}

	return (
		<div className="gate-table-wrapper">
			<div className="gate-toolbar">
				<div className="gate-system-button-group">
					{systemButtons.map((button) => (
						<button
							className={`gate-system-button ${activeSystemIndexes.has(button.index) ? 'active' : ''}`}
							type="button"
							key={button.key}
							onClick={() => toggleSystemButton(button.index)}
						>
							{button.label}
						</button>
					))}
					<button
						className={`gate-system-button gate-system-button-all ${allSystemsActive ? 'active' : ''}`}
						type="button"
						onClick={toggleAllSystemButtons}
					>
						ALL
					</button>
				</div>
				<button
					className="gate-toolbar-button"
					type="button"
					disabled={!deviceCount || !onClearAllSignals}
					onClick={() => onClearAllSignals?.(deviceCount)}
				>
					Clear All Signals
				</button>
			</div>
			<table className="gate-table">
				<colgroup>
					<col className="gate-col-id" />
					<col className="gate-col-mid" />
					<col className="gate-col-sim" />
					<col className="gate-col-signal" />
					<col className="gate-col-standard" />
					<col className="gate-col-standard" />
					<col className="gate-col-error" />
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
						<th scope="col">Sim</th>
						<th scope="col">Sig</th>
						<th scope="col">Op.Req.</th>
						<th scope="col">Status</th>
						<th scope="col">E</th>
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
					{visibleGateIndexes.map((index) => {
						const device = devices[index]
						const runtime = runtimeData[index]
						const status = getGateStatus(runtime?.gateStatusBits)
							const simulatedSignal = runtime?.gateStatusBits?.simulatedSignal === 1
						const hasPressureDisplay = Number(device?.version ?? 0) >= 5
						const showPressure = !!runtime && hasPressureDisplay

						return (
							<tr className="gate-table-row" key={index}>
								<td className="gate-id-cell">{device?.gateId ?? '---'}</td>
								<td className="gate-mid-cell">{device?.motorId ?? '---'}</td>
								<td className="gate-sim-cell">
									<button
										className={`gate-sim-button ${simulatedSignal ? 'active' : ''}`}
										type="button"
										title="Simulate signal"
										disabled={!onSimulateSignal}
										onClick={() => onSimulateSignal?.(index, !simulatedSignal)}
									>
										S
									</button>
								</td>
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
											{status?.label ?? 'UNKNOWN'}
										</span>
									) : (
										<span className="gate-runtime-placeholder">---</span>
									)}
								</td>
								<td className="gate-error-cell">
									{status?.hasError ? <span className="gate-error-badge">E</span> : null}
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
