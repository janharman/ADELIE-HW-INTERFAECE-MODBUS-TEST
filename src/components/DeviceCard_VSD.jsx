import './DeviceCard_VSD.css'

const STATUS_BIT_CHIPS = [
	{ name: 'enabled', label: 'ENA', description: 'Enabled' },
	{ name: 'ready', label: 'RDY', description: 'Ready' },
	{ name: 'run', label: 'RUN', description: 'Running' },
	{ name: 'manual', label: 'MAN', description: 'Manual mode' },
	{ name: 'localControl', label: 'LOL', description: 'Local control' },
	{ name: 'warning', label: 'WAR', description: 'Warning' },
	{ name: 'error', label: 'ERR', description: 'Error' },
	{ name: 'immediateStop', label: 'IMM', description: 'Immediate stop' },
	{ name: 'automatic', label: 'AUT', description: 'Automatic mode' },
]

const DIGITAL_INPUT_CHIPS = [
	{ name: 'manual', label: 'MAN', description: 'Manual input' },
	{ name: 'automatic', label: 'AUT', description: 'Automatic input' },
	{ name: 'airlockOk', label: 'AIR', description: 'Airlock input' },
	{ name: 'transportOk', label: 'TRA', description: 'Transport input' },
	{ name: 'immediateStop', label: 'IMM', description: 'Immediate stop input' },
	{ name: 'enable', label: 'ENA', description: 'Enable input' },
]

const Reading = ({ label, value, unit, decimalPlaces = 0 }) => {
	const hasValue = typeof value === 'number'
	const displayedValue = hasValue ? value.toFixed(decimalPlaces) : '---'

	return (
		<div className="vsd-reading">
			<span className="vsd-reading-label">{label}</span>
			<div className="vsd-reading-value-row">
				<strong>{displayedValue}</strong>
				<span className="vsd-reading-unit">{unit}</span>
			</div>
		</div>
	)
}

const DeviceCard_VSD = ({ index, setup, runtimeData, statusClassName }) => {
	const parameters = setup?.parameters?.filter((parameter) => parameter !== 0 && parameter !== '0') ?? []
	const hasCommunicationError = runtimeData?.status === 0

	return (
		<article className="vsd-device-card">
			<header className="vsd-card-header">
				<div className="vsd-card-identity">
					<span className="vsd-card-id">{setup?.vsdId ?? '---'}</span>
					<h3>{setup?.name?.trim() || `VSD ${index + 1}`}</h3>
				</div>
				<span className={`vsd-status ${statusClassName}`}>{runtimeData?.statusLabel ?? 'Awaiting data'}</span>
			</header>

			<div className="vsd-runtime-data">
				<div className="vsd-ker-status-grid">
					<div className={`vsd-ker-status ${runtimeData?.kerStatusGroup ?? 'unknown'}`}>
						<strong>{runtimeData?.kerStatusLabel ?? 'UNKNOWN'}</strong>
					</div>
					<Reading label="KerPwrRequest" value={runtimeData?.kerPwrRequest} unit="" />
				</div>

				<div className="vsd-reading-grid">
					<Reading label="Frequency" value={runtimeData?.outputFrequencyHertz} unit="Hz" decimalPlaces={1} />
					<Reading label="Voltage" value={runtimeData?.outputVoltage} unit="V" />
					<Reading label="Power" value={runtimeData?.outputPowerWatts} unit="W" />
					<Reading label="Current" value={runtimeData?.outputCurrent} unit="A" />
				</div>

				<div className="vsd-bit-groups">
					<div className="vsd-status-bits">
						<span className="vsd-bit-caption">STS</span>
						{STATUS_BIT_CHIPS.map(({ name, label, description }) => {
							const isActive = runtimeData?.statusBits?.[name] === 1

							return (
								<span
									className={`vsd-status-bit${isActive ? ' active' : ''}`}
									key={name}
									title={`${description}: ${isActive ? 'On' : 'Off'}`}
								>
									{label}
								</span>
							)
						})}
					</div>
					<div className="vsd-reading-grid vsd-aux-reading-grid">
						<Reading label="Frequency ref" value={runtimeData?.frequencyReferencePercent} unit="%" decimalPlaces={1} />
						<Reading label="Analog input 1" value={runtimeData?.analogInput1} unit="" />
						<Reading label="Analog input 2" value={runtimeData?.analogInput2} unit="" />
						<Reading label="Temperature" value={runtimeData?.temperature} unit="°C" />
					</div>
					<div className="vsd-status-bits">
						<span className="vsd-bit-caption vsd-bit-caption-wide">DIGITAL INPUTS</span>
						{DIGITAL_INPUT_CHIPS.map(({ name, label, description }) => {
							const isActive = runtimeData?.digitalInputs?.[name] === 1

							return (
								<span
									className={`vsd-status-bit${isActive ? ' active' : ''}`}
									key={name}
									title={`${description}: ${isActive ? 'On' : 'Off'}`}
								>
									{label}
								</span>
							)
						})}
					</div>
				</div>

				{hasCommunicationError && (
					<div className="vsd-runtime-invalid" />
				)}
			</div>

			<footer className="vsd-card-setup">
				<div><span>Model</span><strong className="vsd-setup-value">{setup?.model?.trim() || '---'}</strong></div>
				<div className="vsd-card-parameters">
					<span>Params</span>
					<div className="vsd-parameter-chips">
						{parameters.length > 0
							? parameters.map((parameter, parameterIndex) => <span className="vsd-parameter-chip" key={parameterIndex}>{parameter}</span>)
							: <span className="vsd-parameter-chip">---</span>}
					</div>
				</div>
				<div><span>Port</span><strong className="vsd-setup-value">{setup?.port ?? '---'}</strong></div>
				<div><span>Addr</span><strong className="vsd-setup-value">{setup?.address ?? '---'}</strong></div>
			</footer>
		</article>
	)
}

export default DeviceCard_VSD