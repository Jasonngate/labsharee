import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Download, FileText, Code, Image, User } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

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

const ViewExperiments = () => {
  const navigate = useNavigate();
  const [data, setData] = useState<Record<string, any>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/view')
      .then(res => res.json())
      .then(json => {
        setData(json);
        setLoading(false);
      })
      .catch(err => {
        console.error("Failed to fetch experiments:", err);
        setLoading(false);
      });
  }, []);

  return (
    <div className="min-h-screen bg-gradient-hero p-4">
      <div className="container max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-foreground mb-2">
              Uploaded Experiments
            </h1>
            <p className="text-muted-foreground">
              Browse all submitted practicals by subject and experiment
            </p>
          </div>
          <Button
            onClick={() => navigate('/')}
            variant="outline"
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Upload
          </Button>
        </div>

        {loading ? (
          <p className="text-center text-muted-foreground">Loading experiments...</p>
        ) : Object.keys(data).length === 0 ? (
          <Card className="shadow-card border-border">
            <CardContent className="p-12 text-center">
              <div className="mb-4">
                <FileText className="h-16 w-16 mx-auto text-muted-foreground/50" />
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-2">
                No experiments uploaded yet
              </h3>
              <p className="text-muted-foreground mb-4">
                Be the first to upload your practical experiments!
              </p>
              <Button
                onClick={() => navigate('/')}
                className="bg-gradient-primary"
              >
                Upload Your First Experiment
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-6">
            {Object.entries(data).map(([subject, experiments]) => (
              <Card key={subject} className="shadow-card border-border">
                <CardHeader className="bg-gradient-primary text-primary-foreground">
                  <CardTitle className="flex items-center gap-2">
                    <User className="h-5 w-5" />
                    {subject}
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="space-y-6">
                    {Object.entries(experiments).map(([expNumber, categories]) => (
                      <div key={expNumber} className="space-y-4">
                        <h3 className="text-lg font-semibold text-foreground border-b border-border pb-2">
                          {expNumber}
                        </h3>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                          {Object.entries(categories).map(([category, files]) => (
                            <div key={category} className="space-y-2">
                              <div className="flex items-center gap-2 mb-3">
                                {getFileIcon(category)}
                                <Badge variant="outline" className={getCategoryColor(category)}>
                                  {category.charAt(0).toUpperCase() + category.slice(1)}
                                </Badge>
                              </div>

                              <div className="space-y-2">
                                {files.map(([filename, url]: [string, string], fileIndex: number) => (
                                  <div
                                    key={fileIndex}
                                    className="flex items-center justify-between p-3 rounded-md bg-muted/50 border"
                                  >
                                    <div className="flex-1 min-w-0">
                                      <p className="text-sm font-medium text-foreground truncate">
                                        {filename}
                                      </p>
                                      <p className="text-xs text-muted-foreground">
                                        Click to download
                                      </p>
                                    </div>
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      className="ml-2 hover:bg-success hover:text-success-foreground"
                                      onClick={() => window.open(url, '_blank')}
                                    >
                                      <Download className="h-4 w-4" />
                                    </Button>
                                  </div>
                                ))}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ViewExperiments;
