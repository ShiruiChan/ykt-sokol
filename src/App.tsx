import { Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import News from './pages/News';
import ProductPage from './pages/ProductPage';
import NotFound from './pages/NotFound';
import './index.css'
import ScrollToTop from './scripts/ScrollToTop';

function App() {
	return (
		<>
			<ScrollToTop/>
			<Routes>
				<Route path="/" element={<Home />} />
				<Route path="/news" element={<News />} />
				<Route path="/product/:id" element={<ProductPage />} />
				<Route path="*" element={<NotFound />} />
			</Routes>
		</>
	);
}

export default App;