<h1>自作パックマン(HTML5+CSS3+JS/ES2022)</h1>
<p><a href="https://pacman.holenet.info/">The Pac-Man Dossier</a> を参考にアレンジしたPAC-MANのクローンゲームです。</p>
<p>試みとして視覚的要素をCSSに委ね、スクリプトを簡潔にしています。</p>
<p><img src="https://github.com/anonimo0611/pacman/assets/111575913/3d21ae43-f63b-45a9-8b6c-37d3ad5993d1" alt="スクリーンショット"></p>
<h2>推奨環境</h2>
<p>最新のPC向けChromium系ブラウザを推奨します。スマホは非対応です。</p>

<h2>練習モード（PRACTICE）について</h2>
<p>練習モードでは、上端にあるハイスコア表示の代わりに<em>PRACTICE</em>と表示されます。</p>
<p class="as-follows">切り替わる条件は以下のとおりです：</p>
<ul>
	<li><em>連続プレイではない</em>（すなわち Only this level がオンの）とき</li>
	<li>または連続プレイにおいて<em>途中のレベルから始める</em>とき</li>
	<li>Speedが0.6以下、Invincible または Show targetsがオンのとき</li>
</ul>
<p>練習モードではレベル間のコーヒーブレイクは実行されません。</p>

<h2>設定項目/操作</h2>
<section>
	<h3>Only this level</h3>
	<div class="cfg-desc">
		<p>オフであれば<em>連続プレイ</em>になる<br>オンなら選択されたレベルをクリア後、タイトル画面に戻る</p>
	</div>
</section>
<section>
	<h3>Power cookies</h3>
	<div class="cfg-desc">
 		<p>パワークッキーの有無</p>
	</div>
</section>
<section>
	<h3>Always chase mode</h3>
	<div class="cfg-desc">
		<p>常に追跡モード（縄張モードなし）</p>
	</div>
</section>
<section>
	<h3>Clear storage</h3>
	<div class="cfg-desc">
		<p>ローカルストレージを消すかどうかの確認<br>設定状態やハイスコアがクリアされます</p>
	</div>
</section>
<section>
	<h3>About keys</h3>
	<div class="cfg-desc">
		<p>プレイ中の操作説明：</p>
		<table class="keys plain">
		<tr>
			<th><kbd>M</kbd></th> 
			<td>ミュート</td>
		</tr>
		<tr>
			<th><kbd>Esc</kbd></th>
			<td>一時停止</td>
		</tr>
		<tr>
			<th><kbd>Del</kbd></th>
			<td>終了するかどうかの確認ダイアログを表示</td>
		</tr>
		<tr>
			<th><kbd>Ctrl</kbd>+<kbd>Del</kbd></th>
			<td>強制的にリセットしてタイトル画面に戻る</td>
		</tr>
		<tr>
			<th class="arrow"><kbd
			class="← arrow">←</kbd><kbd
			class="↑ arrow">↑</kbd><kbd
			class="↓ arrow">↓</kbd><kbd
			class="→ arrow">→</kbd>
			</th>
			<td>パックマンを導く方向（<kbd>A</kbd><kbd>W</kbd><kbd>S</kbd><kbd>D</kbd>でも操作可能）</td>
		</tr>
	 	</table>
	</div>
</section>
<section>
	<h3>
		拡大/縮小トグル
	</h3>
	<div class="cfg-desc">
 		<p>ヴューポートにフィット／実サイズに戻す</p>
	</div>
