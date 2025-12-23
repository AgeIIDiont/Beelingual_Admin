import React, { useState, useEffect, useRef } from 'react';

const TopicReorderModal = ({ show, onClose, topics = [], onUpdateOrder }) => {
    const [items, setItems] = useState([]);
    const [draggingIndex, setDraggingIndex] = useState(null);
    const [dragOverIndex, setDragOverIndex] = useState(null);
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        if (topics) {
            // Sắp xếp lại danh sách theo order hiện có
            const sorted = [...topics].sort((a, b) => (a.order || 999) - (b.order || 999));
            setItems(sorted);
        }
    }, [topics]);

    if (!show) return null;

    const handleDragStart = (e, index) => {
        setDraggingIndex(index);
        e.dataTransfer.effectAllowed = 'move';
        // Ẩn ghost image mặc định nếu muốn hoặc để nguyên
        // e.dataTransfer.setDragImage(e.target, 0, 0);
    };

    const handleDragOver = (e, index) => {
        e.preventDefault(); // Cần thiết để cho phép Drop
        if (draggingIndex === null || draggingIndex === index) return;
        setDragOverIndex(index);
    };

    const handleDrop = async (e, dropIndex) => {
        e.preventDefault();
        if (draggingIndex === null || draggingIndex === dropIndex) {
            setDraggingIndex(null);
            setDragOverIndex(null);
            return;
        }

        const newItems = [...items];
        const [movedItem] = newItems.splice(draggingIndex, 1);
        newItems.splice(dropIndex, 0, movedItem);

        // Cập nhật lại order tạm thời để hiển thị (1, 2, 3...)
        // Nhưng CẦN LƯU Ý: Backend logic dồn hàng có thể khác, nhưng ở đây ta chỉ cần gửi item và vị trí mới
        // Tuy nhiên, logic backend hiện tại là `updateTopic(id, { order: newOrder })`
        // Nên ta cần xác định newOrder = dropIndex + 1.

        setItems(newItems);
        setDraggingIndex(null);
        setDragOverIndex(null);

        // Gọi API cập nhật ngay lặp tức hoặc chờ nút Lưu?
        // User request: "kéo thả được không phải là làm trực tiếp trong bảng... hiện lên form"
        // Thường UX tốt nhất là kéo thả xong -> Bấm Lưu. Hoặc kéo thả -> Lưu luôn.
        // Với logic backend "chèn và dồn hàng", gọi API từng lần kéo thả sẽ an toàn hơn là gửi cả list.
        // Nhưng gửi từng lần có thể chậm. 
        // Tuy nhiên, để đơn giản và nhất quán với logic `ResourceManager` cũ, ta sẽ gọi callback khi drop.

        setIsSaving(true);
        try {
            // Tính toán order mới
            // Vì danh sách items đã cập nhật vị trí, item tại dropIndex chính là item vừa thả
            // Order mới sẽ là (dropIndex + 1)
            const newOrder = dropIndex + 1;
            await onUpdateOrder(movedItem._id, newOrder);
        } catch (err) {
            console.error("Lỗi khi lưu thứ tự", err);
            // Revert lại nếu lỗi (đơn giản là fetch lại từ cha)
        } finally {
            setIsSaving(false);
        }
    };

    const handleDragEnd = () => {
        setDraggingIndex(null);
        setDragOverIndex(null);
    };

    return (
        <div className="modal fade show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }} tabIndex="-1">
            <div className="modal-dialog modal-dialog-centered modal-dialog-scrollable">
                <div className="modal-content shadow-lg border-0 rounded-4">
                    <div className="modal-header bg-light border-bottom-0">
                        <h5 className="modal-title fw-bold text-dark">Sắp xếp thứ tự Chủ đề</h5>
                        <button type="button" className="btn-close" onClick={onClose} disabled={isSaving}></button>
                    </div>
                    <div className="modal-body p-0 bg-light">
                        {isSaving && (
                            <div className="position-absolute w-100 h-100 d-flex justify-content-center align-items-center"
                                style={{ background: 'rgba(255,255,255,0.6)', zIndex: 10 }}>
                                <div className="spinner-border text-warning" role="status"></div>
                            </div>
                        )}
                        <div className="list-group list-group-flush">
                            {items.map((item, index) => {
                                const isDragging = draggingIndex === index;
                                const isDragOver = dragOverIndex === index;

                                return (
                                    <div
                                        key={item._id}
                                        className={`list-group-item list-group-item-action d-flex align-items-center gap-3 p-3 ${isDragging ? 'opacity-50 bg-light' : ''} ${isDragOver ? 'bg-warning bg-opacity-10 border-warning' : ''}`}
                                        draggable={!isSaving}
                                        onDragStart={(e) => handleDragStart(e, index)}
                                        onDragOver={(e) => handleDragOver(e, index)}
                                        onDrop={(e) => handleDrop(e, index)}
                                        onDragEnd={handleDragEnd}
                                        style={{ cursor: isSaving ? 'wait' : 'grab', transition: 'all 0.2s' }}
                                    >
                                        <div className="text-muted">
                                            <i className="fas fa-grip-lines"></i>
                                        </div>
                                        <div
                                            className="rounded bg-secondary bg-opacity-10 d-flex align-items-center justify-content-center fw-bold text-secondary"
                                            style={{ width: '32px', height: '32px', fontSize: '0.8rem' }}
                                        >
                                            {index + 1}
                                        </div>

                                        {item.imageUrl && (
                                            <img src={item.imageUrl} alt="" className="rounded object-fit-cover border" style={{ width: '40px', height: '40px' }} />
                                        )}

                                        <div className="flex-grow-1">
                                            <div className="fw-bold text-dark">{item.name}</div>
                                            <div className="small text-muted">{item.level}</div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                    <div className="modal-footer border-top-0 pt-0 bg-light">
                        <div className="w-100 text-center text-muted small py-2">
                            Kéo thả các mục để thay đổi vị trí
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TopicReorderModal;
