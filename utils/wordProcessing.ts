
import { ProcessingResult } from '../types';

export const processWords = (
  text: string, 
  caseSensitive: boolean = false, 
  smartDedupe: boolean = false
): ProcessingResult => {
  // Split by newline, comma, or semicolon and trim whitespace
  const rawWords = text
    .split(/[\n,;]+/)
    .map(word => word.trim())
    .filter(word => word.length > 0);

  const seen = new Set<string>();
  const initialCleaned: string[] = [];
  const standardDeleted: string[] = [];

  // Step 1: Standard deduplication
  rawWords.forEach(word => {
    const compareKey = caseSensitive ? word : word.toLowerCase();
    if (seen.has(compareKey)) {
      standardDeleted.push(word);
    } else {
      seen.add(compareKey);
      initialCleaned.push(word);
    }
  });

  if (!smartDedupe) {
    return {
      originalCount: rawWords.length,
      cleanedCount: initialCleaned.length,
      deletedCount: standardDeleted.length,
      cleanedList: initialCleaned,
      deletedList: standardDeleted,
    };
  }

  // Step 2: Smart deduplication (Composite check)
  // If "word A word B" exists, remove standalone "word A" and "word B"
  const finalCleaned: string[] = [];
  const smartDeleted: string[] = [...standardDeleted];
  
  // Create a set for fast lookup of the unique items
  const uniqueItemsSet = new Set(caseSensitive ? initialCleaned : initialCleaned.map(w => w.toLowerCase()));
  
  // Identify components to remove
  const componentsToRemove = new Set<string>();
  
  initialCleaned.forEach(line => {
    const parts = line.split(/\s+/).filter(p => p.length > 0);
    if (parts.length > 1) {
      // This is a composite. Check if its parts exist as separate lines.
      parts.forEach(part => {
        const partKey = caseSensitive ? part : part.toLowerCase();
        if (uniqueItemsSet.has(partKey)) {
          componentsToRemove.add(partKey);
        }
      });
    }
  });

  initialCleaned.forEach(line => {
    const lineKey = caseSensitive ? line : line.toLowerCase();
    if (componentsToRemove.has(lineKey)) {
      // Check if this line itself is a composite that we want to keep
      // Logic: only remove it if it's an "atomic" part of a larger phrase
      // but we need to make sure we don't delete a composite that is a part of an even LARGER composite 
      // unless that's intended. The user said: "delete contained words".
      
      const parts = line.split(/\s+/);
      if (parts.length === 1) {
        smartDeleted.push(line);
      } else {
        // If it's a phrase itself, we keep it unless the user meant recursive deletion.
        // Usually, in keyword cleaning, we keep the most specific (longest) strings.
        finalCleaned.push(line);
      }
    } else {
      finalCleaned.push(line);
    }
  });

  return {
    originalCount: rawWords.length,
    cleanedCount: finalCleaned.length,
    deletedCount: smartDeleted.length,
    cleanedList: finalCleaned,
    deletedList: smartDeleted,
  };
};

export const downloadAsFile = (content: string, filename: string) => {
  const blob = new Blob([content], { type: 'text/plain' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};
