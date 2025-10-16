import type { Activity } from '../types';
import { getThemeClasses } from '../theme';

interface ActivityCardProps {
  activity: Activity;
  onChoose: () => void;
}

export default function ActivityCard({ activity, onChoose }: ActivityCardProps) {
  const theme = getThemeClasses();
  
  return (
    <button
      onClick={onChoose}
      className={`bg-gradient-to-r from-[#D4A574] to-[#C8965C] text-white p-4 sm:p-6 flex flex-col items-center justify-center min-h-[180px] sm:min-h-[220px] min-w-[280px] w-full max-w-[400px] rounded-3xl shadow-lg hover:shadow-xl transition-all duration-200 hover:brightness-110 active:scale-95 cursor-pointer`}
    >
      <h3 className="text-lg sm:text-xl font-semibold text-white text-center">
        {activity.name}
      </h3>
    </button>
  );
}



