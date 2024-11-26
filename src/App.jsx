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
  Alert, // นำเข้า Alert สำหรับ Snackbar ที่พัฒนาขึ้น
} from '@mui/material';
import VisibilityIcon from '@mui/icons-material/Visibility';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';

// สไตล์สำหรับโมดอล
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
  // สถานะของนักเรียน
  const [students, setStudents] = useState([]);
  // สถานะของคำค้นหา
  const [searchTerm, setSearchTerm] = useState('');
  // สถานะการเปิดปิดโมดอล
  const [openModal, setOpenModal] = useState(false);
  // ประเภทของโมดอล ('view', 'edit', 'add', 'confirmDelete')
  const [modalType, setModalType] = useState('');
  // ข้อมูลนักเรียนปัจจุบันที่ถูกเลือก
  const [currentStudent, setCurrentStudent] = useState(null);

  // สถานะของ Snackbar
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success', // 'success', 'error', 'warning', 'info'
  });

  useEffect(() => {
    // ดึงข้อมูลโดยใช้ axios
    axios
      .get('https://67453708b4e2e04abea519c3.mockapi.io/studentslist')
      .then((response) => setStudents(response.data))
      .catch((error) => {
        console.error('เกิดข้อผิดพลาดในการดึงข้อมูล:', error);
        showSnackbar('เกิดข้อผิดพลาดในการดึงข้อมูลนักเรียน', 'error');
      });
  }, []);

  // ฟังก์ชันจัดการการค้นหา
  const handleSearch = (event) => {
    setSearchTerm(event.target.value);
  };

  // ฟังก์ชันเปิดโมดอล
  const handleOpenModal = (type, student = null) => {
    setModalType(type);
    setCurrentStudent(student);
    setOpenModal(true);
  };

  // ฟังก์ชันปิดโมดอล
  const handleCloseModal = () => {
    setOpenModal(false);
    setCurrentStudent(null);
  };

  // ฟังก์ชันจัดการการเปลี่ยนแปลงของอินพุต
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setCurrentStudent({ ...currentStudent, [name]: value });
  };

  // ฟังก์ชันแก้ไขข้อมูลนักเรียน
  const handleEditStudent = () => {
    axios
      .put(`https://67453708b4e2e04abea519c3.mockapi.io/studentslist/${currentStudent.id}`, currentStudent)
      .then((response) => {
        setStudents((prevStudents) =>
          prevStudents.map((student) => (student.id === currentStudent.id ? response.data : student))
        );
        handleCloseModal();
        showSnackbar('แก้ไขข้อมูลนักเรียนเรียบร้อยแล้ว', 'success');
      })
      .catch((error) => {
        console.error('เกิดข้อผิดพลาดในการแก้ไขข้อมูลนักเรียน:', error);
        showSnackbar('เกิดข้อผิดพลาดในการแก้ไขข้อมูลนักเรียน', 'error');
      });
  };

  // ฟังก์ชันลบข้อมูลนักเรียนหลังจากยืนยัน
  const confirmDeleteStudent = () => {
    axios
      .delete(`https://67453708b4e2e04abea519c3.mockapi.io/studentslist/${currentStudent.id}`)
      .then(() => {
        setStudents((prevStudents) => prevStudents.filter((student) => student.id !== currentStudent.id));
        handleCloseModal();
        showSnackbar('ลบข้อมูลนักเรียนเรียบร้อยแล้ว', 'success');
      })
      .catch((error) => {
        console.error('เกิดข้อผิดพลาดในการลบข้อมูลนักเรียน:', error);
        showSnackbar('เกิดข้อผิดพลาดในการลบข้อมูลนักเรียน', 'error');
      });
  };

  // ฟังก์ชันเปิดโมดอลยืนยันการลบ
  const handleDeleteStudent = (student) => {
    handleOpenModal('confirmDelete', student);
  };

  // ฟังก์ชันเพิ่มข้อมูลนักเรียนใหม่
  const handleAddStudent = () => {
    // ตรวจสอบว่าข้อมูลครบถ้วน
    if (!currentStudent || !currentStudent.name || !currentStudent.address || !currentStudent.marks) {
      showSnackbar('กรุณากรอกข้อมูลให้ครบทุกช่อง', 'warning');
      return;
    }

    axios
      .post('https://67453708b4e2e04abea519c3.mockapi.io/studentslist', currentStudent)
      .then((response) => {
        setStudents((prevStudents) => [...prevStudents, response.data]);
        handleCloseModal();
        showSnackbar('เพิ่มข้อมูลนักเรียนเรียบร้อยแล้ว', 'success');
      })
      .catch((error) => {
        console.error('เกิดข้อผิดพลาดในการเพิ่มข้อมูลนักเรียน:', error);
        showSnackbar('เกิดข้อผิดพลาดในการเพิ่มข้อมูลนักเรียน', 'error');
      });
  };

  // ฟังก์ชันแสดง Snackbar
  const showSnackbar = (message, severity) => {
    setSnackbar({
      open: true,
      message,
      severity,
    });
  };

  // ฟังก์ชันปิด Snackbar
  const handleSnackbarClose = (event, reason) => {
    if (reason === 'clickaway') {
      return;
    }
    setSnackbar({ ...snackbar, open: false });
  };

  // ฟังก์ชันกรองนักเรียนตามคำค้นหา
  const filteredStudents = students.filter(
    (student) =>
      student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.address.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.marks.toString().includes(searchTerm)
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
        ADD NEW STUDENT
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
          maxHeight: 400, // ปรับค่าตามความสูงของแถว (ประมาณ 8 แถว)
        }}
      >
        <Table stickyHeader size="small" aria-label="students table">
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
                  ไม่พบข้อมูลนักเรียน
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* โมดอลสำหรับดู แก้ไข เพิ่ม ยืนยันการลบ */}
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
                  // ซ่อนปุ่มลูกศรใน Chrome, Safari, Edge, Opera
                  '& input::-webkit-outer-spin-button, & input::-webkit-inner-spin-button': {
                    '-webkit-appearance': 'none',
                    margin: 0,
                  },
                  // ซ่อนปุ่มลูกศรใน Firefox
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
                  // ซ่อนปุ่มลูกศรใน Chrome, Safari, Edge, Opera
                  '& input::-webkit-outer-spin-button, & input::-webkit-inner-spin-button': {
                    '-webkit-appearance': 'none',
                    margin: 0,
                  },
                  // ซ่อนปุ่มลูกศรใน Firefox
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
              <h2>Confirm Delete</h2>
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

      {/* Snackbar สำหรับการแจ้งเตือน */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000} // ระยะเวลาในหน่วยมิลลิวินาที
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
