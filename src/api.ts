import { PressItem } from './types';
import { pressItems as mockItems } from './data/mockData';

export async function fetchPressItems(): Promise<PressItem[]> {
  try {
    const res = await fetch('/api/press-items');
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    return data.length > 0 ? data : mockItems;
  } catch {
    return mockItems;
  }
}

export async function triggerAnalysis(): Promise<{ itemsGenerated: number }> {
  const res = await fetch('/api/analyze', { method: 'POST' });
  if (!res.ok) throw new Error('Analysis failed');
  return res.json();
}
