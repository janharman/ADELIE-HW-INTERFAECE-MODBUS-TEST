// Raw Modbus register values, kept independently of the decoded setup/runtime objects.
// Holding (FC 0x03) and input (FC 0x04) registers are separate address spaces, so they get
// their own map even when the same numeric address is reused by both (e.g. Gate setup/runtime).
const stores = {
	holding: new Map(),
	input: new Map(),
}

export const recordRegisters = (space, address, values) => {
	stores[space]?.set(address, values)
}

// Returns the stored block only if it exactly matches the requested address/count - every
// device is read as one contiguous frame, so partial overlaps never need to be resolved here.
export const getRegisters = (space, address, count) => {
	const values = stores[space]?.get(address)
	return values && values.length === count ? values : null
}

export const resetRegisterStore = () => {
	stores.holding.clear()
	stores.input.clear()
}
