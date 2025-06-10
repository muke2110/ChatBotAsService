import React, { useState } from 'react';
import DashboardLayout from '../components/layout/DashboardLayout';
import { toast } from 'react-hot-toast';

const Upload = () => {
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      if (selectedFile.type === 'application/pdf') {
        setFile(selectedFile);
      } else {
        toast.error('Please upload a PDF file');
      }
    }
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!file) {
      toast.error('Please select a file first');
      return;
    }

    setUploading(true);
    const formData = new FormData();
    formData.append('files', file);

    const token = localStorage.getItem('token');
    const clientId = localStorage.getItem('clientId');

    if (!token || !clientId) {
      toast.error('Authentication error. Please try logging in again.');
      setUploading(false);
      return;
    }

    try {
      const response = await fetch('/api/v1/embed/upload', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'x-client-id': clientId
        },
        body: formData
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        throw new Error(errorData?.message || 'Upload failed');
      }

      const data = await response.json();
      toast.success(data.message || 'File uploaded successfully');
      setFile(null);
      // Reset the file input
      e.target.reset();
    } catch (error) {
      console.error('Upload error:', error);
      toast.error(error.message || 'Failed to upload file');
    } finally {
      setUploading(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto p-6">
        <h1 className="text-2xl font-bold mb-6">Upload Training Data</h1>
        
        <div className="bg-white rounded-lg shadow p-6">
          <form onSubmit={handleUpload}>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Upload PDF Document
              </label>
              <input
                type="file"
                accept=".pdf"
                onChange={handleFileChange}
                className="block w-full text-sm text-gray-500
                  file:mr-4 file:py-2 file:px-4
                  file:rounded-full file:border-0
                  file:text-sm file:font-semibold
                  file:bg-blue-50 file:text-blue-700
                  hover:file:bg-blue-100"
              />
              <p className="mt-2 text-sm text-gray-500">
                Only PDF files are accepted
              </p>
            </div>

            <button
              type="submit"
              disabled={!file || uploading}
              className={`w-full py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white 
                ${!file || uploading 
                  ? 'bg-gray-400 cursor-not-allowed' 
                  : 'bg-blue-600 hover:bg-blue-700'}`}
            >
              {uploading ? 'Uploading...' : 'Upload File'}
            </button>
          </form>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Upload; 