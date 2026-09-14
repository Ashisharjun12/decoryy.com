/** Amount in paise (100 paise = ₹1). */
export function formatInr(amountPaise: number) {
  const rupees = amountPaise / 100;
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(rupees);
}

export function addonLineTotalPaise(pricePaise: number, quantity: number) {
  return pricePaise * quantity;
}

export function isFreeAddon(pricePaise: number, quantity: number) {
  return addonLineTotalPaise(pricePaise, quantity) === 0;
}

export function formatCollectionStatus(status: string) {
  if (status === 'not_required') return 'Not required';
  if (status === 'pending') return 'Pending';
  if (status === 'collected_cash') return 'Cash collected';
  if (status === 'collected_online') return 'Paid online';
  return status;
}

export function collectionStatusTone(status: string): 'amber' | 'emerald' | 'muted' {
  if (status === 'pending') return 'amber';
  if (status === 'collected_cash' || status === 'collected_online') return 'emerald';
  return 'muted';
}
