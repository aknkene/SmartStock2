import { useStore } from '../context/StoreContext';
import { translations } from '../utils/translations';

export function useTranslation() {
  const { language } = useStore();
  
  const t = (key: string): string => {
    return translations[key]?.[language] || key;
  };
  
  return { t, language };
}
