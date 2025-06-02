import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import News from './pages/News';
import ProductPage from './pages/ProductPage';
import './index.css'

const App = () => {
	return (
		<Router>
			<Routes>
				<Route path="/" element={<Home />} />
				<Route path="/news" element={<News />} />
				<Route path="/product" element={<ProductPage />} />
			</Routes>
		</Router>
	);
};

export default App;