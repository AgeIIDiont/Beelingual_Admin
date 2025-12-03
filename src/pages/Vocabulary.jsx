import React, { useMemo , useEffect, useRef, useState } from 'react';
import ResourceManager from '../components/ui/ResourceManager';
import {
  fetchVocabulary,
  createVocabulary,
  updateVocabulary,
  deleteVocabulary,
} from '../services/adminService';
import { fetchTopics as fetchAllTopics } from '../services/adminService';
const levelOptions = [
  { value: '', label: 'Tất cả' },
  { value: 'A', label: 'Level A' },
  { value: 'B', label: 'Level B' },
  { value: 'C', label: 'Level C' },
];

const typeOptions = [
  { value: 'noun', label: 'Danh từ (n)' },
  { value: 'verb', label: 'Động từ (v)' },
  { value: 'adjective', label: 'Tính từ (adj)' },
  { value: 'adverb', label: 'Trạng từ (adv)' },
  { value: 'preposition', label: 'Giới từ (prep)' },
  { value: 'pronoun', label: 'Đại từ (pron)' },
  { value: 'conjunction', label: 'Liên từ (conj)' },
  { value: 'determiner', label: 'Hạn định từ (det)' },
  { value: 'interjection', label: 'Thán từ (int)' },
  { value: 'idiom', label: 'Thành ngữ (idiom)' },
  { value: 'phrase', label: 'Cụm từ (phrase)' },
];

