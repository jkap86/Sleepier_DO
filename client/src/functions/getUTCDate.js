export const getUTCDate = (date) => {
    // Extract year, month, and day
    let yy = date.getUTCFullYear().toString().slice(-2);  // Get last 2 digits of year
    let mm = String(date.getUTCMonth() + 1).padStart(2, '0');  // Month is 0-indexed, so +1
    let dd = String(date.getUTCDate()).padStart(2, '0');

    // Form the "mm-dd-yy" format
    let formattedDate = `${mm}-${dd}-${yy}`;
    return formattedDate;

}