import{j as t}from"./index-CkngFUrs.js";function a(){return t.jsxs("div",{className:"min-h-screen bg-gradient-to-b from-gray-900 to-gray-800 flex items-center justify-center px-4 py-20 overflow-hidden relative",children:[t.jsx("div",{className:"absolute inset-0 pointer-events-none",children:t.jsx("div",{className:"stars animate-twinkle"})}),t.jsxs("div",{className:"container mx-auto text-center relative z-10",children:[t.jsx("h1",{className:"text-7xl sm:text-9xl font-extrabold mb-6 text-transparent bg-clip-text bg-gradient-to-r from-teal-400 to-orange-500 animate-glitch",children:"404"}),t.jsx("p",{className:"text-2xl sm:text-3xl font-semibold text-gray-200 mb-4",children:"Упс! Эта страница не купила Сокол."}),t.jsx("p",{className:"text-lg sm:text-xl text-gray-400 mb-10 max-w-2xl mx-auto",children:"Не волнуйтесь, наша команда уже ищет её на дне болота. А пока вернитесь на главную и продолжите своё путешествие!"}),t.jsx("a",{href:"/",className:"inline-block bg-teal-500 text-white font-bold px-8 py-4 rounded-full text-lg sm:text-xl hover:from-teal-600 hover:to-orange-600 transform hover:scale-105 transition-all duration-300 shadow-lg",children:"Вернуться на главную"})]}),t.jsx("style",{children:`
        .stars {
          background: transparent;
          position: absolute;
          width: 100%;
          height: 100%;
          overflow: hidden;
        }
        .stars::before {
          content: '';
          position: absolute;
          width: 2px;
          height: 2px;
          background: white;
          border-radius: 50%;
          box-shadow: 
            100px 200px 1px rgba(255,255,255,0.8),
            300px 400px 1px rgba(255,255,255,0.6),
            500px 100px 1px rgba(255,255,255,0.7),
            700px 300px 1px rgba(255,255,255,0.5),
            900px 500px 1px rgba(255,255,255,0.9),
            200px 600px 1px rgba(255,255,255,0.6),
            400px 800px 1px rgba(255,255,255,0.8),
            600px 700px 1px rgba(255,255,255,0.7),
            800px 200px 1px rgba(255,255,255,0.5),
            1000px 400px 1px rgba(255,255,255,0.6);
        }
        @keyframes twinkle {
          0%, 100% { opacity: 0.5; }
          50% { opacity: 1; }
        }
        .animate-twinkle {
          animation: twinkle 3s infinite;
        }
        @keyframes glitch {
          0% { transform: translate(0); }
          20% { transform: translate(-2px, 2px); }
          40% { transform: translate(2px, -2px); }
          60% { transform: translate(-2px, 2px); }
          80% { transform: translate(2px, -2px); }
          100% { transform: translate(0); }
        }
        .animate-glitch {
          animation: glitch 0.3s infinite alternate;
        }
      `})]})}export{a as default};
