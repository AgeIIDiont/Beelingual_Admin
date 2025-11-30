import api from "../../../services/api";

// 1. Sửa tên hàm từ getAllgetAllTopics thành getAllTopics
export const getAllTopics = async (params) => {
  try {
    const res = await api.get("/topics", { params });
    // Kiểm tra xem backend trả về res.data hay res.data.data để return cho đúng cấu trúc UI cần
    return res.data; 
  } catch (err) { 
    console.error("❌ Failed to fetch topics:", err);
    throw err; // Nên throw err để bên component bắt được lỗi
  }
};

// 2. Thêm hàm deleteTopic (vì bên Topics.jsx có gọi hàm này)
export const deleteTopic = async (id) => {
  try {
    const res = await api.delete(`/topics/${id}`);
    return res.data;
  } catch (err) {
    console.error("❌ Failed to delete topic:", err);
    throw err;
  }
};