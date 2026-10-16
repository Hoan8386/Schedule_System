import { useCallback, useEffect, useMemo, useState } from "react";
import {
  managerApi,
  type EmployeeStoreResponse,
  type StoreResponse,
  type TestAssignmentResponse,
  type TestOptionResponse,
  type TestQuestionResponse,
  type TestResponse,
  type TestResultResponse,
} from "@/lib/api";
import { listData } from "@/lib/format";
import { buildStoreSummaries, idOf, type QuestionDraft, type TestForm } from "./model";

interface TestData {
  tests: TestResponse[];
  questions: TestQuestionResponse[];
  options: TestOptionResponse[];
  stores: StoreResponse[];
  employeeStores: EmployeeStoreResponse[];
  assignments: TestAssignmentResponse[];
  results: TestResultResponse[];
}

const EMPTY: TestData = { tests: [], questions: [], options: [], stores: [], employeeStores: [], assignments: [], results: [] };

async function fetchTestData(): Promise<TestData> {
  const [tests, questions, options, stores, employeeStores, assignments, results] = await Promise.all([
    managerApi.getTests(),
    managerApi.getTestQuestions(),
    managerApi.getTestOptions(),
    managerApi.getStores(),
    managerApi.getEmployeeStores({ status: "ACTIVE" }),
    managerApi.getTestAssignments(),
    managerApi.getTestResults(),
  ]);
  return {
    tests: listData(tests.data),
    questions: listData(questions.data),
    options: listData(options.data),
    stores: listData(stores.data),
    employeeStores: listData(employeeStores.data),
    assignments: listData(assignments.data),
    results: listData(results.data),
  };
}

const message = (cause: unknown, fallback: string) => (cause instanceof Error ? cause.message : fallback);

/** Dữ liệu bài test và các thao tác tạo / sửa / xóa đề và câu hỏi. */
export function useTestManagement() {
  const [data, setData] = useState<TestData>(EMPTY);
  const [selectedTestId, setSelectedTestId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  const apply = useCallback((next: TestData) => {
    setData(next);
    setSelectedTestId((current) =>
      current && next.tests.some((item) => idOf(item) === current) ? current : next.tests.length ? idOf(next.tests[0]) : null
    );
  }, []);

  const reload = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      apply(await fetchTestData());
    } catch (cause) {
      setError(message(cause, "Không thể tải dữ liệu bài test"));
    } finally {
      setLoading(false);
    }
  }, [apply]);

  useEffect(() => {
    let cancelled = false;
    fetchTestData()
      .then((next) => !cancelled && apply(next))
      .catch((cause) => !cancelled && setError(message(cause, "Không thể tải dữ liệu bài test")))
      .finally(() => !cancelled && setLoading(false));
    return () => {
      cancelled = true;
    };
  }, [apply]);

  const showNotice = (text: string) => {
    setNotice(text);
    window.setTimeout(() => setNotice(""), 3000);
  };

  /** Chạy thao tác ghi, hiện thông báo và tải lại; trả về true nếu thành công. */
  const run = async (action: () => Promise<unknown>, success: string, failure: string, trackSaving = true) => {
    if (trackSaving) setSaving(true);
    setError("");
    try {
      await action();
      showNotice(success);
      await reload();
      return true;
    } catch (cause) {
      setError(message(cause, failure));
      return false;
    } finally {
      if (trackSaving) setSaving(false);
    }
  };

  const optionsOf = (questionId: number) => data.options.filter((option) => option.questionId === questionId);
  const deleteOptions = (questionId: number) => Promise.all(optionsOf(questionId).map((option) => managerApi.deleteTestOption(idOf(option))));

  const saveTest = (id: number | undefined, form: TestForm) => {
    if (!form.testCode.trim() || !form.testName.trim()) {
      setError("Vui lòng nhập mã và tên bài test.");
      return Promise.resolve(false);
    }
    const body = { ...form, durationMinutes: Number(form.durationMinutes), passingScore: Number(form.passingScore) };
    return run(() => (id ? managerApi.updateTest(id, body) : managerApi.createTest(body)), id ? "Đã cập nhật bài test." : "Đã tạo bài test mới.", "Không thể lưu bài test");
  };

  const removeTest = (test: TestResponse) => {
    const testId = idOf(test);
    if (!testId || !window.confirm(`Xóa bài test "${test.testName}"?`)) return;
    void run(() => managerApi.deleteTest(testId), "Đã xóa bài test.", "Không thể xóa bài test", false);
  };

  const saveQuestion = (draft: QuestionDraft) => {
    if (!selectedTestId || !draft.text.trim()) return Promise.resolve(false);
    const options = draft.options.map((item) => ({ ...item, text: item.text.trim() })).filter((item) => item.text.length > 0);
    if (options.length < 2) {
      setError("Vui lòng nhập ít nhất 2 đáp án cho câu hỏi.");
      return Promise.resolve(false);
    }
    if (!options.some((item) => item.isCorrect)) {
      setError("Vui lòng chọn ít nhất 1 đáp án đúng.");
      return Promise.resolve(false);
    }

    return run(
      async () => {
        const body = { testId: selectedTestId, questionText: draft.text.trim(), questionType: "SINGLE_CHOICE", score: Number(draft.score) || 1 };
        const response = draft.id ? await managerApi.updateTestQuestion(draft.id, body) : await managerApi.createTestQuestion(body);
        const questionId = idOf((response.data ?? {}) as { id?: number; questionId?: number });
        if (!questionId) return;
        // Thay toàn bộ đáp án cũ bằng danh sách mới
        await deleteOptions(questionId);
        await Promise.all(
          options.map((option, index) =>
            managerApi.createTestOption({ questionId, optionText: option.text, isCorrect: option.isCorrect, displayOrder: index + 1 })
          )
        );
      },
      "Đã lưu câu hỏi.",
      "Không thể lưu câu hỏi"
    );
  };

  const removeQuestion = (question: TestQuestionResponse) => {
    const questionId = idOf(question);
    if (!questionId || !window.confirm("Xóa câu hỏi này?")) return;
    void run(
      async () => {
        await deleteOptions(questionId);
        await managerApi.deleteTestQuestion(questionId);
      },
      "Đã xóa câu hỏi.",
      "Không thể xóa câu hỏi",
      false
    );
  };

  const storeSummaries = useMemo(
    () => buildStoreSummaries(data.stores, data.employeeStores, data.assignments, data.results),
    [data.stores, data.employeeStores, data.assignments, data.results]
  );

  return {
    ...data,
    storeSummaries,
    selectedTestId,
    setSelectedTestId,
    loading,
    saving,
    error,
    setError,
    notice,
    reload,
    optionsOf,
    saveTest,
    removeTest,
    saveQuestion,
    removeQuestion,
  };
}
