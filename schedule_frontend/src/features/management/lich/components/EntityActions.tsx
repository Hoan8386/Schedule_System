import React from "react";
import { Pencil, Plus, Trash2 } from "lucide-react";
import { Button, IconButton } from "@/components/ui";
import { idOf, type Entity, type Kind } from "../constants";
import { useSchedule } from "../ScheduleContext";

/** Nút sửa / xóa cho một bản ghi. */
export function EntityActions({ kind, item }: { kind: Kind; item: object }) {
  const { openModal, remove } = useSchedule();
  const entity = item as Entity;
  return (
    <div className="flex gap-2">
      <IconButton
        icon={Pencil}
        label="Chỉnh sửa"
        tone="info"
        onClick={(event) => {
          event.stopPropagation();
          openModal(kind, entity);
        }}
      />
      <IconButton
        icon={Trash2}
        label="Xóa"
        tone="danger"
        onClick={(event) => {
          event.stopPropagation();
          void remove(kind, idOf(entity));
        }}
      />
    </div>
  );
}

/** Nút thêm mới, có thể điền sẵn một số trường. */
export function AddButton({ kind, defaults, className = "ml-auto" }: { kind: Kind; defaults?: Entity; className?: string }) {
  const { openModal } = useSchedule();
  return (
    <Button size="sm" icon={Plus} className={className} onClick={() => openModal(kind, defaults, true)}>
      Thêm
    </Button>
  );
}
