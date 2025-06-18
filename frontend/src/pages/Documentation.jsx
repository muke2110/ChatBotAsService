import React from 'react';
import DashboardLayout from '../components/layout/DashboardLayout';

const Documentation = () => {
  const sections = [
    {
      title: 'Getting Started',
      content: [
        {
          subtitle: 'Multi-Widget Integration',
          text: 'Our chatbot service supports multiple widgets per subscription plan. Each widget can have its own documents, settings, and analytics.',
          items: [
            'Starter Plan: 1 widget',
            'Pro Plan: 2 widgets', 
            'Enterprise Plan: 3 widgets'
          ]
        },
        {
          subtitle: 'Basic Integration',
          text: 'To integrate a specific widget into your website, add the following script to your HTML:',
          code: `<script src="https://your-domain.com/chatbot.js?clientId=YOUR_CLIENT_ID&widgetId=YOUR_WIDGET_ID"></script>`,
        }
      ]
    },
    {
      title: 'Widget Management',
      content: [
        {
          subtitle: 'Creating Widgets',
          text: 'Widgets are automatically created when you subscribe to a plan. You can manage them from the Widgets page in your dashboard.',
          items: [
            'Each widget has a unique widgetId',
            'Widgets can be renamed and customized',
            'Each widget has its own S3 storage prefix',
            'Widgets can be activated/deactivated'
          ]
        },
        {
          subtitle: 'Widget Settings',
          text: 'Each widget can have custom settings:',
          items: [
            'Theme colors (primary, text, background)',
            'Chat widget position (bottom-right, bottom-left, top-right, top-left)',
            'Welcome message',
            'Bot name',
            'Custom styling options'
          ]
        }
      ]
    },
    {
      title: 'Document Management',
      content: [
        {
          subtitle: 'Widget-Specific Documents',
          text: 'Each widget can have its own set of documents for training:',
          items: [
            'Upload PDF documents to specific widgets',
            'Documents are processed and embedded automatically',
            'Each widget has separate document storage',
            'Documents are chunked and indexed for fast retrieval'
          ]
        },
        {
          subtitle: 'Document Processing',
          items: [
            'Supported format: PDF',
            'Maximum file size: 10MB per file',
            'Automatic text extraction and chunking',
            'Vector embeddings generated using AWS Bedrock',
            'FAISS indexing for fast similarity search'
          ]
        }
      ]
    },
    {
      title: 'Analytics & Monitoring',
      content: [
        {
          subtitle: 'Widget Analytics',
          text: 'Track performance and usage for each widget:',
          items: [
            'Query count and success rates',
            'Average response times',
            'Error tracking and debugging',
            'Daily/weekly/monthly breakdowns',
            'Recent query history'
          ]
        },
        {
          subtitle: 'Performance Metrics',
          items: [
            'Response time tracking (milliseconds)',
            'Success rate percentage',
            'Error rate monitoring',
            'Query volume trends',
            'Widget-specific performance comparison'
          ]
        }
      ]
    },
    {
      title: 'API Reference',
      content: [
        {
          subtitle: 'Query Endpoint',
          text: 'Send queries to your widget:',
          code: `POST /api/v1/query
Headers: {
  'Content-Type': 'application/json',
  'X-Client-ID': 'your-client-id'
}
Body: {
  "query": "Your question here",
  "widgetId": "your-widget-id"
}`,
        },
        {
          subtitle: 'Response Format',
          code: `{
  "answer": "Generated response",
  "matches": [
    {
      "text": "Relevant document text",
      "score": 0.95,
      "distance": 0.05
    }
  ],
  "status": "SUCCESS",
  "responseTime": 1250
}`,
        }
      ]
    },
    {
      title: 'Error Codes',
      content: [
        {
          subtitle: 'Authentication Errors',
          items: [
            { code: '401', description: 'Unauthorized - Invalid or missing client ID' },
            { code: '403', description: 'Forbidden - Insufficient permissions or inactive widget' }
          ]
        },
        {
          subtitle: 'API Errors',
          items: [
            { code: '400', description: 'Bad Request - Invalid parameters or request body' },
            { code: '404', description: 'Not Found - Widget or document not found' },
            { code: '429', description: 'Too Many Requests - Rate limit exceeded' },
            { code: '500', description: 'Internal Server Error - Something went wrong on our end' }
          ]
        }
      ]
    },
    {
      title: 'Best Practices',
      content: [
        {
          subtitle: 'Document Preparation',
          items: [
            'Keep documents clear and concise',
            'Use proper formatting for better understanding',
            'Update documents regularly to maintain accuracy',
            'Remove outdated or irrelevant information',
            'Organize content logically for better retrieval'
          ]
        },
        {
          subtitle: 'Widget Management',
          items: [
            'Use descriptive widget names',
            'Customize themes to match your brand',
            'Test widgets thoroughly before going live',
            'Monitor analytics regularly',
            'Keep widget settings organized'
          ]
        },
        {
          subtitle: 'Integration Tips',
          items: [
            'Test the chatbot thoroughly before going live',
            'Monitor chatbot performance regularly',
            'Keep your client IDs secure',
            'Implement proper error handling',
            'Use widget-specific scripts for different pages'
          ]
        }
      ]
    }
  ];

  return (
    <DashboardLayout>
      <div className="py-6">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">Documentation</h1>
          
          {sections.map((section, index) => (
            <div key={index} className="mb-12">
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-6">
                {section.title}
              </h2>
              
              {section.content.map((item, contentIndex) => (
                <div key={contentIndex} className="mb-8">
                  <h3 className="text-xl font-medium text-gray-900 dark:text-white mb-4">
                    {item.subtitle}
                  </h3>
                  
                  {item.text && (
                    <p className="text-gray-600 dark:text-gray-400 mb-4">
                      {item.text}
                    </p>
                  )}
                  
                  {item.code && (
                    <div className="bg-gray-800 rounded-lg p-4 mb-4">
                      <code className="text-sm text-white font-mono">
                        {item.code}
                      </code>
                    </div>
                  )}
                  
                  {item.items && (
                    <ul className="space-y-3">
                      {item.items.map((listItem, itemIndex) => (
                        <li key={itemIndex} className="flex items-start">
                          <span className="flex-shrink-0 h-6 w-6 text-primary-600">
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                          </span>
                          <span className="ml-2 text-gray-600 dark:text-gray-400">
                            {typeof listItem === 'string' ? listItem : `${listItem.code} - ${listItem.description}`}
                          </span>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              ))}
            </div>
          ))}

          <div className="bg-gray-50 dark:bg-gray-800 p-6 rounded-lg">
            <h3 className="text-lg font-semibold mb-4">Complete Integration Example</h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Here's a complete example of how to integrate a widget-specific chatbot:
            </p>
            <pre className="bg-gray-800 text-white p-4 rounded-lg overflow-x-auto">
              <code>{`<!-- Add this to your HTML head or before closing body tag -->
<script>
  window.chatbotConfig = {
    clientId: 'YOUR_CLIENT_ID',
    widgetId: 'YOUR_WIDGET_ID',
    theme: {
      primaryColor: '#4F46E5',
      backgroundColor: '#ffffff',
      textColor: '#1F2937'
    },
    position: 'bottom-right',
    apiUrl: 'https://your-domain.com/api/v1'
  };
</script>
<script src="https://your-domain.com/chatbot.js"></script>`}</code>
            </pre>
            <p className="text-gray-600 dark:text-gray-400 mt-4">
              Replace <code className="bg-gray-100 dark:bg-gray-700 px-1 py-0.5 rounded">YOUR_CLIENT_ID</code> and <code className="bg-gray-100 dark:bg-gray-700 px-1 py-0.5 rounded">YOUR_WIDGET_ID</code> with your actual values from the dashboard.
            </p>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Documentation; 