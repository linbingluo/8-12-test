interface StatCardProps {
  label: string;
  value: number;
  color: "blue" | "green" | "purple";
}

const colorMap = {
  blue: "text-blue-600",
  green: "text-green-600",
  purple: "text-purple-600",
};

export default function StatCard({ label, value, color }: StatCardProps) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6 h-32">
      <p className="text-sm text-gray-500 mb-4">{label}</p>
      <p className={`text-4xl font-bold ${colorMap[color]}`}>{value}</p>
    </div>
  );
}