import { useState, useEffect, useRef, useCallback } from 'react';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import {
  setSearchQuery,
  selectConversationSearchQuery,
  selectFilteredConversations,
} from '../store';
import { useDebounce } from './useDebounce';

/**
 * Custom hook to manage conversation search with debouncing, Redux synchronization,
 * keyboard shortcuts (Ctrl+K, forward slash, Escape), and clear handling.
 */
export function useConversationSearch(debounceDelayMs = 250) {
  const dispatch = useAppDispatch();
  const reduxSearchQuery = useAppSelector(selectConversationSearchQuery);
  const filteredConversations = useAppSelector(selectFilteredConversations);

  const [inputValue, setInputValue] = useState(reduxSearchQuery);
  const debouncedValue = useDebounce(inputValue, debounceDelayMs);
  const inputRef = useRef<HTMLInputElement>(null);
  const lastDispatchedRef = useRef(reduxSearchQuery);

  // Synchronize debounced local input to Redux store
  useEffect(() => {
    if (debouncedValue !== lastDispatchedRef.current) {
      lastDispatchedRef.current = debouncedValue;
      dispatch(setSearchQuery(debouncedValue));
    }
  }, [debouncedValue, dispatch]);

  // Synchronize if Redux store is updated externally (e.g. cleared by a modal or filter reset)
  useEffect(() => {
    if (reduxSearchQuery !== lastDispatchedRef.current) {
      lastDispatchedRef.current = reduxSearchQuery;
      setInputValue(reduxSearchQuery);
    }
  }, [reduxSearchQuery]);

  // Instant clear handler
  const handleClear = useCallback(() => {
    setInputValue('');
    lastDispatchedRef.current = '';
    dispatch(setSearchQuery(''));
    inputRef.current?.focus();
  }, [dispatch]);

  // Keyboard shortcut listener: Ctrl+K or / to focus search, Esc to clear
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      const isInputFocused =
        target?.tagName === 'INPUT' ||
        target?.tagName === 'TEXTAREA' ||
        target?.isContentEditable;

      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        inputRef.current?.focus();
        inputRef.current?.select();
      } else if (e.key === '/' && !isInputFocused) {
        e.preventDefault();
        inputRef.current?.focus();
      } else if (e.key === 'Escape' && document.activeElement === inputRef.current) {
        e.preventDefault();
        handleClear();
        inputRef.current?.blur();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [handleClear]);

  return {
    inputValue,
    setInputValue,
    debouncedValue,
    handleClear,
    inputRef,
    filteredConversations,
    totalMatches: filteredConversations.length,
    hasActiveQuery: Boolean(inputValue.trim()),
  };
}
