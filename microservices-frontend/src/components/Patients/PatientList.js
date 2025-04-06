import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getPatients, deletePatient } from '../../services/patientService';
import './PatientList.css';

function PatientList() {
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    getPatients()
      .then((data) => {
        setPatients(data.data); // assuming your API returns patients inside data.data
      })
      .catch((error) => {
        console.error("Error fetching patients:", error);
      })
      .finally(() => setLoading(false));
  }, []);

  const handleDelete = (id) => {
    deletePatient(id)
      .then(() => {
        setPatients(patients.filter(p => p._id !== id));
      })
      .catch((error) => {
        console.error("Error deleting patient:", error);
      });
  };

  const handleViewDetails = (id) => {
    navigate(`/patients/${id}`);
  };

  const handleUpdate = (id) => {
    navigate(`/patients/${id}/edit`);
  };

  return (
    <div className="patient-list-container">
      <h2>Patient List</h2>

      {loading ? (
        <p>Loading patients...</p>
      ) : patients.length === 0 ? (
        <p>No patients found.</p>
      ) : (
        <ul className="patient-list">
          {patients.map(p => (
            <li key={p._id} className="patient-item">
              <div className="patient-info">
                <strong>{p.name}</strong>
                <span>{p.contact}</span>
              </div>
              <div className="patient-actions">
                <button className="view-btn" onClick={() => handleViewDetails(p._id)}>View Details</button>
                <button className="update-btn" onClick={() => handleUpdate(p._id)}>Update</button>
                <button className="delete-btn" onClick={() => handleDelete(p._id)}>Delete</button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default PatientList;
