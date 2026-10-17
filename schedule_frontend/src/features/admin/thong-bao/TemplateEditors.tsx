import { notify } from "@/lib/toast";
import React, { useState } from "react";
import { Check } from "lucide-react";
import { EMAIL_TEMPLATES, NOTIFICATION_TEMPLATES, type EmailTemplate, type NotificationTemplate } from "./mockData";

const inputClass = "w-full rounded-xl border border-slate-300 font-bold text-slate-900 outline-hidden focus:border-brand-500";

interface PickerProps<T extends { id: string; name: string; code: string }> {
  label: string;
  templates: T[];
  selected: T;
  onSelect: (template: T) => void;
  codeClass: string;
  saveLabel: string;
}

/** Thanh chọn mẫu + mã + nút lưu. */
function TemplatePicker<T extends { id: string; name: string; code: string }>({ label, templates, selected, onSelect, codeClass, saveLabel }: PickerProps<T>) {
  return (
    <div className="flex flex-col justify-between gap-3 rounded-xl border border-slate-200 bg-slate-50 p-4 sm:flex-row sm:items-center">
      <div className="flex flex-1 flex-col gap-3 sm:flex-row sm:items-center">
        <label className="whitespace-nowrap text-xs font-black text-slate-800">{label}</label>
        <select
          value={selected.id}
          onChange={(event) => {
            const found = templates.find((template) => template.id === event.target.value);
            if (found) onSelect(found);
          }}
          className="w-full cursor-pointer rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs font-bold text-slate-900 outline-hidden focus:border-brand-500 sm:max-w-md"
        >
          {templates.map((template) => (
            <option key={template.id} value={template.id}>
              {template.name} — [{template.code}]
            </option>
          ))}
        </select>
      </div>
      <div className="flex items-center gap-2">
        <span className={`rounded-lg border px-2.5 py-1 font-mono text-[11px] font-bold ${codeClass}`}>Mã: {selected.code}</span>
        <button onClick={() => notify.success(`Đã lưu nội dung ${saveLabel} "${selected.name}" thành công!`)} className="btn btn-primary btn-sm">
          <Check className="h-3.5 w-3.5 stroke-[3]" />
          <span>Lưu {saveLabel}</span>
        </button>
      </div>
    </div>
  );
}

/** Các biến số có thể chèn vào nội dung. */
function VariableChips({ label, variables, chipClass, onInsert }: { label: string; variables: string[]; chipClass: string; onInsert: (variable: string) => void }) {
  return (
    <div>
      <label className="mb-1 block font-bold text-slate-800">{label}</label>
      <div className="flex flex-wrap gap-1.5">
        {variables.map((variable) => (
          <button
            key={variable}
            type="button"
            onClick={() => onInsert(variable)}
            className={`cursor-pointer rounded-lg border px-2.5 py-1 font-mono text-[11px] font-bold transition-colors ${chipClass}`}
          >
            {variable}
          </button>
        ))}
      </div>
    </div>
  );
}

export function EmailTemplateTab() {
  const [template, setTemplate] = useState<EmailTemplate>(EMAIL_TEMPLATES[0]);
  return (
    <div className="space-y-5 rounded-2xl border border-slate-300 bg-surface p-6 shadow-xs">
      <TemplatePicker
        label="Chọn mẫu thư tự động:"
        templates={EMAIL_TEMPLATES}
        selected={template}
        onSelect={setTemplate}
        codeClass="border-brand-300 bg-brand-100 text-brand-900"
        saveLabel="mẫu email"
      />
      <div className="space-y-4 text-xs">
        <div>
          <label className="mb-1 block font-bold text-slate-800">Tiêu đề thư điện tử (Email Subject) *</label>
          <input type="text" value={template.subject} onChange={(event) => setTemplate({ ...template, subject: event.target.value })} className={`${inputClass} px-3.5 py-2.5`} />
        </div>
        <VariableChips
          label="Các biến số hỗ trợ (Nhấn để chèn vào nội dung):"
          variables={template.variables}
          chipClass="border-brand-300 bg-brand-100 text-brand-900 hover:bg-brand-200"
          onInsert={(variable) => setTemplate({ ...template, content: `${template.content} ${variable}` })}
        />
        <div>
          <label className="mb-1 block font-bold text-slate-800">Nội dung thư điện tử (HTML / Text Body):</label>
          <textarea
            rows={11}
            value={template.content}
            onChange={(event) => setTemplate({ ...template, content: event.target.value })}
            className="w-full rounded-xl border border-slate-300 p-3.5 font-mono text-xs leading-relaxed text-slate-900 outline-hidden focus:border-brand-500"
          />
        </div>
      </div>
    </div>
  );
}

