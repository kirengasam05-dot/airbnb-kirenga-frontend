import toast from 'react-hot-toast';
import { useStore } from '../../../store/StoreContext';
export function useFavorites() { const { state, dispatch } = useStore(); const isSaved = (id: number) => state.saved.includes(id); const toggle = (id: number, title: string) => { dispatch({ type: 'TOGGLE_FAVORITE', payload: id }); toast.success(`${isSaved(id) ? 'Removed' : 'Saved'}: ${title}`); }; return { count: state.saved.length, isSaved, toggle }; }
