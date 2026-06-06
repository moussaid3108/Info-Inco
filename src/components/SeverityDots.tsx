interface Props { level: 1 | 2 | 3; }

const colors = { 1: 'bg-yellow-400', 2: 'bg-orange-500', 3: 'bg-red-600' };

export default function SeverityDots({ level }: Props) {
  return (
    <div className="flex items-center gap-0.5" title={`Gravité ${level}/3`}>
      {[1, 2, 3].map(i => (
        <div
          key={i}
          className={`w-1.5 h-1.5 rounded-full ${i <= level ? colors[level as 1|2|3] : 'bg-gray-200'}`}
        />
      ))}
    </div>
  );
}
