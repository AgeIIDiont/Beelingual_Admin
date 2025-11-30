import React, { useEffect, useState } from "react";
import { fetchVocabExercises } from "../services/exercisesAPI.js";

const Exercises_Vocal = () => {
  const [vocabList, setVocabList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [exerciseType, setExerciseType] = useState("multiple_choice");

  useEffect(() => {
    const loadData = async () => {
      try {
        const data = await fetchVocabExercises();
        setVocabList(data);
      } catch (err) {
        setError("Lỗi khi lấy dữ liệu");
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  if (loading) return <p>Đang tải...</p>;
  if (error) return <p className="text-danger">{error}</p>;

  const vocabExercises = vocabList.filter((ex) => ex.skill === "vocab");

  const filteredExercises = vocabExercises.filter(
    (ex) => ex.type === exerciseType
  );

  return (
    <div className="container py-4">
      <div className="bg-white rounded-4 shadow p-4 mb-4 d-flex">
        <h1 className="h3 fw-bold text-dark mb-0 me-auto">Bài tập về từ vựng</h1>

        <div>
          <button
            className={`btn me-2 ${exerciseType === "multiple_choice" ? "btn-primary" : "btn-outline-primary"}`}
            onClick={() => setExerciseType("multiple_choice")}
          >
            Trắc nghiệm
          </button>
          <button
            className={`btn ${exerciseType === "fill_in_blank" ? "btn-primary" : "btn-outline-primary"}`}
            onClick={() => setExerciseType("fill_in_blank")}
          >
            Điền đáp án
          </button>
        </div>
      </div>

      {filteredExercises.length === 0 ? (
        <p className="text-muted">Không có dữ liệu cho dạng bài này.</p>
      ) : (
        filteredExercises.map((ex) => (
          <div key={ex._id} className="bg-white p-4 rounded-3 shadow mb-3">

            {/* ------------------ TIÊU ĐỀ ------------------ */}
            {ex.type === "multiple_choice" ? (
              <h5 className="fw-bold text-primary">[Trắc nghiệm] {ex.questionText}</h5>
            ) : (
              <h5 className="fw-bold text-success">[Điền đáp án] {ex.questionText}</h5>
            )}

            {/* ------------------ TRẮC NGHIỆM ------------------ */}
            {ex.type === "multiple_choice" && (
              <div className="mt-3">
                <h6 className="fw-bold">Các lựa chọn:</h6>
                <ul>
                  {ex.options?.map((opt) => (
                    <li key={opt._id}>
                      {opt.text} {opt.isCorrect ? "✔️" : ""}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* ------------------ ĐIỀN ĐÁP ÁN ------------------ */}
            {ex.type === "fill_in_blank" && (
              <div className="mt-3">
                <h6 className="fw-bold text-info mb-2">Đáp án đúng:</h6>
                <p className="text-success fw-bold">{ex.correctAnswer}</p>
              </div>
            )}

            {/* ------------------ GIẢI THÍCH ------------------ */}
            <div className="mt-3">
              <h6 className="fw-bold">Giải thích:</h6>
              <p className="fst-italic">{ex.explanation}</p>
            </div>

          </div>
        ))
      )}
    </div>
  );
};

export default Exercises_Vocal;
