import React, { useEffect, useRef, useState } from 'react';
import { Todo } from '../../types/Todo';
import cn from 'classnames';

type Props = {
  todo: Todo;
  onDelete: (id: number) => Promise<void>;
  processedId: number[];
  handleCompletedStatus: (id: number) => void;
  handleUpdateTodo: (todo: Todo) => Promise<void>;
};

export const TodoUser: React.FC<Props> = ({
  todo,
  onDelete,
  handleCompletedStatus,
  handleUpdateTodo,
  processedId,
}) => {
  const { id, completed, title } = todo;
  const [isEditing, setIsEditing] = useState(false);
  const [editedTitle, setEditedTitle] = useState(title);
  const [isLoading, setIsLoading] = useState(false);

  const processedTodos = processedId?.includes(id) || id === 0;

  const todoField = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (todoField.current && isEditing) {
      todoField.current.focus();
    }
  }, [isEditing]);

  const handleBlur = async () => {
    if (isEditing) {
      const titleTrim = editedTitle.trim();

      if (titleTrim === '') {
        try {
          setIsLoading(true);
          await onDelete(id);
          setIsEditing(false);
        } catch (error) {
          // Если удаление не удалось, оставляем форму открытой
          setEditedTitle(title);
        } finally {
          setIsLoading(false);
        }
      } else if (titleTrim !== title) {
        try {
          setIsLoading(true);
          await handleUpdateTodo({ ...todo, title: titleTrim });
          setIsEditing(false);
        } catch (error) {
          // Если обновление не удалось, оставляем форму открытой
          setEditedTitle(title);
        } finally {
          setIsLoading(false);
        }
      } else {
        setIsEditing(false);
      }
    }
  };

  const handleStatusChange = () => {
    handleCompletedStatus(id);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleBlur();
    } else if (e.key === 'Escape') {
      e.preventDefault();
      setEditedTitle(title);
      setIsEditing(false);
    }
  };

  return (
    <div data-cy="Todo" className={cn('todo', { completed })} key={id}>
      <label className="todo__status-label">
        <input
          data-cy="TodoStatus"
          type="checkbox"
          className="todo__status"
          checked={completed}
          onChange={handleStatusChange}
        />
      </label>

      {isEditing ? (
        <form onSubmit={e => e.preventDefault()}>
          <input
            data-cy="TodoTitleField"
            type="text"
            className="todo__title-field"
            placeholder="Empty todo will be deleted"
            value={editedTitle}
            onChange={event => setEditedTitle(event.target.value)}
            onKeyDown={handleKeyDown}
            onBlur={handleBlur}
            ref={todoField}
          />
        </form>
      ) : (
        <>
          <span
            data-cy="TodoTitle"
            className="todo__title"
            onDoubleClick={() => {
              setIsEditing(true);
              setEditedTitle(title);
            }}
          >
            {title}
          </span>

          <button
            type="button"
            className="todo__remove"
            data-cy="TodoDelete"
            onClick={() => onDelete(id)}
          >
            ×
          </button>
        </>
      )}

      <div
        data-cy="TodoLoader"
        className={cn('modal overlay', {
          'is-active': processedTodos || isLoading,
        })}
      >
        <div className="modal-background has-background-white-ter" />
        <div className="loader" />
      </div>
    </div>
  );
};
