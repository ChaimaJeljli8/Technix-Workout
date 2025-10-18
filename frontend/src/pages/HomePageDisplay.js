import Navbar from '../components/Navbar';
import Contact from "../components/Contact";
import About from "../components/About";
import HomePage from "../components/HomePage";
import WorkoutPart from "../components/WorkoutsGeneral";
import VisitorCounter from "../components/VisitorCounter";
import Footer from '../components/Footer';
const HomePageDisplay = () => {
    return (
        <div className="w-full h-full overflow-x-hidden">
            <Navbar />
            <HomePage />
            <About />
            <WorkoutPart />
            <VisitorCounter />
            <Contact  />
            <Footer />
        </div>
        
    );
};

export default HomePageDisplay;
