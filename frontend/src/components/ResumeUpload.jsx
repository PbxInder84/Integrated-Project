import { useState } from "react";
import { useNavigate } from "react-router-dom";
import ATSResults from "./ATSResults";
import resumeAPI from "../api/resumeAPI";
import "../assets/css/ResumeUpload.css"; // Import CSS

const ResumeUpload = () => {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [atsData, setAtsData] = useState(null);
  const [error, setError] = useState("");
  const [dragActive, setDragActive] = useState(false);
  const navigate = useNavigate();

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setError("");
    }
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setFile(e.dataTransfer.files[0]);
      setError("");
    }
  };

  const handleUpload = async () => {
    if (!file) {
      setError("Please select a resume file");
      return;
    }
    setError("");
    setLoading(true);

    const formData = new FormData();
    formData.append("resume", file);

    try {
      const response = await resumeAPI.post("/upload", formData);

      if (response.status === 207) {
        setError("Resume uploaded but ATS analysis is currently unavailable");
        setAtsData(null);
      } else {
        const { atsScore } = response.data;
        setAtsData(atsScore);
        setError("");
      }
    } catch (error) {
      console.error("Upload error:", error);
      if (error.response?.status === 401) {
        navigate("/login");
      } else {
        setError(error.response?.data?.message || "Error uploading resume");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="resume-container">
      <h2 className="resume-title">Upload Your Resume</h2>

      {error && <div className="error-message">{error}</div>}

      <div
        className={`drop-zone ${dragActive ? "drag-active" : ""}`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        <input type="file" id="file-upload" onChange={handleFileChange} accept=".pdf,.doc,.docx" />
        <label htmlFor="file-upload">
          {file ? file.name : "Click to upload or drag and drop"}
        </label>
      </div>

      {file && <p className="file-info">Selected: {file.name}</p>}

      <button onClick={handleUpload} disabled={loading || !file} className="upload-button">
        {loading ? "Analyzing..." : "Analyze Resume"}
      </button>

      {atsData && <ATSResults score={atsData.score} feedback={atsData.feedback} skills={atsData.skills} />}
    </div>
  );
};

export default ResumeUpload;
