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

export const matchesSlaveAddress = (response, slaveAddress) => response[0] === slaveAddress

export const isValidReadResponse = (response, frame) => (
	response[1] === frame.functionCode
	&& response[2] === frame.count * 2
)

export const getRegister = (response, index) => {
	const byteIndex = 3 + index * 2
	return (response[byteIndex] << 8) | response[byteIndex + 1]
}

export { READ_HOLDING_REGISTERS, READ_INPUT_REGISTERS }
