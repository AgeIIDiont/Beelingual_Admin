import React, { useEffect, useState } from "react";
import { fetchVocabExercises } from "../services/exercisesAPI.js";

const Exercises_Vocal = () => {
  const [vocabList, setVocabList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

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

  return (
    <div className="container py-4">
      <div className="bg-white rounded-4 shadow p-4 mb-4">
        <h1 className="h3 fw-bold text-dark mb-0">Bài tập về từ vựng</h1>
      </div>

      {(() => {
        const grammarList = vocabList.filter((ex) => ex.skill === "grammar");
        if (grammarList.length === 0) {
            return <p className="text-muted">Không có dữ liệu bài tập Grammar.</p>;
        }
        return grammarList.map((ex) => (
            <div key={ex._id} className="bg-white p-4 rounded-3 shadow mb-3">
            <h5 className="fw-bold">{ex.questionText}</h5>

            <ul>
                {ex.options?.map((opt) => (
                <li key={opt._id}>{opt.text} {opt.isCorrect ? "✔️" : ""}</li>
                ))}
            </ul>
            <p>
                <b>Giải thích: </b>
                <span className="fst-italic">{ex.explanation}</span>
            </p>
            </div>
        ));
        })()}
    </div>
  );
};

export default Exercises_Vocal;
