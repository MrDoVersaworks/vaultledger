const POW10 = (digits: number) => 10n ** BigInt(digits);

export function parseDecimal(value: string | number, fractionDigits: number): bigint {
  const text = String(value).trim();
  if (!/^-?(?:\d+)(?:\.\d+)?$/.test(text)) {
    throw new Error('Invalid decimal value.');
  }
  const [whole, fraction = ''] = text.split('.');
  if (fraction.length > fractionDigits) {
    throw new Error('Decimal precision exceeds the supported contract.');
  }
  const scale = POW10(fractionDigits);
  const sign = whole.startsWith('-') ? -1n : 1n;
  const wholeDigits = whole.replace('-', '');
  const fractional = (fraction + '0'.repeat(fractionDigits)).slice(0, fractionDigits);
  return sign * (BigInt(wholeDigits) * scale + BigInt(fractional || '0'));
}

export function formatDecimal(value: bigint, fractionDigits: number): string {
  const scale = POW10(fractionDigits);
  const sign = value < 0n ? '-' : '';
  const absolute = value < 0n ? -value : value;
  const whole = absolute / scale;
  const fraction = (absolute % scale).toString().padStart(fractionDigits, '0');
  return sign + whole.toString() + '.' + fraction;
}

export function lineTotalCents(quantity: bigint, unitPrice: bigint, inputScaleDigits = 2): bigint {
  const divisor = POW10(inputScaleDigits * 2 - 2);
  const product = quantity * unitPrice;
  return (product + divisor / 2n) / divisor;
}

export function taxCents(subtotalCents: bigint, taxRate: bigint, taxRateScaleDigits = 2): bigint {
  const divisor = POW10(taxRateScaleDigits + 2);
  return (subtotalCents * taxRate + divisor / 2n) / divisor;
}