</section>
<section>
	<h3>設定パネル</h3>
	<div class="cfg-desc">
		<table class="plain">
		<tr>
			<th>Volume</th>
			<td>音量調整</td>
		</tr>
		<tr>
			<th>Speed</th>
			<td>ゲームの進行速度 0.5～1.2倍</td>
		</tr>
		<tr>
			<th>PacLives</th>
			<td>ライフ 1～5（迷路にいるぶんも含む）</td>
		</tr>
		<tr>
			<th>Extend</th>
			<td>ライフがひとつ増えるスコア</td>
		</tr>
		<tr>
			<th>Invincible</th>
			<td>無敵モード</td>
		</tr>
		<tr>
			<th>Unrestricted ghosts</th>
			<td><a href="http://anonimo0611.web.fc2.com/Pac-Man_Dossier/02.html#areas-to-exploit"
			title="第２章：ゲームプレイの詳細 最大限活用すべきエリア - The Pac-Man Dossier邦訳">
			ゴーストのターン制限</a>をなくす</td>
		</tr>
		<tr>
			<th>Show targets</th>
			<td>ゴーストが目指すターゲットタイルの表示</td>
		</tr>
		<tr>
			<th>Show tile grid</th>
			<td>タイルのグリッドを表示</td>
		</tr>
		<tr>
			<th>Attract demo</th>
			<td>アトラクト デモの再生</td>
		</tr>
		<tr>
			<th>Coffee Break 1-3</th>
			<td>コーヒーブレイクの再生</td>
		</tr>
		<tr>
			<th>Return to Default</th>
			<td>デフォルト設定に戻す</td>
		</tr>
		</table>
	</div>
</section>
<p>Unrestricted ghostsを有効にすると極端に難しくなるので、あまりお奨めはしません。岩谷氏率いるナムコの開発チームがバランス調整に労力を費やした結果、ゴーストの進入禁止エリアがあるのです。</p>

<h2>アトラクト デモ</h2>
<p>タイトル画面でなにも操作せず放置すると、30秒ほどで始まるようにしています。</p>
<p>すぐにご覧になりたいときは ハンバーガーボタンを押してください。</p>
<p>コーヒーブレイクを観ることもできます。</p>

<h2>ゲームレベル</h2>
<p>難易度はレベル１～13まで13段階としており、13以後は同じ難易度の繰り返しです。</p>
<p>メニュー選択でお好みのレベルから始められますが、途中からだと練習モードになります。</p>
<p>“Only this level”をオンにすると、次のレベルに進まずタイトル画面に戻ります。</p>

<h2>縄張/追跡モード</h2>
<p>“常に追跡モード”がオフのときは、おおむね原作のとおりです。</p>
<p>しかし原作より移動が速いため、縄張/追跡モードの各期間は短めです。</p>
<p>次の表は各期間の長さをまとめたものです（単位は秒）：</p>
<table>
	<thead>
		<tr>
			<th></th>
			<th scope="col">モード</th>
			<th scope="col" class="level">レベル 1</th>
			<th scope="col" class="level">レベル 2-4</th>
			<th scope="col" class="level">レベル 5+</th>
		</tr>
	</thead>
	<tbody>
		<tr>
			<th rowspan="2" scope="rowgroup">1</th>
			<th scope="row">縄張</th>
			<td>4.5</td>
			<td>4.5</td>
			<td>3.5</td>
		</tr>
		<tr>
			<th scope="row">追跡</th>
			<td>15.0</td>
			<td>15.0</td>
			<td>15.0</td>
		</tr>
		<tr>
			<th rowspan="2" scope="rowgroup">2</th>
			<th scope="row">縄張</th>
			<td>4.5</td>
			<td>4.5</td>
			<td>3.5</td>
		</tr>
		<tr>
			<th scope="row">追跡</th>
			<td>15.0</td>
			<td>15.0</td>
			<td>15.0</td>
		</tr>
		<tr>
			<th rowspan="2" scope="rowgroup">3</th>
			<th scope="row">縄張</th>
			<td>3.5</td>
			<td>3.5</td>
			<td>3.5</td>
		</tr>
		<tr>
			<th scope="row">追跡</th>
			<td>15.0</td>
			<td>780</td>
			<td>780</td>
		</tr>
		<tr>
			<th rowspan="2" scope="rowgroup">4</th>
			<th scope="row">縄張</th>
			<td>3.0</td>
			<td>1/60</td>
			<td>1/60</td>
		</tr>
		<tr>
			<th scope="row">追跡</th>
			<td>無限</td>
			<td>無限</td>
			<td>無限</td>
		</tr>
	</tbody>
</table>