export function NotificationTemplateTab() {
  const [template, setTemplate] = useState<NotificationTemplate>(NOTIFICATION_TEMPLATES[0]);
  return (
    <div className="space-y-5 rounded-2xl border border-slate-300 bg-surface p-6 shadow-xs">
      <TemplatePicker
        label="Chọn mẫu thông báo riêng:"
        templates={NOTIFICATION_TEMPLATES}
        selected={template}
        onSelect={setTemplate}
        codeClass="border-purple-300 bg-purple-100 text-purple-900"
        saveLabel="mẫu thông báo"
      />
      <div className="space-y-4 text-xs">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-1 block font-bold text-slate-800">Mức độ ưu tiên thông báo *</label>
            <select
              value={template.priority}
              onChange={(event) => setTemplate({ ...template, priority: event.target.value as NotificationTemplate["priority"] })}
              className={`${inputClass} bg-white px-3 py-2`}
            >
              <option value="NORMAL">Thông thường (Chuông nhẹ)</option>
              <option value="HIGH">Quan trọng (Banner nổi)</option>
              <option value="URGENT">Khẩn cấp (Rung chuông & Pop-up)</option>
            </select>
          </div>
          <div>
            <label className="mb-1 block font-bold text-slate-800">Phân loại nghiệp vụ *</label>
            <select
              value={template.type}
              onChange={(event) => setTemplate({ ...template, type: event.target.value as NotificationTemplate["type"] })}
              className={`${inputClass} bg-white px-3 py-2`}
            >
              <option value="CA_LAM">Lịch làm việc & Ca trực</option>
              <option value="CHAM_CONG">Chấm công & Điểm danh</option>
              <option value="LUONG">Lương & Thưởng</option>
              <option value="NOI_QUY">Nội quy & Kỷ luật</option>
              <option value="KHAN_CAP">Khẩn cấp toàn hệ thống</option>
            </select>
          </div>
        </div>
        <div>
          <label className="mb-1 block font-bold text-slate-800">Tiêu đề thông báo hiển thị trên ứng dụng (In-app Title) *</label>
          <input type="text" value={template.title} onChange={(event) => setTemplate({ ...template, title: event.target.value })} className={`${inputClass} px-3.5 py-2.5`} />
        </div>
        <VariableChips
          label="Các biến số hỗ trợ (Nhấn để chèn):"
          variables={template.variables}
          chipClass="border-purple-300 bg-purple-100 text-purple-900 hover:bg-purple-200"
          onInsert={(variable) => setTemplate({ ...template, message: `${template.message} ${variable}` })}
        />
        <div>
          <label className="mb-1 block font-bold text-slate-800">Nội dung thông báo chi tiết (In-app Message Content):</label>
          <textarea
            rows={5}
            value={template.message}
            onChange={(event) => setTemplate({ ...template, message: event.target.value })}
            className="w-full rounded-xl border border-slate-300 p-3.5 text-xs font-medium leading-relaxed text-slate-900 outline-hidden focus:border-brand-500"
          />
        </div>
      </div>
    </div>
  );
}
