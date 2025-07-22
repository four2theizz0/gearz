/**
 * Date utilities for consistent client/server rendering
 * Prevents React hydration errors by using consistent formatting
 */

export const formatDate = (dateString: string | null | undefined): string => {
  if (!dateString) return '-';
  
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return '-';
    
    // Use manual formatting to ensure 100% consistency between server and client
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 
                   'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    
    const month = months[date.getMonth()];
    const day = date.getDate();
    const year = date.getFullYear();
    const hours = date.getHours();
    const minutes = date.getMinutes();
    
    const displayHours = hours === 0 ? 12 : hours > 12 ? hours - 12 : hours;
    const ampm = hours >= 12 ? 'PM' : 'AM';
    const displayMinutes = minutes.toString().padStart(2, '0');
    
    return `${month} ${day}, ${year}, ${displayHours}:${displayMinutes} ${ampm}`;
  } catch (error) {
    return '-';
  }
};

export const formatPickupDay = (pickupDay: string, pickupCustom: string): string => {
  if (pickupDay && !isNaN(Date.parse(pickupDay))) {
    return formatDate(pickupDay);
  }
  if (pickupCustom) return pickupCustom;
  return pickupDay || '-';
};