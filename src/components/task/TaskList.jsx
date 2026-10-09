import { useMemo } from "react";
import { CheckCircle2, PlayCircle, Circle } from "lucide-react";
import TaskStatusSection from "./TaskStatusSection";

const SECTION_CONFIGS = [
  {
    key: "completed",
    title: "Completed",
    icon: CheckCircle2,
    description: "Tasks you have completed",
    emptyMessage: "No completed tasks yet.",
  },
  {
    key: "ongoing",
    title: "Ongoing",
    icon: PlayCircle,
    description: "Tasks you are currently working on",
    emptyMessage: "No ongoing tasks.",
  },
  {
    key: "pending",
    title: "Pending",
    icon: Circle,
    description: "Tasks you haven't started yet",
    emptyMessage: "No pending tasks.",
  },
];

/**
 * Normalizes status field with fallback for older MongoDB task documents.
 * Legacy rule:
 * - status === "completed" -> completed
 * - status === "ongoing" -> ongoing
 * - status === "pending" -> pending
 * - status missing && completed === true -> completed
 * - else -> pending
 */
function normalizeTaskStatus(task) {
  if (!task) return "pending";
  if (task.status === "completed") return "completed";
  if (task.status === "ongoing") return "ongoing";
  if (task.status === "pending") return "pending";
  if (!task.status && task.completed === true) return "completed";
  return "pending";
}

/**
 * TaskList
 * Renders tasks segregated into three status sections in exact order: COMPLETED -> ONGOING -> PENDING.
 */
function TaskList({
  tasks = [],
  statusFilter = "all",
  onEdit,
  onDelete,
}) {
  const groupedTasks = useMemo(() => {
    const groups = {
      completed: [],
      ongoing: [],
      pending: [],
    };

    tasks.forEach((task) => {
      const statusKey = normalizeTaskStatus(task);
      if (groups[statusKey]) {
        groups[statusKey].push(task);
      } else {
        groups.pending.push(task);
      }
    });

    return groups;
  }, [tasks]);

  const visibleSections = useMemo(() => {
    if (statusFilter && statusFilter !== "all") {
      return SECTION_CONFIGS.filter((sec) => sec.key === statusFilter);
    }
    return SECTION_CONFIGS;
  }, [statusFilter]);

  return (
    <div
      className="task-grouped-board"
      aria-label="Task board grouped by status"
    >
      {visibleSections.map((sec) => (
        <TaskStatusSection
          key={sec.key}
          status={sec.key}
          title={sec.title}
          icon={sec.icon}
          description={sec.description}
          emptyMessage={sec.emptyMessage}
          tasks={groupedTasks[sec.key] || []}
          onEdit={onEdit}
          onDelete={onDelete}
        />
      ))}
    </div>
  );
}

export default TaskList;
