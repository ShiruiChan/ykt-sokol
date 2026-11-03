/** Точка входа админ-панели (admin.html). Без пререндера и гидрации */
import React from 'react';
import ReactDOM from 'react-dom/client';
import AdminApp from './AdminApp';
import '../index.css';
import './admin.css';

const root = document.getElementById('root');
if (!root) throw new Error('Не найден корневой элемент "root"');

ReactDOM.createRoot(root).render(
	<React.StrictMode>
		<AdminApp />
	</React.StrictMode>
);
