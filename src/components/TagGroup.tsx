import { getThemeClasses } from '../theme';

interface TagGroupProps {
  title: string;
  tags: string[];
  selected: string | string[] | null;
  onTagSelect: (tag: string) => void;
}

export default function TagGroup({ title, tags, selected, onTagSelect }: TagGroupProps) {
  const theme = getThemeClasses();
  
  const isSelected = (tag: string): boolean => {
    if (Array.isArray(selected)) {
      return selected.includes(tag);
    }
    return selected === tag;
  };



  return (
    <div className={`bg-gradient-to-r from-[#D4A574] to-[#C8965C] text-white p-4 rounded-3xl shadow-lg`}>
      <div className="flex flex-wrap items-center gap-3">
        <h3 className={`text-lg font-semibold text-white`}>{title}</h3>
        <div className="flex flex-wrap gap-2">
          {tags.map((tag) => (
            <button
              key={tag}
              onClick={() => onTagSelect(tag)}
              className={`text-sm font-medium transition-all duration-150 ${
                isSelected(tag)
                  ? `bg-[#2D2D2D] text-white px-4 py-2 rounded-full shadow-inner hover:shadow-md hover:brightness-110 active:scale-95`
                  : `bg-white text-[#2D2D2D] px-4 py-2 rounded-full shadow-sm hover:shadow-md hover:brightness-110 active:scale-95`
              }`}
            >
              {tag.replace('_', ' ')}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}