<h2>ゴーストの経路探索と個性</h2>
<p>おおむね原作のとおりゴーストの経路探索と個性を再現しています。</p>
<p>ただしピンキーは“待ちぶせ”という個性を活かして、<br>
パックマンがトンネルに入ると目標を彼から反対側の出口に切り替えて先回りします。</p>
<p>イジケゴーストの曲がる方向を決める擬似乱数ジェネレータは再現していません。</p>

<h2>占有タイルと当たり判定</h2>
<p>当たり判定は<a href="http://anonimo0611.web.fc2.com/Pac-Man_Dossier/03.html#what-tile-am-i-in" title="第３章：迷路ロジックの初歩 どのタイルにいるの？ - The Pac-Man Dossier邦訳">占有タイル</a>ではなく、円の当たり判定を採用しています。</p>
<p>追跡中のゴーストは小さめの半径、逆にイジケに対して判定を大きくしています。</p>
<p>ターン中などに稀にすり抜けますが、あえて小さい判定にしています。</p>

<h2>巣からの開放</h2>
<p><a href="http://anonimo0611.web.fc2.com/Pac-Man_Dossier/02.html#home-sweet-home" title="第２章：ゲームプレイの詳細 ホームスイートホーム - The Pac-Man Dossier邦訳">ドットカウンター/グローバル･ドットカウンター</a>を原作のとおり実装しています。</p>
<p>タイマー制限も原作同様にレベル１～４までは４秒、レベル５以降では３秒です。</p>
<p>これはドットを食べたり、優先ゴーストを開放するごとにゼロにリセットされます。</p>
<p>ただし“常に追跡モード”では次の表のとおり、時間で開放されます（単位はミリ秒）：</p>
<table>
	<col>
	<col class="light-bg-Pinky">
	<col class="light-bg-Aosuke">
	<col class="light-bg-Guzuta">
	<thead>
		<tr>
			<th>レベル</th>
			<th scope="col" class="bg-Pinky">ピンキー</th>
			<th scope="col" class="bg-Aosuke">アオスケ</th>
			<th scope="col" class="bg-Guzuta">グズタ</th>
		</tr>
	</thead>
	<tbody>
		<tr class="miss">
			<th scope="row">ミス</th>
			<td>1000</td>
			<td>500</td>
			<td>500</td>
		</tr>
		<tr>
			<th scope="row" class="f1 fruit">01</th>
			<td>1000</td>
			<td>4000</td>
			<td>4000</td>
		</tr>
		<tr>
			<th scope="row" class="f2 fruit">02</th>
			<td>800</td>
			<td>2200</td>
			<td>4000</td>
		</tr>
		<tr>
			<th scope="row" class="f3 fruit">03</th>
			<td>600</td>
			<td>1900</td>
			<td>3500</td>
		</tr>
		<tr>
			<th scope="row" class="f3 fruit">04</th>
			<td>600</td>
			<td>1900</td>
			<td>1500</td>
		</tr>
		<tr>
			<th scope="row" class="f4 fruit">05</th>
			<td>500</td>
			<td>1300</td>
			<td>1200</td>
		</tr>
		<tr>
			<th scope="row" class="f4 fruit">06</th>
			<td>500</td>
			<td>1300</td>
			<td>1200</td>
		</tr>
		<tr>
			<th scope="row" class="f5 fruit">07</th>
			<td>300</td>
			<td>700</td>
			<td>800</td>
		</tr>
		<tr>
			<th scope="row" class="f5 fruit">08</th>
			<td>300</td>
			<td>700</td>
			<td>800</td>
		</tr>
		<tr>
			<th scope="row" class="f6 fruit">09</th>
			<td>200</td>
			<td>800</td>
			<td>200</td>
		</tr>
		<tr>
			<th scope="row" class="f6 fruit">10</th>
			<td>200</td>
			<td>800</td>
			<td>200</td>
		</tr>
		<tr>
			<th scope="row" class="f7 fruit">11</th>
			<td>100</td>
			<td>700</td>
			<td>200</td>
		</tr>
		<tr>
			<th scope="row" class="f7 fruit">12</th>
			<td>100</td>
			<td>700</td>
			<td>200</td>
		</tr>
		<tr>
			<th scope="row" class="f8 fruit">13+</th>
			<td>0</td>
			<td>900</td>
			<td>0</td>
		</tr>
	</tbody>
