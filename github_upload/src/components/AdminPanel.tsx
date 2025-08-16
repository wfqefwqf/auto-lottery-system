import React, { useState } from 'react';
import { ArrowLeft, Users, Tags, FileText, Settings, BarChart3 } from 'lucide-react';
import ParticipantManager from './ParticipantManager';
import CategoryManager from './CategoryManager';
import LotteryHistory from './LotteryHistory';
import ExcelImportExport from './ExcelImportExport';

interface AdminPanelProps {
  onNavigateBack: () => void;
}

type AdminTab = 'participants' | 'categories' | 'history' | 'excel' | 'stats';

const AdminPanel: React.FC<AdminPanelProps> = ({ onNavigateBack }) => {
  const [activeTab, setActiveTab] = useState<AdminTab>('participants');

  const tabs = [
    {
      id: 'participants' as AdminTab,
      name: '参与者管理',
      icon: Users,
      description: '管理抽奖参与者信息'
    },
    {
      id: 'categories' as AdminTab,
      name: '分类管理',
      icon: Tags,
      description: '管理抽奖分类设置'
    },
    {
      id: 'history' as AdminTab,
      name: '抽奖历史',
      icon: FileText,
      description: '查看历史抽奖记录'
    },
    {
      id: 'excel' as AdminTab,
      name: 'Excel导入导出',
      icon: BarChart3,
      description: '批量导入导出数据'
    }
  ];

  const renderContent = () => {
    switch (activeTab) {
      case 'participants':
        return <ParticipantManager />;
      case 'categories':
        return <CategoryManager />;
      case 'history':
        return <LotteryHistory />;
      case 'excel':
        return <ExcelImportExport />;
      default:
        return <ParticipantManager />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={onNavigateBack}
                className="fluent-button-secondary flex items-center gap-2"
              >
                <ArrowLeft className="w-4 h-4" />
                返回抽奖
              </button>
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Settings className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">管理后台</h1>
                  <p className="text-gray-600">抽奖系统配置与数据管理</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`fluent-card p-6 text-left transition-all duration-200 hover:scale-105 ${
                  activeTab === tab.id
                    ? 'border-blue-500 bg-blue-50 shadow-md'
                    : 'hover:border-blue-300'
                }`}
              >
                <div className="flex items-center gap-3 mb-3">
                  <div className={`p-2 rounded-lg ${
                    activeTab === tab.id 
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-600'
                  }`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <h3 className={`font-semibold ${
                    activeTab === tab.id ? 'text-blue-900' : 'text-gray-900'
                  }`}>
                    {tab.name}
                  </h3>
                </div>
                <p className={`text-sm ${
                  activeTab === tab.id ? 'text-blue-700' : 'text-gray-600'
                }`}>
                  {tab.description}
                </p>
              </button>
            );
          })}
        </div>

        {/* Content Area */}
        <div className="fluent-card-elevated p-6">
          {renderContent()}
        </div>
      </div>
    </div>
  );
};

export default AdminPanel;