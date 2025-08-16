import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Search, Filter, UserPlus, Users } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { Participant, Category } from '../types';
import toast from 'react-hot-toast';

const ParticipantManager: React.FC = () => {
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [filteredParticipants, setFilteredParticipants] = useState<Participant[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [showModal, setShowModal] = useState(false);
  const [editingParticipant, setEditingParticipant] = useState<Participant | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    category_id: '',
    is_active: true
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    filterParticipants();
  }, [participants, searchTerm, selectedCategory]);

  const loadData = async () => {
    await Promise.all([loadParticipants(), loadCategories()]);
  };

  const loadParticipants = async () => {
    try {
      const { data, error } = await supabase
        .from('participants')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setParticipants(data || []);
    } catch (error: any) {
      toast.error(`加载参与者失败: ${error.message}`);
    }
  };

  const loadCategories = async () => {
    try {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: true });

      if (error) throw error;
      setCategories(data || []);
    } catch (error: any) {
      toast.error(`加载分类失败: ${error.message}`);
    }
  };

  const filterParticipants = () => {
    let filtered = participants;

    // 按分类筛选
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(p => p.category_id === selectedCategory);
    }

    // 按名称搜索
    if (searchTerm) {
      filtered = filtered.filter(p => 
        p.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredParticipants(filtered);
  };

  const handleOpenModal = (participant?: Participant) => {
    if (participant) {
      setEditingParticipant(participant);
      setFormData({
        name: participant.name,
        category_id: participant.category_id || '',
        is_active: participant.is_active
      });
    } else {
      setEditingParticipant(null);
      setFormData({
        name: '',
        category_id: categories.length > 0 ? categories[0].id : '',
        is_active: true
      });
    }
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingParticipant(null);
    setFormData({
      name: '',
      category_id: '',
      is_active: true
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      toast.error('请填写参与者姓名');
      return;
    }

    setLoading(true);

    try {
      const submitData = {
        name: formData.name.trim(),
        category_id: formData.category_id || null,
        is_active: formData.is_active
      };

      if (editingParticipant) {
        // 更新
        const { error } = await supabase
          .from('participants')
          .update(submitData)
          .eq('id', editingParticipant.id);

        if (error) throw error;
        toast.success('更新成功');
      } else {
        // 新增
        const { error } = await supabase
          .from('participants')
          .insert([submitData]);

        if (error) throw error;
        toast.success('添加成功');
      }

      handleCloseModal();
      loadParticipants();
    } catch (error: any) {
      toast.error(`操作失败: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (participant: Participant) => {
    if (!confirm(`确定要删除参与者“${participant.name}”吗？`)) {
      return;
    }

    try {
      const { error } = await supabase
        .from('participants')
        .delete()
        .eq('id', participant.id);

      if (error) throw error;
      toast.success('删除成功');
      loadParticipants();
    } catch (error: any) {
      toast.error(`删除失败: ${error.message}`);
    }
  };

  const toggleActive = async (participant: Participant) => {
    try {
      const { error } = await supabase
        .from('participants')
        .update({ is_active: !participant.is_active })
        .eq('id', participant.id);

      if (error) throw error;
      toast.success('状态更新成功');
      loadParticipants();
    } catch (error: any) {
      toast.error(`更新失败: ${error.message}`);
    }
  };

  const getCategoryName = (categoryId?: string) => {
    if (!categoryId) return '未分类';
    const category = categories.find(c => c.id === categoryId);
    return category?.name || '未知分类';
  };

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Users className="w-6 h-6" />
            参与者管理
          </h2>
          <p className="text-gray-600 mt-1">管理抽奖参与者信息</p>
        </div>
        <button
          onClick={() => handleOpenModal()}
          className="fluent-button flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          添加参与者
        </button>
      </div>

      {/* Filters */}
      <div className="fluent-card p-4 mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="搜索参与者姓名..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="fluent-input pl-10 w-full"
              />
            </div>
          </div>
          <div className="w-full md:w-48">
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
        </div>
        <div className="flex items-center gap-4 mt-3 text-sm text-gray-600">
          <span>总计: {participants.length} 人</span>
          <span>当前显示: {filteredParticipants.length} 人</span>
          <span>启用: {participants.filter(p => p.is_active).length} 人</span>
        </div>
      </div>

      {/* Participants Table */}
      <div className="fluent-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  参与者
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  分类
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  状态
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  操作
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredParticipants.map((participant) => (
                <tr key={participant.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10">
                        <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                          <UserPlus className="h-5 w-5 text-blue-600" />
                        </div>
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">
                          {participant.name}
                        </div>
                        <div className="text-sm text-gray-500">
                          {new Date(participant.created_at).toLocaleDateString('zh-CN')}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                      {getCategoryName(participant.category_id)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <button
                      onClick={() => toggleActive(participant)}
                      className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        participant.is_active
                          ? 'bg-green-100 text-green-800'
                          : 'bg-red-100 text-red-800'
                      }`}
                    >
                      {participant.is_active ? '启用' : '禁用'}
                    </button>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleOpenModal(participant)}
                        className="text-blue-600 hover:text-blue-900"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(participant)}
                        className="text-red-600 hover:text-red-900"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredParticipants.length === 0 && (
          <div className="text-center py-12">
            <UserPlus className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">没有参与者</h3>
            <p className="mt-1 text-sm text-gray-500">
              {searchTerm || selectedCategory !== 'all' 
                ? '没有找到符合条件的参与者'
                : '开始添加第一个参与者吧'
              }
            </p>
            {!searchTerm && selectedCategory === 'all' && (
              <button
                onClick={() => handleOpenModal()}
                className="mt-3 fluent-button-secondary"
              >
                添加参与者
              </button>
            )}
          </div>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="fluent-card-elevated w-full max-w-md p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              {editingParticipant ? '编辑参与者' : '添加参与者'}
            </h3>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  姓名 *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="fluent-input w-full"
                  placeholder="请输入参与者姓名"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  分类
                </label>
                <select
                  value={formData.category_id}
                  onChange={(e) => setFormData({ ...formData, category_id: e.target.value })}
                  className="fluent-select w-full"
                >
                  <option value="">未分类</option>
                  {categories.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="is_active"
                  checked={formData.is_active}
                  onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <label htmlFor="is_active" className="ml-2 text-sm text-gray-700">
                  启用状态
                </label>
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="fluent-button-secondary"
                >
                  取消
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="fluent-button"
                >
                  {loading ? '保存中...' : '保存'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ParticipantManager;