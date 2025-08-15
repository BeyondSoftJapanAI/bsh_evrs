import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import './App.css';
import Home from './components/Home';
import DailyVisitor from './components/DailyVisitor';
import EventReception from './components/EventReception';
import EventRegistration from './components/EventRegistration';
import RegistrationManagement from './components/RegistrationManagement';
import EmployeeAttendance from './components/EmployeeAttendance';
import DeliveryPersonnel from './components/DeliveryPersonnel';
import Interviewer from './components/Interviewer';
import Admin from './components/Admin';
import EventManagement from './components/EventManagement';

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/daily-visitor" element={<DailyVisitor />} />
          <Route path="/event-reception" element={<EventReception />} />
          <Route path="/event-registration" element={<EventRegistration />} />
          <Route path="/registration-management" element={<RegistrationManagement />} />
          <Route path="/employee-attendance" element={<EmployeeAttendance />} />
          <Route path="/delivery" element={<DeliveryPersonnel />} />
          <Route path="/interview" element={<Interviewer />} />
          <Route path="/admin" element={<Admin />} />
          <Route path="/event-management" element={<EventManagement />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;