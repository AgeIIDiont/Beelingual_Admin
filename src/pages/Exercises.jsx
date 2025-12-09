import React, { useMemo, useEffect, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import ResourceManager from '../components/ui/ResourceManager';
import {
  createExercise,
  deleteExercise,
  fetchExercises,
  updateExercise,
  fetchTopics,
  fetchGrammar,
  fetchGrammarExercises,
  createGrammarExercise,
  updateGrammarExercise,
  deleteGrammarExercise,
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
  const [searchParams] = useSearchParams();
  const resourceManagerRef = useRef(null);
  const [topics, setTopics] = React.useState([]);
  const [grammars, setGrammars] = React.useState([]);

  useEffect(() => {
    fetchTopics().then((res) => {
      setTopics(res.data || res.items || []);
    }).catch(console.error);

    fetchGrammar({}).then((res) => {
      setGrammars(res.data || res.items || []);
    }).catch(console.error);
  }, []);

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
        render: (item) => {
          const question = item.questionText || item.question || '';
          const ref = item.skill === 'grammar'
            ? (item.grammarId?.title || item.grammarTitle || 'Không có grammar')
            : (item.topicRef || 'Không có topic');
          return (
            <div>
              <div className="fw-semibold text-dark">{question}</div>
              <small className="text-muted">{ref}</small>
            </div>
          );
        },
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
        defaultValue: searchParams.get('skill') || '',
        col: 3,
      },
      {
        name: 'grammarId',
        label: 'Bài ngữ pháp',
        type: 'select',
        options: [
          { value: '', label: 'Tất cả bài ngữ pháp' },
          ...grammars.map((g) => ({ value: g._id, label: g.title })),
        ],
        defaultValue: searchParams.get('grammarId') || '',
        col: 3,
        hideCondition: (values) => values.skill !== 'grammar',
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
    [grammars, searchParams]
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
        {/* Basic fields - hide level and type for grammar exercises */}
        {formFields.map((field) => {
          // Hide level for grammar, but allow type to be selected
          if (currentSkill === 'grammar' && field.name === 'level') {
            return null;
          }
          return (
            <div className={`col-md-${field.col || 12} mb-3`} key={field.name}>
              <label htmlFor={field.name} className="form-label fw-medium text-muted">
                {field.label}
              </label>
              {renderFormField(field)}
            </div>
          );
        })}

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

        {/* Grammar ID for grammar exercises */}
        {currentSkill === 'grammar' && (
          <div className="col-md-6 mb-3">
            <label htmlFor="grammarId" className="form-label fw-medium text-muted">
              Bài ngữ pháp <span className="text-danger">*</span>
            </label>
            <select
              className="form-select"
              id="grammarId"
              name="grammarId"
              value={formState.grammarId || ''}
              onChange={(e) => setFormState({ ...formState, grammarId: e.target.value })}
              required
            >
              <option value="">-- Chọn bài ngữ pháp --</option>
              {grammars.map((grammar) => (
                <option key={grammar._id} value={grammar._id}>
                  {grammar.title}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Topic reference for non-grammar exercises */}
        {currentSkill !== 'grammar' && (
          <div className="col-md-6 mb-3">
            <label htmlFor="topicRef" className="form-label fw-medium text-muted">
              Topic tham chiếu
            </label>
            <select
              className="form-select"
              id="topicRef"
              name="topicRef"
              value={formState.topicRef || ''}
              onChange={(e) => setFormState({ ...formState, topicRef: e.target.value })}
            >
              <option value="">-- Chọn Topic --</option>
              {topics.map((topic) => (
                <option key={topic._id} value={topic.name}>
                  {topic.name}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Audio Text for listening exercises */}
        {currentSkill === 'listening' && (
          <div className="col-12 mb-3">
            <label htmlFor="audioText" className="form-label fw-medium text-muted">
              Câu/Đoạn nghe (Audio Text) <span className="text-danger">*</span>
            </label>
            <textarea
              className="form-control"
              id="audioText"
              name="audioText"
              value={formState.audioText || ''}
              onChange={(e) => setFormState({ ...formState, audioText: e.target.value })}
              placeholder="Nhập câu hoặc đoạn văn để luyện nghe. Ví dụ: 'The weather is beautiful today.'"
              rows={3}
              required
            />
          </div>
        )}

        {/* Multiple choice answers - for grammar exercises (array of strings) */}
        {currentType === 'multiple_choice' && currentSkill === 'grammar' && (
          <div className="col-12 mb-3">
            <label className="form-label fw-medium text-muted">
              Danh sách đáp án <span className="text-danger">*</span>
            </label>
            <small className="text-muted d-block mb-2">
              Nhập 4 đáp án và tích chọn đáp án đúng
            </small>
            {['A', 'B', 'C', 'D'].map((letter, index) => {
              const options = formState.options || ['', '', '', ''];
              const currentOption = options[index] || '';
              const isSelected = formState.correctAnswer === currentOption && currentOption !== '';

              return (
                <div key={letter} className="input-group mb-2">
                  <span className="input-group-text" style={{ width: '45px' }}>
                    {letter}
                  </span>
                  <input
                    type="text"
                    className="form-control"
                    value={currentOption}
                    onChange={(e) => {
                      const newValue = e.target.value;
                      const newOptions = [...options];
                      newOptions[index] = newValue;

                      // If this option was selected, update correctAnswer too
                      let newCorrectAnswer = formState.correctAnswer;
                      if (formState.correctAnswer === currentOption) {
                        newCorrectAnswer = newValue;
                      }

                      setFormState({
                        ...formState,
                        options: newOptions,
                        correctAnswer: newCorrectAnswer,
                      });
                    }}
                    placeholder={`Nhập đáp án ${letter}`}
                    required
                  />
                  <div className="input-group-text">
                    <input
                      type="radio"
                      className="form-check-input mt-0"
                      name="grammarCorrectAnswerRadio"
                      checked={isSelected}
                      onChange={() => {
                        if (currentOption.trim() !== '') {
                          setFormState({ ...formState, correctAnswer: currentOption });
                        } else {
                          // Optional: Alert user to fill text first? Or just let them select empty
                          setFormState({ ...formState, correctAnswer: currentOption });
                        }
                      }}
                      disabled={!currentOption.trim()} // Disable selection if empty
                      title="Chọn làm đáp án đúng"
                    />
                  </div>
                </div>
              );
            })}
            {/* Display error if no correct answer selected? Browser 'required' on radio is tricky if hidden. */}
          </div>
        )}

        {/* Multiple choice answers - for non-grammar exercises (array of objects) */}
        {currentType === 'multiple_choice' && currentSkill !== 'grammar' && (
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
    // Handle grammar exercises differently
    if (values.skill === 'grammar') {
      const payload = {
        grammarId: values.grammarId,
        question: values.questionText?.trim() || values.question?.trim(),
        explanation: values.explanation?.trim() || '',
        type: values.type || 'multiple_choice',
      };

      // For grammar exercises, adjust based on type
      if (values.type === 'multiple_choice') {
        if (values.options && Array.isArray(values.options)) {
          payload.options = values.options.filter(opt => opt && opt.trim());
        }
      } else {
        // fill_in_blank
        payload.options = [];
      }

      // correctAnswer is a string
      if (values.correctAnswer) {
        payload.correctAnswer = values.correctAnswer.trim();
      }

      // Remove empty fields
      Object.keys(payload).forEach((key) => {
        if (payload[key] === undefined || payload[key] === null || payload[key] === '') {
          delete payload[key];
        }
      });

      return payload;
    }

    // Handle other exercises (vocab, listening, reading)
    const payload = {
      skill: values.skill || 'vocab',
      type: values.type || 'multiple_choice',
      level: values.level || 'A',
      questionText: values.questionText?.trim(),
      topicRef: values.topicRef?.trim(),
      explanation: values.explanation?.trim(),
    };

    // Add audio text for listening exercises
    if (values.skill === 'listening' && values.audioText) {
      payload.audioText = values.audioText.trim();
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
    // Check if this is a grammar exercise
    // We explicitly set skill='grammar' in listApiWrapper, or check for grammarId
    const isGrammarExercise = item.skill === 'grammar' || (item.grammarId && item.question);

    if (isGrammarExercise) {
      const formData = {
        skill: 'grammar',
        questionText: item.question || '',
        grammarId: item.grammarId?._id || item.grammarId || '',
        explanation: item.explanation || '',
        correctAnswer: item.correctAnswer || '',
        type: item.type || (item.options && item.options.length > 0 ? 'multiple_choice' : 'fill_in_blank'),
      };

      // Map options from array of strings to form format
      if (Array.isArray(item.options)) {
        formData.options = [...item.options];
        // Ensure we have 4 options
        while (formData.options.length < 4) {
          formData.options.push('');
        }
      } else {
        formData.options = ['', '', '', ''];
      }

      // Set default answers for compatibility
      formData.answers = [
        { text: '', isCorrect: false },
        { text: '', isCorrect: false },
        { text: '', isCorrect: false },
        { text: '', isCorrect: false },
      ];

      return formData;
    }

    // Handle regular exercises
    const formData = {
      skill: item.skill || 'vocab',
      type: item.type || 'multiple_choice',
      level: item.level || 'A',
      questionText: item.questionText || '',
      topicRef: item.topicRef || '',
      explanation: item.explanation || '',
      audioText: item.audioText || '',
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

  // Wrapper functions to handle grammar exercises
  const listApiWrapper = async (params = {}) => {
    // If filtering by grammar skill OR if a specific grammar is selected (implying grammar skill)
    if (params.skill === 'grammar' || params.grammarId) {
      // If grammarId filter is provided, fetch grammar exercises for that grammar
      if (params.grammarId) {
        const res = await fetchGrammarExercises(params.grammarId);

        let items = res.data || [];

        // Client-side fallback filtering to ensure we only get exercises for this grammar
        // This protects against backend ignoring the filter
        items = items.filter(item => {
          const gId = item.grammarId?._id || item.grammarId;
          return String(gId) === String(params.grammarId);
        });

        // Map grammar exercises to match UI format
        const grammar = grammars.find(g => String(g._id) === String(params.grammarId));
        const mappedData = items.map((item) => {
          // Logic: Options empty -> 'fill_in_blank', else 'multiple_choice'
          const computedType = (item.options && item.options.length > 0) ? 'Trắc nghiệm' : 'Điền từ';
          return {
            ...item,
            skill: 'grammar',
            questionText: item.question,
            grammarTitle: grammar?.title || item.grammarId?.title || '',
            type: computedType,
          };
        });

        // Apply search filter if provided
        let filteredData = mappedData;
        if (params.search) {
          const searchLower = params.search.toLowerCase();
          filteredData = mappedData.filter(item =>
            (item.questionText && item.questionText.toLowerCase().includes(searchLower)) ||
            (item.explanation && item.explanation.toLowerCase().includes(searchLower))
          );
        }

        return {
          data: filteredData,
          items: filteredData,
          total: filteredData.length,
          count: filteredData.length,
        };
      }
      // If no grammarId but skill=grammar, fetch exercises from all grammars
      try {
        // Call API without grammarId to get all
        const res = await fetchGrammarExercises();
        const allExercises = (res.data || []).map((item) => {
          // Find grammar title from the pre-loaded grammars list
          const grammarIdStr = item.grammarId?._id || item.grammarId;
          const grammar = grammars.find(g => String(g._id) === String(grammarIdStr));

          // Logic: Options empty -> 'fill_in_blank', else 'multiple_choice'
          const computedType = (item.options && item.options.length > 0) ? 'Trắc nghiệm' : 'Điền từ';

          return {
            ...item,
            skill: 'grammar',
            questionText: item.question,
            grammarTitle: grammar?.title || 'Unknown Grammar',
            // Ensure grammarId is the string ID for consistency if needed
            grammarId: grammarIdStr,
            type: computedType,
          };
        });

        // Apply search filter if provided
        let filteredData = allExercises;
        if (params.search) {
          const searchLower = params.search.toLowerCase();
          filteredData = allExercises.filter(item =>
            (item.questionText && item.questionText.toLowerCase().includes(searchLower)) ||
            (item.explanation && item.explanation.toLowerCase().includes(searchLower))
          );
        }

        return {
          data: filteredData,
          items: filteredData,
          total: filteredData.length,
          count: filteredData.length,
        };
      } catch (err) {
        console.error('Error fetching all grammar exercises:', err);
        return { data: [], items: [], total: 0, count: 0 };
      }
    }
    // For other skills, use regular API but exclude grammar exercises
    const filteredParams = { ...params };
    // Remove grammarId from params for regular exercises
    delete filteredParams.grammarId;
    return fetchExercises(filteredParams);
  };

  const createApiWrapper = async (payload) => {
    // Check if this is a grammar exercise by checking if payload has grammarId
    if (payload.grammarId) {
      // This is a grammar exercise
      return createGrammarExercise(payload);
    }
    return createExercise(payload);
  };

  const updateApiWrapper = async (id, payload) => {
    // Check if this is a grammar exercise by checking if payload has grammarId
    if (payload.grammarId) {
      return updateGrammarExercise(id, payload);
    }
    return updateExercise(id, payload);
  };

  const deleteApiWrapper = async (id, item) => {
    // Check if this is a grammar exercise
    // Grammar exercises have grammarId and question (not questionText)
    // Also explicitly check skill property if we added it in mapping
    const isGrammarExercise = item?.skill === 'grammar' || item?.grammarId || (item?.question && !item?.questionText);
    if (isGrammarExercise) {
      return deleteGrammarExercise(id);
    }
    return deleteExercise(id);
  };

  return (
    <ResourceManager
      ref={resourceManagerRef}
      resourceName="bài tập"
      columns={columns}
      filters={filters}
      formFields={formFields}
      listApi={listApiWrapper}
      createApi={createApiWrapper}
      updateApi={updateApiWrapper}
      deleteApi={deleteApiWrapper}
      mapItemToForm={mapExerciseToForm}
      buildPayload={buildPayload}
      hideHeader={true}
      customFormRenderer={renderExerciseForm}
    />
  );
};

export default Exercises;
