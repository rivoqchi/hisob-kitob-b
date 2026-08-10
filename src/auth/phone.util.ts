/** O‘zbekiston mobil: +998 + 9 raqam. */

const UZ_E164 = /^\+998\d{9}$/;

/**
 * Turli formatlarni E.164 (+998XXXXXXXXX) ga keltiradi.
 * Misol: "90 123 45 67", "998901234567", "+998901234567".
 */
export function normalizeUzPhone(input: string): string | null {
  const digits = input.replace(/\D/g, '');

  let national: string;
  if (digits.length === 9) {
    national = digits;
  } else if (digits.length === 12 && digits.startsWith('998')) {
    national = digits.slice(3);
  } else {
    return null;
  }

  if (!/^[0-9]{9}$/.test(national)) {
    return null;
  }

  const e164 = `+998${national}`;
  return UZ_E164.test(e164) ? e164 : null;
}

export function isUzPhone(phone: string): boolean {
  return UZ_E164.test(phone);
}
