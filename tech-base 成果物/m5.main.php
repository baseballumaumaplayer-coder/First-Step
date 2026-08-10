<?php
// 1. DB接続設定
$dsn = 'mysql:dbname=tb280238db;host=localhost';
$user = 'tb-280238';
$password = '3Rhj9AnARe';
$pdo = new PDO($dsn, $user, $password, array(PDO::ATTR_ERRMODE => PDO::ERRMODE_WARNING));

// 【テーブルの変更】新しい名前「tbtest_pass」で、passwordカラムを追加して作成
$sql = "CREATE TABLE IF NOT EXISTS tbtest_pass"
     . " ("
     . "id INT AUTO_INCREMENT PRIMARY KEY,"
     . "name CHAR(32),"
     . "comment TEXT,"
     . "password CHAR(32)" // パスワード保存用のカラムを追加
     . ");";
$pdo->query($sql);

// フォームに表示するための初期値
$edit_name = "";
$edit_comment = "";
$edit_id = ""; 
$edit_pass = ""; // 編集時にパスワードも引き継ぐ用


// 2. 各種POST処理の分岐（パスワードチェック付き）

if ($_SERVER['REQUEST_METHOD'] === 'POST') {

    // --- 【編集対象の呼び出し処理】 ---
    if (isset($_POST['edit_target_id']) && $_POST['edit_target_id'] !== '') {
        $edit_target_id = $_POST['edit_target_id'];
        $input_pass = isset($_POST['edit_password']) ? $_POST['edit_password'] : '';

        // まず、指定された番号のデータを取得
        $sql = 'SELECT * FROM tbtest_pass WHERE id = :id';
        $stmt = $pdo->prepare($sql);
        $stmt->bindParam(':id', $edit_target_id, PDO::PARAM_INT);
        $stmt->execute();
        $row = $stmt->fetch();

        if ($row) {
            // 【確認】入力されたパスワードが、投稿時のパスワードと一致するか
            if ($row['password'] !== '' && $row['password'] === $input_pass) {
                $edit_name = $row['name'];
                $edit_comment = $row['comment'];
                $edit_id = $row['id'];
                $edit_pass = $row['password']; // 現在のパスワードをフォームにセット
            } else {
                echo '<p style="color: red;">パスワードが違います、または設定されていません。</p>';
            }
        } else {
            echo '<p style="color: red;">指定された番号の投稿が見つかりません。</p>';
        }
    }

    // --- 【削除処理】 ---
    if (isset($_POST['delete_id']) && $_POST['delete_id'] !== '') {
        $delete_id = $_POST['delete_id'];
        $input_pass = isset($_POST['delete_password']) ? $_POST['delete_password'] : '';

        // まず対象のパスワードを調べる
        $sql = 'SELECT password FROM tbtest_pass WHERE id = :id';
        $stmt = $pdo->prepare($sql);
        $stmt->bindParam(':id', $delete_id, PDO::PARAM_INT);
        $stmt->execute();
        $row = $stmt->fetch();

        if ($row) {
            // 【確認】パスワードが一致したときのみ削除
            if ($row['password'] !== '' && $row['password'] === $input_pass) {
                $sql = 'DELETE FROM tbtest_pass WHERE id = :id';
                $stmt = $pdo->prepare($sql);
                $stmt->bindParam(':id', $delete_id, PDO::PARAM_INT);
                $stmt->execute();
                echo '<p style="color: red;">投稿番号 ' . $delete_id . ' 番を削除しました。</p>';
            } else {
                echo '<p style="color: red;">パスワードが違います、または設定されていません。</p>';
            }
        }
    }

    // --- 【メインフォーム（新規投稿 または 編集実行）】 ---
    if (isset($_POST['name']) && isset($_POST['comment'])) {
        $name = trim($_POST['name']);
        $comment = trim($_POST['comment']);
        $post_pass = $_POST['post_password']; // フォームからのパスワード
        $mode_id = $_POST['mode_id']; 

        if ($name !== '' && $comment !== '') {
            if ($mode_id !== '') {
                // 【編集実行】UPDATE文（パスワードも一緒に編集・上書きできるように対応）
                $sql = 'UPDATE tbtest_pass SET name=:name, comment=:comment, password=:password WHERE id = :id';
                $stmt = $pdo->prepare($sql);
                $stmt->bindParam(':name', $name, PDO::PARAM_STR);
                $stmt->bindParam(':comment', $comment, PDO::PARAM_STR);
                $stmt->bindParam(':password', $post_pass, PDO::PARAM_STR);
                $stmt->bindParam(':id', $mode_id, PDO::PARAM_INT);
                $stmt->execute();
                echo '<p style="color: blue;">投稿番号 ' . $mode_id . ' 番を更新しました！</p>';
            } else {
                // 【新規投稿】INSERT文（パスワードも一緒に保存）
                $sql = "INSERT INTO tbtest_pass (name, comment, password) VALUES (:name, :comment, :password)";
                $stmt = $pdo->prepare($sql);
                $stmt->bindParam(':name', $name, PDO::PARAM_STR);
                $stmt->bindParam(':comment', $comment, PDO::PARAM_STR);
                $stmt->bindParam(':password', $post_pass, PDO::PARAM_STR);
                $stmt->execute();
                echo '<p style="color: green;">新規投稿を保存しました！</p>';
            }
        }
    }
}

