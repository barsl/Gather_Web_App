export const getFormattedDateStringNumeric = date => {
  return date.toLocaleString('en-CA', {
    year: 'numeric',
    month: 'numeric',
    day: 'numeric',
    hour: 'numeric',
    minute: 'numeric',
  });
};