</table>
<p>それぞれの時間があらわす意味は以下の通りです：</p>
<ul class="release-time">
	<li><span class="ghs-name bg-Pinky ">ピンキー</span>……ラウンド開始時からの経過時間</li>
	<li><span class="ghs-name bg-Aosuke">アオスケ</span>……<span class="ghs-name bg-Pinky">ピンキー</span>が開放されてからの経過時間</li>
	<li><span class="ghs-name bg-Guzuta">グズタ</span>……<span class="ghs-name bg-Aosuke">アオスケ</span>が開放されてからの経過時間</li>
</ul>

<h2>イジケモード</h2>
<p>下記の表は各レベルのイジケタイム（秒）です：</p>
<table>
	<thead>
		<tr>
			<th scope="row">レベル</th>
			<th scope="col" class="f1 fruit">1</th>
			<th scope="col" class="f2 fruit">2</th>
			<th scope="col" class="f3 fruit">3</th>
			<th scope="col" class="f3 fruit">4</th>
			<th scope="col" class="f4 fruit">5</th>
			<th scope="col" class="f4 fruit">6</th>
			<th scope="col" class="f5 fruit">7</th>
			<th scope="col" class="f5 fruit">8</th>
			<th scope="col" class="f6 fruit">9</th>
			<th scope="col" class="f6 fruit">10</th>
			<th scope="col" class="f7 fruit">11</th>
			<th scope="col" class="f7 fruit">12</th>
			<th scope="col" class="f8 fruit">13+</th>
		</tr>
	</thead>
	<tbody>
		<tr>
			<th scope="row">秒</th>
			<td>6</td>
			<td>5</td>
			<td>4</td>
			<td>3</td>
			<td>2</td>
			<td>5</td>
			<td>2</td>
			<td>2</td>
			<td>1</td>
			<td>5</td>
			<td>2</td>
			<td>1</td>
			<td>0</td>
		</tr>
	</tbody>
</table>
<p>レベル５、９をクリアしたあと、コーヒーブレイクを挟んだ６、10は５秒に延長されます。</p>
<p>レベル13以降ではイジケなくなり、進行方向を反転するだけになります。</p>
<p>ゼロ秒のときは400ミリ秒のあいだ、パックマンから遠ざかるようにしています。</p>

<h2>コーナリング</h2>
<p>パックマンの<a href="http://anonimo0611.web.fc2.com/Pac-Man_Dossier/02.html#cornering" title="第２章：ゲームプレイの詳細 コーナリング - The Pac-Man Dossier邦訳">プリターン/ポストターン</a>をそれらしく実装しています。</p>
<p>壁のある方向に矢印キーあるいはAWSDを押すと次のターンを予約でき、曲がれる交差点のタイルに達するとパックマンが自動的に曲がります（原作とは異なりますが、操作しやすいので）。</p>
<p>交差点の中心より手前で予約すると、曲がり角を斜めに進み速度が２倍になります</p>

<h2>移動速度</h2>
<p>標準設定ではすべてのレベルを通して原作より移動速度が速くなっています。</p>
<p>レベル１～13までの13段階で徐々に速くなります(原作では４段階)。</p>
<p>通常時のゴーストはパックマンに対して102％の速度で移動します。</p>
<p>レベル13以降では、パックマンの速度はゴーストに対して約93％に落ちます。</p>
<p>無理ゲーにならいようにバランス調整している積もりです。ゴーストとの当たり判定が小さいのでギリギリかわせたり、プリターンを連続すると引き離せます。<a href="http://anonimo0611.web.fc2.com/Pac-Man_Dossier/02.html#areas-to-exploit" title="第２章：ゲームプレイの詳細 最大限活用すべきエリア - The Pac-Man Dossier邦訳">緊急回避用通路</a>に逃げ込むのも手です。
</p>
<p>状況による相対的な速度変化は下記のとおりです：</p>
<dl>
	<dt><em>パックマン</em></dt>
	<dd>
		<dl>
			<dt>ドットを食べる</dt>
			<dd>0.86倍</dd>
			<dt>イジケタイム</dt>
			<dd>1.10倍</dd>
			<dt>イジケ＋ドット</dt>
			<dd>0.95倍</dd>
		</dl>
	</dd>
