import React from 'react';

const ChatbotSection = ({ chatConfig, setChatConfig, onSave, saving }) => {
  const updateConfig = (key, value) => {
    setChatConfig(prev => ({ ...prev, [key]: value }));
  };

  const updateQuestion = (idx, field, value) => {
    const newQs = [...chatConfig.suggestedQuestions];
    newQs[idx][field] = value;
    setChatConfig(prev => ({ ...prev, suggestedQuestions: newQs }));
  };

  const addQuestion = () => {
    const newQuestion = { text: '', response: '' };
    setChatConfig(prev => ({
      ...prev,
      suggestedQuestions: [...(prev.suggestedQuestions || []), newQuestion]
    }));
  };

  const removeQuestion = (idx) => {
    setChatConfig(prev => ({
      ...prev,
      suggestedQuestions: prev.suggestedQuestions.filter((_, i) => i !== idx)
    }));
  };

  return (
    <div className="fade-in">
      {/* Bot Identity */}
      <h6 className="fw-bold text-secondary mb-3">
        <i className="fas fa-robot me-2"></i>
        Nhân dạng Bot
      </h6>

      <div className="row g-3 mb-4">
        <div className="col-md-6">
          <div className="lp-form-group mb-0">
            <label className="lp-label">Tên Bot</label>
            <input
              type="text"
              className="lp-input"
              value={chatConfig.botName || ''}
              onChange={(e) => updateConfig('botName', e.target.value)}
              placeholder="Bee Assistant"
            />
          </div>
        </div>

        <div className="col-md-6">
          <div className="lp-form-group mb-0">
            <label className="lp-label">Tính cách</label>
            <input
              type="text"
              className="lp-input"
              value={chatConfig.personality || ''}
              onChange={(e) => updateConfig('personality', e.target.value)}
              placeholder="Thân thiện, nhiệt tình..."
            />
          </div>
        </div>
      </div>

      {/* Error Messages */}
      <h6 className="fw-bold text-secondary mb-3">
        <i className="fas fa-exclamation-triangle me-2"></i>
        Thông báo lỗi
      </h6>

      <div className="row g-3 mb-4">
        <div className="col-12">
          <div className="lp-form-group mb-0">
            <label className="lp-label">Lỗi chung</label>
            <input
              type="text"
              className="lp-input"
              value={chatConfig.errorMessage || ''}
              onChange={(e) => updateConfig('errorMessage', e.target.value)}
              placeholder="Xin lỗi, đã có lỗi xảy ra..."
            />
          </div>
        </div>

        <div className="col-md-6">
          <div className="lp-form-group mb-0">
            <label className="lp-label">Lỗi giới hạn tốc độ</label>
            <input
              type="text"
              className="lp-input"
              value={chatConfig.rateLimitMessage || ''}
              onChange={(e) => updateConfig('rateLimitMessage', e.target.value)}
              placeholder="Bạn đang gửi quá nhanh..."
            />
          </div>
        </div>

        <div className="col-md-6">
          <div className="lp-form-group mb-0">
            <label className="lp-label">Lỗi không tìm thấy model</label>
            <input
              type="text"
              className="lp-input"
              value={chatConfig.modelNotFoundMessage || ''}
              onChange={(e) => updateConfig('modelNotFoundMessage', e.target.value)}
              placeholder="Không thể kết nối AI..."
            />
          </div>
        </div>
      </div>

      {/* Suggested Questions */}
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h6 className="fw-bold text-secondary mb-0">
          <i className="fas fa-lightbulb me-2"></i>
          Câu hỏi gợi ý ({chatConfig.suggestedQuestions?.length || 0})
        </h6>
        <button
          type="button"
          className="lp-btn-add"
          onClick={addQuestion}
        >
          <i className="fas fa-plus"></i>
          Thêm câu hỏi
        </button>
      </div>

      {chatConfig.suggestedQuestions?.map((q, idx) => (
        <div key={idx} className="lp-section-card">
          <div className="lp-section-card-title d-flex justify-content-between align-items-center">
            <div>
              <span className="badge bg-info text-white rounded-pill">Q{idx + 1}</span>
              <span className="ms-2">{q.text?.substring(0, 40) || 'Câu hỏi chưa đặt'}{q.text?.length > 40 ? '...' : ''}</span>
            </div>
            <button
              type="button"
              className="lp-btn-delete"
              onClick={() => removeQuestion(idx)}
              title="Xóa câu hỏi này"
            >
              <i className="fas fa-trash-alt"></i>
            </button>
          </div>

          <div className="lp-form-group mb-3">
            <label className="lp-label">Câu hỏi</label>
            <input
              type="text"
              className="lp-input"
              value={q.text || ''}
              onChange={(e) => updateQuestion(idx, 'text', e.target.value)}
              placeholder="Người dùng có thể hỏi gì?"
            />
          </div>

          <div className="lp-form-group mb-0">
            <label className="lp-label">Câu trả lời mẫu</label>
            <textarea
              className="lp-textarea"
              value={q.response || ''}
              onChange={(e) => updateQuestion(idx, 'response', e.target.value)}
              placeholder="Bot sẽ trả lời như thế nào?"
              rows={2}
            />
          </div>
        </div>
      ))}

      <button
        className="lp-btn-save mt-3"
        onClick={onSave}
        disabled={saving}
      >
        {saving ? (
          <>
            <span className="spinner-border spinner-border-sm"></span>
            Đang lưu...
          </>
        ) : (
          <>
            <i className="fas fa-save"></i>
            Lưu cấu hình Chatbot
          </>
        )}
      </button>
    </div>
  );
};

export default ChatbotSection;