// 3. 表示用の全データ取得
$sql = 'SELECT * FROM tbtest_pass ORDER BY id ASC';
$stmt = $pdo->query($sql);
$results = $stmt->fetchAll();
?>

<!DOCTYPE html>
<html lang="ja">
<head>
    <meta charset="UTF-8">
    <title>簡易DB掲示板</title>
</head>
<body>

    <div style="background:#fff9e6; padding:10px; border:1px solid #ffcc00; margin-bottom:15px;">
        <strong>【この掲示板のテーマ】</strong><br>
        「おすすめのアーティスト」について自由に書き込んでください！<br>
    </div>

    <h2>簡易DB掲示板</h2>
    
    <form action="" method="post" style="background:#eef7ff; padding:15px; margin-bottom:10px;">
        <h3><?php echo $edit_id !== '' ? '【編集モード】' : '【新規登録モード】'; ?></h3>
        
        編集番号：
        <input type="text" name="mode_id" value="<?php echo $edit_id; ?>" placeholder="新規登録" readonly style="background-color: #e0e0e0; width: 80px; text-align: center;"><br><br>
        
        名前：<input type="text" name="name" value="<?php echo $edit_name; ?>"><br><br>
        コメント：<input type="text" name="comment" value="<?php echo $edit_comment; ?>"><br><br>
        
        パスワード：<input type="password" name="post_password" value="<?php echo $edit_pass; ?>"><br><br>
        
        <input type="submit" value="送信">
    </form>
    
    <form action="" method="post" style="background:#fff0f0; padding:10px; display:inline-block;">
        <h3>削除</h3>
        削除対象番号：<input type="number" name="delete_id" style="width:50px;"><br><br>
        パスワード：<input type="password" name="delete_password" style="width:100px;"><br><br>
        <input type="submit" value="削除">
    </form>

    <form action="" method="post" style="background:#f0fff0; padding:10px; display:inline-block; margin-left:10px; vertical-align: top;">
        <h3>編集</h3>
        編集対象番号：<input type="number" name="edit_target_id" style="width:50px;"><br><br>
        パスワード：<input type="password" name="edit_password" style="width:100px;"><br><br>
        <input type="submit" value="編集">
    </form>

    <hr>

    <h3>投稿一覧</h3>
    <table border="1">
        <tr><th>ID</th><th>名前</th><th>コメント</th></tr>
        <?php foreach ($results as $row): ?>
            <tr>
                <td><?php echo $row['id']; ?></td>
                <td><?php echo $row['name']; ?></td>
                <td><?php echo $row['comment']; ?></td>
            </tr>
        <?php endforeach; ?>
    </table>

</body>
</html>