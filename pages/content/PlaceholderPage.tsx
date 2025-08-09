
import React from 'react';

interface PlaceholderPageProps {
  pageName: string;
}

const PlaceholderPage: React.FC<PlaceholderPageProps> = ({ pageName }) => {
  return (
    <div className="flex flex-col items-center justify-center h-full text-center bg-dark-card rounded-2xl p-8 border border-dark-border">
      <h2 className="text-4xl font-bold text-primary">{pageName}</h2>
      <p className="mt-2 text-lg text-medium-text">This page is under construction.</p>
      <p className="mt-4 text-sm text-medium-text/70">Full functionality for the {pageName} module will be available here.</p>
    </div>
  );
};

export default PlaceholderPage;