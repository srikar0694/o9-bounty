import { format, formatDistanceToNow } from 'date-fns';
import { clsx, type ClassValue } from 'clsx';

export function cn(...inputs: ClassValue[]) {
  return clsx(inputs);
}

export function formatDate(date: string | Date, formatString = 'MMM d, yyyy') {
  return format(new Date(date), formatString);
}

export function formatRelativeDate(date: string | Date) {
  return formatDistanceToNow(new Date(date), { addSuffix: true });
}

export function calculatePoints(basePoints: number, mode: 'rootcause' | 'fix' | 'both'): number {
  switch (mode) {
    case 'rootcause':
      return Math.round(basePoints * 0.1);
    case 'fix':
      return Math.round(basePoints * 0.9);
    case 'both':
      return basePoints;
    default:
      return 0;
  }
}

export function getPointBreakdown(mode: 'rootcause' | 'fix' | 'both') {
  switch (mode) {
    case 'rootcause':
      return { rootcause_pct: 100, fix_pct: 0 };
    case 'fix':
      return { rootcause_pct: 0, fix_pct: 100 };
    case 'both':
      return { rootcause_pct: 10, fix_pct: 90 };
    default:
      return { rootcause_pct: 0, fix_pct: 0 };
  }
}

export function getStatusColor(statusCode: string): string {
  switch (statusCode) {
    case 'open':
      return 'bg-blue-100 text-blue-800';
    case 'in_progress':
      return 'bg-yellow-100 text-yellow-800';
    case 'resolved':
      return 'bg-green-100 text-green-800';
    case 'closed':
      return 'bg-gray-100 text-gray-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
}

export function getPointsColor(size: string): string {
  switch (size) {
    case 'S':
    case 'M':
      return 'bg-green-100 text-green-800';
    case 'L':
    case 'XL':
      return 'bg-yellow-100 text-yellow-800';
    case '2XL':
    case '3XL':
      return 'bg-orange-100 text-orange-800';
    case '4XL':
    case '5XL':
      return 'bg-red-100 text-red-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
}