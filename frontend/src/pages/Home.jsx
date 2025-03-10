import { Link } from "react-router-dom";
import "../assets/css/Home.css";

const Home = () => {
  return (
    <div className="home-container">
      {/* Hero Section */}
      <div className="hero">
        <h1>
          Optimize Your Resume with <span>AI-Powered Analysis</span>
        </h1>
        <p>
          Upload your resume and get instant feedback on how well it performs
          with Applicant Tracking Systems (ATS).
        </p>
        <Link to="/dashboard" className="cta-button">
          Analyze Your Resume
        </Link>
      </div>

      {/* Features Section */}
      <div className="features">
        {[
          { title: "ATS Compatibility", desc: "Get a score that shows how well your resume performs with ATS.", icon: "📄" },
          { title: "Skill Detection", desc: "Identify key skills and match them to job requirements.", icon: "✅" },
          { title: "Actionable Feedback", desc: "Receive recommendations to improve your resume.", icon: "💡" },
        ].map((feature, index) => (
          <div key={index} className="feature-card">
            <div className="feature-icon">{feature.icon}</div>
            <h3 className="feature-title">{feature.title}</h3>
            <p className="feature-desc">{feature.desc}</p>
          </div>
        ))}
      </div>

      {/* How It Works Section */}
      <div className="how-it-works">
        <h2>How It Works</h2>
        <div className="steps">
          {["Upload your resume", "AI analyzes content", "Get detailed feedback"].map((step, index) => (
            <div key={index} className="step">
              <div className="step-number">{index + 1}</div>
              <p className="step-text">{step}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Home;
