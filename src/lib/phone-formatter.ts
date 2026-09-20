/**
 * Phone Number Auto-Formatter Utility for OBEFF IMS
 * Formats numbers dynamically based on country dial code as the user types.
 */

export function cleanDigits(input: string, stripLeadingZero = true): string {
  const digits = input.replace(/\D/g, '');
  if (stripLeadingZero && digits.startsWith('0')) {
    return digits.slice(1);
  }
  return digits;
}

/**
 * Format local digits according to country dial code conventions
 */
export function formatPhoneNumber(rawInput: string, countryCode: string): string {
  if (!rawInput) return '';

  const digits = cleanDigits(rawInput);

  switch (countryCode) {
    case '+234': {
      // Nigeria: 10 digits without leading 0 -> XXX XXX XXXX (e.g. 708 005 5637)
      const capped = digits.slice(0, 10);
      if (capped.length <= 3) return capped;
      if (capped.length <= 6) return `${capped.slice(0, 3)} ${capped.slice(3)}`;
      return `${capped.slice(0, 3)} ${capped.slice(3, 6)} ${capped.slice(6)}`;
    }

    case '+1': {
      // US & Canada: 10 digits -> XXX XXX XXXX (e.g. 555 123 4567)
      const capped = digits.slice(0, 10);
      if (capped.length <= 3) return capped;
      if (capped.length <= 6) return `${capped.slice(0, 3)} ${capped.slice(3)}`;
      return `${capped.slice(0, 3)} ${capped.slice(3, 6)} ${capped.slice(6)}`;
    }

    case '+44': {
      // United Kingdom: 10 digits without leading 0 -> XXXX XXXXXX (e.g. 7700 900123)
      const capped = digits.slice(0, 10);
      if (capped.length <= 4) return capped;
      return `${capped.slice(0, 4)} ${capped.slice(4)}`;
    }

    case '+233': // Ghana: 9 digits -> XX XXX XXXX
    case '+27':  // South Africa: 9 digits -> XX XXX XXXX
    case '+254': // Kenya: 9 digits -> XXX XXX XXX
    case '+237': // Cameroon: 9 digits -> XXX XXX XXX
    case '+225': { // Cote d'Ivoire: 10 digits -> XX XX XX XX XX
      if (countryCode === '+225') {
        const capped = digits.slice(0, 10);
        return capped.match(/.{1,2}/g)?.join(' ') || capped;
      }
      const capped = digits.slice(0, 9);
      if (capped.length <= 3) return capped;
      if (capped.length <= 6) return `${capped.slice(0, 3)} ${capped.slice(3)}`;
      return `${capped.slice(0, 3)} ${capped.slice(3, 6)} ${capped.slice(6)}`;
    }

    default: {
      // Generic international chunking: 3-3-4
      const capped = digits.slice(0, 12);
      if (capped.length <= 3) return capped;
      if (capped.length <= 6) return `${capped.slice(0, 3)} ${capped.slice(3)}`;
      if (capped.length <= 10) return `${capped.slice(0, 3)} ${capped.slice(3, 6)} ${capped.slice(6)}`;
      return `${capped.slice(0, 3)} ${capped.slice(3, 6)} ${capped.slice(6, 10)} ${capped.slice(10)}`;
    }
  }
}

/**
 * Parses an existing full phone string (e.g. "+234 803 000 0001") into country code and local formatted number
 */
export function parsePhoneNumber(fullPhone?: string): { countryCode: string; phoneNumber: string } {
  if (!fullPhone) {
    return { countryCode: '+234', phoneNumber: '' };
  }

  const trimmed = fullPhone.trim();
  const match = trimmed.match(/^(\+\d{1,4})\s*(.*)$/);

  if (match) {
    const code = match[1];
    const local = match[2];
    return {
      countryCode: code,
      phoneNumber: formatPhoneNumber(local, code),
    };
  }

  return {
    countryCode: '+234',
    phoneNumber: formatPhoneNumber(trimmed, '+234'),
  };
}
