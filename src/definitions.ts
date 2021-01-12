export type TodoItemStatus = "done" | "doing" | "delete";

export type Author = {
  id: string;
  name: string;
  password: string;
  login: boolean;
};

export type TodoItem = {
  id: string;
  title: string;
  content: string;
  createTime: number;
  updateTime: number;
  deleteTime?: number;
  status: TodoItemStatus;
  author?: Author;
};
