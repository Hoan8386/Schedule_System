"use client";

import { notify } from "@/lib/toast";
import React, { useEffect, useState } from "react";
import { AlertCircle, Plus } from "lucide-react";
import { storeManagerApi } from "@/lib/api";
import { codeFromName, STORE_STAFF, toTestPlan, type TestPlan } from "./model";
import { TestPlanTable } from "./TestPlanTable";
import { AssignPanel, TestEditor, type TestDraft } from "./TestEditor";

interface Props {
  /** "quanlytest" | "ketquatest" | "mytest" – hiện cả ba dùng chung giao diện quản lý */
  mode?: string;
}

const errorText = (cause: unknown) => (cause instanceof Error ? cause.message : String(cause));

/** Trưởng cửa hàng soạn, giao và theo dõi bài test. */
// eslint-disable-next-line @typescript-eslint/no-unused-vars -- mode được giữ để layout truyền vào
export default function StoreManagerTestManagementPage({ mode = "quanlytest" }: Props) {
  const [tests, setTests] = useState<TestPlan[]>([]);
  const [error, setError] = useState("");
  const [draft, setDraft] = useState<TestDraft>({ testName: "Quy trình vệ sinh cuối ca", duration: "10 phút" });
  const [dueDate] = useState("12/10/2026 · 23:59");
  const [selectedStaff, setSelectedStaff] = useState<string[]>(STORE_STAFF.map((staff) => staff.code));

  useEffect(() => {
    let active = true;
    storeManagerApi
      .getTests()
      .then(({ data }) => active && setTests(data.map(toTestPlan)))
      .catch((cause) => {
        if (!active) return;
        setError(errorText(cause));
        setTests([]);
      });
    return () => {
      active = false;
    };
  }, []);

  const toggleStaff = (code: string) => setSelectedStaff((prev) => (prev.includes(code) ? prev.filter((item) => item !== code) : [...prev, code]));

  const saveAndAssign = async () => {
    try {
      const { data } = await storeManagerApi.createTest({
        testCode: codeFromName(draft.testName),
        testName: draft.testName.trim(),
        durationMinutes: Number.parseInt(draft.duration, 10) || 10,
        status: "ASSIGNED",
      });
      const testId = Number(data.testId ?? data.id);
      if (testId && selectedStaff.length > 0) {
        const employees = await storeManagerApi.getEmployees("ACTIVE");
        await Promise.all(
          employees.data
            .filter((employee) => selectedStaff.includes(String(employee.employeeCode ?? "")))
            .map((employee) => storeManagerApi.createTestAssignment({ testId, employeeId: employee.id, status: "ASSIGNED", dueAt: dueDate }))
        );
      }
      setTests((prev) => [
        {
          id: String(testId),
          code: String(data.testCode ?? "NEW-TEST"),
          title: String(data.testName ?? draft.testName),
          duration: `${data.durationMinutes ?? 10} phút`,
          status: "ASSIGNED",
          dueDate,
          questionCount: 0,
          submittedCount: 0,
          totalAssigned: selectedStaff.length,
        },
        ...prev,
      ]);
    } catch (cause) {
      setError(errorText(cause));
    }
  };

  return (
    <div className="page">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-slate-800">Quản lý bài test</h1>
          <p className="mt-1 text-xs text-slate-500">Soạn nội dung, giao và theo dõi bài test cho nhân viên tại BLOAN Nguyễn Trãi.</p>
        </div>
        <button
          onClick={() => {
            setDraft({ ...draft, testName: "Bài kiểm tra mới" });
            notify.info("Đã mở mẫu soạn bài kiểm tra mới!");
          }}
          className="btn btn-primary px-5 shadow-sm shadow-brand-200"
        >
          <Plus className="h-4 w-4 stroke-[3]" />
          <span>Tạo bài test</span>
        </button>
      </div>
      {error && <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-xs text-red-700">{error}</div>}

      <TestPlanTable tests={tests} />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <TestEditor draft={draft} onChange={setDraft} />
        <AssignPanel selected={selectedStaff} onToggle={toggleStaff} onAssign={() => void saveAndAssign()} />
      </div>

      <div className="flex items-center gap-3 rounded-2xl border border-brand-200/80 bg-brand-50/70 p-4 text-xs text-brand-900">
        <AlertCircle className="h-4 w-4 shrink-0 text-brand-600" />
        <p>Lưu nháp trước khi giao bài. Nội dung bài đã giao được giữ nguyên để đảm bảo kết quả nhất quán.</p>
      </div>
    </div>
  );
}
