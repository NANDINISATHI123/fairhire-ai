
import React from 'react';
import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import Home from './pages/Home';
import Auth from './pages/Auth';
import Interview from './pages/Interview';
import Report from './pages/Report';
import Dashboard from './pages/Dashboard';
import CandidateDashboard from './pages/CandidateDashboard';
import ResetPassword from './pages/ResetPassword';

const App: React.FC = () => {
    return (
        <Router>
            <Layout>
                <Routes>
                    <Route path="/" element={<Home />} />
                    <Route path="/login" element={<Auth />} />
                    <Route path="/reset-password" element={<ResetPassword />} />
                    <Route path="/interview/new" element={<Interview />} />
                    <Route path="/report/:id" element={<Report />} />
                    <Route path="/dashboard" element={<Dashboard />} />
                    <Route path="/candidate-dashboard" element={<CandidateDashboard />} />
                    <Route path="*" element={<Navigate to="/" />} />
                </Routes>
            </Layout>
        </Router>
    );
};

export default App;