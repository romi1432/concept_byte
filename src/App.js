import React, { useState } from 'react';
import { Upload, FileText, Play, ChevronLeft, ChevronRight, Loader2, Video, Download } from 'lucide-react';

const App = () => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [conceptBytes, setConceptBytes] = useState([]);
  const [currentByteIndex, setCurrentByteIndex] = useState(0);
  const [error, setError] = useState('');

  const handleFileSelect = (event) => {
    const file = event.target.files[0];
    if (file && file.type === 'application/pdf') {
      setSelectedFile(file);
      setError('');
    } else {
      setError('Please select a valid PDF file');
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      setError('Please select a PDF file first');
      return;
    }

    setIsProcessing(true);
    setError('');
    
    const formData = new FormData();
    formData.append('pdf', selectedFile);

    try {
      const response = await fetch('http://localhost:3001/upload-pdf', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Failed to process PDF');
      }

      const data = await response.json();
      setConceptBytes(data);
      setCurrentByteIndex(0);
    } catch (err) {
      setError('Error processing PDF: ' + err.message);
    } finally {
      setIsProcessing(false);
    }
  };

  const nextByte = () => {
    if (currentByteIndex < conceptBytes.length - 1) {
      setCurrentByteIndex(currentByteIndex + 1);
    }
  };

  const prevByte = () => {
    if (currentByteIndex > 0) {
      setCurrentByteIndex(currentByteIndex - 1);
    }
  };

  const downloadVideo = (videoUrl, title) => {
    const link = document.createElement('a');
    link.href = videoUrl;
    link.download = `${title.replace(/\s+/g, '_')}.mp4`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const currentByte = conceptBytes[currentByteIndex];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 font-inter flex flex-col items-center justify-center p-4">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-2">
              PDF to ConceptBytes
            </h1>
            <p className="text-lg text-gray-600">
              Transform your PDF content into engaging video concept scripts and videos
            </p>
          </div>

          {/* Upload Section */}
          <div className="bg-white rounded-3xl shadow-xl p-8 mb-8">
            <div className="flex flex-col items-center">
              <div className="w-28 h-28 bg-gradient-to-br from-blue-100 to-blue-200 rounded-full flex items-center justify-center shadow-lg mb-4">
                <FileText className="w-12 h-12 text-blue-600" />
              </div>
              
              <div className="w-full max-w-md">
                <input
                  type="file"
                  accept=".pdf"
                  onChange={handleFileSelect}
                  className="w-full p-3 border-2 border-dashed border-gray-300 rounded-lg text-center cursor-pointer hover:border-blue-500 transition-colors focus:outline-none"
                />
                
                {selectedFile && (
                  <p className="mt-2 text-sm text-gray-600 text-center">
                    Selected: {selectedFile.name}
                  </p>
                )}
                
                <button
                  onClick={handleUpload}
                  disabled={!selectedFile || isProcessing}
                  className="w-full mt-4 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-semibold py-3 px-6 rounded-full transition-colors flex items-center justify-center gap-2 shadow"
                >
                  {isProcessing ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Processing PDF & Generating Videos...
                    </>
                  ) : (
                    <>
                      <Upload className="w-5 h-5" />
                      Upload & Process
                    </>
                  )}
                </button>
              </div>
            </div>

            {error && (
              <div className="mt-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg shadow-inner">
                {error}
              </div>
            )}
          </div>

          {/* ConceptBytes Display */}
          {conceptBytes.length > 0 && (
            <div className="bg-white rounded-3xl shadow-xl p-8">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900">
                  ConceptBytes Generated
                </h2>
                <div className="text-sm text-gray-500">
                  {currentByteIndex + 1} of {conceptBytes.length}
                </div>
              </div>

              {currentByte && (
                <div className="space-y-6">
                  {/* Title */}
                  <div className="flex items-center justify-between">
                    <h3 className="text-xl font-semibold text-gray-900">
                      {currentByte.title}
                    </h3>
                    {currentByte.videoUrl && (
                      <button
                        onClick={() => downloadVideo(currentByte.videoUrl, currentByte.title)}
                        className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
                      >
                        <Download className="w-4 h-4" />
                        Download Video
                      </button>
                    )}
                  </div>

                  {/* Video Player */}
                  {currentByte.videoUrl && (
                    <div className="bg-gray-900 rounded-xl overflow-hidden shadow-2xl">
                      <div className="relative">
                        <video
                          controls
                          className="w-full h-auto max-h-96"
                          poster="/api/placeholder/800/450"
                        >
                          <source src={currentByte.videoUrl} type="video/mp4" />
                          Your browser does not support the video tag.
                        </video>
                        <div className="absolute top-4 left-4 bg-black bg-opacity-50 text-white px-3 py-1 rounded-full text-sm flex items-center gap-2">
                          <Video className="w-4 h-4" />
                          Generated Video
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Script */}
                  <div className="bg-gray-50 rounded-xl p-6 shadow-inner">
                    <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                      <Play className="w-5 h-5" />
                      Script
                    </h4>
                    <p className="text-gray-700 leading-relaxed">
                      {currentByte.script}
                    </p>
                  </div>

                  {/* Audio URL */}
                  {currentByte.audioUrl && (
                    <div className="bg-blue-50 rounded-xl p-6 shadow-inner">
                      <h4 className="font-semibold text-gray-900 mb-3">
                        Generated Audio
                      </h4>
                      <audio controls className="w-full">
                        <source src={currentByte.audioUrl} type="audio/mpeg" />
                        Your browser does not support the audio element.
                      </audio>
                    </div>
                  )}

                  {/* Visual Suggestions */}
                  <div className="bg-green-50 rounded-xl p-6 shadow-inner">
                    <h4 className="font-semibold text-gray-900 mb-3">
                      Visual Suggestions
                    </h4>
                    <p className="text-gray-700 leading-relaxed">
                      {currentByte.visualSuggestions}
                    </p>
                  </div>

                  {/* Navigation */}
                  {conceptBytes.length > 1 && (
                    <div className="flex justify-between items-center pt-6 border-t border-gray-200">
                      <button
                        onClick={prevByte}
                        disabled={currentByteIndex === 0}
                        className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 disabled:bg-gray-50 disabled:text-gray-400 rounded-full shadow transition-colors"
                      >
                        <ChevronLeft className="w-4 h-4" />
                        Previous
                      </button>
                      
                      <div className="flex gap-2">
                        {conceptBytes.map((_, index) => (
                          <button
                            key={index}
                            onClick={() => setCurrentByteIndex(index)}
                            className={`w-3 h-3 rounded-full transition-colors ${
                              index === currentByteIndex
                                ? 'bg-blue-600'
                                : 'bg-gray-300 hover:bg-gray-400'
                            }`}
                          />
                        ))}
                      </div>
                      
                      <button
                        onClick={nextByte}
                        disabled={currentByteIndex === conceptBytes.length - 1}
                        className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 disabled:bg-gray-50 disabled:text-gray-400 rounded-full shadow transition-colors"
                      >
                        Next
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    </div>
                  )}

                  {/* Bulk Actions */}
                  <div className="flex justify-center pt-4 border-t border-gray-200">
                    <button
                      onClick={() => {
                        conceptBytes.forEach((byte, index) => {
                          if (byte.videoUrl) {
                            setTimeout(() => {
                              downloadVideo(byte.videoUrl, `${byte.title}_${index + 1}`);
                            }, index * 500); // Stagger downloads
                          }
                        });
                      }}
                      className="flex items-center gap-2 px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors shadow-lg"
                    >
                      <Download className="w-5 h-5" />
                      Download All Videos
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default App;