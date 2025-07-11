
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { Button } from './ui/button';
import { User, Mail, MapPin, Phone, Calendar, GraduationCap, Home } from 'lucide-react';

interface Student {
  id: string;
  name: string;
  email: string;
  username: string;
  grade_level: string;
  stream: string;
  room: string;
  age?: number;
  date_of_birth?: string;
  home_address?: string;
  parent_name?: string;
  parent_contact?: string;
  shoe_rack_number?: string;
}

interface StudentProfileModalProps {
  student: Student | null;
  isOpen: boolean;
  onClose: () => void;
}

const StudentProfileModal = ({ student, isOpen, onClose }: StudentProfileModalProps) => {
  if (!student) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto bg-white border-0 shadow-2xl">
        <DialogHeader className="pb-4 border-b border-gray-100">
          <DialogTitle className="flex items-center space-x-2 text-xl font-bold text-gray-800">
            <User className="w-6 h-6 text-blue-600" />
            <span>Student Profile</span>
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6 pt-4">
          {/* Basic Information */}
          <div className="bg-gray-50 p-6 rounded-xl shadow-sm border border-gray-100">
            <h3 className="font-bold text-lg mb-4 text-gray-800 flex items-center space-x-2">
              <User className="w-5 h-5 text-blue-600" />
              <span>Basic Information</span>
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center space-x-2">
                <User className="w-4 h-4 text-gray-500" />
                <span className="font-medium">Name:</span>
                <span>{student.name}</span>
              </div>
              <div className="flex items-center space-x-2">
                <Mail className="w-4 h-4 text-gray-500" />
                <span className="font-medium">Email:</span>
                <span>{student.email}</span>
              </div>
              <div className="flex items-center space-x-2">
                <User className="w-4 h-4 text-gray-500" />
                <span className="font-medium">Username:</span>
                <span>{student.username}</span>
              </div>
              {student.age && (
                <div className="flex items-center space-x-2">
                  <Calendar className="w-4 h-4 text-gray-500" />
                  <span className="font-medium">Age:</span>
                  <span>{student.age}</span>
                </div>
              )}
              {student.date_of_birth && (
                <div className="flex items-center space-x-2">
                  <Calendar className="w-4 h-4 text-gray-500" />
                  <span className="font-medium">Date of Birth:</span>
                  <span>{new Date(student.date_of_birth).toLocaleDateString()}</span>
                </div>
              )}
            </div>
          </div>

          {/* Academic Information */}
          <div className="bg-blue-50 p-6 rounded-xl shadow-sm border border-blue-100">
            <h3 className="font-bold text-lg mb-4 text-gray-800 flex items-center space-x-2">
              <GraduationCap className="w-5 h-5 text-blue-600" />
              <span>Academic Information</span>
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center space-x-2">
                <GraduationCap className="w-4 h-4 text-blue-500" />
                <span className="font-medium">Grade Level:</span>
                <span>{student.grade_level}</span>
              </div>
              <div className="flex items-center space-x-2">
                <GraduationCap className="w-4 h-4 text-blue-500" />
                <span className="font-medium">Stream:</span>
                <span>{student.stream}</span>
              </div>
            </div>
          </div>

          {/* Accommodation Information */}
          <div className="bg-green-50 p-6 rounded-xl shadow-sm border border-green-100">
            <h3 className="font-bold text-lg mb-4 text-gray-800 flex items-center space-x-2">
              <MapPin className="w-5 h-5 text-green-600" />
              <span>Accommodation Information</span>
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center space-x-2">
                <MapPin className="w-4 h-4 text-green-500" />
                <span className="font-medium">Room:</span>
                <span>{student.room}</span>
              </div>
              {student.shoe_rack_number && (
                <div className="flex items-center space-x-2">
                  <MapPin className="w-4 h-4 text-green-500" />
                  <span className="font-medium">Shoe Rack:</span>
                  <span>{student.shoe_rack_number}</span>
                </div>
              )}
            </div>
          </div>

          {/* Contact Information */}
          {(student.home_address || student.parent_name || student.parent_contact) && (
            <div className="bg-yellow-50 p-6 rounded-xl shadow-sm border border-yellow-100">
              <h3 className="font-bold text-lg mb-4 text-gray-800 flex items-center space-x-2">
                <Phone className="w-5 h-5 text-yellow-600" />
                <span>Contact Information</span>
              </h3>
              <div className="space-y-3">
                {student.home_address && (
                  <div className="flex items-start space-x-2">
                    <Home className="w-4 h-4 text-yellow-500 mt-1" />
                    <div>
                      <span className="font-medium">Home Address:</span>
                      <p className="text-gray-700">{student.home_address}</p>
                    </div>
                  </div>
                )}
                {student.parent_name && (
                  <div className="flex items-center space-x-2">
                    <User className="w-4 h-4 text-yellow-500" />
                    <span className="font-medium">Parent Name:</span>
                    <span>{student.parent_name}</span>
                  </div>
                )}
                {student.parent_contact && (
                  <div className="flex items-center space-x-2">
                    <Phone className="w-4 h-4 text-yellow-500" />
                    <span className="font-medium">Parent Contact:</span>
                    <span>{student.parent_contact}</span>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        <div className="flex justify-end pt-6 border-t border-gray-100">
          <Button 
            onClick={onClose} 
            variant="outline" 
            className="px-8 py-2 bg-white hover:bg-gray-50 border-gray-300 text-gray-700 font-medium"
          >
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default StudentProfileModal;
