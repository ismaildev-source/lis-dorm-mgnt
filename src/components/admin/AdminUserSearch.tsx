
import React from 'react';
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';

interface AdminUserSearchProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
}

const AdminUserSearch: React.FC<AdminUserSearchProps> = ({
  searchTerm,
  onSearchChange
}) => {
  return (
    <div className="mb-4 print:hidden">
      <div className="relative">
        <Search className="absolute left-2 top-2.5 h-4 w-2 text-muted-foreground" />
        <Input
          placeholder="Search admin users..."
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          className="w-40 h-10 pl-5"
        />
      </div>
    </div>
  );
};

export default AdminUserSearch;
