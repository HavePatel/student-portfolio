import TaskCard from "./TaskCard";
import EmptyState from "./EmptyState";

/**
 * TaskList
 * Renders the responsive grid of TaskCards or delegates to EmptyState.
 */
function TaskList({
  tasks,
  allTasks,
  onEdit,
  onDelete,
  onToggleStatus,
  onClearFilters,
}) {
  const isFiltered = tasks.length !== allTasks.length;

  if (tasks.length === 0) {
    return (
      <EmptyState
        filtered={isFiltered || allTasks.length > 0}
        onClear={isFiltered ? onClearFilters : undefined}
      />
    );
  }

  return (
    <div
      className="task-list"
      aria-label={`${tasks.length} task${tasks.length !== 1 ? "s" : ""}`}
    >
      {tasks.map((task) => (
        <TaskCard
          key={task.id || task._id}
          task={task}
          onEdit={onEdit}
          onDelete={onDelete}
          onToggleStatus={onToggleStatus}
        />
      ))}
    </div>
  );
}

export default TaskList;
