import { Decimal } from "@prisma/client/runtime/library"

function toDecimal(value: string | number | Decimal): Decimal {
  if (value instanceof Decimal) return value
  return new Decimal(value as any)
}

export function addDecimal(a: string | number | Decimal, b: string | number | Decimal): Decimal {
  const da = toDecimal(a)
  const db = toDecimal(b)
  return da.add(db)
}

export function gteDecimal(a: Decimal | number | string, b: Decimal | number | string): boolean {
  const da = toDecimal(a as any)
  const db = toDecimal(b as any)
  return da.greaterThanOrEqualTo(db)
}