</dl>
<dl>
	<dt><em>ゴースト</em></dt>
	<dd>
		<dl>
			<dt>イジケゴースト</dt>
			<dd>0.65倍</dd>
			<dt>トンネル通過中</dt>
			<dd>0.60倍</dd>
			<dt>巣にもどる目玉</dt>
			<dd>およそ1.40倍</dd>
		</dl>
	</dd>
</dl>

<h2>アカベエのスパート</h2>
<p>アカベエはレベルごとに３回速度を上げます（原作は２段階）。</p>
<p>後のレベルほど、より多くの残りドットでスパートが発動します。</p>
<p>次の表に発動するドットの残り数と速度の係数をまとめたした：</p>
<table>
	<thead>
		<tr>
			<th scope="col">Lv.</th>
			<th scope="col">第１</th>
			<th scope="col">第２</th>
			<th scope="col">第３</th>
		</tr>
	</thead>
	<tbody>
		<tr>
			<th scope="row" class="f1 fruit">01</th>
			<td>30</td>
			<td>20</td>
			<td>10</td>
		</tr>
		<tr>
			<th scope="row" class="f2 fruit">02</th>
			<td>30</td>
			<td>20</td>
			<td>10</td>
		</tr>
		<tr>
			<th scope="row" class="f3 fruit">03</th>
			<td>45</td>
			<td>30</td>
			<td>15</td>
		</tr>
		<tr>
			<th scope="row" class="f3 fruit">04</th>
			<td>60</td>
			<td>40</td>
			<td>20</td>
		</tr>
		<tr>
			<th scope="row" class="f4 fruit">05</th>
			<td>75</td>
			<td>50</td>
			<td>25</td>
		</tr>
		<tr>
			<th scope="row" class="f4 fruit">06</th>
			<td>90</td>
			<td>60</td>
			<td>30</td>
		</tr>
		<tr>
			<th scope="row" class="f5 fruit">07</th>
			<td>105</td>
			<td>70</td>
			<td>35</td>
		</tr>
		<tr>
			<th scope="row" class="f5 fruit">08</th>
			<td>105</td>
			<td>70</td>
			<td>35</td>
		</tr>
		<tr>
			<th scope="row" class="f6 fruit">09</th>
			<td>120</td>
			<td>80</td>
			<td>40</td>
		</tr>
		<tr>
			<th scope="row" class="f6 fruit">10</th>
			<td>135</td>
			<td>90</td>
			<td>45</td>
		</tr>
		<tr>
			<th scope="row" class="f7 fruit">11</th>
			<td>150</td>
			<td>100</td>
			<td>50</td>
		</tr>
		<tr>
			<th scope="row" class="f7 fruit">12</th>
			<td>165</td>
			<td>110</td>
			<td>55</td>
		</tr>
		<tr>
			<th scope="row" class="f8 fruit">13+</th>
			<td>180</td>
			<td>120</td>
			<td>60</td>
		</tr>
	</tbody>
	<tfoot>
		<tr>
			<th scope="row">速度</th>
			<td>1.02</td>
			<td>1.05</td>
			<td>1.10</td>
		</tr>
	</tfoot>
</table>
<p>第２段階以上ではアカベエは発光し、縄張モードでもプレイヤーを追跡します。</p>
<p>ただし縄張/追跡モードの切り替え時には進行方向を反転します。</p>
<p>発動後にミスすると、再開後はグズタが巣を出るまでスパートは発動しません。</p>

<h2>攻略パターン</h2>
<p>原作のパターンは使えませんが、別の攻略パターンがあるかもしれません。しかし、原作の開発者が想定外だったように、私も想定していません。仕様変更でパターンが変わる可能性もあります。</p>
<p>パターンを実行するだけなら忍耐力を競うだけになり、ゲーム性が失われてしまいます。それよりも思い思いに操作し、その場その場でゴーストの行動を読むほうが面白いと私は思っています。</p>
