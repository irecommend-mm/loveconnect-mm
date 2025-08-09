
import React from 'react';
import { ChevronRight, LucideIcon } from 'lucide-react';

interface SettingsItem {
  icon: LucideIcon;
  label: string;
  action: () => void;
  showChevron?: boolean;
  highlight?: boolean;
  badge?: string;
}

interface SettingsSectionProps {
  title: string;
  items: SettingsItem[];
}

export const SettingsSection = ({ title, items }: SettingsSectionProps) => {
  return (
    <div className="mb-6">
      <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide px-6 mb-3">
        {title}
      </h3>
      <div className="bg-white rounded-2xl mx-4 overflow-hidden shadow-sm">
        {items.map((item, index) => (
          <button
            key={index}
            onClick={item.action}
            className={`w-full flex items-center justify-between px-6 py-4 transition-colors ${
              index !== items.length - 1 ? 'border-b border-gray-50' : ''
            } ${
              item.highlight 
                ? 'bg-gradient-to-r from-pink-50 to-purple-50 hover:from-pink-100 hover:to-purple-100' 
                : 'hover:bg-gray-50'
            }`}
          >
            <div className="flex items-center space-x-4">
              <div className={`p-2 rounded-full ${
                item.highlight 
                  ? 'bg-gradient-to-r from-pink-500 to-purple-500' 
                  : 'bg-gray-100'
              }`}>
                <item.icon className={`h-5 w-5 ${
                  item.highlight ? 'text-white' : 'text-gray-600'
                }`} />
              </div>
              <span className={`font-medium ${
                item.highlight ? 'text-pink-700' : 'text-gray-900'
              }`}>
                {item.label}
              </span>
              {item.badge && (
                <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full">
                  {item.badge}
                </span>
              )}
            </div>
            {item.showChevron && (
              <ChevronRight className="h-5 w-5 text-gray-400" />
            )}
          </button>
        ))}
      </div>
    </div>
  );
};
