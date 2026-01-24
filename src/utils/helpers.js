import { format, parseISO } from 'date-fns';

export function formatDate(date, formatStr = 'MMM dd, yyyy') {
  if (!date) return '';
  const dateObj = typeof date === 'string' ? parseISO(date) : date;
  try {
    return format(dateObj, formatStr);
  } catch (e) {
    return '';
  }
}

export function formatDateTime(date) {
  if (!date) return '';
  const dateObj = typeof date === 'string' ? parseISO(date) : date;
  try {
    return format(dateObj, 'MMM dd, yyyy HH:mm');
  } catch (e) {
    return '';
  }
}

export function formatCurrency(amount, currency = 'USD') {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
  }).format(amount || 0);
}

// UPDATED: Better initials generation
export function getInitials(name) {
  if (!name) return 'U';
  
  // If it's an email, take the part before @
  if (name.includes('@')) {
    name = name.split('@')[0];
  }

  // Remove extra spaces
  const cleanName = name.trim();
  
  if (cleanName.length === 0) return 'U';

  const parts = cleanName.split(' ');
  
  if (parts.length === 1) {
    return parts[0].slice(0, 2).toUpperCase();
  }
  
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

export function generateId() {
  return Math.random().toString(36).substring(2, 9);
}

export function getStatusColor(status) {
  const colors = {
    upcoming: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
    live: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
    completed: 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300',
    cancelled: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300',
    pending: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300',
    accepted: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
    declined: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300',
  };
  return colors[status] || colors.pending;
}