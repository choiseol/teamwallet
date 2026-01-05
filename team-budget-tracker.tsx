import { useState, useEffect } from 'react';
import { PlusCircle, Trash2, Users, Wallet, TrendingDown, Calendar } from 'lucide-react';

export default function BudgetTracker() {
  const BUDGET_PER_PERSON = 50000;
  const [loading, setLoading] = useState(true);
  const [teamSize, setTeamSize] = useState(7);
  const [expenses, setExpenses] = useState([]);
  const [newExpense, setNewExpense] = useState({ name: '', amount: '', description: '' });
  const [currentMonth, setCurrentMonth] = useState('2026-01');

  const totalBudget = teamSize * BUDGET_PER_PERSON;
  const totalSpent = expenses.reduce((sum, e) => sum + e.amount, 0);
  const remaining = totalBudget - totalSpent;
  const usagePercent = (totalSpent / totalBudget) * 100;

  useEffect(() => {
    loadData();
  }, [currentMonth]);

  const loadData = async () => {
    setLoading(true);
    try {
      const key = `budget-${currentMonth}`;
      const result = await window.storage.get(key, true);
      if (result?.value) {
        const data = JSON.parse(result.value);
        setTeamSize(data.teamSize || 7);
        setExpenses(data.expenses || []);
      } else {
        setTeamSize(7);
        setExpenses([]);
      }
    } catch (e) {
      setTeamSize(7);
      setExpenses([]);
    }
    setLoading(false);
  };

  const saveData = async (newTeamSize, newExpenses) => {
    try {
      const key = `budget-${currentMonth}`;
      await window.storage.set(key, JSON.stringify({
        teamSize: newTeamSize,
        expenses: newExpenses
      }), true);
    } catch (e) {
      console.error('저장 실패:', e);
    }
  };

  const addExpense = () => {
    if (!newExpense.name || !newExpense.amount) return;
    const expense = {
      id: Date.now(),
      name: newExpense.name,
      amount: parseInt(newExpense.amount),
      description: newExpense.description,
      date: new Date().toLocaleDateString('ko-KR')
    };
    const updated = [...expenses, expense];
    setExpenses(updated);
    saveData(teamSize, updated);
    setNewExpense({ name: '', amount: '', description: '' });
  };

  const deleteExpense = (id) => {
    const updated = expenses.filter(e => e.id !== id);
    setExpenses(updated);
    saveData(teamSize, updated);
  };

  const updateTeamSize = (size) => {
    const newSize = Math.max(1, parseInt(size) || 1);
    setTeamSize(newSize);
    saveData(newSize, expenses);
  };

  const formatCurrency = (n) => n.toLocaleString('ko-KR') + '원';

  if (loading) {
    return <div className="min-h-screen bg-slate-50 flex items-center justify-center">
      <p className="text-slate-500">불러오는 중...</p>
    </div>;
  }

  return (
    <div className="min-h-screen bg-slate-50 p-4">
      <div className="max-w-2xl mx-auto space-y-4">
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-xl font-bold text-slate-800">팀 조직경비 관리</h1>
            <div className="flex items-center gap-2">
              <Calendar size={16} className="text-slate-400" />
              <input
                type="month"
                value={currentMonth}
                onChange={(e) => setCurrentMonth(e.target.value)}
                className="text-sm border rounded-lg px-2 py-1 text-slate-600"
              />
            </div>
          </div>
          
          <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl mb-4">
            <Users size={18} className="text-blue-500" />
            <span className="text-sm text-slate-600">팀원 수</span>
            <input
              type="number"
              min="1"
              value={teamSize}
              onChange={(e) => updateTeamSize(e.target.value)}
              className="w-16 text-center border rounded-lg px-2 py-1 font-medium"
            />
            <span className="text-sm text-slate-500">× 5만원 = {formatCurrency(totalBudget)}</span>
          </div>

          <div className={`rounded-2xl p-5 text-center mb-3 ${remaining >= 0 ? 'bg-green-50 border-2 border-green-200' : 'bg-red-50 border-2 border-red-200'}`}>
            <p className={`text-sm mb-1 ${remaining >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {remaining >= 0 ? '✓ 잔액' : '⚠️ 예산 초과'}
            </p>
            <p className={`text-3xl font-bold ${remaining >= 0 ? 'text-green-700' : 'text-red-700'}`}>
              {formatCurrency(Math.abs(remaining))}
              {remaining < 0 && <span className="text-lg ml-1">초과</span>}
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="bg-blue-50 rounded-xl p-4 text-center">
              <Wallet size={20} className="mx-auto text-blue-500 mb-1" />
              <p className="text-xs text-blue-600 mb-1">총 예산</p>
              <p className="font-bold text-blue-700">{formatCurrency(totalBudget)}</p>
            </div>
            <div className="bg-orange-50 rounded-xl p-4 text-center">
              <TrendingDown size={20} className="mx-auto text-orange-500 mb-1" />
              <p className="text-xs text-orange-600 mb-1">사용액</p>
              <p className="font-bold text-orange-700">{formatCurrency(totalSpent)}</p>
            </div>
          </div>

          <div className="mt-4">
            <div className="h-3 bg-slate-100 rounded-full overflow-hidden">
              <div 
                className={`h-full transition-all ${usagePercent > 100 ? 'bg-red-500' : usagePercent > 80 ? 'bg-orange-400' : 'bg-blue-500'}`}
                style={{ width: `${Math.min(usagePercent, 100)}%` }}
              />
            </div>
            <p className="text-xs text-slate-500 mt-1 text-right">{usagePercent.toFixed(1)}% 사용</p>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100">
          <h2 className="font-semibold text-slate-700 mb-3">지출 입력</h2>
          <div className="space-y-2">
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="사용자"
                value={newExpense.name}
                onChange={(e) => setNewExpense({...newExpense, name: e.target.value})}
                className="flex-1 border rounded-lg px-3 py-2 text-sm"
              />
              <input
                type="number"
                placeholder="금액"
                value={newExpense.amount}
                onChange={(e) => setNewExpense({...newExpense, amount: e.target.value})}
                className="w-28 border rounded-lg px-3 py-2 text-sm"
              />
            </div>
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="사용 내역 (선택)"
                value={newExpense.description}
                onChange={(e) => setNewExpense({...newExpense, description: e.target.value})}
                className="flex-1 border rounded-lg px-3 py-2 text-sm"
                onKeyDown={(e) => e.key === 'Enter' && addExpense()}
              />
              <button
                onClick={addExpense}
                className="bg-blue-500 text-white px-4 py-2 rounded-lg flex items-center gap-1 hover:bg-blue-600 transition"
              >
                <PlusCircle size={18} />
                <span className="text-sm">추가</span>
              </button>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100">
          <h2 className="font-semibold text-slate-700 mb-3">
            지출 내역 <span className="text-sm font-normal text-slate-400">({expenses.length}건)</span>
          </h2>
          {expenses.length === 0 ? (
            <p className="text-center text-slate-400 py-8">아직 지출 내역이 없습니다</p>
          ) : (
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {expenses.map((e) => (
                <div key={e.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-xl">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-slate-700">{e.name}</span>
                      <span className="text-xs text-slate-400">{e.date}</span>
                    </div>
                    {e.description && <p className="text-xs text-slate-500 mt-0.5">{e.description}</p>}
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="font-semibold text-slate-700">{formatCurrency(e.amount)}</span>
                    <button onClick={() => deleteExpense(e.id)} className="text-slate-400 hover:text-red-500">
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <p className="text-xs text-center text-slate-400">
          💡 이 페이지를 공유하면 팀원 모두가 동일한 데이터를 확인할 수 있습니다
        </p>
      </div>
    </div>
  );
}
