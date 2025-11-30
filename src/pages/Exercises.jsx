import React from "react";
import { Link } from "react-router-dom";

const Exercises = () => {
  return (
    <div className="container-fluid py-5 px-4 px-lg-5">
      <div className="bg-white rounded-4 shadow p-4 mb-4">
        <h1 className="h3 fw-bold text-dark mb-0">Bài tập & Đề thi</h1>
      </div>

      <div className="bg-white rounded-4 shadow p-4 mb-4">
        <Link
          to="/exercises/vocal"
          className="text-decoration-none fst-italic fw-bold text-black"
        >
          Vocabulary
        </Link>
      </div>

      <div className="bg-white rounded-4 shadow p-4 mb-4">
        <Link
          to="/exercises/gram"
          className="text-decoration-none fst-italic fw-bold text-black"
        >
          Grammar
        </Link>
      </div>
    </div>
  );
};

export default Exercises;
