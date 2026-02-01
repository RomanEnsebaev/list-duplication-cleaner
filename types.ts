
export interface ProcessingResult {
  originalCount: number;
  cleanedCount: number;
  deletedCount: number;
  cleanedList: string[];
  deletedList: string[];
}

export interface HistoryItem {
  id: string;
  timestamp: number;
  filename?: string;
  originalCount: number;
  deletedCount: number;
}
