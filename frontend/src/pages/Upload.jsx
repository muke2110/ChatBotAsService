import React, { useState, useEffect } from 'react';
import DashboardLayout from '../components/layout/DashboardLayout';
import { toast } from 'react-hot-toast';
import { DocumentTextIcon, TrashIcon } from '@heroicons/react/24/outline';

const Upload = () => {
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [currentDocument, setCurrentDocument] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  useEffect(() => {
    fetchCurrentDocument();
  }, []);

  const fetchCurrentDocument = async () => {
    try {
      const token = localStorage.getItem('token');
      const clientId = localStorage.getItem('clientId');

      const response = await fetch('/api/v1/documents', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'x-client-id': clientId
        }
      });

      if (!response.ok) throw new Error('Failed to fetch document');

      const data = await response.json();
      setCurrentDocument(data.document || null);
    } catch (error) {
      console.error('Error fetching document:', error);
      toast.error('Failed to fetch document');
    }
  };

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
      // Refresh current document
      fetchCurrentDocument();
    } catch (error) {
      console.error('Upload error:', error);
      toast.error(error.message || 'Failed to upload file');
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = () => {
    setShowDeleteConfirm(true);
  };

  const confirmDelete = async () => {
    try {
      const token = localStorage.getItem('token');
      const clientId = localStorage.getItem('clientId');

      const response = await fetch('http://localhost:3000/api/v1/documents/', {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'x-client-id': clientId
        }
      });

      if (!response.ok) throw new Error('Failed to delete document');

      toast.success('Document deleted successfully');
      setShowDeleteConfirm(false);
      setCurrentDocument(null);
    } catch (error) {
      console.error('Delete error:', error);
      toast.error('Failed to delete document');
    }
  };

  return (
    <DashboardLayout>
      <div className="py-6">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          {!currentDocument && (
            <div className="bg-white dark:bg-gray-800 shadow sm:rounded-lg">
              <div className="px-4 py-5 sm:p-6">
                <h3 className="text-lg font-medium leading-6 text-gray-900 dark:text-white">
                  Upload Document
                </h3>
                <div className="mt-2 max-w-xl text-sm text-gray-500 dark:text-gray-400">
                  <p>Upload a PDF document to train your chatbot. The document will be processed and used to answer user queries.</p>
                </div>
                <form onSubmit={handleUpload} className="mt-5">
                  <div className="flex items-center">
                    <label className="block">
                      <span className="sr-only">Choose file</span>
                      <input
                        type="file"
                        accept=".pdf"
                        onChange={handleFileChange}
                        className="block w-full text-sm text-gray-500 dark:text-gray-400
                file:mr-4 file:py-2 file:px-4
                file:rounded-md file:border-0
                file:text-sm file:font-semibold
                file:bg-primary-50 file:text-primary-700
                hover:file:bg-primary-100
                dark:file:bg-primary-900 dark:file:text-primary-300"
                      />
                    </label>
                    <button
                      type="submit"
                      disabled={uploading || !file}
                      className="ml-3 btn-primary"
                    >
                      {uploading ? (
                        <div className="flex items-center">
                          <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white mr-2"></div>
                          Uploading...
                        </div>
                      ) : (
                        'Upload'
                      )}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* Current Document */}
          <div className="mt-8 bg-white dark:bg-gray-800 shadow sm:rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <h3 className="text-lg font-medium leading-6 text-gray-900 dark:text-white mb-4">
                Current Document
              </h3>
              <div className="divide-y divide-gray-200 dark:divide-gray-700">
                {!currentDocument ? (
                  <p className="text-gray-500 dark:text-gray-400 py-4">No document uploaded yet.</p>
                ) : (
                  <div className="py-4 flex justify-between items-center">
                    <div className="flex items-center">
                      <DocumentTextIcon className="h-6 w-6 text-gray-400" />
                      <span className="ml-2 text-gray-900 dark:text-white">{currentDocument.name}</span>
                    </div>
                    <button
                      onClick={handleDelete}
                      className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300"
                    >
                      <TrashIcon className="h-5 w-5" />
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-sm w-full mx-4">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
              Delete Document
            </h3>
            <p className="text-gray-500 dark:text-gray-400 mb-6">
              Are you sure you want to delete this document? This action cannot be undone.
            </p>
            <div className="flex justify-end space-x-4">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="btn-secondary"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                className="btn-danger"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
};

export default Upload; 