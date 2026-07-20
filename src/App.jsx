import Header from "./components/Header";
import About from "./components/About";
import Skills from "./components/Skills";
import Footer from "./components/Footer";
import "./App.css";

function App() {

const skills = [
  "Python",
  "JavaScript",
  "React",
  "Node.js",
  "HTML",
  "CSS",
  "SQL",
  "Power BI",
  "Machine Learning",
  "Git & GitHub"
];

  return (
    <>
      <Header
        name="Have Patel"
        role="AI & ML Student"
      />

      <About />

      <Skills skillList={skills} />

      <Footer />
    </>
  );
}

export default App;