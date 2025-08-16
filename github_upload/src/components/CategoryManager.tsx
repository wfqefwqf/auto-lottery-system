import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Tag, Users } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { Category } from '../types';
import toast from 'react-hot-toast';

const CategoryManager: React.FC = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [participantCounts, setParticipantCounts] = useState<Record<string, number>>({});
  const [showModal, setShowModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    is_active: true
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadCategories();
    loadParticipantCounts();
  }, []);

  const loadCategories = async () => {
    try {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setCategories(data || []);
    } catch (error: any) {
      toast.error(`加载分类失败: ${error.message}`);
    }
  };

  const loadParticipantCounts = async () => {
    try {
      const { data, error } = await supabase
        .from('participants')
        .select('category_id')
        .eq('is_active', true);

      if (error) throw error;

      const counts: Record<string, number> = {};
      data?.forEach(participant => {
        const categoryId = participant.category_id;
        if (categoryId) {
          counts[categoryId] = (counts[categoryId] || 0) + 1;
        }
      });
      
      setParticipantCounts(counts);
    } catch (error: any) {
      toast.error(`加载参与者数量失败: ${error.message}`);
    }
  };

  const handleOpenModal = (category?: Category) => {
    if (category) {
      setEditingCategory(category);
      setFormData({
        name: category.name,
        description: category.description || '',
        is_active: category.is_active
      });
    } else {
      setEditingCategory(null);
      setFormData({
        name: '',
        description: '',
        is_active: true
      });
    }
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingCategory(null);
    setFormData({
      name: '',
      description: '',
      is_active: true
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      toast.error('请填写分类名称');
      return;
    }

    setLoading(true);

    try {
      const submitData = {
        name: formData.name.trim(),
        description: formData.description.trim() || null,
        is_active: formData.is_active,
        updated_at: new Date().toISOString()
      };

      if (editingCategory) {
        // 更新
        const { error } = await supabase
          .from('categories')
          .update(submitData)
          .eq('id', editingCategory.id);

        if (error) throw error;
        toast.success('更新成功');
      } else {
        // 新增
        const { error } = await supabase
          .from('categories')
          .insert([submitData]);

        if (error) throw error;
        toast.success('添加成功');
      }

      handleCloseModal();
      loadCategories();
      loadParticipantCounts();
    } catch (error: any) {
      toast.error(`操作失败: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (category: Category) => {
    const participantCount = participantCounts[category.id] || 0;
    
    if (participantCount > 0) {
      toast.error(`该分类下还有${participantCount}个参与者，无法删除`);
      return;
    }

    if (!confirm(`确定要删除分类“${category.name}”吗？`)) {
      return;
    }

    try {
      const { error } = await supabase
        .from('categories')
        .delete()
        .eq('id', category.id);

      if (error) throw error;
      toast.success('删除成功');
      loadCategories();
      loadParticipantCounts();
    } catch (error: any) {
      toast.error(`删除失败: ${error.message}`);
    }
  };

  const toggleActive = async (category: Category) => {
    try {
      const { error } = await supabase
        .from('categories')
        .update({ 
          is_active: !category.is_active,
          updated_at: new Date().toISOString()
        })
        .eq('id', category.id);

      if (error) throw error;
      toast.success('状态更新成功');
      loadCategories();
    } catch (error: any) {
      toast.error(`更新失败: ${error.message}`);
    }
  };

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Tag className="w-6 h-6" />
            分类管理
          </h2>
          <p className="text-gray-600 mt-1">管理抽奖分类设置</p>
        </div>
        <button
          onClick={() => handleOpenModal()}
          className="fluent-button flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          添加分类
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="fluent-card p-4">
          <div className="text-2xl font-bold text-blue-600">{categories.length}</div>
          <div className="text-sm text-gray-600">总分类数</div>
        </div>
        <div className="fluent-card p-4">
          <div className="text-2xl font-bold text-green-600">
            {categories.filter(c => c.is_active).length}
          </div>
          <div className="text-sm text-gray-600">启用分类</div>
        </div>
        <div className="fluent-card p-4">
          <div className="text-2xl font-bold text-purple-600">
            {Object.values(participantCounts).reduce((sum, count) => sum + count, 0)}
          </div>
          <div className="text-sm text-gray-600">总参与者数</div>
        </div>
      </div>

      {/* Categories Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {categories.map((category) => (
          <div key={category.id} className="fluent-card p-6 relative">
            {/* Status Badge */}
            <div className="absolute top-4 right-4">
              <button
                onClick={() => toggleActive(category)}
                className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                  category.is_active
                    ? 'bg-green-100 text-green-800'
                    : 'bg-red-100 text-red-800'
                }`}
              >
                {category.is_active ? '启用' : '禁用'}
              </button>
            </div>

            {/* Category Info */}
            <div className="mb-4">
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Tag className="w-5 h-5 text-blue-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900">
                  {category.name}
                </h3>
              </div>
              
              {category.description && (
                <p className="text-gray-600 text-sm mb-3">
                  {category.description}
                </p>
              )}
              
              <div className="flex items-center gap-4 text-sm text-gray-500">
                <div className="flex items-center gap-1">
                  <Users className="w-4 h-4" />
                  <span>{participantCounts[category.id] || 0} 人</span>
                </div>
                <div>
                  {new Date(category.created_at).toLocaleDateString('zh-CN')}
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-2">
              <button
                onClick={() => handleOpenModal(category)}
                className="fluent-button-secondary flex items-center gap-1 px-3 py-1 text-sm"
              >
                <Edit2 className="w-3 h-3" />
                编辑
              </button>
              <button
                onClick={() => handleDelete(category)}
                disabled={participantCounts[category.id] > 0}
                className={`flex items-center gap-1 px-3 py-1 text-sm border border-red-300 rounded ${
                  participantCounts[category.id] > 0
                    ? 'text-gray-400 cursor-not-allowed'
                    : 'text-red-600 hover:bg-red-50'
                }`}
              >
                <Trash2 className="w-3 h-3" />
                删除
              </button>
            </div>
          </div>
        ))}
      </div>

      {categories.length === 0 && (
        <div className="text-center py-12">
          <Tag className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">没有分类</h3>
          <p className="mt-1 text-sm text-gray-500">
            开始创建第一个抽奖分类吧
          </p>
          <button
            onClick={() => handleOpenModal()}
            className="mt-3 fluent-button-secondary"
          >
            添加分类
          </button>
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="fluent-card-elevated w-full max-w-md p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              {editingCategory ? '编辑分类' : '添加分类'}
            </h3>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  分类名称 *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="fluent-input w-full"
                  placeholder="请输入分类名称"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  分类描述
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="fluent-input w-full h-20 resize-none"
                  placeholder="请输入分类描述（可选）"
                />
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

export default CategoryManager;