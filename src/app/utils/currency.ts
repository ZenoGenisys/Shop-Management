export const formatINR = (value: string): string => {
  const numericValue = parseFloat(value);
  return `₹ ${numericValue.toLocaleString('en-IN')}`;
};