import React, { useEffect, useState } from 'react';
import axios from 'axios';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Button,
  IconButton,
  TextField,
  Modal,
  Box,
  Snackbar,
  Alert, // Import Alert for enhanced Snackbar
} from '@mui/material';
import VisibilityIcon from '@mui/icons-material/Visibility';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';

const style = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: 400,
  bgcolor: 'background.paper',
  boxShadow: 24,
  p: 4,
  borderRadius: '8px',
};

function App() {
  const [students, setStudents] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [openModal, setOpenModal] = useState(false);
  const [modalType, setModalType] = useState(''); // Modal ประเภทต่างๆ
  const [currentStudent, setCurrentStudent] = useState(null);

  // Snackbar state
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success', // 'success', 'error', 'warning', 'info'
  });

  useEffect(() => {
    // Fetch data using axios
    axios
      .get('https://67453708b4e2e04abea519c3.mockapi.io/studentslist')
      .then((response) => setStudents(response.data))
      .catch((error) => {
        console.error('Error fetching data:', error);
        showSnackbar('Error fetching students data', 'error');
      });
  }, []);

  const handleSearch = (event) => {
    setSearchTerm(event.target.value);
  };

  const handleOpenModal = (type, student = null) => {
    setModalType(type);
    setCurrentStudent(student);
    setOpenModal(true);
  };

  const handleCloseModal = () => {
    setOpenModal(false);
    setCurrentStudent(null);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setCurrentStudent({ ...currentStudent, [name]: value });
  };

  const handleEditStudent = () => {
    axios
      .put(`https://67453708b4e2e04abea519c3.mockapi.io/studentslist/${currentStudent.id}`, currentStudent)
      .then((response) => {
        setStudents((prevStudents) =>
          prevStudents.map((student) => (student.id === currentStudent.id ? response.data : student))
        );
        handleCloseModal();
        showSnackbar('Student updated successfully', 'success');
      })
      .catch((error) => {
        console.error('Error updating student:', error);
        showSnackbar('Error updating student', 'error');
      });
  };

  // New function to handle the actual deletion after confirmation
  const confirmDeleteStudent = () => {
    axios
      .delete(`https://67453708b4e2e04abea519c3.mockapi.io/studentslist/${currentStudent.id}`)
      .then(() => {
        setStudents((prevStudents) => prevStudents.filter((student) => student.id !== currentStudent.id));
        handleCloseModal();
        showSnackbar('Student deleted successfully', 'success');
      })
      .catch((error) => {
        console.error('Error deleting student:', error);
        showSnackbar('Error deleting student', 'error');
      });
  };

  // Modify handleDeleteStudent to open confirmation modal
  const handleDeleteStudent = (student) => {
    handleOpenModal('confirmDelete', student);
  };

  const handleAddStudent = () => {
    // Ensure that currentStudent is not null and has necessary fields
    if (!currentStudent || !currentStudent.name || !currentStudent.address || !currentStudent.marks) {
      showSnackbar('Please fill in all fields', 'warning');
      return;
    }

    axios
      .post('https://67453708b4e2e04abea519c3.mockapi.io/studentslist', currentStudent)
      .then((response) => {
        setStudents((prevStudents) => [...prevStudents, response.data]);
        handleCloseModal();
        showSnackbar('Student added successfully', 'success');
      })
      .catch((error) => {
        console.error('Error adding student:', error);
        showSnackbar('Error adding student', 'error');
      });
  };

  // Function to show Snackbar
  const showSnackbar = (message, severity) => {
    setSnackbar({
      open: true,
      message,
      severity,
    });
  };

  // Function to handle Snackbar close
  const handleSnackbarClose = (event, reason) => {
    if (reason === 'clickaway') {
      return;
    }
    setSnackbar({ ...snackbar, open: false });
  };

  const filteredStudents = students.filter(
    (student) =>
      student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.address.toLowerCase().includes(searchTerm.toLowerCase()) 
      // student.marks.toString().includes(searchTerm)
  );

  return (
    <div style={{ padding: '20px' }}>
      <h1>Students Details</h1>
      <Button
        variant="contained"
        color="primary"
        style={{ marginBottom: '10px' }}
        onClick={() => handleOpenModal('add')}
      >
        Add New Student
      </Button>
      <TextField
        label="Search"
        variant="outlined"
        fullWidth
        style={{ marginBottom: '20px' }}
        onChange={handleSearch}
      />
      <TableContainer
        component={Paper}
        sx={{
          maxHeight: 600, // Adjust this value based on row height
        }}
      >
        <Table stickyHeader size="medium" aria-label="students table">
          <TableHead>
            <TableRow>
              <TableCell>#</TableCell>
              <TableCell>Name</TableCell>
              <TableCell>Address</TableCell>
              <TableCell>Marks</TableCell>
              <TableCell>Action</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredStudents.length > 0 ? (
              filteredStudents.map((student, index) => (
                <TableRow key={student.id} hover>
                  <TableCell>{index + 1}</TableCell>
                  <TableCell>{student.name}</TableCell>
                  <TableCell>{student.address}</TableCell>
                  <TableCell>{student.marks}</TableCell>
                  <TableCell>
                    <IconButton color="primary" onClick={() => handleOpenModal('view', student)}>
                      <VisibilityIcon />
                    </IconButton>
                    <IconButton color="secondary" onClick={() => handleOpenModal('edit', student)}>
                      <EditIcon />
                    </IconButton>
                    <IconButton color="error" onClick={() => handleDeleteStudent(student)}>
                      <DeleteIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={5} align="center">
                  No students found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Modal for View/Edit/Add/Confirm Delete */}
      <Modal open={openModal} onClose={handleCloseModal}>
        <Box sx={style}>
          {modalType === 'view' && (
            <>
              <h2>Student Details</h2>
              <p>
                <strong>Name:</strong> {currentStudent?.name}
              </p>
              <p>
                <strong>Address:</strong> {currentStudent?.address}
              </p>
              <p>
                <strong>Marks:</strong> {currentStudent?.marks}
              </p>
              <Button variant="contained" onClick={handleCloseModal}>
                Close
              </Button>
            </>
          )}

          {modalType === 'edit' && (
            <>
              <h2>Edit Student</h2>
              <TextField
                label="Name"
                name="name"
                value={currentStudent?.name || ''}
                onChange={handleInputChange}
                fullWidth
                style={{ marginBottom: '10px' }}
              />
              <TextField
                label="Address"
                name="address"
                value={currentStudent?.address || ''}
                onChange={handleInputChange}
                fullWidth
                style={{ marginBottom: '10px' }}
              />
              <TextField
                label="Marks"
                name="marks"
                type="number"
                value={currentStudent?.marks || ''}
                onChange={handleInputChange}
                fullWidth
                style={{ marginBottom: '10px' }}
                InputProps={{
                  inputMode: 'numeric',
                  pattern: '[0-9]*',
                }}
                sx={{
                  // Hide spin buttons in Chrome, Safari, Edge, Opera
                  '& input::-webkit-outer-spin-button, & input::-webkit-inner-spin-button': {
                    '-webkit-appearance': 'none',
                    margin: 0,
                  },
                  // Hide spin buttons in Firefox
                  '& input[type=number]': {
                    '-moz-appearance': 'textfield',
                  },
                }}
              />
              <Button variant="contained" color="primary" onClick={handleEditStudent}>
                Save
              </Button>
              <Button
                variant="outlined"
                color="secondary"
                onClick={handleCloseModal}
                style={{ marginLeft: '10px' }}
              >
                Cancel
              </Button>
            </>
          )}

          {modalType === 'add' && (
            <>
              <h2>Add New Student</h2>
              <TextField
                label="Name"
                name="name"
                value={currentStudent?.name || ''}
                onChange={handleInputChange}
                fullWidth
                style={{ marginBottom: '10px' }}
              />
              <TextField
                label="Address"
                name="address"
                value={currentStudent?.address || ''}
                onChange={handleInputChange}
                fullWidth
                style={{ marginBottom: '10px' }}
              />
              <TextField
                label="Marks"
                name="marks"
                type="number"
                value={currentStudent?.marks || ''}
                onChange={handleInputChange}
                fullWidth
                style={{ marginBottom: '10px' }}
                InputProps={{
                  inputMode: 'numeric',
                  pattern: '[0-9]*',
                }}
                sx={{
                  // Hide spin buttons in Chrome, Safari, Edge, Opera
                  '& input::-webkit-outer-spin-button, & input::-webkit-inner-spin-button': {
                    '-webkit-appearance': 'none',
                    margin: 0,
                  },
                  // Hide spin buttons in Firefox
                  '& input[type=number]': {
                    '-moz-appearance': 'textfield',
                  },
                }}
              />
              <Button variant="contained" color="primary" onClick={handleAddStudent}>
                Add
              </Button>
              <Button
                variant="outlined"
                color="secondary"
                onClick={handleCloseModal}
                style={{ marginLeft: '10px' }}
              >
                Cancel
              </Button>
            </>
          )}

          {modalType === 'confirmDelete' && (
            <>
              <h2>Confirm Deletion</h2>
              <p>
                Are you sure you want to delete <strong>{currentStudent?.name}</strong>?
              </p>
              <Button variant="contained" color="error" onClick={confirmDeleteStudent}>
                Delete
              </Button>
              <Button
                variant="outlined"
                color="secondary"
                onClick={handleCloseModal}
                style={{ marginLeft: '10px' }}
              >
                Cancel
              </Button>
            </>
          )}
        </Box>
      </Modal>

      {/* Snackbar for Notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000} // Duration in milliseconds
        onClose={handleSnackbarClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={handleSnackbarClose} severity={snackbar.severity} sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </div>
  );
}

export default App;
