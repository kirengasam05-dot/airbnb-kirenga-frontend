import { useEffect, useMemo, useRef, useState } from 'react';
import debounce from 'lodash/debounce';
import { useStore } from '../../../store/StoreContext';
export function SearchBar() { const { dispatch } = useStore(); const [value, setValue] = useState(''); const inputRef = useRef<HTMLInputElement>(null); useEffect(() => { inputRef.current?.focus(); }, []); const debounced = useMemo(() => debounce((next: string) => dispatch({ type: 'SET_FILTER', payload: next }), 300), [dispatch]); useEffect(() => () => debounced.cancel(), [debounced]); return <input ref={inputRef} className="search" value={value} onChange={(e) => { setValue(e.target.value); debounced(e.target.value); }} placeholder="Where are you going? Search Kigali, Musanze..."/>; }
