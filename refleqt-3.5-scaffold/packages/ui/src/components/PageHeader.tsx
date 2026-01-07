import type { ReactNode } from 'react';

export interface PageHeaderProps {
  title: string;
  description?: string;
  actions?: ReactNode;
}

export function PageHeader({ title, description, actions }: PageHeaderProps) {
  return (
    <div className="bg-gray-800 border border-gray-700 rounded-lg p-6 mb-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white mb-2">{title}</h1>
          {description && <p className="text-sm text-gray-300">{description}</p>}
        </div>
        {actions && <div className="ml-4">{actions}</div>}
      </div>
    </div>
  );
}
