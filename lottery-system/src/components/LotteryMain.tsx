import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, RotateCcw, Trophy, Users, Calendar } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { Category, Participant, LotteryResult } from '../types';
import toast from 'react-hot-toast';

interface LotteryMainProps {
  onNavigateToAdmin: () => void;
}

const LotteryMain: React.FC<LotteryMainProps> = ({ onNavigateToAdmin }) => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [prizeNames, setPrizeNames] = useState<string[]>(['一等奖']);
  const [winnerCount, setWinnerCount] = useState(1);
  const [drawCount, setDrawCount] = useState(1); // 新增：一次性抽奖人数
  const [isDrawing, setIsDrawing] = useState(false);
  const [currentName, setCurrentName] = useState('');
  const [winners, setWinners] = useState<LotteryResult | null>(null);
  const [showConfetti, setShowConfetti] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const confettiRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    loadCategories();
  }, []);

  useEffect(() => {
    if (selectedCategory) {
      loadParticipants();
    }
  }, [selectedCategory]);

  const loadCategories = async () => {
    try {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: true });

      if (error) throw error;
      setCategories(data || []);
      if (data && data.length > 0) {
        setSelectedCategory(data[0].id);
      }
    } catch (error: any) {
      toast.error(`加载分类失败: ${error.message}`);
    }
  };

  const loadParticipants = async () => {
    if (!selectedCategory) return;

    try {
      const { data, error } = await supabase
        .from('participants')
        .select('*')
        .eq('category_id', selectedCategory)
        .eq('is_active', true)
        .order('created_at', { ascending: true });

      if (error) throw error;
      setParticipants(data || []);
    } catch (error: any) {
      toast.error(`加载参与者失败: ${error.message}`);
    }
  };

  const startLottery = async () => {
    if (!selectedCategory) {
      toast.error('请选择抽奖分类');
      return;
    }

    if (participants.length === 0) {
      toast.error('该分类下没有可用的参与者');
      return;
    }

    if (participants.length < drawCount) {
      toast.error(`参与者数量(${participants.length})少于所需抽奖人数(${drawCount})`);
      return;
    }

    if (prizeNames.some(name => !name.trim())) {
      toast.error('请填写所有奖品名称');
      return;
    }

    setIsDrawing(true);
    setWinners(null);
    setShowConfetti(false);

    // 开始滚动名字动画
    let nameIndex = 0;
    intervalRef.current = setInterval(() => {
      setCurrentName(participants[nameIndex].name);
      nameIndex = (nameIndex + 1) % participants.length;
    }, 100);

    // 模拟抽奖过程（2秒后停止）
    setTimeout(async () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }

      try {
        const { data, error } = await supabase.functions.invoke('lottery-draw', {
          body: {
            categoryId: selectedCategory,
            prizeNames: prizeNames.slice(0, Math.max(1, prizeNames.length)),
            winnerCount: drawCount
          }
        });

        if (error) throw error;

        setWinners(data.data);
        setCurrentName(data.data.winners[0]?.name || '');
        setIsDrawing(false);
        setShowConfetti(true);
        
        toast.success(`恭喜！已抽出${data.data.winners.length}位中奖者！`);
        
        // 5秒后隐藏彩带效果
        setTimeout(() => setShowConfetti(false), 5000);

      } catch (error: any) {
        setIsDrawing(false);
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
        }
        toast.error(`抽奖失败: ${error.message}`);
      }
    }, 2000);
  };

  const resetLottery = () => {
    setWinners(null);
    setCurrentName('');
    setShowConfetti(false);
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
  };

  const addPrize = () => {
    setPrizeNames([...prizeNames, `${prizeNames.length + 1}等奖`]);
  };

  const removePrize = (index: number) => {
    if (prizeNames.length > 1) {
      const newPrizes = prizeNames.filter((_, i) => i !== index);
      setPrizeNames(newPrizes);
    }
  };

  const updatePrizeName = (index: number, name: string) => {
    const newPrizes = [...prizeNames];
    newPrizes[index] = name;
    setPrizeNames(newPrizes);
  };

  const createConfetti = () => {
    const pieces = [];
    for (let i = 0; i < 50; i++) {
      pieces.push(
        <div
          key={i}
          className="confetti-piece"
          style={{
            left: `${Math.random() * 100}%`,
            animationDelay: `${Math.random() * 3}s`,
            animationDuration: `${3 + Math.random() * 2}s`
          }}
        />
      );
    }
    return pieces;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      {/* Header */}
      <div className="max-w-6xl mx-auto mb-8">
        <div className="fluent-card p-6 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-blue-100 rounded-lg">
                <Trophy className="w-8 h-8 text-blue-600" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">智能抽奖系统</h1>
                <p className="text-gray-600 mt-1">Microsoft Fluent Design 风格</p>
              </div>
            </div>
            <button
              onClick={onNavigateToAdmin}
              className="fluent-button-secondary"
            >
              管理后台
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="stats-card">
            <div className="stats-number">{categories.length}</div>
            <div className="stats-label">抽奖分类</div>
          </div>
          <div className="stats-card">
            <div className="stats-number">{participants.length}</div>
            <div className="stats-label">当前分类参与者</div>
          </div>
          <div className="stats-card">
            <div className="stats-number">{drawCount}</div>
            <div className="stats-label">本次抽奖人数</div>
          </div>
        </div>

        {/* Configuration */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Category Selection */}
          <div className="fluent-card p-6">
            <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Users className="w-5 h-5" />
              选择抽奖分类
            </h3>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="fluent-select w-full"
            >
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name} ({participants.filter(p => p.category_id === category.id).length}人)
                </option>
              ))}
            </select>
            {selectedCategory && (
              <p className="text-sm text-gray-600 mt-2">
                当前分类共有 {participants.length} 位参与者
              </p>
            )}
          </div>

          {/* Prize Configuration */}
          <div className="fluent-card p-6">
            <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Trophy className="w-5 h-5" />
              抽奖设置
            </h3>
            
            {/* 抽奖人数设置 */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                一次性抽奖人数
              </label>
              <input
                type="number"
                min="1"
                max={participants.length || 1}
                value={drawCount}
                onChange={(e) => setDrawCount(Math.max(1, Math.min(participants.length || 1, parseInt(e.target.value) || 1)))}
                className="fluent-input w-full"
                placeholder="请输入抽奖人数"
              />
              <p className="text-xs text-gray-500 mt-1">
                最大可抽取 {participants.length} 人
              </p>
            </div>
            
            {/* 奖品设置 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                奖品名称
              </label>
              <div className="space-y-3">
                {prizeNames.map((prize, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <input
                      type="text"
                      value={prize}
                      onChange={(e) => updatePrizeName(index, e.target.value)}
                      className="fluent-input flex-1"
                      placeholder="奖品名称"
                    />
                    {prizeNames.length > 1 && (
                      <button
                        onClick={() => removePrize(index)}
                        className="fluent-button-secondary px-3 py-2"
                      >
                        删除
                      </button>
                    )}
                  </div>
                ))}
                <button
                  onClick={addPrize}
                  className="fluent-button-secondary w-full"
                >
                  添加奖品
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Lottery Display */}
        <div className="fluent-card-elevated p-8 mb-8 lottery-container relative">
          {showConfetti && (
            <div ref={confettiRef} className="absolute inset-0 pointer-events-none overflow-hidden">
              {createConfetti()}
            </div>
          )}

          <div className="text-center">
            <h2 className="text-2xl font-semibold text-gray-900 mb-8">抽奖结果</h2>
            
            <AnimatePresence mode="wait">
              {isDrawing ? (
                <motion.div
                  key="drawing"
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.8, opacity: 0 }}
                  className="lottery-spinning"
                >
                  <div className="lottery-name-display">
                    {currentName || '准备中...'}
                  </div>
                  <div className="loading-spinner mx-auto"></div>
                </motion.div>
              ) : winners ? (
                <motion.div
                  key="winners"
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="lottery-winner"
                >
                  <div className="space-y-6">
                    {winners.winners.map((winner, index) => (
                      <div key={winner.id} className="text-center">
                        <div className="text-lg font-medium text-blue-600 mb-2">
                          {winner.prizeName}
                        </div>
                        <div className="lottery-name-display">
                          {winner.name}
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="mt-8 text-center">
                    <p className="text-gray-600">
                      恭喜以上{winners.winners.length}位获奖者！
                    </p>
                    <p className="text-sm text-gray-500 mt-2">
                      本次抽奖参与人数：{winners.totalParticipants}人
                    </p>
                  </div>
                </motion.div>
              ) : (
                <motion.div
                  key="ready"
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="text-center"
                >
                  <div className="lottery-name-display text-gray-400">
                    准备开始抽奖
                  </div>
                  <p className="text-gray-600 mt-4">
                    点击下方按钮开始抽奖
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Control Buttons */}
        <div className="flex justify-center gap-4">
          <button
            onClick={startLottery}
            disabled={isDrawing || !selectedCategory || participants.length === 0}
            className="fluent-button fluent-button-large flex items-center gap-2"
          >
            <Play className="w-5 h-5" />
            {isDrawing ? '抽奖中...' : '开始抽奖'}
          </button>
          
          {winners && (
            <button
              onClick={resetLottery}
              className="fluent-button-secondary fluent-button-large flex items-center gap-2"
            >
              <RotateCcw className="w-5 h-5" />
              重新抽奖
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default LotteryMain;