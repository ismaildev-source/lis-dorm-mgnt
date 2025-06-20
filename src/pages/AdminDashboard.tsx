import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { LogOut, Users, UserPlus, Shield, GraduationCap, User, Calendar, Download, Eye, Printer } from 'lucide-react';
import { Button } from '../components/ui/button';
import { useNavigate } from 'react-router-dom';
import AdminUserManagement from '../components/AdminUserManagement';
import SupervisorUserManagement from '../components/SupervisorUserManagement';
import StudentUserManagement from '../components/StudentUserManagement';
import ParentUserManagement from '../components/ParentUserManagement';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/ui/table';
import { supabase } from '@/integrations/supabase/client';
import LogoutConfirmation from '../components/LogoutConfirmation';
import SupervisorStudentsView from '../components/SupervisorStudentsView';

const AdminDashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [selectedSupervisor, setSelectedSupervisor] = useState<any>(null);
  const [supervisors, setSupervisors] = useState<any[]>([]);
  const [userCounts, setUserCounts] = useState({
    admin: 0,
    supervisor: 0,
    parent: 0,
    student: 0,
  });
  const [attendanceRecords, setAttendanceRecords] = useState<any[]>([]);

  const handleLogout = () => {
    setShowLogoutConfirm(true);
  };

  const confirmLogout = () => {
    logout();
    navigate('/');
    setShowLogoutConfirm(false);
  };

  const fetchUserCounts = async () => {
    try {
      const [adminResult, supervisorResult, parentResult, studentResult] = await Promise.all([
        supabase.from('admin_users').select('id', { count: 'exact' }),
        supabase.from('supervisor_users').select('id', { count: 'exact' }),
        supabase.from('parent_users').select('id', { count: 'exact' }),
        supabase.from('student_users').select('id', { count: 'exact' })
      ]);

      setUserCounts({
        admin: adminResult.count || 0,
        supervisor: supervisorResult.count || 0,
        parent: parentResult.count || 0,
        student: studentResult.count || 0,
      });
    } catch (error) {
      console.error('Error fetching user counts:', error);
    }
  };

  const fetchSupervisors = async () => {
    try {
      const { data, error } = await supabase
        .from('supervisor_users')
        .select('id, name, email');
      
      if (error) throw error;
      setSupervisors(data || []);
    } catch (error) {
      console.error('Error fetching supervisors:', error);
    }
  };

  const fetchAttendanceRecords = async () => {
    try {
      const { data, error } = await supabase
        .from('attendance')
        .select(`
          *,
          student_users (name),
          supervisor_users (name)
        `)
        .order('date', { ascending: false });
      
      if (error) throw error;
      setAttendanceRecords(data || []);
    } catch (error) {
      console.error('Error fetching attendance records:', error);
    }
  };

  useEffect(() => {
    fetchUserCounts();
    fetchSupervisors();
    fetchAttendanceRecords();
  }, []);

  const exportAttendanceToCSV = () => {
    const headers = ['Date', 'Student', 'Status', 'Study Type', 'Grade', 'Supervisor', 'Absent Reason', 'Late', 'Noise', 'Left Early', 'Inactive', 'Comments'];
    const csvContent = [
      headers.join(','),
      ...attendanceRecords.map(record => [
        record.date,
        record.student_users?.name || 'N/A',
        record.attendance_status,
        record.study_type,
        record.grade_level,
        record.supervisor_users?.name || 'N/A',
        record.absent_reason || '',
        record.is_late ? 'Yes' : 'No',
        record.is_noise ? 'Yes' : 'No',
        record.is_leave_early ? 'Yes' : 'No',
        record.is_doing_nothing ? 'Yes' : 'No',
        record.comments || ''
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'attendance_records.csv';
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const printTable = (tableId: string, title: string) => {
    const printWindow = window.open('', '_blank');
    const table = document.getElementById(tableId);
    if (table && printWindow) {
      // Clone the table and remove action buttons
      const clonedTable = table.cloneNode(true) as HTMLElement;
      
      // Remove action columns and buttons
      const actionHeaders = clonedTable.querySelectorAll('th:last-child');
      actionHeaders.forEach(header => {
        if (header.textContent?.toLowerCase().includes('action')) {
          header.remove();
        }
      });
      
      const actionCells = clonedTable.querySelectorAll('td:last-child');
      actionCells.forEach(cell => {
        if (cell.querySelector('button')) {
          cell.remove();
        }
      });

      // Remove any buttons from the cloned table
      const buttons = clonedTable.querySelectorAll('button');
      buttons.forEach(button => button.remove());

      printWindow.document.write(`
        <html>
          <head>
            <title>Print ${title}</title>
            <style>
              body { font-family: Arial, sans-serif; margin: 20px; }
              h1 { color: #1e40af; margin-bottom: 20px; }
              table { border-collapse: collapse; width: 100%; margin-top: 20px; }
              th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
              th { background-color: #f2f2f2; font-weight: bold; }
              @media print { body { margin: 0; } }
            </style>
          </head>
          <body>
            <h1>${title}</h1>
            ${clonedTable.outerHTML}
          </body>
        </html>
      `);
      printWindow.document.close();
      printWindow.print();
    }
  };

  const tabs = [
    { id: 'overview', label: 'Overview', icon: Shield },
    { id: 'admins', label: 'Admin Users', icon: Shield },
    { id: 'supervisors', label: 'Supervisors', icon: Users },
    { id: 'students', label: 'Students', icon: GraduationCap },
    { id: 'parents', label: 'Parents', icon: User },
    { id: 'attendance', label: 'Attendance Records', icon: Calendar },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-blue-600">LIS Dorm Karen Admin</h1>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-gray-700">Welcome, {user?.name}</span>
              <Button
                onClick={handleLogout}
                variant="outline"
                size="sm"
                className="flex items-center space-x-2"
              >
                <LogOut size={16} />
                <span>Logout</span>
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Navigation Tabs */}
        <div className="border-b border-gray-200 mb-8">
          <nav className="-mb-px flex space-x-8">
            {tabs.map((tab) => {
              const IconComponent = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <IconComponent size={20} />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Tab Content */}
        {activeTab === 'overview' && (
          <div className="space-y-8">
            {/* User Counts */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-white p-6 rounded-lg shadow">
                <div className="flex items-center">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <Shield className="w-6 h-6 text-blue-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Total Admins</p>
                    <p className="text-2xl font-bold text-gray-900">{userCounts.admin}</p>
                  </div>
                </div>
              </div>

              <div className="bg-white p-6 rounded-lg shadow">
                <div className="flex items-center">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <Users className="w-6 h-6 text-green-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Supervisors</p>
                    <p className="text-2xl font-bold text-gray-900">{userCounts.supervisor}</p>
                  </div>
                </div>
              </div>

              <div className="bg-white p-6 rounded-lg shadow">
                <div className="flex items-center">
                  <div className="p-2 bg-yellow-100 rounded-lg">
                    <User className="w-6 h-6 text-yellow-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Parents</p>
                    <p className="text-2xl font-bold text-gray-900">{userCounts.parent}</p>
                  </div>
                </div>
              </div>

              <div className="bg-white p-6 rounded-lg shadow">
                <div className="flex items-center">
                  <div className="p-2 bg-purple-100 rounded-lg">
                    <GraduationCap className="w-6 h-6 text-purple-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Students</p>
                    <p className="text-2xl font-bold text-gray-900">{userCounts.student}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Supervisors and their students */}
            <Card>
              <CardHeader>
                <CardTitle>Supervisors and Their Students</CardTitle>
              </CardHeader>
              <CardContent>
                {supervisors.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-gray-500">No supervisors found.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {supervisors.map((supervisor) => (
                      <Card key={supervisor.id} className="p-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <h4 className="font-medium">{supervisor.name}</h4>
                            <p className="text-sm text-gray-500">{supervisor.email}</p>
                          </div>
                          <Button
                            onClick={() => setSelectedSupervisor(supervisor)}
                            variant="outline"
                            size="sm"
                          >
                            <Eye className="w-4 h-4 mr-2" />
                            View Students
                          </Button>
                        </div>
                      </Card>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}

        {activeTab === 'admins' && (
          <div>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold">Admin Users</h2>
              <Button onClick={() => printTable('admin-table', 'Admin Users')} variant="outline" size="sm">
                <Printer className="w-4 h-4 mr-2" />
                Print
              </Button>
            </div>
            <div id="admin-table">
              <AdminUserManagement onUserCountChange={fetchUserCounts} />
            </div>
          </div>
        )}
        
        {activeTab === 'supervisors' && (
          <div>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold">Supervisors</h2>
              <Button onClick={() => printTable('supervisor-table', 'Supervisor Users')} variant="outline" size="sm">
                <Printer className="w-4 h-4 mr-2" />
                Print
              </Button>
            </div>
            <div id="supervisor-table">
              <SupervisorUserManagement onUserCountChange={fetchUserCounts} />
            </div>
          </div>
        )}
        
        {activeTab === 'students' && (
          <div>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold">Students</h2>
              <Button onClick={() => printTable('student-table', 'Student Users')} variant="outline" size="sm">
                <Printer className="w-4 h-4 mr-2" />
                Print
              </Button>
            </div>
            <div id="student-table">
              <StudentUserManagement onUserCountChange={fetchUserCounts} />
            </div>
          </div>
        )}
        
        {activeTab === 'parents' && (
          <div>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold">Parents</h2>
              <Button onClick={() => printTable('parent-table', 'Parent Users')} variant="outline" size="sm">
                <Printer className="w-4 h-4 mr-2" />
                Print
              </Button>
            </div>
            <div id="parent-table">
              <ParentUserManagement onUserCountChange={fetchUserCounts} />
            </div>
          </div>
        )}
        
        {activeTab === 'attendance' && (
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>All Attendance Records</CardTitle>
              <div className="flex gap-2">
                <Button onClick={() => printTable('attendance-table', 'Attendance Records')} variant="outline" size="sm">
                  <Printer className="w-4 h-4 mr-2" />
                  Print
                </Button>
                <Button onClick={exportAttendanceToCSV} variant="outline" size="sm">
                  <Download className="w-4 h-4 mr-2" />
                  Export CSV
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div id="attendance-table" className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>Student</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Study Type</TableHead>
                      <TableHead>Grade</TableHead>
                      <TableHead>Supervisor</TableHead>
                      <TableHead>Behavioral Issues</TableHead>
                      <TableHead className="min-w-[200px]">Comments</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {attendanceRecords.map((record) => (
                      <TableRow key={record.id}>
                        <TableCell>{new Date(record.date).toLocaleDateString()}</TableCell>
                        <TableCell>{record.student_users?.name || 'N/A'}</TableCell>
                        <TableCell>
                          <span className={`px-2 py-1 rounded-full text-xs ${
                            record.attendance_status === 'Present' 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-red-100 text-red-800'
                          }`}>
                            {record.attendance_status}
                          </span>
                        </TableCell>
                        <TableCell>{record.study_type}</TableCell>
                        <TableCell>{record.grade_level}</TableCell>
                        <TableCell>{record.supervisor_users?.name || 'N/A'}</TableCell>
                        <TableCell>
                          <div className="flex flex-wrap gap-1">
                            {record.is_late && <span className="px-1 py-0.5 bg-yellow-100 text-yellow-800 text-xs rounded">Late</span>}
                            {record.is_noise && <span className="px-1 py-0.5 bg-yellow-100 text-yellow-800 text-xs rounded">Noise</span>}
                            {record.is_leave_early && <span className="px-1 py-0.5 bg-yellow-100 text-yellow-800 text-xs rounded">Left Early</span>}
                            {record.is_doing_nothing && <span className="px-1 py-0.5 bg-yellow-100 text-yellow-800 text-xs rounded">Inactive</span>}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="max-w-xs break-words" title={record.comments}>
                            {record.comments || 'No comments'}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Logout Confirmation */}
      <LogoutConfirmation
        isOpen={showLogoutConfirm}
        onClose={() => setShowLogoutConfirm(false)}
        onConfirm={confirmLogout}
      />

      {/* Supervisor Students View Modal */}
      {selectedSupervisor && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[80vh] overflow-y-auto">
            <SupervisorStudentsView
              supervisorId={selectedSupervisor.id}
              supervisorName={selectedSupervisor.name}
              onClose={() => setSelectedSupervisor(null)}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
