import Sidebar from './Sidebar.jsx';
import Chatbot from './Chatbot.jsx';

export default function Layout({ children }) {
  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      <Sidebar />
      <main style={{ marginLeft: 240, flex: 1, padding: '24px 32px', maxWidth: 'calc(100vw - 240px)' }}>
        {children}
      </main>
      <Chatbot />
    </div>
  );
}