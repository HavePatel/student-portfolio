import TaskCard from "./TaskCard";

/**
 * TaskStatusSection
 * Presentational component for a single status group (Completed, Ongoing, or Pending).
 * Renders section header (title, icon, task count, description), task card list, or empty state.
 * Enables internal scrolling when tasks.length > 2.
 */
function TaskStatusSection({
  status,
  title,
  icon: Icon,
  description,
  emptyMessage,
  tasks = [],
  onEdit,
  onDelete,
}) {
  const count = tasks.length;
  const isScrollable = count > 2;

  return (
    <section
      className={`task-status-section task-status-section--${status}`}
      aria-labelledby={`section-heading-${status}`}
    >
      <div className="task-status-section__header">
        <div className="task-status-section__title-wrap">
          <span className="task-status-section__icon" aria-hidden="true">
            {Icon && <Icon size={18} strokeWidth={2.2} />}
          </span>
          <h2
            id={`section-heading-${status}`}
            className="task-status-section__title"
          >
            {title}
          </h2>
          <span
            className="task-status-section__count"
            aria-label={`${count} ${count === 1 ? "task" : "tasks"}`}
          >
            {count} {count === 1 ? "task" : "tasks"}
          </span>
        </div>
        {description && (
          <p className="task-status-section__description">{description}</p>
        )}
      </div>

      {count > 0 ? (
        <div
          className={`task-status-section__tasks${
            isScrollable ? " task-status-section__tasks--scrollable" : ""
          }`}
          tabIndex={isScrollable ? 0 : undefined}
          aria-label={
            isScrollable
              ? `${title} tasks scrollable list (${count} total)`
              : undefined
          }
        >
          {tasks.map((task) => (
            <TaskCard
              key={task.id || task._id}
              task={task}
              onEdit={onEdit}
              onDelete={onDelete}
            />
          ))}
        </div>
      ) : (
        <div className="task-status-section__empty" role="status">
          <p>{emptyMessage || `No ${status} tasks.`}</p>
        </div>
      )}
    </section>
  );
}

export default TaskStatusSection;
