import React, { useState } from 'react';
import DashboardLayout from '../components/layout/DashboardLayout';

const Documentation = () => {
  const [activeTab, setActiveTab] = useState('script');

  const integrationMethods = [
    {
      id: 'script',
      title: 'HTML Script Tag',
      description: 'Quick integration for any website',
      content: {
        overview: 'Add the chatbot to any website with a single script tag. Ideal for static sites, landing pages, or rapid deployment.',
        installation: {
          title: 'Installation',
          steps: [
            {
              step: 1,
              title: 'Add Script Tag',
              description: 'Include the chatbot script in your HTML file.',
              code: `<script src="https://your-domain.com/chatbot.js?clientId=YOUR_CLIENT_ID&widgetId=YOUR_WIDGET_ID"></script>`
            },
            {
              step: 2,
              title: 'Obtain Credentials',
              description: 'Retrieve your Client ID and Widget ID from your dashboard.',
              code: `// From your dashboard:
// Client ID: abc123-def456-ghi789
// Widget ID: widget_xyz123`
            },
            {
              step: 3,
              title: 'Customize (Optional)',
              description: 'Add parameters for customization.',
              code: `<script src="https://your-domain.com/chatbot.js?clientId=YOUR_CLIENT_ID&widgetId=YOUR_WIDGET_ID&position=bottom-left&primaryColor=%23ff6b6b&botName=Support%20Bot"></script>`
            }
          ]
        },
        configuration: {
          title: 'Configuration Options',
          description: 'Configure via URL parameters.',
          options: [
            { param: 'clientId', type: 'string', required: true, description: 'Unique client identifier' },
            { param: 'widgetId', type: 'string', required: true, description: 'Specific widget identifier' },
            { param: 'apiUrl', type: 'string', required: false, description: 'API endpoint (defaults to localhost)' },
            { param: 'position', type: 'string', required: false, description: 'Widget position: bottom-right, bottom-left, top-right, top-left' },
            { param: 'primaryColor', type: 'string', required: false, description: 'Primary color in hex (e.g., #007bff)' },
            { param: 'backgroundColor', type: 'string', required: false, description: 'Background color in hex' },
            { param: 'textColor', type: 'string', required: false, description: 'Text color in hex' },
            { param: 'botName', type: 'string', required: false, description: 'Name in chat header' },
            { param: 'welcomeMessage', type: 'string', required: false, description: 'Initial user message' }
          ]
        },
        examples: {
          title: 'Examples',
          examples: [
            {
              title: 'Basic Integration',
              description: 'Minimal setup with Client ID.',
              code: `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Example Website</title>
</head>
<body>

<!-- Add the chatbot script -->
<script src="http://localhost:3000/chatbot.js" defer></script>

<!-- Initialize the chatbot -->
<script defer>
    window.addEventListener('load', function() {
        // Initialize the chatbot with your configuration
        const chatbot = new ChatbotService({
            clientId: 'e1b712ed-8b6a-4e5e-8288-92e26069dfe5',
            widgetId: 'widget_31db9885-4461-4028-8ead-1ff04eb4b4ec',
        });
    });
</script>

</body>
</html> `
            },
            {
              title: 'Customized Integration',
              description: 'Fully customized setup.',
              code: `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Example Website</title>
</head>
<body>

<!-- Add the chatbot script -->
<script src="http://localhost:3000/chatbot.js" defer></script>

<!-- Initialize the chatbot -->
<script defer>
    window.addEventListener('load', function() {
        // Initialize the chatbot with your configuration
        const chatbot = new ChatbotService({
            clientId: 'e1b712ed-8b6a-4e5e-8288-92e26069dfe5',
            widgetId: 'widget_31db9885-4461-4028-8ead-1ff04eb4b4ec',
            apiUrl: 'http://localhost:3000/api/v1',
            position: "bottom-right",
            theme: {
              primaryColor: "#ade70d",
              textColor: "#000000",
              backgroundColor: "#ebede8"
            },
            botName: "cookiee Assistant",
            welcomeMessage: "Anneyong Sweet tooths! How can I help you ?"
        });
    });
</script>

</body>
</html> `
            }
          ]
        }
      }
    },
    {
      id: 'npm',
      title: 'NPM Package',
      description: 'Advanced integration for React and modern apps',
      content: {
        overview: 'Install as an npm package for full control. Ideal for React applications and SPAs.',
        installation: {
          title: 'Installation',
          steps: [
            {
              step: 1,
              title: 'Install Package',
              description: 'Add the chatbot widget to your project.',
              code: `npm install @mukesh2110/chatbot-widget`
            },
            {
              step: 2,
              title: 'Initialize',
              description: 'Import and create a ChatbotService instance.',
              code: `import ChatbotService from '@mukesh2110/chatbot-widget';

const chatbot = new ChatbotService({
  clientId: 'YOUR_CLIENT_ID',
  widgetId: 'YOUR_WIDGET_ID'
});`
            },
            {
              step: 3,
              title: 'React Integration',
              description: 'Use in React with useEffect.',
              code: `import ChatbotService from '@mukesh2110/chatbot-widget';

function App() {
    const chatbot = new ChatbotService({
      clientId: 'YOUR_CLIENT_ID',
      widgetId: 'YOUR_WIDGET_ID'
    });
  return <div>Your App Content</div>;
}`
            }
          ]
        },
        configuration: {
          title: 'Configuration Options',
          description: 'Pass a configuration object.',
          options: [
            { param: 'clientId', type: 'string', required: true, description: 'Unique client identifier' },
            { param: 'widgetId', type: 'string', required: true, description: 'Specific widget identifier' },
            { param: 'apiUrl', type: 'string', required: false, description: 'API endpoint (defaults to localhost)' },
            { param: 'position', type: 'string', required: false, description: 'Widget position: bottom-right, bottom-left, top-right, top-left' },
            { param: 'theme', type: 'object', required: false, description: 'Theme configuration' },
            { param: 'botName', type: 'string', required: false, description: 'Name in chat header' },
            { param: 'welcomeMessage', type: 'string', required: false, description: 'Initial user message' }
          ]
        },
        examples: {
          title: 'Examples',
          examples: [
            {
              title: 'Basic React Integration',
              description: 'Simple React component setup.',
              code: `import ChatbotService from '@mukesh2110/chatbot-widget';

function App() {

    const chatbot = new ChatbotService({
      clientId: 'abc123-def456-ghi789',
      widgetId: 'widget_xyz123',
    });

  return (
    <div className="App">
      <h1>Welcome to my React app</h1>
    </div>
  );
}

export default App;`
            },
            {
              title: 'Advanced React Integration',
              description: 'Fully customized setup.',
              code: `import ChatbotService from '@mukesh2110/chatbot-widget';

function App() {
  new ChatbotService({
    clientId: 'e1b712ed-8b6a-4e5e-8288-92e26069dfe5',
    widgetId: 'widget_31db9885-4461-4028-8ead-1ff04eb4b4ec',
    apiUrl: 'http://localhost:3000/api/v1',
    position: "bottom-right",
    theme: {
      primaryColor: "#ade70d",
      textColor: "#000000",
      backgroundColor: "#ebede8"
    },
    botName: "cookiee Assistant",
    welcomeMessage: "Anneyong Sweet tooths! How can I help you ?"
  })
  return (
    <div className="App">
      <h1>Hello world</h1>

    </div>
  );
}

export default App;
`
            }
          ]
        }
      }
    }
  ];

  const otherSections = [
    {
      title: 'Multi-Widget Support',
      content: [
        {
          subtitle: 'Plan Limits',
          text: 'Support for multiple widgets per plan, each with unique settings and analytics.',
          items: [
            'Starter Plan: 1 widget',
            'Pro Plan: 2 widgets',
            'Enterprise Plan: 3 widgets'
          ]
        },
        {
          subtitle: 'Widget Management',
          text: 'Manage widgets from the dashboard.',
          items: [
            'Unique widgetId per widget',
            'Customizable names and settings',
            'Separate S3 storage',
            'Activate/deactivate widgets'
          ]
        }
      ]
    },
    {
      title: 'Document Management',
      content: [
        {
          subtitle: 'Widget Documents',
          text: 'Each widget can have its own document set.',
          items: [
            'Upload documents (PDF, DOCX, TXT, CSV) to specific widgets',
            'Automatic processing and embedding',
            'Separate document storage',
            'Indexed for fast retrieval'
          ]
        },
        {
          subtitle: 'Processing',
          items: [
            'Formats: PDF, DOCX, TXT, CSV',
            'Automatic text extraction',
            'Vector embeddings via AWS Bedrock',
            'FAISS indexing'
          ]
        }
      ]
    },
    {
      title: 'API Reference',
      content: [
        {
          subtitle: 'Query Endpoint',
          text: 'Send queries to your widget.',
          code: `POST /api/v1/query/ask
Headers: {
  'Content-Type': 'application/json',
  'X-Client-ID': 'your-client-id'
}
Body: {
  "query": "Your question here",
  "widgetId": "your-widget-id"
}`
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
}`
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
            { code: '400', description: 'Bad Request - Invalid parameters' },
            { code: '404', description: 'Not Found - Widget or document not found' },
            { code: '429', description: 'Too Many Requests - Rate limit exceeded' },
            { code: '500', description: 'Internal Server Error' }
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
            'Keep documents concise',
            'Use clear formatting',
            'Update regularly',
            'Remove outdated content',
            'Organize logically'
          ]
        },
        {
          subtitle: 'Widget Management',
          items: [
            'Use descriptive names',
            'Match brand themes',
            'Test before deployment',
            'Monitor analytics',
            'Organize settings'
          ]
        },
        {
          subtitle: 'Integration Tips',
          items: [
            'Test thoroughly',
            'Monitor performance',
            'Secure client IDs',
            'Handle errors',
            'Use widget-specific scripts'
          ]
        }
      ]
    }
  ];

  const renderConfigurationTable = (options) => (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse bg-white dark:bg-gray-800 rounded-lg shadow-sm">
        <thead className="bg-gray-100 dark:bg-gray-700">
          <tr>
            <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900 dark:text-gray-100">Parameter</th>
            <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900 dark:text-gray-100">Type</th>
            <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900 dark:text-gray-100">Required</th>
            <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900 dark:text-gray-100">Description</th>
          </tr>
        </thead>
        <tbody>
          {options.map((option, index) => (
            <tr key={index} className="border-t dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700">
              <td className="px-6 py-4 text-sm font-mono text-blue-600 dark:text-blue-400">{option.param}</td>
              <td className="px-6 py-4 text-sm text-gray-700 dark:text-gray-300">{option.type}</td>
              <td className="px-6 py-4 text-sm">
                <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${option.required ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200' : 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'}`}>
                  {option.required ? 'Yes' : 'No'}
                </span>
              </td>
              <td className="px-6 py-4 text-sm text-gray-700 dark:text-gray-300">{option.description}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );

  const renderCodeBlock = (code, language = 'javascript') => (
    <div className="relative my-4">
      <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto text-sm font-mono">
        <code>{code}</code>
      </pre>
      <button
        onClick={() => navigator.clipboard.writeText(code)}
        className="absolute top-2 right-2 bg-gray-700 hover:bg-gray-600 text-white text-xs px-3 py-1 rounded"
      >
        Copy
      </button>
    </div>
  );

  return (
    <DashboardLayout>
      <div className="py-8 bg-gray-50 dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <header className="mb-12">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Documentation</h1>
            <p className="mt-2 text-lg text-gray-600 dark:text-gray-400">
              Integrate our AI chatbot widget into your website or application with ease.
            </p>
          </header>

          <nav className="mb-8">
            <div className="flex border-b border-gray-200 dark:border-gray-700">
              {integrationMethods.map((method) => (
                <button
                  key={method.id}
                  onClick={() => setActiveTab(method.id)}
                  className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors ${activeTab === method.id
                      ? 'border-blue-600 text-blue-600 dark:text-blue-400'
                      : 'border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                    }`}
                >
                  {method.title}
                </button>
              ))}
            </div>
          </nav>

          {integrationMethods.map((method) => (
            <section key={method.id} className={activeTab === method.id ? 'block' : 'hidden'}>
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 mb-8">
                <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">{method.title}</h2>
                <p className="text-gray-600 dark:text-gray-400 mb-6">{method.content.overview}</p>

                <div className="mb-8">
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">{method.content.installation.title}</h3>
                  <div className="space-y-6">
                    {method.content.installation.steps.map((step) => (
                      <div key={step.step} className="flex space-x-4">
                        <span className="flex-shrink-0 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold">
                          {step.step}
                        </span>
                        <div>
                          <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-2">{step.title}</h4>
                          <p className="text-gray-600 dark:text-gray-400 mb-3">{step.description}</p>
                          {step.code && renderCodeBlock(step.code)}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="mb-8">
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">{method.content.configuration.title}</h3>
                  <p className="text-gray-600 dark:text-gray-400 mb-4">{method.content.configuration.description}</p>
                  {renderConfigurationTable(method.content.configuration.options)}
                </div>

                <div>
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">{method.content.examples.title}</h3>
                  <div className="space-y-6">
                    {method.content.examples.examples.map((example, index) => (
                      <div key={index} className="p-4 rounded-lg border border-gray-200 dark:border-gray-700">
                        <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-2">{example.title}</h4>
                        <p className="text-gray-600 dark:text-gray-400 mb-3">{example.description}</p>
                        {renderCodeBlock(example.code)}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </section>
          ))}

          {otherSections.map((section, index) => (
            <section key={index} className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-6">{section.title}</h2>
              {section.content.map((item, contentIndex) => (
                <div key={contentIndex} className="mb-8 last:mb-0">
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">{item.subtitle}</h3>
                  {item.text && <p className="text-gray-600 dark:text-gray-400 mb-4">{item.text}</p>}
                  {item.code && renderCodeBlock(item.code)}
                  {item.items && (
                    <ul className="list-disc pl-5 space-y-2">
                      {item.items.map((listItem, itemIndex) => (
                        <li key={itemIndex} className="text-gray-600 dark:text-gray-400">
                          {typeof listItem === 'string' ? listItem : `${listItem.code} - ${listItem.description}`}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              ))}
            </section>
          ))}

          <section className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-6">
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Quick Start Guide</h3>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-medium text-gray-900 dark:text-white mb-2">1. Get Credentials</h4>
                <p className="text-gray-600 dark:text-gray-400 text-sm">Sign up and retrieve your Client ID and Widget ID.</p>
              </div>
              <div>
                <h4 className="font-medium text-gray-900 dark:text-white mb-2">2. Choose Integration</h4>
                <p className="text-gray-600 dark:text-gray-400 text-sm">Select HTML script tag or NPM package.</p>
              </div>
              <div>
                <h4 className="font-medium text-gray-900 dark:text-white mb-2">3. Upload Documents</h4>
                <p className="text-gray-600 dark:text-gray-400 text-sm">Train your chatbot with documents (PDF, DOCX, TXT, CSV).</p>
              </div>
              <div>
                <h4 className="font-medium text-gray-900 dark:text-white mb-2">4. Test & Deploy</h4>
                <p className="text-gray-600 dark:text-gray-400 text-sm">Test and deploy your chatbot.</p>
              </div>
            </div>
          </section>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Documentation;