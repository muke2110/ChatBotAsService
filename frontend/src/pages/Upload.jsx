import React, { useState, useEffect } from 'react';
import DashboardLayout from '../components/layout/DashboardLayout';
import { toast } from 'react-hot-toast';
import { DocumentTextIcon, TrashIcon } from '@heroicons/react/24/outline';

const Upload = () => {
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [documents, setDocuments] = useState([]);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [documentToDelete, setDocumentToDelete] = useState(null);

  useEffect(() => {
    fetchDocuments();
  }, []);

  const fetchDocuments = async () => {
    try {
      const token = localStorage.getItem('token');
      const clientId = localStorage.getItem('clientId');

      const response = await fetch('/api/v1/documents', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'x-client-id': clientId
        }
      });

      if (!response.ok) throw new Error('Failed to fetch documents');

      const data = await response.json();
      setDocuments(data.documents || []);
    } catch (error) {
      console.error('Error fetching documents:', error);
      toast.error('Failed to fetch documents');
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
      // Refresh documents list
      fetchDocuments();
    } catch (error) {
      console.error('Upload error:', error);
      toast.error(error.message || 'Failed to upload file');
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (document) => {
    setDocumentToDelete(document);
    setShowDeleteConfirm(true);
  };

  const confirmDelete = async () => {
    try {
      const token = localStorage.getItem('token');
      const clientId = localStorage.getItem('clientId');

      const response = await fetch(`/api/v1/documents/${documentToDelete.id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'x-client-id': clientId
        }
      });

      if (!response.ok) throw new Error('Failed to delete document');

      toast.success('Document deleted successfully');
      setShowDeleteConfirm(false);
      setDocumentToDelete(null);
      fetchDocuments();
    } catch (error) {
      console.error('Delete error:', error);
      toast.error('Failed to delete document');
    }
  };

  return (
    <DashboardLayout>
      <div className="py-6">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="bg-white dark:bg-gray-800 shadow sm:rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <h3 className="text-lg font-medium leading-6 text-gray-900 dark:text-white">
                Upload Documents
              </h3>
              <div className="mt-2 max-w-xl text-sm text-gray-500 dark:text-gray-400">
                <p>Upload PDF documents to train your chatbot. The documents will be processed and used to answer user queries.</p>
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

          {/* Documents List */}
          <div className="mt-8 bg-white dark:bg-gray-800 shadow sm:rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <h3 className="text-lg font-medium leading-6 text-gray-900 dark:text-white mb-4">
                Uploaded Documents
              </h3>
              <div className="divide-y divide-gray-200 dark:divide-gray-700">
                {documents.length === 0 ? (
                  <p className="text-gray-500 dark:text-gray-400 py-4">No documents uploaded yet.</p>
                ) : (
                  documents.map((doc) => (
                    <div key={doc.id} className="py-4 flex justify-between items-center">
                      <div className="flex items-center">
                        <DocumentTextIcon className="h-6 w-6 text-gray-400" />
                        <span className="ml-2 text-gray-900 dark:text-white">{doc.name}</span>
                      </div>
                      <button
                        onClick={() => handleDelete(doc)}
                        className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300"
                      >
                        <TrashIcon className="h-5 w-5" />
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed z-10 inset-0 overflow-y-auto">
          <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 transition-opacity" aria-hidden="true">
              <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
            </div>

            <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>

            <div className="inline-block align-bottom bg-white dark:bg-gray-800 rounded-lg px-4 pt-5 pb-4 text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full sm:p-6">
              <div>
                <div className="mt-3 text-center sm:mt-5">
                  <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-white">
                    Delete Document
                  </h3>
                  <div className="mt-2">
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Are you sure you want to delete this document? This action will also delete all associated files in the S3 bucket. This action cannot be undone.
                    </p>
                  </div>
                </div>
              </div>
              <div className="mt-5 sm:mt-6 sm:grid sm:grid-cols-2 sm:gap-3 sm:grid-flow-row-dense">
                <button
                  type="button"
                  onClick={confirmDelete}
                  className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-red-600 text-base font-medium text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 sm:col-start-2 sm:text-sm"
                >
                  Delete
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowDeleteConfirm(false);
                    setDocumentToDelete(null);
                  }}
                  className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 sm:mt-0 sm:col-start-1 sm:text-sm dark:bg-gray-700 dark:text-gray-300 dark:border-gray-600 dark:hover:bg-gray-600"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
};

export default Upload; 