import { usePage } from '../contexts/PageContext';
const Vocabularys = () => {
    const { setPageInfo } = usePage();
    const resourceManagerRef = useRef(null);
    const [topicOptions, setTopicOptions] = useState([]);

    useEffect(() => {
      const loadTopics = async () => {
        try {
          const response = await fetchAllTopics();
          const topicsData = response.data || [];
          const options = topicsData.map((topic) => ({
            value: topic._id || topic.id || topic.name,
            label: `${topic.name}`,
          }));
          setTopicOptions([{ value: '', label: 'Tất cả' }, ...options]);
        } catch (error) {
          console.error('Error fetching topics:', error);
        }
      };
      loadTopics();
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
          title: 'Quản lý Từ vựng',
          description: 'Quản lý toàn bộ từ vựng: thêm, sửa, xóa và tìm kiếm.',
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
                Thêm từ vựng
              </button>
            </>
          ),
        });
      return () => setPageInfo({ title: '', description: '', actions: null });
    }, [setPageInfo]);
  // Hàm xử lý phát âm thanh
  const playAudio = (url) => {
    if (!url) return;
    const audio = new Audio(url);
    audio.play().catch((err) => console.error("Audio play error:", err));
  };

  const columns = useMemo(
    () => [
      {
        key: 'imageUrl',
        label: 'Hình ảnh',
        minWidth: '100px',
        render: (item) => (
          item.imageUrl ? (
            <div className="ratio ratio-4x3" style={{ width: '80px', borderRadius: '8px', overflow: 'hidden' }}>
              <img 
                src={item.imageUrl} 
                alt={item.word} 
                className="object-fit-cover w-100 h-100"
                onError={(e) => { e.target.src = 'https://placehold.co/80x60?text=No+Img'; }}
              />
            </div>
          ) : (
            <div className="bg-light d-flex align-items-center justify-content-center text-muted small" style={{ width: '80px', height: '60px', borderRadius: '8px' }}>
              No Img
            </div>
          )
        ),
      },
      {
        key: 'word',
        label: 'Từ vựng & Phát âm',
        minWidth: '200px',
        render: (item) => (
          <div className="d-flex flex-column gap-1">
            <div className="d-flex align-items-center gap-2">
              <span className="fw-bold text-dark fs-5">{item.word}</span>
              {/* Badge hiển thị loại từ */}
              {item.type && (
                <span className="badge bg-light text-secondary border border-secondary-subtle small fw-normal">
                  {typeOptions.find(t => t.value === item.type)?.label?.match(/\((.*?)\)/)?.[1] || item.type}
                </span>
              )}
            </div>
            
            <div className="d-flex align-items-center gap-2">
              {/* Phiên âm */}
              <span className="text-muted fst-italic font-monospace">/{item.pronunciation}/</span>
              
              {/* Nút nghe Audio */}
              {item.audioUrl && (
                <button 
                  type="button"
                  className="btn btn-sm btn-light text-primary rounded-circle p-1 d-flex align-items-center justify-content-center"
                  style={{ width: '28px', height: '28px' }}
                  onClick={() => playAudio(item.audioUrl)}
                  title="Nghe phát âm"
                >
                  <i className="fas fa-volume-high"></i>
                </button>
              )}
            </div>
          </div>
        ),
      },
      {
        key: 'meaning',
        label: 'Ý nghĩa',
        minWidth: '250px',
        render: (item) => (
          <div style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word', lineHeight: '1.5' }}>
            {item.meaning}
          </div>
        ),
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
        key: 'topic',
        label: 'Chủ đề',
        render: (item) => {
          // topic may be a populated object or a plain string (id or name)
          if (!item.topic) return '—';
          if (typeof item.topic === 'object') {
            return (
              <span className="badge bg-info bg-opacity-10 text-info border border-info border-opacity-25 px-2 py-1">
                {item.topic.icon ? item.topic.icon + ' ' : ''}{item.topic.name || item.topic.label || item.topic.title}
              </span>
            );
          }

          // If topic is a string, it might be an id. Try to resolve a friendly name from topicOptions
          const topicStr = String(item.topic);
          const found = topicOptions.find((t) => String(t.value) === topicStr || String(t.label) === topicStr);
          const label = found ? found.label : topicStr;

          return (
            <span className="badge bg-info bg-opacity-10 text-info border border-info border-opacity-25 px-2 py-1">
              {label}
            </span>
          );
        },
      },
    ],
    [topicOptions]
  );

  const filters = useMemo(
    () => [
      {
        name: 'search',
        label: 'Tìm kiếm từ...',
        type: 'text',
        placeholder: 'Nhập từ vựng hoặc ý nghĩa...',
        col: 4,
      },
      {
        name: 'topic',
        label: 'Chủ đề',
        type: 'select',
        options: topicOptions,
        col: 3,
      },
      {
        name: 'level',
        label: 'Trình độ',
        type: 'select',
        options: levelOptions,
        col: 2,
      },
      {
        name: 'type',
        label: 'Loại từ',
        type: 'select',
        options: typeOptions,
        col: 3,
      },
    ],
    [topicOptions]
  );

  const formFields = useMemo(
    () => [
      {
        name: 'word',
        label: 'Từ vựng (Word)',
        type: 'text',
        required: true,
        placeholder: 'Ví dụ: Serendipity',
        col: 6,
      },
      {
        name: 'pronunciation',
        label: 'Phiên âm (IPA)',
        type: 'text',
        required: true,
        placeholder: 'Ví dụ: /ˌser.ənˈdɪp.ə.ti/',
        col: 6,
      },
      {
        name: 'type',
        label: 'Loại từ',
        type: 'select',
        options: typeOptions,
        defaultValue: 'noun',
        col: 6,
      },
      {
        name: 'level',
        label: 'Trình độ',
        type: 'select',
        options: levelOptions.slice(1),
        defaultValue: 'A',
        col: 6,
      },
      {
        name: 'meaning',
        label: 'Ý nghĩa / Định nghĩa',
        type: 'textarea',
        rows: 2,
        required: true,
        placeholder: 'Giải thích nghĩa của từ...',
        col: 12,
      },
      {
        name: 'topic',
        label: 'Chủ đề',
        type: 'select',
        options: topicOptions.slice(1),
        required: true,
        col: 12,
        placeholder: 'Ví dụ: Travel, Business...'
      },
      {
        name: 'audioUrl',
        label: 'Link Audio (MP3)',
        type: 'text',
        placeholder: 'https://example.com/audio.mp3',
        col: 12,
      },
      {
        name: 'imageUrl',
        label: 'Link Hình ảnh',
        type: 'text',
        placeholder: 'https://example.com/image.jpg',
        col: 12,
      },
    ],
    [topicOptions]
  );

  const buildPayload = (values) => {
    const payload = {
      word: values.word?.trim(),
      meaning: values.meaning?.trim(),
      level: values.level || 'A',
      type: values.type || 'noun',
      pronunciation: values.pronunciation?.trim(),
      topic: values.topic?.trim(),
      imageUrl: values.imageUrl?.trim(),
      audioUrl: values.audioUrl?.trim(),
    };

    Object.keys(payload).forEach((key) => {
      if (!payload[key]) delete payload[key];
    });

    return payload;
  };

  return (
    <ResourceManager
      ref={resourceManagerRef}
      resourceName="từ vựng"
      columns={columns}
      filters={filters}
      formFields={formFields}
      listApi={async (params) => {
        const res = await fetchVocabulary(params);
        let items = res.data || res.items || [];

        try {
          if (params) {
            if (params.topic) {
              const wanted = String(params.topic).toLowerCase();
              items = items.filter((it) => {
                const topicId = it.topic?._id || '';
                const topicName = (it.topic?.name || it.topic || '').toString().toLowerCase();
                return String(topicId) === wanted || topicName === wanted;
              });
            }
            if (params.search) {
              const q = String(params.search).toLowerCase();
              items = items.filter((it) => (it.word || '').toLowerCase().includes(q) || (it.meaning || '').toLowerCase().includes(q));
            }
            if (params.level) {
              if (params.level !== '') items = items.filter((it) => it.level === params.level);
            }
            if (params.type) {
              if (params.type !== '') items = items.filter((it) => it.type === params.type);
            }
          }
        } catch (e) {
          console.warn('Client-side filter fallback failed for Vocabulary', e);
        }

        return { ...res, data: items, total: items.length };
      }}
      createApi={createVocabulary}
      updateApi={updateVocabulary}
      deleteApi={deleteVocabulary}
      hideHeader={true}
      buildPayload={buildPayload}
    />
  );
};

export default Vocabularys;

