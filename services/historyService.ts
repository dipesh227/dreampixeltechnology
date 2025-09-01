import { HistoryEntry } from '../types';

const HISTORY_KEY = 'dreamPixelCreations';
const MAX_HISTORY_ITEMS = 50;

export const getCreations = (): HistoryEntry[] => {
    try {
        const creationsJson = localStorage.getItem(HISTORY_KEY);
        if (creationsJson) {
            return JSON.parse(creationsJson);
        }
    } catch (error) {
        console.error("Failed to parse history from localStorage", error);
        return [];
    }
    return [];
};

export const saveCreation = (newEntry: HistoryEntry): void => {
    try {
        const creations = getCreations();
        const updatedCreations = [newEntry, ...creations].slice(0, MAX_HISTORY_ITEMS);
        localStorage.setItem(HISTORY_KEY, JSON.stringify(updatedCreations));
    } catch (error) {
        console.error("Failed to save creation to localStorage", error);
    }
};

export const clearCreations = (): void => {
    try {
        localStorage.removeItem(HISTORY_KEY);
    } catch (error) {
        console.error("Failed to clear creations from localStorage", error);
    }
};