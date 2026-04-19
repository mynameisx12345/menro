export interface TableColumn {
  key: string;         // property key on the row object
  label: string;       // header label
  sortable?: boolean;
  type?: 'text' | 'date' | 'badge';  // rendering hint
  badgeClass?: (row: any) => string;  // CSS class for badge type
}

export interface TableAction {
  label: string;
  class?: string;       // e.g. 'success', 'danger'
  handler: (row: any) => void;
}
