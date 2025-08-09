import React from 'react';

const CodeBlock: React.FC<{ children: React.ReactNode }> = ({ children }) => (
    <pre className="bg-dark-bg border border-dark-border rounded-lg p-4 text-sm text-light-text font-mono overflow-x-auto">
        <code>{children}</code>
    </pre>
);

const DeploymentGuidePage: React.FC = () => {

    return (
        <div className="h-full space-y-8">
            <h2 className="text-3xl font-bold font-display">Application Deployment Guide</h2>

            <p className="text-medium-text">
                This guide provides step-by-step instructions to take your application from this development environment to a live, publicly accessible website. We will use modern, industry-standard tools: <strong className="text-primary">Vite</strong> for building the project and <strong className="text-primary">Vercel</strong> for hosting.
            </p>

            <div className="space-y-6">
                <section>
                    <h3 className="text-2xl font-semibold mb-3 text-primary border-b border-dark-border pb-2">Step 1: Prepare Your Project Files</h3>
                    <p className="mb-4">First, you need to download the complete source code of this application. Then, you'll set up a tool called Vite, which will bundle and optimize the code for production.</p>
                    <ol className="list-decimal list-inside space-y-2 pl-4 text-light-text">
                        <li>Download all the files for this project.</li>
                        <li>Create a `package.json` file in the root directory with the following content. This file manages your project's dependencies.</li>
                    </ol>
                    <CodeBlock>
                        {`{
  "name": "management-pro",
  "private": true,
  "version": "1.0.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview"
  },
  "dependencies": {
    "@google/genai": "^0.12.0",
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "chart.js": "^4.4.2",
    "react-chartjs-2": "^5.2.0",
    "jspdf": "^2.5.1",
    "jspdf-autotable": "^3.8.2",
    "qrcode": "^1.5.3",
    "jsbarcode": "^3.11.5"
  },
  "devDependencies": {
    "@types/react": "^18.2.15",
    "@types/react-dom": "^18.2.7",
    "@vitejs/plugin-react": "^4.0.3",
    "vite": "^4.4.5",
    "tailwindcss": "^3.3.3",
    "typescript": "^5.0.2"
  }
}`}
                    </CodeBlock>
                     <p className="mt-4">Next, install these dependencies by opening a terminal in your project folder and running:</p>
                     <CodeBlock>{`npm install`}</CodeBlock>
                </section>

                <section>
                    <h3 className="text-2xl font-semibold mb-3 text-primary border-b border-dark-border pb-2">Step 2: Set Up the Gemini API Key</h3>
                    <p className="mb-4">Your API key must be kept secret. We will use an environment variable, which is a secure way to store sensitive information without putting it directly in the code.</p>
                     <ol className="list-decimal list-inside space-y-2 pl-4 text-light-text">
                        <li>Create a file named `.env` in the root of your project directory.</li>
                        <li>Inside this file, add your API key like this. Remember to replace `YOUR_API_KEY_HERE` with your actual key.</li>
                    </ol>
                    <CodeBlock>{`VITE_GEMINI_API_KEY=YOUR_API_KEY_HERE`}</CodeBlock>
                    <p className="mt-4 text-sm text-warning">Important: The variable name **must** start with `VITE_` for it to be accessible in the application code.</p>
                </section>
                
                 <section>
                    <h3 className="text-2xl font-semibold mb-3 text-primary border-b border-dark-border pb-2">Step 3: Update API Key Usage in Code</h3>
                    <p className="mb-4">Now, you need to modify the files that use the Gemini API to read the key from the environment variable we just set up.</p>
                     <ol className="list-decimal list-inside space-y-2 pl-4 text-light-text">
                        <li>Find every file where <code><span>process</span><span>.env</span><span>.API_KEY</span></code> is used.</li>
                        <li>Replace <code><span>process</span><span>.env</span><span>.API_KEY</span></code> with <code><span>import</span><span>.meta</span><span>.env</span><span>.VITE_GEMINI_API_KEY</span></code>.</li>
                         <li>Files to check include: `StaffPage.tsx`, `FinanceCenterPage.tsx`, etc.</li>
                    </ol>
                     <p className="mt-4 text-sm text-accent">Example Change:</p>
                     <CodeBlock>
                        {'// Before\n'}
                        {'const ai = new GoogleGenAI({apiKey: '}
                        <span>process</span><span>.env</span><span>.API_KEY</span>
                        {'});\n\n'}
                        {'// After\n'}
                        {'const ai = new GoogleGenAI({apiKey: '}
                        <span>import</span><span>.meta</span><span>.env</span><span>.VITE_GEMINI_API_KEY</span>
                        {'});'}
                     </CodeBlock>
                </section>

                <section>
                    <h3 className="text-2xl font-semibold mb-3 text-primary border-b border-dark-border pb-2">Step 4: Deploy to Vercel</h3>
                    <p className="mb-4">Vercel is a platform that makes deploying websites incredibly simple. It can connect directly to a code repository (like GitHub) and deploy your site automatically.</p>
                    <ol className="list-decimal list-inside space-y-2 pl-4 text-light-text">
                        <li>
                            <a href="https://vercel.com/signup" target="_blank" rel="noopener noreferrer" className="text-accent underline">Sign up for a free Vercel account</a>. It's easiest to sign up using a GitHub, GitLab, or Bitbucket account.
                        </li>
                        <li>Push your project code to a new repository on your chosen Git provider.</li>
                        <li>
                            On your Vercel dashboard, click <strong className="text-white">"Add New... &gt; Project"</strong>.
                        </li>
                        <li>Import the Git repository you just created. Vercel will automatically detect that it's a Vite project.</li>
                        <li>
                            Before deploying, go to the project's <strong className="text-white">"Settings" &gt; "Environment Variables"</strong> section.
                        </li>
                        <li>
                            Add a new environment variable. The name must be <strong className="text-white">`VITE_GEMINI_API_KEY`</strong> and the value should be your actual Gemini API key.
                        </li>
                         <li>
                            Go back to your project's deployment page and click <strong className="text-white">"Deploy"</strong>.
                        </li>
                        <li>Wait for the build to complete. Vercel will provide you with a public URL where your application is now live!</li>
                    </ol>
                </section>
            </div>
        </div>
    );
};

export default DeploymentGuidePage;