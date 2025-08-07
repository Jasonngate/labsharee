import React, { useState } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Upload, FileText, Code, Image, Eye } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import FileUploadArea from './FileUploadArea';

interface FormDataState {
  batch: string;
  subject: string;
  experiment: string;
  rubricFile: File | null;
  outputFile: File | null;
  codeFile: File | null;
}

const UploadForm = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState<FormDataState>({
    batch: '',
    subject: '',
    experiment: '',
    rubricFile: null,
    outputFile: null,
    codeFile: null,
  });

  const subjects = [
    'Machine Learning',
    'Blockchain',
    'Big Data Analysis',
    'Natural Language Processing',
  ];

  const experiments = Array.from({ length: 11 }, (_, i) => `Experiment ${i + 1}`);

  const handleFileChange = (field: keyof FormDataState) => (file: File | null) => {
    setFormData((prev) => ({ ...prev, [field]: file }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.subject || !formData.experiment) {
      toast({
        title: 'Missing Information',
        description: 'Subject and Experiment Number are required.',
        variant: 'destructive',
      });
      return;
    }

    const hasFiles = formData.rubricFile || formData.outputFile || formData.codeFile;
    if (!hasFiles) {
      toast({
        title: 'No Files Selected',
        description: 'Please select at least one file to upload.',
        variant: 'destructive',
      });
      return;
    }

    const data = new FormData();
    data.append('subject', formData.subject);
    data.append('expno', formData.experiment);
    data.append('batch', formData.batch);

    if (formData.rubricFile) data.append('rubric', formData.rubricFile);
    if (formData.outputFile) data.append('output', formData.outputFile);
    if (formData.codeFile) data.append('code', formData.codeFile);

    try {
      setIsSubmitting(true);
      const response = await fetch('/upload', {
        method: 'POST',
        body: data,
      });

      const result = await response.json();
      setIsSubmitting(false);

      if (response.ok) {
        toast({
          title: 'Upload Successful!',
          description: result.message || 'Files uploaded.',
        });

        setFormData({
          batch: '',
          subject: '',
          experiment: '',
          rubricFile: null,
          outputFile: null,
          codeFile: null,
        });
      } else {
        toast({
          title: 'Upload Failed',
          description: result.error || 'Something went wrong. Try again.',
          variant: 'destructive',
        });
      }
    } catch (err) {
      setIsSubmitting(false);
      console.error(err);
      toast({
        title: 'Server Error',
        description: 'Failed to connect to the server.',
        variant: 'destructive',
      });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-hero p-4">
      <div className="container max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-foreground mb-2">
            BE COMPS Lab Upload
          </h1>
          <p className="text-muted-foreground text-lg">
            Upload your practical experiments and share knowledge
          </p>
          <Button onClick={() => navigate('/view')} variant="secondary" className="mt-4">
            <Eye className="mr-2 h-4 w-4" />
            View All Experiments
          </Button>
        </div>

        <Card className="shadow-card border-border">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Upload className="h-5 w-5 text-primary" />
              Upload Your Practical
            </CardTitle>
            <CardDescription>
              Select your batch, subject, experiment and upload your files
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="batch">Batch</Label>
                  <Select
                    value={formData.batch}
                    onValueChange={(value) => setFormData((prev) => ({ ...prev, batch: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select batch" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="A">Batch A</SelectItem>
                      <SelectItem value="B">Batch B</SelectItem>
                      <SelectItem value="C">Batch C</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="subject">
                    Subject <span className="text-destructive">*</span>
                  </Label>
                  <Select
                    value={formData.subject}
                    onValueChange={(value) =>
                      setFormData((prev) => ({ ...prev, subject: value }))
                    }
                    required
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select subject" />
                    </SelectTrigger>
                    <SelectContent>
                      {subjects.map((subject) => (
                        <SelectItem key={subject} value={subject}>
                          {subject}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="experiment">
                    Experiment <span className="text-destructive">*</span>
                  </Label>
                  <Select
                    value={formData.experiment}
                    onValueChange={(value) =>
                      setFormData((prev) => ({ ...prev, experiment: value }))
                    }
                    required
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select experiment" />
                    </SelectTrigger>
                    <SelectContent>
                      {experiments.map((exp) => (
                        <SelectItem key={exp} value={exp}>
                          {exp}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-6">
                <FileUploadArea
                  label="Upload Writeups"
                  description="PDF, DOCX, or image files"
                  accept=".pdf,.docx,.doc,.png,.jpg,.jpeg"
                  icon={<FileText className="h-8 w-8" />}
                  onFileChange={handleFileChange('rubricFile')}
                  selectedFile={formData.rubricFile}
                />

                <FileUploadArea
                  label="Upload Output"
                  description="Screenshots, results, or documentation"
                  accept=".pdf,.docx,.doc,.png,.jpg,.jpeg"
                  icon={<Image className="h-8 w-8" />}
                  onFileChange={handleFileChange('outputFile')}
                  selectedFile={formData.outputFile}
                />

                <FileUploadArea
                  label="Upload Code"
                  description="Python, Jupyter notebooks, or text files"
                  accept=".py,.ipynb,.txt,.pdf,.docx,.doc"
                  icon={<Code className="h-8 w-8" />}
                  onFileChange={handleFileChange('codeFile')}
                  selectedFile={formData.codeFile}
                />
              </div>

              <Button
                type="submit"
                size="lg"
                disabled={isSubmitting}
                className="w-full bg-gradient-primary hover:opacity-90 shadow-primary"
              >
                <Upload className="mr-2 h-5 w-5" />
                {isSubmitting ? 'Uploading...' : 'Submit Practical'}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default UploadForm;
