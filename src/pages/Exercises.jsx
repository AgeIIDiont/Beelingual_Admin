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
        label: 'Level',
        minWidth: '100px',
        render: (item) => {
          let colorClass = 'bg-secondary';
          if (item.level === 'A') colorClass = 'bg-success';
          if (item.level === 'B') colorClass = 'bg-warning text-dark';
          if (item.level === 'C') colorClass = 'bg-danger';

          return (
            <span className={`badge ${colorClass} rounded-pill px-3 py-2`}>
              {item.level || '—'}
            </span>
          );
        },
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
    ],
    []
  );

  const renderExerciseForm = ({ formState, setFormState, renderFormField }) => {
    const currentType = formState.type || 'multiple_choice';
    const currentSkill = formState.skill || 'vocab';

    const handleAnswerChange = (index, field, value) => {
      setFormState((prev) => {
        const answers = prev.answers || [
          { text: '', isCorrect: false },
          { text: '', isCorrect: false },
          { text: '', isCorrect: false },
          { text: '', isCorrect: false },
        ];
        const newAnswers = [...answers];
        newAnswers[index] = { ...newAnswers[index], [field]: value };
        return { ...prev, answers: newAnswers };
      });
    };

    const handleCorrectAnswerToggle = (index) => {
      setFormState((prev) => {
        const answers = prev.answers || [
          { text: '', isCorrect: false },
          { text: '', isCorrect: false },
          { text: '', isCorrect: false },
          { text: '', isCorrect: false },
        ];
        const newAnswers = answers.map((ans, i) => ({
          ...ans,
          isCorrect: i === index,
        }));
        return { ...prev, answers: newAnswers };
      });
    };

    return (
      <div className="row">
        {/* Basic fields */}
        {formFields.map((field) => (
          <div className={`col-md-${field.col || 12} mb-3`} key={field.name}>
            <label htmlFor={field.name} className="form-label fw-medium text-muted">
              {field.label}
            </label>
            {renderFormField(field)}
          </div>
        ))}

        {/* Question text */}
        <div className="col-12 mb-3">
          <label htmlFor="questionText" className="form-label fw-medium text-muted">
            Nội dung câu hỏi <span className="text-danger">*</span>
          </label>
          <textarea
            className="form-control"
            id="questionText"
            name="questionText"
            value={formState.questionText || ''}
            onChange={(e) => setFormState({ ...formState, questionText: e.target.value })}
            rows={3}
            required
          />
        </div>

        {/* Topic reference */}
        <div className="col-md-6 mb-3">
          <label htmlFor="topicRef" className="form-label fw-medium text-muted">
            Topic tham chiếu
          </label>
          <input
            type="text"
            className="form-control"
            id="topicRef"
            name="topicRef"
            value={formState.topicRef || ''}
            onChange={(e) => setFormState({ ...formState, topicRef: e.target.value })}
            placeholder="vd: Travel - Lesson 1"
          />
        </div>

        {/* Audio URL for listening exercises */}
        {currentSkill === 'listening' && (
          <div className="col-md-6 mb-3">
            <label htmlFor="audioUrl" className="form-label fw-medium text-muted">
              Audio URL <span className="text-danger">*</span>
            </label>
            <input
              type="text"
              className="form-control"
              id="audioUrl"
              name="audioUrl"
              value={formState.audioUrl || ''}
              onChange={(e) => setFormState({ ...formState, audioUrl: e.target.value })}
              placeholder="https://..."
              required
            />
          </div>
        )}

        {/* Multiple choice answers */}
        {currentType === 'multiple_choice' && (
          <div className="col-12 mb-3">
            <label className="form-label fw-medium text-muted">
              Danh sách đáp án <span className="text-danger">*</span>
            </label>
            <small className="text-muted d-block mb-2">
              Nhập 4 đáp án và chọn đáp án đúng bằng checkbox
            </small>
            {['A', 'B', 'C', 'D'].map((letter, index) => {
              const answers = formState.answers || [
                { text: '', isCorrect: false },
                { text: '', isCorrect: false },
                { text: '', isCorrect: false },
                { text: '', isCorrect: false },
              ];
              return (
                <div key={letter} className="input-group mb-2">
                  <span className="input-group-text" style={{ width: '45px' }}>
                    {letter}
                  </span>
                  <input
                    type="text"
                    className="form-control"
                    value={answers[index]?.text || ''}
                    onChange={(e) => handleAnswerChange(index, 'text', e.target.value)}
                    placeholder={`Nhập đáp án ${letter}`}
                    required
                  />
                  <div className="input-group-text">
                    <input
                      type="checkbox"
                      className="form-check-input mt-0"
                      checked={answers[index]?.isCorrect || false}
                      onChange={() => handleCorrectAnswerToggle(index)}
                      title="Đáp án đúng"
                    />
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Fill in blank - correct answer only */}
        {currentType === 'fill_in_blank' && (
          <div className="col-12 mb-3">
            <label htmlFor="correctAnswer" className="form-label fw-medium text-muted">
              Đáp án đúng <span className="text-danger">*</span>
            </label>
            <input
              type="text"
              className="form-control"
              id="correctAnswer"
              name="correctAnswer"
              value={formState.correctAnswer || ''}
              onChange={(e) => setFormState({ ...formState, correctAnswer: e.target.value })}
              placeholder="Nhập đáp án đúng"
              required
            />
          </div>
        )}

        {/* Explanation */}
        <div className="col-12 mb-3">
          <label htmlFor="explanation" className="form-label fw-medium text-muted">
            Giải thích
          </label>
          <textarea
            className="form-control"
            id="explanation"
            name="explanation"
            value={formState.explanation || ''}
            onChange={(e) => setFormState({ ...formState, explanation: e.target.value })}
            rows={3}
          />
        </div>
      </div>
    );
  };

  const buildPayload = (values) => {
    const payload = {
      skill: values.skill || 'vocab',
      type: values.type || 'multiple_choice',
      level: values.level || 'A',
      questionText: values.questionText?.trim(),
      topicRef: values.topicRef?.trim(),
      explanation: values.explanation?.trim(),
    };

    // Add audio URL for listening exercises
    if (values.skill === 'listening' && values.audioUrl) {
      payload.audioUrl = values.audioUrl.trim();
    }

    // Add answers for multiple choice
    if (values.type === 'multiple_choice' && values.answers) {
      payload.options = values.answers
        .filter((ans) => ans.text.trim())
        .map((ans) => ({
          text: ans.text.trim(),
          isCorrect: ans.isCorrect || false,
        }));
    }

    // Add correct answer for fill in blank
    if (values.type === 'fill_in_blank' && values.correctAnswer) {
      payload.correctAnswer = values.correctAnswer.trim();
    }

    // Remove empty fields
    Object.keys(payload).forEach((key) => {
      if (payload[key] === undefined || payload[key] === null || payload[key] === '') {
        delete payload[key];
      }
    });

    return payload;
  };

  const mapExerciseToForm = (item) => {
    const formData = {
      skill: item.skill || 'vocab',
      type: item.type || 'multiple_choice',
      level: item.level || 'A',
      questionText: item.questionText || '',
      topicRef: item.topicRef || '',
      explanation: item.explanation || '',
      audioUrl: item.audioUrl || '',
      correctAnswer: item.correctAnswer || '',
    };

    // Map options to answers for multiple choice
    if (item.type === 'multiple_choice' && Array.isArray(item.options)) {
      formData.answers = item.options.map((opt) => ({
        text: opt.text || '',
        isCorrect: opt.isCorrect || false,
      }));
      // Ensure we have 4 answers
      while (formData.answers.length < 4) {
        formData.answers.push({ text: '', isCorrect: false });
      }
    } else {
      formData.answers = [
        { text: '', isCorrect: false },
        { text: '', isCorrect: false },
        { text: '', isCorrect: false },
        { text: '', isCorrect: false },
      ];
    }

    return formData;
  };

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
      customFormRenderer={renderExerciseForm}
    />
  );
};

export default Exercises;

