export type LabelType = 'Feature' | 'Bug' | 'Issue' | 'Undefined';
export type PriorityType = 'Low' | 'Medium' | 'High' | 'Critical';

export type Assignee = {
  id: string;
  name: string;
  avatar: string;
  color: string;
  initials: string;
};

export type ChecklistItem = {
  id: string;
  text: string;
  completed: boolean;
};

export type Attachment = {
  id: string;
  name: string;
  type: 'pdf' | 'image' | 'doc' | 'spreadsheet' | 'other';
  size: string;
};

export type Task = {
  id: string;
  columnId: string;
  title: string;
  description: string;
  assignees: string[];
  dueDate: string | null;
  label: LabelType;
  priority: PriorityType | null;
  checklist: ChecklistItem[];
  attachments: Attachment[];
  coverImage: string | null;
  createdAt: string;
  updatedAt: string;
  position: number;
  creator?: Assignee;
};

export type Column = {
  id: string;
  title: string;
  color: string;
  position: number;
};

export type FilterState = {
  search: string;
  assignees: string[];
  labels: LabelType[];
  dueDateFrom: string | null;
  dueDateTo: string | null;
};
