import React, { useMemo, useEffect, useRef } from 'react';
import ResourceManager from '../components/ui/ResourceManager';
import {
  createExercise,
  deleteExercise,
  fetchExercises,
  updateExercise,
} from '../services/adminService';
import { usePage } from '../contexts/PageContext';

const skillOptions = [
  { value: '', label: 'Tất cả kỹ năng' },
  { value: 'vocab', label: 'Từ vựng' },
  { value: 'grammar', label: 'Ngữ pháp' },
  { value: 'listening', label: 'Nghe' },
  { value: 'reading', label: 'Đọc' },
];

const typeOptions = [
  { value: '', label: 'Tất cả loại bài' },
  { value: 'multiple_choice', label: 'Trắc nghiệm' },
  { value: 'fill_in_blank', label: 'Điền vào chỗ trống' },
];

const levelOptions = [
  { value: '', label: 'Tất cả cấp độ' },
  { value: 'A', label: 'Level A' },
  { value: 'B', label: 'Level B' },
  { value: 'C', label: 'Level C' },
];

const Exercises = () => {
  const { setPageInfo } = usePage();
  const resourceManagerRef = useRef(null);

  useEffect(() => {
    const handleRefresh = () => {
      if (resourceManagerRef.current) {
        resourceManagerRef.current.refresh();
      }
    };

    const handleCreate = () => {
      if (resourceManagerRef.current) {
        resourceManagerRef.current.openCreateForm();
      }
    };

    setPageInfo({
      title: 'Bài tập & Đề thi',
      description: 'Xây dựng ngân hàng câu hỏi cho từng kỹ năng và cấp độ.',
      actions: (
        <>
          <button
            className="btn btn-outline-secondary"
            type="button"
            onClick={handleRefresh}
          >
            <i className="fas fa-rotate me-2"></i>
            Làm mới
          </button>
          <button className="btn btn-warning text-dark fw-bold" onClick={handleCreate}>
            <i className="fas fa-plus me-2" />
            Thêm bài tập
          </button>
        </>
      ),
    });
    return () => setPageInfo({ title: '', description: '', actions: null });
  }, [setPageInfo]);

  const columns = useMemo(
    () => [
      {
        key: 'questionText',
        label: 'Câu hỏi',
        render: (item) => (
          <div>
            <div className="fw-semibold text-dark">{item.questionText}</div>
            <small className="text-muted">{item.topicRef || 'Không có topic'}</small>
          </div>
        ),
      },
      {
        key: 'skill',
        label: 'Kỹ năng',
        render: (item) => item.skill || '—',
      },
      {
        key: 'type',
        label: 'Loại bài',
        render: (item) => item.type || '—',
      },
      {
        key: 'level',
        label: 'Cấp độ',
        render: (item) => item.level || '—',
      },
      {
        key: 'createdAt',
        label: 'Ngày tạo',
        render: (item) => new Date(item.createdAt).toLocaleDateString('vi-VN'),
      },
    ],
    []
  );

  const filters = useMemo(
    () => [
      {
        name: 'search',
        label: 'Tìm kiếm câu hỏi',
        type: 'text',
        placeholder: 'Nhập nội dung...',
        col: 6,
      },
      {
        name: 'skill',
        label: 'Kỹ năng',
        type: 'select',
        options: skillOptions,
        col: 3,
      },
      {
        name: 'type',
        label: 'Loại bài',
        type: 'select',
        options: typeOptions,
        col: 3,
      },
      {
        name: 'level',
        label: 'Cấp độ',
        type: 'select',
        options: levelOptions,
        col: 3,
      },
    ],
    []
  );

  const formFields = useMemo(
    () => [
      {
        name: 'skill',
        label: 'Kỹ năng',
        type: 'select',
        options: skillOptions.slice(1),
        defaultValue: 'vocab',
        col: 4,
        required: true,
      },
      {
        name: 'type',
        label: 'Loại bài',
        type: 'select',
        options: typeOptions.slice(1),
        defaultValue: 'multiple_choice',
        col: 4,
        required: true,
      },
      {
        name: 'level',
        label: 'Cấp độ',
        type: 'select',
        options: levelOptions.slice(1),
        defaultValue: 'A',
        col: 4,
        required: true,
      },
      {
        name: 'questionText',
        label: 'Nội dung câu hỏi',
        type: 'textarea',
        rows: 3,
        required: true,
        col: 12,
      },
      {
        name: 'topicRef',
        label: 'Topic tham chiếu',
        type: 'text',
        placeholder: 'vd: Travel - Lesson 1',
        col: 6,
      },
      {
        name: 'correctAnswer',
        label: 'Đáp án đúng',
        type: 'text',
        col: 6,
      },
      {
        name: 'optionsRaw',
        label: 'Danh sách đáp án',
        type: 'textarea',
        rows: 4,
        helper: 'Mỗi dòng một đáp án, định dạng: Nội dung || true/false',
        col: 12,
      },
      {
        name: 'explanation',
        label: 'Giải thích',
        type: 'textarea',
        rows: 3,
        col: 12,
      },
      {
        name: 'audioUrl',
        label: 'Audio (nếu có)',
        type: 'text',
        placeholder: 'https://...',
        col: 12,
      },
    ],
    []
  );

  const buildPayload = (values) => {
    const parseOptions = (raw) =>
      raw
        .split('\n')
        .map((line) => line.trim())
        .filter(Boolean)
        .map((line) => {
          const [text, flag] = line.split('||');
          return {
            text: (text || '').trim(),
            isCorrect: (flag || '').trim().toLowerCase() === 'true',
          };
        });

    const payload = {
      skill: values.skill || 'vocab',
      type: values.type || 'multiple_choice',
      level: values.level || 'A',
      questionText: values.questionText?.trim(),
      topicRef: values.topicRef?.trim(),
      explanation: values.explanation?.trim(),
      correctAnswer: values.correctAnswer?.trim(),
      audioUrl: values.audioUrl?.trim(),
      options: values.optionsRaw ? parseOptions(values.optionsRaw) : undefined,
    };

    Object.keys(payload).forEach((key) => {
      if (payload[key] === undefined || payload[key] === null || payload[key] === '') {
        delete payload[key];
      }
    });

    return payload;
  };

  const mapExerciseToForm = (item) => ({
    skill: item.skill || 'vocab',
    type: item.type || 'multiple_choice',
    level: item.level || 'A',
    questionText: item.questionText || '',
    topicRef: item.topicRef || '',
    explanation: item.explanation || '',
    correctAnswer: item.correctAnswer || '',
    audioUrl: item.audioUrl || '',
    optionsRaw: Array.isArray(item.options)
      ? item.options.map((opt) => `${opt.text} || ${opt.isCorrect}`).join('\n')
      : '',
  });

  return (
    <ResourceManager
      ref={resourceManagerRef}
      resourceName="bài tập"
      columns={columns}
      filters={filters}
      formFields={formFields}
      listApi={fetchExercises}
      createApi={createExercise}
      updateApi={updateExercise}
      deleteApi={deleteExercise}
      mapItemToForm={mapExerciseToForm}
      buildPayload={buildPayload}
      hideHeader={true}
    />
  );
};

export default Exercises;

