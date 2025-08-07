import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table';
import {
  ArrowLeft,
  Download,
  Trash2,
  LogOut,
  FileText,
  Code,
  Image,
  User
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';

interface UploadFile {
  id: number;
  batch: string;
  subject: string;
  experiment: string;
  category: string;
  filename: string;
  url: string;
}

const getFileIcon = (category: string) => {
  switch (category) {
    case 'rubric':
      return <FileText className="h-4 w-4" />;
    case 'output':
      return <Image className="h-4 w-4" />;
    case 'code':
      return <Code className="h-4 w-4" />;
    default:
      return <FileText className="h-4 w-4" />;
  }
};

const getCategoryColor = (category: string) => {
  switch (category) {
    case 'rubric':
      return 'bg-blue-500/10 text-blue-400 border-blue-500/20';
    case 'output':
      return 'bg-green-500/10 text-green-400 border-green-500/20';
    case 'code':
      return 'bg-purple-500/10 text-purple-400 border-purple-500/20';
    default:
      return 'bg-gray-500/10 text-gray-400 border-gray-500/20';
  }
};

const AdminDashboard = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [uploads, setUploads] = useState<UploadFile[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchUploads = async () => {
    try {
      const res = await fetch('/admin/dashboard', {
        credentials: 'include',
      });
      const data = await res.json();
      if (res.ok) {
        setUploads(data);
      } else {
        toast({ title: 'Error', description: data.error || 'Failed to fetch data' });
      }
    } catch (error) {
      console.error('Error fetching admin data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (fileId: number, filename: string) => {
    if (window.confirm(`Are you sure you want to delete ${filename}?`)) {
      const res = await fetch(`/admin/delete/${fileId}`, {
        method: 'DELETE',
        credentials: 'include',
      });
      const data = await res.json();

      if (res.ok) {
        toast({ title: 'Deleted', description: `${filename} was removed.` });
        setUploads((prev) => prev.filter((file) => file.id !== fileId));
      } else {
        toast({ title: 'Error', description: data.error || 'Delete failed' });
      }
    }
  };

  const handleLogout = async () => {
    await fetch('/admin/logout', {
      method: 'POST',
      credentials: 'include',
    });
    toast({ title: 'Logged Out', description: 'Session cleared.' });
    navigate('/admin');
  };

  useEffect(() => {
    fetchUploads();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-hero p-4">
      <div className="container max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-foreground mb-2">
              Admin Dashboard
            </h1>
            <p className="text-muted-foreground">
              Manage uploaded experiments and files
            </p>
          </div>
          <div className="flex gap-2">
            <Button
              onClick={handleLogout}
              variant="outline"
              className="flex items-center gap-2"
            >
              <LogOut className="h-4 w-4" />
              Logout
            </Button>
            <Button
              onClick={() => navigate('/')}
              variant="secondary"
              className="flex items-center gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Upload
            </Button>
          </div>
        </div>

        <Card className="shadow-card border-border">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5 text-primary" />
              All Uploaded Files
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <p className="text-muted-foreground text-center py-8">Loading files...</p>
            ) : uploads.length > 0 ? (
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-12">#</TableHead>
                      <TableHead>Batch</TableHead>
                      <TableHead>Subject</TableHead>
                      <TableHead>Experiment</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead>Filename</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {uploads.map((item, index) => (
                      <TableRow key={item.id}>
                        <TableCell className="font-medium">{index + 1}</TableCell>
                        <TableCell>
                          <Badge variant="outline" className="text-xs">
                            {item.batch || '-'}
                          </Badge>
                        </TableCell>
                        <TableCell className="font-medium">{item.subject}</TableCell>
                        <TableCell>{item.experiment}</TableCell>
                        <TableCell>
                          <Badge variant="outline" className={getCategoryColor(item.category)}>
                            <span className="mr-1">{getFileIcon(item.category)}</span>
                            {item.category}
                          </Badge>
                        </TableCell>
                        <TableCell className="max-w-xs">
                          <p className="truncate text-sm" title={item.filename}>
                            {item.filename}
                          </p>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-1">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => window.open(item.url, '_blank')}
                              className="hover:bg-success hover:text-success-foreground"
                            >
                              <Download className="h-4 w-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleDelete(item.id, item.filename)}
                              className="hover:bg-destructive hover:text-destructive-foreground"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            ) : (
              <div className="text-center py-12">
                <FileText className="h-16 w-16 mx-auto text-muted-foreground/50 mb-4" />
                <h3 className="text-lg font-semibold text-foreground mb-2">
                  No files uploaded yet
                </h3>
                <p className="text-muted-foreground">
                  Files will appear here once students start uploading their experiments.
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminDashboard;
