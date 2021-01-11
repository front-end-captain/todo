export type TodoItemStatus = "done" | "doing" | "delete";

export type Author = {
  id: string;
  name: string;
};

export type TodoItem = {
  id: string;
  index: number;
  title: string;
  content: string;
  createTime: number;
  updateTime: number;
  deleteTime: number | null;
  status: TodoItemStatus;
  authorId: string | null;
};
