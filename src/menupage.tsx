import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { collection, addDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { solveDP } from '../lib/dp';
import { MenuCard, UIMenuItem} from '../menucard'; // 👈 MenuCardと型定義をインポート
import { PRESET_MENUS } from '../mocks/menus'; // 👈 指定の初期データをそのままインポート

export default function MenuPage() {
  const navigate = useNavigate();
  
  // 指定の正しい初期データでStateを初期化
  const [menuList, setMenuList] = useState<UIMenuItem[]>(() =>
    PRESET_MENUS.map((m: UIMenuItem) => ({ ...m, isSelected: true, preference: 3 }))
  );
  
  const [stomachCapacity, setStomachCapacity] = useState<number>(800);
  const [stayTime, setStayTime] = useState<number>(90);
  const [buffetPrice, setBuffetPrice] = useState<number>(3980);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const handleToggleSelect = (menuId: string) => {
    setMenuList(prev => prev.map(item => item.menuId === menuId ? { ...item, isSelected: !item.isSelected } : item));
  };

  const handleChangePreference = (menuId: string, preference: number) => {
    setMenuList(prev => prev.map(item => item.menuId === menuId ? { ...item, preference } : item));
  };

 
  // 🔥 DPを計算し、Firestoreへ結果ごと保存してリザルトへ遷移する処理
  const handleRunDP = async () => {
    setIsSubmitting(true);
    
    const selectedMenus = menuList
      .filter(m => m.isSelected)
      .map(m => ({ menuId: m.menuId, preference: m.preference }));

    const pureMenus = menuList.map(({ isSelected, preference, ...m }) => m);

    const inputData = {
      stomachCapacity,
      stayTime,
      buffetPrice,
      selectedMenus,
    };
    // （以下略、元のコードのまま）
  return (
    <div className="min-h-screen bg-stone-50 text-zinc-950">
      <main className="mx-auto max-w-2xl space-y-6 px-5 py-10 sm:px-8">
        
        {/* ヘッダー */}
        <div className="flex items-center justify-between">
          <p className="font-mono text-xs font-bold uppercase tracking-[0.22em] text-red-700">
            Kosupa Checker
          </p>
          <p className="font-mono text-xs text-zinc-400">/select</p>
        </div>

        {/* 画面タイトル */}
        <div className="rounded-sm border-2 border-zinc-950 bg-white p-6 shadow-[6px_6px_0_#18181b]">
          <h1 className="text-xl font-black sm:text-2xl">😋 メニューセレクト</h1>
          <p className="mt-2 text-sm text-zinc-500">
            食べたいメニューにチェックを入れ、好み度を設定してください。
          </p>
        </div>

        {/* 条件設定スライダー */}
        <div className="rounded-sm border-2 border-zinc-200 bg-white p-5 shadow-[6px_6px_0_#18181b] space-y-5">
          <h2 className="text-sm font-bold uppercase tracking-widest text-zinc-500">条件設定</h2>
          
          <div className="space-y-4 font-mono text-sm">
            <div>
              <label className="block text-xs font-bold text-zinc-400 uppercase tracking-wider mb-1">
                食べ放題料金 (円)
              </label>
              <input 
                type="number" 
                step="100" 
                value={buffetPrice} 
                onChange={e => setBuffetPrice(Number(e.target.value))} 
                className="w-full rounded-sm border-2 border-zinc-950 p-2.5 font-bold text-zinc-950 focus:outline-none focus:ring-0" 
              />
            </div>
            
            <div>
              <div className="flex justify-between text-xs font-bold mb-1">
                <label className="text-zinc-400 uppercase tracking-wider">あなたの胃袋容量</label>
                <span className="text-zinc-950 font-bold">{stomachCapacity.toLocaleString()}g</span>
              </div>
              <input 
                type="range" 
                min="200" 
                max="2500" 
                step="50" 
                value={stomachCapacity} 
                onChange={e => setStomachCapacity(Number(e.target.value))} 
                className="w-full h-2 bg-zinc-200 rounded-sm appearance-none cursor-pointer accent-zinc-950" 
              />
            </div>

            <div>
              <div className="flex justify-between text-xs font-bold mb-1">
                <label className="text-zinc-400 uppercase tracking-wider">お店の制限時間</label>
                <span className="text-zinc-950 font-bold">{stayTime}分</span>
              </div>
              <input 
                type="range" 
                min="10" 
                max="180" 
                step="5" 
                value={stayTime} 
                onChange={e => setStayTime(Number(e.target.value))} 
                className="w-full h-2 bg-zinc-200 rounded-sm appearance-none cursor-pointer accent-zinc-950" 
              />
            </div>
          </div>
        </div>

        {/* メニュー選択一覧 */}
        <div className="space-y-4">
          <h2 className="text-sm font-bold uppercase tracking-widest text-zinc-500">対象メニュー</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {menuList.map(menu => (
              <MenuCard 
                key={menu.menuId} 
                item={menu} 
                onToggleSelect={handleToggleSelect} 
                onChangePreference={handleChangePreference} 
              />
            ))}
          </div>
        </div>

        {/* 送信ボタン */}
        <button
          type="button"
          disabled={isSubmitting}
          onClick={handleRunDP}
          className="w-full rounded-sm border-2 border-zinc-950 bg-red-700 px-5 py-4 text-base font-black text-white shadow-[4px_4px_0_#18181b] transition hover:bg-red-800 active:translate-x-1 active:translate-y-1 active:shadow-none disabled:opacity-50"
        >
          {isSubmitting ? '計算中...' : 'コスパをチェック！'}
        </button>

      </main>
    </div>
  );
}}