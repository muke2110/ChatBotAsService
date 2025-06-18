import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext';
import DashboardLayout from '../components/layout/DashboardLayout';
import { toast } from 'react-hot-toast';
import { DocumentTextIcon, TrashIcon } from '@heroicons/react/24/outline';

const Upload = () => {
  const { token, selectedWidget } = useAuth();
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [currentDocument, setCurrentDocument] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const clientId = localStorage.getItem('clientId');
  console.log("ClientId:::: ",clientId);
  

  const fetchCurrentDocument = useCallback(async () => {
    try {
      const params = new URLSearchParams();
      if (selectedWidget) {
        params.append('widgetId', selectedWidget.widgetId);
      }

      const response = await fetch(`/api/v1/documents?${params}`, {
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
  }, [selectedWidget, token, clientId]);

  useEffect(() => {
    fetchCurrentDocument();
  }, [fetchCurrentDocument]);

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

    if (!selectedWidget) {
      toast.error('Please select a widget first');
      return;
    }

    setUploading(true);
    const formData = new FormData();
    formData.append('files', file);
    formData.append('widgetId', selectedWidget.widgetId);

    try {
      const response = await fetch('/api/v1/embed/upload', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'x-client-id': clientId
        },
        body: formData
      });

      if (response.ok) {
        toast.success('Document uploaded successfully!');
        setFile(null);
        fetchCurrentDocument();
      } else {
        const error = await response.json();
        toast.error(error.message || 'Upload failed');
      }
    } catch (error) {
      console.error('Error uploading file:', error);
      toast.error('Upload failed');
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async () => {
    try {
      const params = new URLSearchParams();
      if (selectedWidget) {
        params.append('widgetId', selectedWidget.widgetId);
      }

      const response = await fetch(`/api/v1/documents?${params}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'x-client-id': clientId
        }
      });

      if (response.ok) {
        toast.success('Document deleted successfully!');
        setCurrentDocument(null);
      } else {
        const error = await response.json();
        toast.error(error.message || 'Delete failed');
      }
    } catch (error) {
      console.error('Error deleting document:', error);
      toast.error('Delete failed');
    } finally {
      setShowDeleteConfirm(false);
    }
  };

  const confirmDelete = () => {
    handleDelete();
  };

  if (!selectedWidget) {
    return (
      <DashboardLayout>
        <div className="py-6">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="bg-yellow-50 dark:bg-yellow-900/50 border-l-4 border-yellow-400 p-4">
              <div className="flex">
                <div className="ml-3">
                  <p className="text-sm text-yellow-700 dark:text-yellow-200">
                    Please select a widget from the dropdown above to upload documents.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="py-6">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Upload Documents
            </h1>
            <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
              Upload documents for widget: <strong>{selectedWidget.name}</strong>
            </p>
          </div>

          {/* Upload Form */}
          {!currentDocument && (
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 mb-6">
              <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                Upload New Document
              </h2>
              <form onSubmit={handleUpload} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Select PDF File
                  </label>
                  <input
                    type="file"
                    accept=".pdf"
                    onChange={handleFileChange}
                    className="block w-full text-sm text-gray-500 dark:text-gray-400
                      file:mr-4 file:py-2 file:px-4
                      file:rounded-full file:border-0
                      file:text-sm file:font-semibold
                      file:bg-primary-50 file:text-primary-700
                      hover:file:bg-primary-100
                      dark:file:bg-primary-900 dark:file:text-primary-200"
                  />
                </div>
                <button
                  type="submit"
                  disabled={!file || uploading}
                  className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {uploading ? 'Uploading...' : 'Upload Document'}
                </button>
              </form>
            </div>
          )}

          {/* No Document Message */}
          {!currentDocument && (
            <div className="bg-blue-50 dark:bg-blue-900/50 border-l-4 border-blue-400 p-4 mb-6">
              <div className="flex">
                <div className="ml-3">
                  <p className="text-sm text-blue-700 dark:text-blue-200">
                    No documents uploaded for this widget yet. Upload a PDF document to get started.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Current Document */}
          {currentDocument && (
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
              <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                Current Document
              </h2>
              <div className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                <div className="flex items-center">
                  <DocumentTextIcon className="h-8 w-8 text-primary-600 mr-3" />
                  <div>
                    <h3 className="text-sm font-medium text-gray-900 dark:text-white">
                      {currentDocument.name}
                    </h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Size: {(currentDocument.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Uploaded: {new Date(currentDocument.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setShowDeleteConfirm(true)}
                  className="inline-flex items-center px-3 py-1.5 border border-red-300 dark:border-red-600 shadow-sm text-xs font-medium rounded text-red-700 dark:text-red-300 bg-white dark:bg-gray-700 hover:bg-red-50 dark:hover:bg-red-900/20 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                >
                  <TrashIcon className="h-3 w-3 mr-1" />
                  Delete
                </button>
              </div>
            </div>
          )}

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
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Upload; 