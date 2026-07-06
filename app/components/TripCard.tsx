"use client";

import { deleteTrip } from "@/app/lib/api";
import { useState } from "react";

interface TripCardProps {
  id?: number;
  title: string;
  dateRange: string;
  destinations: number;
  budget: number;
  rating: number;
  status: "draft" | "ongoing" | "completed";
  onDeleted?: () => void;
  onEdit?: () => void;
  isSelected?: boolean;
  onSelectionChange?: (selected: boolean) => void;
  isSelectMode?: boolean;
}

export default function TripCard({
  id,
  title,
  dateRange,
  destinations,
  budget,
  rating,
  status,
  onDeleted,
  onEdit,
  isSelected = false,
  onSelectionChange,
  isSelectMode = false,
}: TripCardProps) {
  const [deleting, setDeleting] = useState(false);

  const handleDelete = async () => {
    if (!id) return;

    if (confirm(`确定要删除"${title}"吗？`)) {
      setDeleting(true);
      try {
        await deleteTrip(id);
        onDeleted?.();
      } catch (error) {
        console.error("Error deleting trip:", error);
        alert("删除失败，请重试");
      } finally {
        setDeleting(false);
      }
    }
  };

  const handleSelectChange = (checked: boolean) => {
    onSelectionChange?.(checked);
  };

  const statusColors = {
    draft: "bg-gray-100 text-gray-700",
    ongoing: "bg-blue-100 text-blue-700",
    completed: "bg-green-100 text-green-700",
  };

  const statusLabels = {
    draft: "草稿",
    ongoing: "进行中",
    completed: "已完成",
  };

  return (
    <div
      className={`bg-white rounded-lg border p-6 hover:shadow-lg transition ${
        isSelected ? "border-blue-500 bg-blue-50" : "border-gray-200"
        // ✅ 选中时：蓝色边框 + 浅蓝色背景
      }`}
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-start gap-3 flex-1">
          {/* ✅ 多选模式时显示复选框 */}
          {isSelectMode && (
            <input
              type="checkbox"
              checked={isSelected}
              onChange={(e) => handleSelectChange(e.target.checked)}
              className="mt-1 w-4 h-4 cursor-pointer"
            />
          )}
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-gray-900 mb-1">
              {title}
            </h3>
            <p className="text-sm text-gray-500">{dateRange}</p>
          </div>
        </div>

        {/* ✅ 非多选模式时显示编辑/删除按钮 */}
        {!isSelectMode && (
          <div className="flex gap-2 ml-2">
            <button
              onClick={onEdit}
              className="text-gray-400 hover:text-blue-600 transition flex-shrink-0"
              title="编辑"
            >
              ✏️
            </button>
            <button
              onClick={handleDelete}
              disabled={deleting}
              className="text-gray-400 hover:text-red-600 transition flex-shrink-0 disabled:opacity-50"
              title="删除"
            >
              ✕
            </button>
          </div>
        )}
      </div>

      <div className="space-y-2 mb-4">
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">目的地：</span>
          <span className="font-semibold text-gray-900">{destinations} 个</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">预算：</span>
          <span className="font-semibold text-gray-900">
            ¥{budget.toLocaleString()}
          </span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">评分：</span>
          <span className="font-semibold text-yellow-500">
            {"★".repeat(rating)}
          </span>
        </div>
      </div>

      <div
        className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${statusColors[status]}`}
      >
        {statusLabels[status]}
      </div>
    </div>
  );
}