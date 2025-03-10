import React from "react";
import { useNavigate } from "react-router-dom";
import { jsPDF } from "jspdf";
import "../assets/css/ATSResults.css"; // Import CSS file

const ATSResults = ({ score, feedback, skills }) => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  const downloadPDF = () => {
    const doc = new jsPDF();
    doc.text("ATS Analysis Results", 10, 10);
    doc.text(`Score: ${score}/100`, 10, 20);
    doc.text(`Feedback: ${feedback}`, 10, 30);
    if (skills && skills.length > 0) {
      doc.text("Detected Skills:", 10, 40);
      skills.forEach((skill, index) => {
        doc.text(`- ${skill}`, 10, 50 + index * 10);
      });
    }
    doc.save("ATS_Results.pdf");
  };

  return (
    <div className="ats-container">
      <h2 className="ats-title">ATS Analysis Results</h2>

      <div className="score-container">
        <div className={`score-value ${score >= 80 ? "green" : score >= 60 ? "yellow" : "red"}`}>
          {score}/100
        </div>
        <div className="score-bar">
          <div
            className={`score-fill ${score >= 80 ? "green-fill" : score >= 60 ? "yellow-fill" : "red-fill"}`}
            style={{ width: `${score}%` }}
          ></div>
        </div>
      </div>

      <div className="feedback-section">
        <h3>Feedback:</h3>
        <p>{feedback}</p>
      </div>

      {skills && skills.length > 0 && (
        <div className="skills-section">
          <h3>Detected Skills:</h3>
          <div className="skills-container">
            {skills.map((skill, index) => (
              <span key={index} className="skill-tag">
                {skill}
              </span>
            ))}
          </div>
        </div>
      )}

      <button onClick={downloadPDF} className="download-button">
        Download PDF
      </button>
    </div>
  );
};

export default ATSResults;
