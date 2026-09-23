/**
 * Utility functions for CFA currency formatting
 */

export const CURRENCY_LABEL = 'FCFA';

export const formatCFA = (amount: number): string => {
  if (isNaN(amount) || amount === null || amount === undefined) {
    return `0 ${CURRENCY_LABEL}`;
  }
  // CFA does not use fractional cents/centimes in daily commerce
  const rounded = Math.round(amount);
  return `${rounded.toLocaleString('fr-FR')} ${CURRENCY_LABEL}`;
};

export const formatCFAShort = (amount: number): string => {
  if (isNaN(amount)) return `0 ${CURRENCY_LABEL}`;
  const rounded = Math.round(amount);
  if (Math.abs(rounded) >= 1_000_000) {
    return `${(rounded / 1_000_000).toFixed(1)}M ${CURRENCY_LABEL}`;
  }
  if (Math.abs(rounded) >= 1_000) {
    return `${(rounded / 1_000).toFixed(0)}k ${CURRENCY_LABEL}`;
  }
  return `${rounded.toLocaleString('fr-FR')} ${CURRENCY_LABEL}`;
};
