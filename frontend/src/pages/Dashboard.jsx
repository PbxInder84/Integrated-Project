import ResumeUpload from "../components/ResumeUpload";
import "../assets/css/Dashboard.css"; // Import the CSS file

const Dashboard = () => {
  return (
    <div className="dashboard-container">
      <h1 className="dashboard-title">Dashboard</h1>
      <ResumeUpload />
    </div>
  );
};

export default Dashboard;
