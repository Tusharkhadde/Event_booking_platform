import { format, parseISO } from 'date-fns';

export function formatDate(date, formatStr = 'MMM dd, yyyy') {
  if (!date) return '';
  const dateObj = typeof date === 'string' ? parseISO(date) : date;
  return format(dateObj, formatStr);
}

export function formatDateTime(date) {
  if (!date) return '';
  const dateObj = typeof date === 'string' ? parseISO(date) : date;
  return format(dateObj, 'MMM dd, yyyy HH:mm');
}

export function formatCurrency(amount, currency = 'USD') {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
  }).format(amount);
}

export function getInitials(name) {
  if (!name) return 'U';
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
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