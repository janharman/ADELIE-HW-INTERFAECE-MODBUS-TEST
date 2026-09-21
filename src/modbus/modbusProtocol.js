import {
	READ_HOLDING_REGISTERS,
	READ_INPUT_REGISTERS,
} from './frameDefinitions'

export const calculateModbusCrc = (bytes) => {
	let crc = 0xffff

	for (const byte of bytes) {
		crc ^= byte
		for (let bit = 0; bit < 8; bit += 1) {
			crc = (crc & 0x0001) ? (crc >> 1) ^ 0xa001 : crc >> 1
		}
	}

	return [crc & 0xff, (crc >> 8) & 0xff]
}

export const createReadFrame = (slaveAddress, functionCode, address, count) => {
	const frame = [
		slaveAddress,
		functionCode,
		(address >> 8) & 0xff,
		address & 0xff,
		(count >> 8) & 0xff,
		count & 0xff,
	]

	return [...frame, ...calculateModbusCrc(frame)]
}

export const WRITE_SINGLE_COIL = 0x05
export const WRITE_SINGLE_COIL_OFF = 0x0000
export const WRITE_SINGLE_COIL_ON = 0xff00
export const WRITE_SINGLE_COIL_RESPONSE_LENGTH = 8
export const WRITE_MULTIPLE_COILS = 0x0f
export const WRITE_MULTIPLE_COILS_RESPONSE_LENGTH = 8

export const createWriteSingleCoilFrame = (slaveAddress, address, value) => {
	const frame = [
		slaveAddress,
		WRITE_SINGLE_COIL,
		(address >> 8) & 0xff,
		address & 0xff,
		(value >> 8) & 0xff,
		value & 0xff,
	]

	return [...frame, ...calculateModbusCrc(frame)]
}

export const createWriteMultipleCoilsFrame = (slaveAddress, address, values) => {
	const packedValues = Array.from({ length: Math.ceil(values.length / 8) }, (_, byteIndex) => (
		values.slice(byteIndex * 8, byteIndex * 8 + 8).reduce(
			(byte, value, bitIndex) => byte | (Number(Boolean(value)) << bitIndex),
			0,
		)
	))
	const frame = [
		slaveAddress,
		WRITE_MULTIPLE_COILS,
		(address >> 8) & 0xff,
		address & 0xff,
		(values.length >> 8) & 0xff,
		values.length & 0xff,
		packedValues.length,
		...packedValues,
	]

	return [...frame, ...calculateModbusCrc(frame)]
}

export const matchesSlaveAddress = (response, slaveAddress) => response[0] === slaveAddress

export const isValidReadResponse = (response, frame) => (
	response[1] === frame.functionCode
	&& response[2] === frame.count * 2
)

export const isValidWriteSingleCoilResponse = (response, slaveAddress, address, value) => (
	response.length === WRITE_SINGLE_COIL_RESPONSE_LENGTH
	&& response[0] === slaveAddress
	&& response[1] === WRITE_SINGLE_COIL
	&& (((response[2] << 8) | response[3]) === address)
	&& (((response[4] << 8) | response[5]) === value)
)

export const isValidWriteMultipleCoilsResponse = (response, slaveAddress, address, count) => (
	response.length === WRITE_MULTIPLE_COILS_RESPONSE_LENGTH
	&& response[0] === slaveAddress
	&& response[1] === WRITE_MULTIPLE_COILS
	&& (((response[2] << 8) | response[3]) === address)
	&& (((response[4] << 8) | response[5]) === count)
)

export const getRegister = (response, index) => {
	const byteIndex = 3 + index * 2
	return (response[byteIndex] << 8) | response[byteIndex + 1]
}

export { READ_HOLDING_REGISTERS, READ_INPUT_REGISTERS }
