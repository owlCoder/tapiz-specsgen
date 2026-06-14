export type ItemStatus = "active" | "done" | "archived";

export interface ItemDto {
  id: string;
  ownerId: string;
  title: string;
  description: string | null;
  status: ItemStatus;
  createdAt: Date;
  updatedAt: Date;
}

export interface NewItem {
  ownerId: string;
  title: string;
  description?: string | null;
  status?: ItemStatus;
}

export interface ItemsRepo {
  listByOwner(ownerId: string): Promise<ItemDto[]>;
  findById(id: string): Promise<ItemDto | null>;
  create(item: NewItem): Promise<ItemDto>;
  update(id: string, patch: Partial<Pick<NewItem, "title" | "description" | "status">>): Promise<void>;
  delete(id: string): Promise<void>;
}
