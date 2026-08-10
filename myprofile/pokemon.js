// 💡 検索ボタンがクリックされたら動くイベント（DOM操作）
document.getElementById('searchBtn').addEventListener('click', () => {
  
  // 入力された日本語のポケモン名を取得（リプレイスで前後の空白も消しておく）
  const inputName = document.getElementById('pokemonInput').value.replace(/\s+/g, '');

  if (!inputName) {
    alert('ポケモンの名前を入力してください！');
    return;
  }

  // 表示を一度「検索中...」にする
  document.getElementById('abilityName').innerText = '検索中...';
  document.getElementById('abilityEffect').innerText = '';

  // ─── ステップ1: 日本語名からポケモンのデータ（英語名など）を探す ───
  // 💡 まずはポケモンの種族データを検索するAPIを叩きます
  fetch(`https://pokeapi.co/api/v2/pokemon-species/${inputName}`)
    .then((response) => {
      if (!response.ok) {
        // ※ PokeAPIの日本語検索はID番号か一部対応のため、ここでは「見つからない」エラーのハンドリング
        throw new Error('ポケモンが見つかりませんでした。ひらがな・カタカナ、またはID番号(例: 25)で試してね');
      }
      return response.json();
    })
    .then((speciesData) => {
      
      // このポケモンが持っている「最初の特性」のURLを取得する
      // 本来は英語名から調べるのが確実ですが、今回は実験として
      // 入力された「ID番号（ピカチュウなら25）」を使って特性ルートへ繋ぐ簡易版にします
      const pokemonId = speciesData.id;
      
      // ─── ステップ2: そのポケモンの特性情報を取得する ───
      // ポケモン個別の詳細データから特性のURLを引っ張るために、もう一度fetchします
      return fetch(`https://pokeapi.co/api/v2/pokemon/${pokemonId}`);
    })
    .then((response) => response.json())
    .then((pokemonData) => {
      // 最初の特性（ability[0]）のURLをゲット
      const abilityUrl = pokemonData.abilities[0].ability.url;
      
      // ─── ステップ3: 特性の詳細URLから日本語テキストを持ってくる ───
      return fetch(abilityUrl);
    })
    .then((response) => response.json())
    .then((abilityData) => {
      
      // 【前回作った処理】日本語の名前と説明文を探す
      const jpNameEntry = abilityData.names.find(entry => entry.language.name === 'ja');
      const jpName = jpNameEntry ? jpNameEntry.name : abilityData.name;

      const jpEffectEntry = abilityData.flavor_text_entries.find(entry => entry.language.name === 'ja');
      let jpEffect = jpEffectEntry ? jpEffectEntry.flavor_text : '説明がありません。';
      
      // リプレイスで綺麗にする
      jpEffect = jpEffect.replace(/\s+/g, '');

      // 🎯 画面に表示！
      document.getElementById('abilityName').innerText = `特性名: ${jpName}`;
      document.getElementById('abilityEffect').innerText = jpEffect;
    })
    .catch((error) => {
      // 何かエラーがあったら画面に出す
      document.getElementById('abilityName').innerText = 'エラー';
      document.getElementById('abilityEffect').innerText = error.message;
    });
});