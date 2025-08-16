import React, { useState, useEffect } from 'react';
import { Clock, Trophy, User, Calendar, Filter, Search, Download } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { LotteryRecord, Category } from '../types';
import toast from 'react-hot-toast';

const LotteryHistory: React.FC = () => {
  const [records, setRecords] = useState<LotteryRecord[]>([]);
  const [filteredRecords, setFilteredRecords] = useState<LotteryRecord[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [dateRange, setDateRange] = useState<{ start: string; end: string }>({
    start: '',
    end: ''
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    filterRecords();
  }, [records, selectedCategory, searchTerm, dateRange]);

  const loadData = async () => {
    setLoading(true);
    await Promise.all([loadRecords(), loadCategories()]);
    setLoading(false);
  };

  const loadRecords = async () => {
    try {
      const { data, error } = await supabase
        .from('lottery_records')
        .select('*')
        .order('lottery_date', { ascending: false });

      if (error) throw error;
      setRecords(data || []);
    } catch (error: any) {
      toast.error(`加载抽奖记录失败: ${error.message}`);
    }
  };

  const loadCategories = async () => {
    try {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .order('created_at', { ascending: true });

      if (error) throw error;
      setCategories(data || []);
    } catch (error: any) {
      toast.error(`加载分类失败: ${error.message}`);
    }
  };

  const filterRecords = () => {
    let filtered = records;

    // 按分类筛选
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(r => r.category_id === selectedCategory);
    }

    // 按名称或奖品搜索
    if (searchTerm) {
      filtered = filtered.filter(r => 
        r.participant_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.prize_name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // 按日期筛选
    if (dateRange.start) {
      filtered = filtered.filter(r => new Date(r.lottery_date) >= new Date(dateRange.start));
    }
    if (dateRange.end) {
      filtered = filtered.filter(r => new Date(r.lottery_date) <= new Date(dateRange.end + 'T23:59:59'));
    }

    setFilteredRecords(filtered);
  };

  const getCategoryName = (categoryId?: string) => {
    if (!categoryId) return '未分类';
    const category = categories.find(c => c.id === categoryId);
    return category?.name || '未知分类';
  };

  const exportHistory = async () => {
    try {
      const { data, error } = await supabase.functions.invoke('export-excel', {
        body: {
          type: 'lottery_records',
          categoryId: selectedCategory !== 'all' ? selectedCategory : undefined
        }
      });

      if (error) throw error;

      // 创建下载链接
      const blob = new Blob([atob(data.data.content)], { type: data.data.mimeType });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.style.display = 'none';
      a.href = url;
      a.download = data.data.filename;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      toast.success('导出成功');
    } catch (error: any) {
      toast.error(`导出失败: ${error.message}`);
    }
  };

  const clearFilters = () => {
    setSelectedCategory('all');
    setSearchTerm('');
    setDateRange({ start: '', end: '' });
  };

  const getStats = () => {
    const totalRecords = filteredRecords.length;
    const uniqueWinners = new Set(filteredRecords.map(r => r.participant_name)).size;
    const prizeTypes = new Set(filteredRecords.map(r => r.prize_name)).size;
    const today = new Date().toDateString();
    const todayRecords = filteredRecords.filter(r => 
      new Date(r.lottery_date).toDateString() === today
    ).length;

    return { totalRecords, uniqueWinners, prizeTypes, todayRecords };
  };

  const stats = getStats();

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="loading-spinner"></div>
        <span className="ml-2 text-gray-600">加载中...</span>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Clock className="w-6 h-6" />
            抽奖历史
          </h2>
          <p className="text-gray-600 mt-1">查看所有历史抽奖记录</p>
        </div>
        <button
          onClick={exportHistory}
          className="fluent-button flex items-center gap-2"
        >
          <Download className="w-4 h-4" />
          导出记录
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="fluent-card p-4">
          <div className="text-2xl font-bold text-blue-600">{stats.totalRecords}</div>
          <div className="text-sm text-gray-600">总抽奖次数</div>
        </div>
        <div className="fluent-card p-4">
          <div className="text-2xl font-bold text-green-600">{stats.uniqueWinners}</div>
          <div className="text-sm text-gray-600">中奖人数</div>
        </div>
        <div className="fluent-card p-4">
          <div className="text-2xl font-bold text-purple-600">{stats.prizeTypes}</div>
          <div className="text-sm text-gray-600">奖品类型</div>
        </div>
        <div className="fluent-card p-4">
          <div className="text-2xl font-bold text-orange-600">{stats.todayRecords}</div>
          <div className="text-sm text-gray-600">今日抽奖</div>
        </div>
      </div>

      {/* Filters */}
      <div className="fluent-card p-4 mb-6">
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="搜索中奖者或奖品名称..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="fluent-input pl-10 w-full"
              />
            </div>
          </div>
          
          <div className="w-full lg:w-48">
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="fluent-select w-full"
            >
              <option value="all">所有分类</option>
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
          </div>
          
          <div className="flex gap-2">
            <input
              type="date"
              value={dateRange.start}
              onChange={(e) => setDateRange({ ...dateRange, start: e.target.value })}
              className="fluent-input"
              placeholder="开始日期"
            />
            <input
              type="date"
              value={dateRange.end}
              onChange={(e) => setDateRange({ ...dateRange, end: e.target.value })}
              className="fluent-input"
              placeholder="结束日期"
            />
          </div>
          
          <button
            onClick={clearFilters}
            className="fluent-button-secondary whitespace-nowrap"
          >
            清空筛选
          </button>
        </div>
        
        <div className="flex items-center gap-4 mt-3 text-sm text-gray-600">
          <span>总记录: {records.length} 条</span>
          <span>当前显示: {filteredRecords.length} 条</span>
        </div>
      </div>

      {/* Records Table */}
      <div className="fluent-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  中奖者
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  奖品
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  分类
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  抽奖时间
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredRecords.map((record) => (
                <tr key={record.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10">
                        <div className="h-10 w-10 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center">
                          <User className="h-5 w-5 text-white" />
                        </div>
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">
                          {record.participant_name}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <Trophy className="h-4 w-4 text-yellow-500 mr-2" />
                      <span className="text-sm font-medium text-gray-900">
                        {record.prize_name}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                      {getCategoryName(record.category_id)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    <div className="flex items-center">
                      <Calendar className="h-4 w-4 text-gray-400 mr-2" />
                      <div>
                        <div>{new Date(record.lottery_date).toLocaleDateString('zh-CN')}</div>
                        <div className="text-xs text-gray-500">
                          {new Date(record.lottery_date).toLocaleTimeString('zh-CN')}
                        </div>
                      </div>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredRecords.length === 0 && (
          <div className="text-center py-12">
            <Clock className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">没有抽奖记录</h3>
            <p className="mt-1 text-sm text-gray-500">
              {searchTerm || selectedCategory !== 'all' || dateRange.start || dateRange.end
                ? '没有找到符合条件的记录'
                : '还没有进行过抽奖活动'
              }
            </p>
            {(!searchTerm && selectedCategory === 'all' && !dateRange.start && !dateRange.end) && (
              <p className="mt-2 text-sm text-blue-600">
                开始你的第一次抽奖吧！
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default LotteryHistory;