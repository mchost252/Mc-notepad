import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { SearchProvider } from './contexts/SearchContext';
import Layout from './components/Layout';
import NotificationManager from './components/NotificationManager';
import Dashboard from './pages/Dashboard';
import Notes from './pages/Notes';
import Review from './pages/Review';

function App() {
  return (
    <SearchProvider>
      <NotificationManager />
      <Router>
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<Dashboard />} />
            <Route path="notes" element={<Notes />} />
            <Route path="review" element={<Review />} />
          </Route>
        </Routes>
      </Router>
    </SearchProvider>
  );
}

export default App;
