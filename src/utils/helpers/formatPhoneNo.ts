/**
 * Formats an Indonesian phone number or ID number into a human-readable string.
 *
 * - For mobile numbers starting with "08", formats according to the length:
 *   - 9 digits: 08x-xxx-xxx
 *   - 10 digits: 08xx-xxx-xxx
 *   - 11 digits: 08xx-xxxx-xxx
 *   - 12 digits: 08xx-xxxx-xxxx
 *   - 13 digits: 08xx-xxxx-xxxxx
 * - For landline numbers, detects 3-digit or 4-digit area codes and formats as:
 *   - (areaCode) xxxx xxxx or (areaCode) xxx xxxx
 * - Removes all non-digit characters before formatting.
 * - Truncates numbers longer than 12 digits (except for mobile numbers).
 *
 * @param phoneNo - The phone number or ID number as a string (may contain non-digit characters).
 * @returns The formatted phone number string, or an empty string if input is empty.
 */
export const formatIdNumber = (phoneNo: string) => {
	const threeDigitAreaCodes = ["021", "022", "024", "031", "061"];

	let digits = phoneNo.replace(/\D/g, "");

	if (digits.length === 0) {
		return "";
	}

	if (/^08\d{8,11}$/.test(digits)) {
		switch (digits.length) {
			case 9: // 08x-xxx-xxx
				return `${digits.slice(0, 3)}-${digits.slice(3, 6)}-${digits.slice(6)}`;
			case 10: // 08xx-xxx-xxx
				return `${digits.slice(0, 4)}-${digits.slice(4, 7)}-${digits.slice(7)}`;
			case 11: // 08xx-xxx-xxxx
				return `${digits.slice(0, 4)}-${digits.slice(4, 7)}-${digits.slice(7)}`;
			case 12: // 08xx-xxxx-xxxx
				return `${digits.slice(0, 4)}-${digits.slice(4, 8)}-${digits.slice(8)}`;
			case 13: // 08xx-xxxx-xxxxx
				return `${digits.slice(0, 4)}-${digits.slice(4, 8)}-${digits.slice(8)}`;
			default:
				return digits;
		}
	}

	if (digits.length > 12) {
		digits = digits.slice(0, 12);
	}

	let areaCode = "";
	let localNumber = "";

	if (threeDigitAreaCodes.some((code) => digits.startsWith(code))) {
		areaCode = digits.slice(0, 3);
		localNumber = digits.slice(3);
	} else {
		areaCode = digits.slice(0, 4);
		localNumber = digits.slice(4);
	}

	let formattedNumber = "";
	if (localNumber.length >= 8) {
		formattedNumber = `${localNumber.slice(0, 4)} ${localNumber.slice(4)}`;
	} else {
		formattedNumber = `${localNumber.slice(0, 3)} ${localNumber.slice(3)}`;
	}

	return `(${areaCode}) ${formattedNumber}`;
};
