import { Vocabulary } from '../data/mockupVocabulary';

const DELAY = 500;

export const vocabularyService = {
  // Lấy tất cả từ vựng
  getAllVocabularies: () => {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(Vocabulary);
      }, DELAY);
    });
  },

  // Lấy danh sách từ vựng thuộc một chủ đề cụ thể
  // Ví dụ: Lấy tất cả từ thuộc "Greetings"
  getVocabulariesByTopic: (topicNameOrId) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        // Lọc dữ liệu
        const filtered = Vocabulary.filter(v => v.topic === topicNameOrId);
        resolve(filtered);
      }, DELAY);
    });
  },

  // Lấy chi tiết 1 từ
  getVocabularyById: (id) => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const item = Vocabulary.find(v => v.id === id);
        item ? resolve(item) : reject(new Error("Vocabulary not found"));
      }, DELAY);
    });
  },

  // Giả lập xóa
  deleteVocabulary: (id) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        console.log(`Mock API: Deleted Vocabulary ${id}`);
        resolve({ success: true });
      }, DELAY);
    });
  }
};