// --- 1. 画面起動時の初期化処理 ---
window.addEventListener('DOMContentLoaded', () => {
    // Cookieからテーマを復元
    const savedTheme = getCookie('theme_mode');
    if (savedTheme === 'dark') {
        document.body.classList.add('dark-mode');
    }

    // Cookieから最後の検索空港コードを復元
    const savedCountry = getCookie('last_search_country');
    if (savedCountry) {
        document.getElementById('countryInput').value = savedCountry;
    }
});

// --- 2. イベントリスナーの登録 ---

// テーマ切り替え
document.getElementById('themeToggle').addEventListener('click', () => {
    document.body.classList.toggle('dark-mode');
    const isDark = document.body.classList.contains('dark-mode');
    setCookie('theme_mode', isDark ? 'dark' : 'light', 365); // 1年間保存
});

// 空港コードの保存
document.getElementById('saveAirportBtn').addEventListener('click', () => {
    const countryValue = document.getElementById('countryInput').value.trim().toUpperCase();
    setCookie('last_search_country', countryValue, 30); // 30日間保存
    alert(`デフォルトの空港コードを「${countryValue}」としてCookieに保存しました！`);
});

// データ取得ボタン
document.getElementById('fetchFlightsBtn').addEventListener('click', fetchFlightData);


// --- 3. 非同期処理によるAPIデータ取得 ---
async function fetchFlightData() {
    const loadingText = document.getElementById('loadingText');
    const tableBody = document.querySelector('#flightTable tbody');
    // 入力された空港コード（HNDなど）を取得し、大文字に統一
    const filterInput = document.getElementById('countryInput').value.trim().toUpperCase();

    // ローディング表示開始
    loadingText.style.display = 'inline';
    tableBody.innerHTML = `<tr><td colspan="5" style="text-align: center;">データを読み込み中...</td></tr>`;

    try {
        // Flightradar24のリアルタイムデータAPI
        const response = await fetch('https://data-cloud.flightradar24.com/zones/fcgi/feed.js');
        
        if (!response.ok) {
            throw new Error('APIリクエストに失敗しました');
        }

        const data = await response.json();
        
        // テーブルの初期化
        tableBody.innerHTML = '';
        let count = 0;

        for (const flightId in data) {
            if (Array.isArray(data[flightId])) {
                const flight = data[flightId];
                
                const callsign = flight[13] || 'N/A';    // 便名
                const origin = flight[11] || '???';       // 出発空港
                const destination = flight[12] || '???';  // 目的空港
                const route = `${origin} ➔ ${destination}`; // 路線

                // 【高度判定ロジック】flight[4]の高度（フィート）を取得
                const altitude = flight[4] || 0; 
                // 高度が0より高ければ「飛行中（高度）」、0なら「地上」
                const statusText = altitude > 0 ? `飛行中 (${altitude} ft)` : '地上';

                // 空港コードでのフィルタリング（出発または目的地に入力文字が含まれるか）
                if (filterInput === '' || origin.includes(filterInput) || destination.includes(filterInput)) {
                    const row = document.createElement('tr');
                    row.innerHTML = `
                        <td><strong>${callsign}</strong></td>
                        <td>${route}</td>
                        <td>${flight[2] ? flight[2].toFixed(4) : 'N/A'}</td>
                        <td>${flight[1] ? flight[1].toFixed(4) : 'N/A'}</td>
                        <td>${statusText}</td>
                    `;
                    tableBody.appendChild(row);
                    count++;
                }
            }
            if (count >= 15) break; // 最大15件
        }

        if (count === 0) {
            tableBody.innerHTML = `<tr><td colspan="5" style="text-align: center;">指定された空港（${filterInput}）に関わるフライトは見つかりませんでした。</td></tr>`;
        }

    } catch (error) {
        console.error('エラー発生:', error);
        tableBody.innerHTML = `<tr><td colspan="5" style="text-align: center; color: red;">エラー: ${error.message}</td></tr>`;
    } finally {
        // ローディング表示終了
        loadingText.style.display = 'none';
    }
}