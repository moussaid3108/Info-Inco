import { PressItem } from './types';
import { pressItems as mockItems } from './data/mockData';

export async function fetchPressItems(date?: string): Promise<PressItem[]> {
  try {
    const url = date ? `/api/press-items?date=${date}` : '/api/press-items';
    const res = await fetch(url);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    return data.length > 0 ? data : (date ? [] : mockItems);
  } catch {
    return date ? [] : mockItems;
  }
}

export async function fetchAvailableDates(): Promise<string[]> {
  try {
    const res = await fetch('/api/dates');
    if (!res.ok) return [];
    return res.json();
  } catch {
    return [];
  }
}

export async function triggerAnalysis(): Promise<{ itemsGenerated: number }> {
  // /api/refresh : purge les anciens articles + force une nouvelle analyse
  const res = await fetch('/api/refresh', { method: 'POST' });
  if (!res.ok) throw new Error('Analysis failed');
  return res.json();
}

export async function fetchSourceCounts(): Promise<Record<string, number>> {
  try {
    const res = await fetch('/api/sources');
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return res.json();
  } catch {
    return {};
  }
}
