import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import './index.css';

const rootElement = document.getElementById('root');

if (!rootElement) {
	throw new Error('Не найден корневой элемент "root"');
}

const app = (
	<React.StrictMode>
		<BrowserRouter>
			<App />
		</BrowserRouter>
	</React.StrictMode>
);

// В проде HTML уже отрисован пререндером — «оживляем» его, а не рисуем заново.
// В dev-режиме #root пустой, и работает обычный клиентский рендер.
if (rootElement.hasChildNodes()) {
	ReactDOM.hydrateRoot(rootElement, app);
} else {
	ReactDOM.createRoot(rootElement).render(app);
}
