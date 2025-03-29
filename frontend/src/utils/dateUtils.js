/**
 * Date utility functions for the application
 */

/**
 * Checks if a date is from the current year
 * @param {string|Date} date - The date to check (Date object or ISO string)
 * @returns {boolean} - True if the date is from the current year, false otherwise
 */
export const isCurrentYear = (date) => {
  if (!date) return false;

  const currentYear = new Date().getFullYear();
  let dateYear;

  if (date instanceof Date) {
    dateYear = date.getFullYear();
  } else {
    // If it's a string, convert to Date
    dateYear = new Date(date).getFullYear();
  }

  return dateYear === currentYear;
};

/**
 * Checks if a record is editable based on its date
 * This function specifically checks if the record is from the current year
 * @param {Object} record - The record to check
 * @param {string} dateField - The name of the date field in the record (default: 'date')
 * @returns {boolean} - True if the record is editable, false otherwise
 */
export const isRecordEditable = (record, dateField = "date") => {
  if (!record || !record[dateField]) return false;

  return isCurrentYear(record[dateField]);
};

/**
 * For records with month and year fields instead of a date field
 * @param {Object} record - The record with month and year fields
 * @returns {boolean} - True if the record is from the current year, false otherwise
 */
export const isYearlyRecordEditable = (record) => {
  if (!record || !record.year) return false;

  const currentYear = new Date().getFullYear().toString();
  return record.year === currentYear;
};

/**
 * Formats a number to show a limited number of decimal places
 * @param {number} value - The number to format
 * @param {number} decimalPlaces - Number of decimal places to display (default: 2)
 * @returns {string} - The formatted number with the specified decimal places
 */
export const formatDecimal = (value, decimalPlaces = 2) => {
  if (value === null || value === undefined || isNaN(value)) {
    return "0";
  }

  // Convert to number if it's a string
  const numValue = typeof value === "string" ? parseFloat(value) : value;

  // Format to fixed decimal places
  return numValue.toFixed(decimalPlaces);
};
