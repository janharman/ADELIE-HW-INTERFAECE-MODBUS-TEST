import './GlobalRuntimePanel.css'

const formatHex = (value, width = 4) => `0x${(value >>> 0).toString(16).padStart(width, '0').toUpperCase()}`

function GlobalRuntimePanel({ runtime }) {
	const semaphore = runtime?.semaphore

	return (
		<div className="global-runtime-panels">
			<div className="global-runtime-status-panel">
				<div className="global-runtime-value">
					<span>Global Error</span>
					<strong className={`global-runtime-bits${runtime?.globalError ? ' has-value' : ''}`}>
						{runtime ? runtime.globalErrorBits : '---'}
					</strong>
				</div>
				<div className="global-runtime-value">
					<span>Global Warning</span>
					<strong className={`global-runtime-bits${runtime?.globalWarning ? ' has-value' : ''}`}>
						{runtime ? runtime.globalWarningBits : '---'}
					</strong>
				</div>
				<div className="global-runtime-value">
					<span>Global Status</span>
					<strong className={`global-runtime-bits${runtime?.globalStatus ? ' has-value' : ''}`}>
						{runtime ? runtime.globalStatusBits : '---'}
					</strong>
				</div>
			</div>

			<div className="global-semaphore" title="Kernel semaphore">
				{[
					['Red', 'red'],
					['Orange', 'orange'],
					['Green', 'green'],
					['Buzzer', 'buzzer'],
				].map(([label, key]) => (
					<div className={`semaphore-light ${key}${semaphore?.[key] ? ' active' : ''}`} key={key}>
						<span className="semaphore-bulb" />
						<span>{label}</span>
					</div>
				))}
			</div>

			<div className="global-runtime-version-panel">
				<div className="global-runtime-value">
					<span>Record Version</span>
					<strong>{runtime ? runtime.recordVersion : '---'}</strong>
				</div>
				<div className="global-runtime-value">
					<span>Json setup version</span>
					<strong>{runtime ? runtime.jsonSetupVersion : '---'}</strong>
				</div>
			</div>
		</div>
	)
}

export default GlobalRuntimePanel