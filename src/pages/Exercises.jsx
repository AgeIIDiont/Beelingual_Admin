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
  fetchGrammarCategories,
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
  { value: 'cloze_test', label: 'Bài đục lỗ' },
];

const levelOptions = [
  { value: '', label: 'Tất cả cấp độ' },
  { value: 'A1', label: 'Level A1' },
  { value: 'A2', label: 'Level A2' },
  { value: 'B1', label: 'Level B1' },
  { value: 'B2', label: 'Level B2' },
  { value: 'C1', label: 'Level C1' },
  { value: 'C2', label: 'Level C2' },
];

const Exercises = () => {
  const { setPageInfo } = usePage();
  const [searchParams] = useSearchParams();
  const resourceManagerRef = useRef(null);
  const [topics, setTopics] = React.useState([]);
  const [grammars, setGrammars] = React.useState([]); // For filter
  const [formGrammars, setFormGrammars] = React.useState([]); // For form dropdown
  const [grammarCategories, setGrammarCategories] = React.useState([]);
  // State để track filter values cho real-time filtering
  const [filterValues, setFilterValues] = React.useState({
    skill: searchParams.get('skill') || '',
    grammarCategoryId: searchParams.get('grammarCategoryId') || '',
    grammarId: searchParams.get('grammarId') || '',
  });

  useEffect(() => {
    fetchTopics().then((res) => {
      setTopics(res.data || res.items || []);
    }).catch(console.error);

    // Không fetch grammar lúc init nữa - sẽ fetch khi user chọn category

    fetchGrammarCategories({}).then((res) => {
      // Backend trả về mảng trực tiếp, không phải object với thuộc tính data
      const categories = Array.isArray(res) ? res : (res.data || res.items || []);
      console.log('Grammar Categories:', categories); // Debug log
      setGrammarCategories(categories);
    }).catch((err) => {
      console.error('Error fetching grammar categories:', err);
    });
  }, []);

  // Fetch grammar khi user chọn category (server-side filtering)
  useEffect(() => {
    if (filterValues.grammarCategoryId) {
      console.log('🔍 Fetching grammars for category:', filterValues.grammarCategoryId);
      fetchGrammar({ categoryId: filterValues.grammarCategoryId, limit: 1000 })
        .then((res) => {
          const grammarData = res.data || res.items || [];
          setGrammars(grammarData);
          console.log('✅ Fetched grammars:', grammarData.length, 'items');
        })
        .catch((err) => {
          console.error('❌ Error fetching grammars:', err);
          setGrammars([]);
        });
    } else {
      // Reset grammars khi không chọn category
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setGrammars([]);
    }
  }, [filterValues.grammarCategoryId]);

  // Helper to fetch grammars for form based on category
  const fetchFormGrammars = async (categoryId) => {
    if (!categoryId) {
      setFormGrammars([]);
      return;
    }
    try {
      // Use API wrapper to fetch grammars
      const res = await fetchGrammar({ categoryId, limit: 1000 });
      setFormGrammars(res.data || res.items || []);
    } catch (err) {
      console.error('Error fetching form grammars:', err);
      setFormGrammars([]);
    }
  };

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
              <div
                className="fw-semibold text-dark"
                title={question}
                style={{
                  display: '-webkit-box',
                  WebkitLineClamp: 1,
                  WebkitBoxOrient: 'vertical',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis'
                }}
              >
                {question}
              </div>
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
          if (['A1', 'A2', 'A'].includes(item.level)) colorClass = 'bg-success';
          if (['B1', 'B2', 'B'].includes(item.level)) colorClass = 'bg-warning text-dark';
          if (['C1', 'C2', 'C'].includes(item.level)) colorClass = 'bg-danger';

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
        onChange: (value) => {
          setFilterValues(prev => ({
            ...prev,
            skill: value,
            grammarCategoryId: value === 'grammar' ? prev.grammarCategoryId : '',
            grammarId: value === 'grammar' ? prev.grammarId : '',
          }));
        },
      },
      {
        name: 'grammarCategoryId',
        label: 'Danh mục ngữ pháp',
        type: 'select',
        options: [
          { value: '', label: 'Chọn danh mục' },
          ...grammarCategories.map((cat) => ({ value: cat._id, label: cat.name })),
        ],
        defaultValue: searchParams.get('grammarCategoryId') || '',
        col: 3,
        hideCondition: (values) => values.skill !== 'grammar',
        onChange: (value) => {
          setFilterValues(prev => ({
            ...prev,
            grammarCategoryId: value,
            grammarId: '', // Reset grammar when category changes
          }));
        },
      },
      {
        name: 'grammarId',
        label: 'Bài ngữ pháp',
        type: 'select',
        options: [
          { value: '', label: 'Tất cả bài ngữ pháp' },
          // Backend đã filter theo category rồi, chỉ cần map ra options
          ...grammars.map((g) => ({ value: g._id, label: g.title })),
        ],
        defaultValue: searchParams.get('grammarId') || '',
        col: 3,
        // Chỉ hiển thị khi: skill = grammar VÀ đã chọn danh mục
        hideCondition: (values) => values.skill !== 'grammar' || !values.grammarCategoryId,
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
    [grammars, grammarCategories, searchParams, filterValues]
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
        defaultValue: 'A1',
        col: 4,
        required: true,
      },
    ],
    []
  );

  const renderExerciseForm = ({ formState, setFormState, renderFormField }) => {
    const currentType = formState.type || 'multiple_choice';
    const currentSkill = formState.skill || 'vocab';
    const selectedCategoryId = formState.grammarCategoryId || '';

    // Use formGrammars state which is fetched from server based on category
    // This allows separation between filter search (grammars state) and form dropdown (formGrammars state)
    const filteredGrammars = formGrammars;

    // Get selected category to generate dynamic label
    const selectedCategory = grammarCategories.find(cat => String(cat._id) === String(selectedCategoryId));

    // Generate dynamic label based on category
    const getGrammarLabel = () => {
      if (!selectedCategory) return 'Chọn ngữ pháp';

      const categoryName = selectedCategory.name.toLowerCase();
      if (categoryName.includes('tense')) return 'Chọn thì';
      if (categoryName.includes('modal')) return 'Chọn động từ khuyết thiếu';
      if (categoryName.includes('conditional')) return 'Chọn loại câu điều kiện';
      if (categoryName.includes('passive')) return 'Chọn dạng câu bị động';
      if (categoryName.includes('wish')) return 'Chọn loại câu ước';
      if (categoryName.includes('tag')) return 'Chọn dạng câu hỏi đuôi';

      return `Chọn ${selectedCategory.name}`;
    };

    const grammarLabel = getGrammarLabel();

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

        {/* Grammar Category for grammar exercises */}
        {currentSkill === 'grammar' && (
          <div className="col-md-6 mb-3">
            <label htmlFor="grammarCategoryId" className="form-label fw-medium text-muted">
              Danh mục ngữ pháp <span className="text-danger">*</span>
            </label>
            <select
              className="form-select"
              id="grammarCategoryId"
              name="grammarCategoryId"
              value={formState.grammarCategoryId || ''}
              onChange={(e) => {
                // Reset grammarId when category changes
                setFormState({
                  ...formState,
                  grammarCategoryId: e.target.value,
                  grammarId: '' // Clear selected grammar
                });
                // Fetch grammars for the new category
                fetchFormGrammars(e.target.value);
              }}
              required
            >
              <option value="">-- Chọn danh mục --</option>
              {grammarCategories.map((category) => (
                <option key={category._id} value={category._id}>
                  {category.name}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Grammar ID for grammar exercises - only show if category is selected */}
        {currentSkill === 'grammar' && selectedCategoryId && (
          <div className="col-md-6 mb-3">
            <label htmlFor="grammarId" className="form-label fw-medium text-muted">
              {grammarLabel} <span className="text-danger">*</span>
            </label>
            <select
              className="form-select"
              id="grammarId"
              name="grammarId"
              value={formState.grammarId || ''}
              onChange={(e) => setFormState({ ...formState, grammarId: e.target.value })}
              required
            >
              <option value="">-- {grammarLabel} --</option>
              {filteredGrammars.map((grammar) => (
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

        {/* Removed Audio File input as per request */}

        {/* Multiple choice answers - for grammar exercises (array of strings) */}
        {currentType === 'multiple_choice' && currentSkill === 'grammar' && (
          <div className="col-12 mb-3">
            <label className="form-label fw-medium text-muted">
              Danh sách đáp án
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
              Danh sách đáp án
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

        {/* Fill in blank or Cloze Test - correct answer only */}
        {(currentType === 'fill_in_blank' || currentType === 'cloze_test') && (
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
              placeholder={
                currentType === 'cloze_test'
                  ? 'đáp án 1/ đáp án 2/...'
                  : 'Nhập đáp án đúng'
              }
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
        // fill_in_blank or cloze_test
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

    // Add audio text (stored in 'audioUrl' field) for listening exercises
    if (values.skill === 'listening' && values.audioText) {
      payload.audioUrl = values.audioText.trim();
    }

    // Add answers for multiple choice
    if (values.type === 'multiple_choice' && values.answers) {
      payload.options = values.answers
        .filter((ans) => ans.text.trim())
        .map((ans) => ({
          text: ans.text.trim(),
          isCorrect: ans.isCorrect || false,
        }));

      // Find correct answer from answers array and set it to payload.correctAnswer
      const correctOpt = values.answers.find(ans => ans.isCorrect);
      if (correctOpt && correctOpt.text) {
        payload.correctAnswer = correctOpt.text.trim();
      }
    }

    // Add correct answer for fill in blank or cloze test
    if ((values.type === 'fill_in_blank' || values.type === 'cloze_test') && values.correctAnswer) {
      payload.correctAnswer = values.correctAnswer.trim();
    }

    // Remove empty fields
    Object.keys(payload).forEach((key) => {
      // Don't auto-delete topicRef if we want to clear it (it might be null)
      // But if it's undefined, we might want to delete it.
      // Strategy: Let's clean up everything first, then handle topicRef null explicitly if needed.
      if (payload[key] === undefined || payload[key] === null || payload[key] === '') {
        delete payload[key];
      }
    });

    // Explicitly set topicRef to null if it was cleared (empty string from form) and skill is NOT grammar
    // We check if it's missing from payload (deleted above) but WAS present in values as empty string
    if (values.skill !== 'grammar' && (!values.topicRef || values.topicRef.trim() === '')) {
      payload.topicRef = null;
    }

    return payload;
  };

  const mapExerciseToForm = (item) => {
    // Check if this is a grammar exercise
    // We explicitly set skill='grammar' in listApiWrapper, or check for grammarId
    const isGrammarExercise = item.skill === 'grammar' || (item.grammarId && item.question);

    if (isGrammarExercise) {
      // Extract grammarId and find the corresponding grammar to get categoryId
      const grammarIdValue = item.grammarId ? String(item.grammarId._id || item.grammarId) : '';

      // Try to find category ID from item properties
      let categoryIdValue = '';
      if (item.grammarId && item.grammarId.categoryId) {
        categoryIdValue = String(item.grammarId.categoryId._id || item.grammarId.categoryId);
      } else {
        // Fallback: try to find in current loaded grammars (might fail if not loaded)
        // grammarIdValue should be compared as string
        const grammar = grammars.find(g => String(g._id) === String(grammarIdValue));
        const gCat = grammar?.categoryId;
        categoryIdValue = gCat ? String(gCat._id || gCat) : '';
      }

      // Trigger fetch grammars for this category to populate form dropdown
      if (categoryIdValue) {
        fetchFormGrammars(categoryIdValue);
      }

      const formData = {
        skill: 'grammar',
        questionText: item.question || '',
        grammarId: grammarIdValue,
        grammarCategoryId: categoryIdValue,
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
      audioText: item.audioUrl || item.audio || '', // Map 'audioUrl' or 'audio' (backend) to 'audioText' (frontend form)
      audio: item.audioUrl || item.audio || '',
      correctAnswer: item.correctAnswer || '',
    };

    // Map options to answers for multiple choice
    if (item.type === 'multiple_choice' && Array.isArray(item.options)) {
      formData.answers = item.options.map((opt) => ({
        text: opt.text || '',
        // Check both the object's isCorrect and string comparison with item.correctAnswer
        isCorrect: opt.isCorrect || (item.correctAnswer && opt.text === item.correctAnswer) || false,
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

  // Ref to hold grammars for stable API access
  const grammarsRef = useRef(grammars);

  useEffect(() => {
    grammarsRef.current = grammars;
  }, [grammars]);

  // Wrapper functions to handle grammar exercises
  const listApiWrapper = React.useCallback(async (params = {}) => {
    // TRƯỜNG HỢP 1: Lọc theo Skill = Grammar HOẶC đang chọn cụ thể 1 bài Grammar (hoặc category)
    if (params.skill === 'grammar' || params.grammarId || params.grammarCategoryId) {
      try {
        // Prepare params for grammar exercises API
        const grammarParams = {};
        if (params.grammarId) grammarParams.grammarId = params.grammarId;
        if (params.grammarCategoryId) grammarParams.grammarCategoryId = params.grammarCategoryId;

        const res = await fetchGrammarExercises(params.grammarId || '', grammarParams);

        let items = res.data || [];

        // Map grammar exercises to match UI format
        // Use ref to avoid dependency change
        const currentGrammars = grammarsRef.current;

        // Apply search filter if provided (Client-side search for grammar exercises)
        if (params.search) {
          const searchLower = params.search.toLowerCase();
          items = items.filter(item =>
            (item.question && item.question.toLowerCase().includes(searchLower)) ||
            (item.explanation && item.explanation.toLowerCase().includes(searchLower))
          );
        }

        const mappedData = items.map((item) => {
          // Logic: Options empty -> 'fill_in_blank', else 'multiple_choice'
          const computedType = (item.options && item.options.length > 0) ? 'Trắc nghiệm' : 'Điền từ';

          // Ưu tiên lấy title từ populated grammarId (backend trả về)
          // Fallback sang lookup từ list grammars nếu backend chưa populate
          const grammarIdStr = item.grammarId?._id || item.grammarId;
          const populatedTitle = item.grammarId?.title;
          const populatedLevel = item.grammarId?.level;

          const grammar = currentGrammars.find(g => String(g._id) === String(grammarIdStr));

          return {
            ...item,
            skill: 'grammar',
            questionText: item.question,
            grammarTitle: populatedTitle || grammar?.title || 'Unknown Grammar',
            level: populatedLevel || grammar?.level || 'A1',
            type: computedType,
            grammarId: item.grammarId // Keep the object or string
          };
        });

        return {
          data: mappedData,
          items: mappedData,
          total: mappedData.length,
          count: mappedData.length,
        };
      } catch (err) {
        console.error('Error fetching grammar exercises:', err);
        return { data: [], items: [], total: 0, count: 0 };
      }
    }

    // TRƯỜNG HỢP 2: Lọc theo Skill khác (Vocab, Listening, Reading)
    if (params.skill && params.skill !== 'grammar') {
      const filteredParams = { ...params };
      delete filteredParams.grammarId;
      delete filteredParams.grammarCategoryId;
      return fetchExercises(filteredParams);
    }

    // TRƯỜNG HỢP 3: Không chọn skill nào (Tất cả kỹ năng) -> Merge cả 2 nguồn
    try {
      const filteredParams = { ...params };
      delete filteredParams.grammarId;
      delete filteredParams.grammarCategoryId;

      // Chạy song song 2 request
      const [regularRes, grammarRes] = await Promise.all([
        fetchExercises(filteredParams),
        fetchGrammarExercises() // Fetch all grammar exercises for merging
      ]);

      const regularExercises = regularRes.data || regularRes.items || [];

      // Xử lý grammar exercises
      let grammarExercises = grammarRes.data || [];
      const currentGrammars = grammarsRef.current; // Snapshot for mapping

      // Nếu có search, phải filter grammar exercises client-side (vì API grammar chưa support search text)
      if (params.search) {
        const searchLower = params.search.toLowerCase();
        grammarExercises = grammarExercises.filter(item =>
          (item.question && item.question.toLowerCase().includes(searchLower)) ||
          (item.explanation && item.explanation.toLowerCase().includes(searchLower))
        );
      }

      const mappedGrammarExercises = grammarExercises.map((item) => {
        const computedType = (item.options && item.options.length > 0) ? 'Trắc nghiệm' : 'Điền từ';
        const grammarIdStr = item.grammarId?._id || item.grammarId;
        const populatedTitle = item.grammarId?.title;
        const populatedLevel = item.grammarId?.level;
        const grammar = currentGrammars.find(g => String(g._id) === String(grammarIdStr));

        return {
          ...item,
          skill: 'grammar',
          questionText: item.question,
          grammarTitle: populatedTitle || grammar?.title || 'Unknown Grammar',
          level: populatedLevel || grammar?.level || 'A1',
          type: computedType,
          createdAt: item.createdAt // Ensure date for sorting
        };
      });

      // Merge and sort
      const allExercises = [...regularExercises, ...mappedGrammarExercises];

      // Sort by createdAt desc
      allExercises.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

      // Note: Pagination logic here is tricky because we merged a paginated list with a full list.
      // Ideally backend should support unified querying. 
      // For now we return the merged list. ResourceManager might slice it if client-side pagination is enabled, 
      // but if server-side pagination is expected, this "All Skills" view might behave oddly regarding page numbers.
      // However, usually for "All", user expects to see everything mixed. 

      return {
        data: allExercises,
        items: allExercises,
        total: (regularRes.total || 0) + mappedGrammarExercises.length,
        count: allExercises.length,
        // Recalculate pages if needed, or let client handle if we return all data (though regular is paginated)
        // Adjusting limit to match returned data size effectively disables server pagination for this view
        page: 1,
        limit: allExercises.length,
        totalPages: 1
      };

    } catch (err) {
      console.error('Error fetching combined exercises:', err);
      // Fallback to just regular exercises if grammar fetch fails
      return fetchExercises(params);
    }
  }, []);

  const createApiWrapper = React.useCallback(async (payload) => {
    // Check if this is a grammar exercise by checking if payload has grammarId
    if (payload.grammarId) {
      // This is a grammar exercise
      return createGrammarExercise(payload);
    }
    return createExercise(payload);
  }, []);

  const updateApiWrapper = React.useCallback(async (id, payload) => {
    // Check if this is a grammar exercise by checking if payload has grammarId
    if (payload.grammarId) {
      return updateGrammarExercise(id, payload);
    }
    return updateExercise(id, payload);
  }, []);

  const deleteApiWrapper = React.useCallback(async (id, item) => {
    // Check if this is a grammar exercise
    // Grammar exercises have grammarId and question (not questionText)
    // Also explicitly check skill property if we added it in mapping
    const isGrammarExercise = item?.skill === 'grammar' || item?.grammarId || (item?.question && !item?.questionText);
    if (isGrammarExercise) {
      return deleteGrammarExercise(id);
    }
    return deleteExercise(id);
  }, []);

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
