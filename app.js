(function() {
'use strict';
if (window.__MAMNON_APP_LOADED__) return;
window.__MAMNON_APP_LOADED__ = true;
/* ==========================================================================
   MẦM NON HÒA PHƯỚC - CANVA / CANVAS STUDIO ENGINE
   - Menu mở rộng nằm riêng biệt ở góc trên bên phải
   - Giao diện thiết kế trực tiếp trên Artboard kiểu Canva + Filmstrip phía dưới
   - Hỗ trợ tải các ảnh khác lên để tạo câu hỏi và đáp án trả lời
   - Xuất Word (.doc) & PDF (.pdf) cho cả Bộ câu hỏi trò chơi lẫn Giáo án A4
   ========================================================================== */

document.addEventListener('paste', function(e) {
  if (e.target && e.target.getAttribute('contenteditable') === 'true') {
    e.preventDefault();
    const text = (e.clipboardData || window.clipboardData).getData('text/plain');
    document.execCommand('insertText', false, text);
  }
});

const $ = id => document.getElementById(id);
const clean = s => String(s == null ? '' : s).trim();
const esc = s => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({
  '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
}[c]));

// Đưa hàm $ và openFilePicker ra window để mọi nút Tải ảnh lên hoạt động ổn định 100%
window.$ = $;
window.clean = clean;
window.esc = esc;
window.openFilePicker = function(inputId) {
  const el = document.getElementById(inputId);
  if (!el) return;
  try { el.value = ''; } catch (e) {}
  el.click();
};

// ===== HIỆU ỨNG ÂM THANH VUI NHỘN KHI BÉ CHỌN ĐÁP ÁN =====
let audioCtx = null;

function getAudioCtx() {
  if (!audioCtx) {
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (AudioContextClass) audioCtx = new AudioContextClass();
  }
  return audioCtx;
}

function playCheerSound() {
  try {
    const ctx = getAudioCtx();
    if (!ctx) return;
    const notes = [523.25, 659.25, 783.99, 1046.50];
    notes.forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, ctx.currentTime + i * 0.09);
      gain.gain.setValueAtTime(0.18, ctx.currentTime + i * 0.09);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + i * 0.09 + 0.28);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(ctx.currentTime + i * 0.09);
      osc.stop(ctx.currentTime + i * 0.09 + 0.28);
    });
  } catch (e) {}
}

function playGentleRetrySound() {
  try {
    const ctx = getAudioCtx();
    if (!ctx) return;
    const notes = [349.23, 329.63];
    notes.forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, ctx.currentTime + i * 0.14);
      gain.gain.setValueAtTime(0.15, ctx.currentTime + i * 0.14);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + i * 0.14 + 0.25);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(ctx.currentTime + i * 0.14);
      osc.stop(ctx.currentTime + i * 0.14 + 0.25);
    });
  } catch (e) {}
}

// ===== INDEXEDDB STORAGE ENGINE =====
const DB_NAME = 'MamNonHongDao_DB_V1';
const DB_VERSION = 1;
const LIBRARY_KEY = 'mamnon_hongdao_library';
const GAME_KEY = 'mamnon_hongdao_game_v1';
const CUSTOM_IMG_KEY = 'mamnon_hoaphuoc_custom_images_v1';
let dbPromise = null;

function getDB() {
  if (!dbPromise) {
    dbPromise = new Promise((resolve, reject) => {
      if (typeof indexedDB === 'undefined') {
        return reject(new Error('IndexedDB not supported'));
      }
      const timer = setTimeout(() => reject(new Error('IndexedDB timeout')), 600);
      try {
        const req = indexedDB.open(DB_NAME, DB_VERSION);
        req.onupgradeneeded = e => {
          const db = e.target.result;
          if (!db.objectStoreNames.contains('lessons')) db.createObjectStore('lessons', { keyPath: 'id' });
          if (!db.objectStoreNames.contains('app_state')) db.createObjectStore('app_state', { keyPath: 'key' });
        };
        req.onsuccess = e => { clearTimeout(timer); resolve(e.target.result); };
        req.onerror = e => { clearTimeout(timer); reject(e.target.error); };
        req.onblocked = () => { clearTimeout(timer); reject(new Error('IndexedDB blocked')); };
      } catch (err) {
        clearTimeout(timer);
        reject(err);
      }
    });
  }
  return dbPromise;
}

async function dbSetLesson(entry) {
  try {
    const db = await getDB();
    const tx = db.transaction('lessons', 'readwrite');
    tx.objectStore('lessons').put(entry);
    await new Promise((res, rej) => { tx.oncomplete = res; tx.onerror = rej; });
  } catch (err) {}
}

async function dbGetAllLessons() {
  try {
    const db = await getDB();
    const tx = db.transaction('lessons', 'readonly');
    const req = tx.objectStore('lessons').getAll();
    return await new Promise((res, rej) => { req.onsuccess = () => res(req.result || []); req.onerror = rej; });
  } catch (err) { return []; }
}

async function dbDeleteLesson(id) {
  try {
    const db = await getDB();
    const tx = db.transaction('lessons', 'readwrite');
    tx.objectStore('lessons').delete(id);
    await new Promise((res, rej) => { tx.oncomplete = res; tx.onerror = rej; });
  } catch (err) {}
}

async function dbSetState(key, val) {
  try {
    const db = await getDB();
    const tx = db.transaction('app_state', 'readwrite');
    tx.objectStore('app_state').put({ key, data: val });
    await new Promise((res, rej) => { tx.oncomplete = res; tx.onerror = rej; });
  } catch (err) {}
}

async function dbGetState(key) {
  try {
    const db = await getDB();
    const tx = db.transaction('app_state', 'readonly');
    const req = tx.objectStore('app_state').get(key);
    const res = await new Promise((res, rej) => { req.onsuccess = () => res(req.result); req.onerror = rej; });
    return res ? res.data : null;
  } catch (err) { return null; }
}

// ===== TRẠNG THÁI CHUNG =====
let currentLessonData = null;
let lessonLibrary = { version: 1, activeId: null, items: [] };
let undoStack = [];
let activeAnimalCategory = 'all';
let customUploadedImages = [];

const getAgeLabel = key => ({
  '12-24m': '12 - 24 Tháng (Nhà trẻ)',
  '24-36m': '24 - 36 Tháng (Nhà trẻ)',
  '3-4y': '3 - 4 Tuổi (Mẫu giáo Bé)',
  '4-5y': '4 - 5 Tuổi (Mẫu giáo Nhỡ)',
  '5-6y': '5 - 6 Tuổi (Mẫu giáo Lớn)'
})[key] || '3 - 4 Tuổi (Mẫu giáo Bé)';

const getDuration = key => ({
  '12-24m': '12 - 15 Phút',
  '24-36m': '15 - 20 Phút',
  '3-4y': '20 - 25 Phút',
  '4-5y': '25 - 30 Phút',
  '5-6y': '30 - 35 Phút'
})[key] || '20 - 25 Phút';

function pushUndoState() {
  if (currentLessonData) {
    undoStack.push(JSON.parse(JSON.stringify(currentLessonData)));
    if (undoStack.length > 20) undoStack.shift();
  }
}

window.undoLastChange = function() {
  if (undoStack.length === 0) {
    showToast('↩️ Hoàn tác', 'Chưa có thao tác chỉnh sửa nào trước đó để hoàn tác!', false);
    return;
  }
  const lastState = undoStack.pop();
  populateUI(lastState);
  persist();
  showToast('↩️ Đã hoàn tác!', 'Đã khôi phục lại phiên bản trước đó.');
};

// ===== ĐIỀU KHIỂN THANH MENU RIÊNG BIỆT Ở GÓC TRÊN BÊN PHẢI =====
window.toggleRightMenu = function(forceClose = false) {
  const drawer = $('right-menu-drawer');
  const backdrop = $('right-menu-backdrop');
  if (!drawer || !backdrop) return;

  if (forceClose || drawer.classList.contains('open')) {
    drawer.classList.remove('open');
    backdrop.classList.add('hidden');
  } else {
    drawer.classList.add('open');
    backdrop.classList.remove('hidden');
  }
};

window.switchTabFromMenu = function(tabId) {
  switchTab(tabId);
  toggleRightMenu(true);
};

// ===== ĐIỀU KHIỂN CHẾ ĐỘ TRÊN CANVAS (DESIGN / QUIZ / MEMORY) =====
window.openCanvasSubMode = function(subMode) {
  switchTab('games', true);
  window.gQuizPlay.mode = subMode;

  const designStage = $('canvas-stage-design');
  const quizStage = $('canvas-stage-quiz');
  const memoryStage = $('canvas-stage-memory');

  designStage?.classList.add('hidden');
  quizStage?.classList.add('hidden');
  memoryStage?.classList.add('hidden');

  if (subMode === 'quiz') {
    window.saveCurrentFormQ();
    renderPreview();
    quizStage?.classList.remove('hidden');
  } else if (subMode === 'memory') {
    window.saveCurrentFormQ();
    initMemoryGame();
    memoryStage?.classList.remove('hidden');
  } else {
    designStage?.classList.remove('hidden');
  }

  updateTopHeaderPills(subMode);
};

function updateTopHeaderPills(activeKey) {
  const keys = ['design', 'quiz', 'memory', 'a4'];
  keys.forEach(k => {
    const btn = $('top-pill-' + k);
    if (!btn) return;
    if (k === activeKey) {
      btn.className = 'px-3 py-1.5 rounded-xl text-xs font-extrabold bg-gradient-to-r from-pink-500 to-rose-400 text-white shadow-sm transition flex items-center gap-1';
    } else {
      btn.className = 'px-3 py-1.5 rounded-xl text-xs font-extrabold text-pink-700 hover:bg-white/70 transition flex items-center gap-1';
    }
  });
}

window.toggleAnimalStickerDrawer = function() {
  const drawer = $('animal-sticker-drawer');
  const arrow = $('sticker-drawer-arrow');
  if (!drawer) return;
  drawer.classList.toggle('hidden');
  if (arrow) arrow.textContent = drawer.classList.contains('hidden') ? '▾' : '▴';
  if (!drawer.classList.contains('hidden')) {
    $('custom-image-studio-drawer')?.classList.add('hidden');
    if ($('custom-img-drawer-arrow')) $('custom-img-drawer-arrow').textContent = '▾';
  }
};

window.toggleCustomImageDrawer = function() {
  const drawer = $('custom-image-studio-drawer');
  const arrow = $('custom-img-drawer-arrow');
  if (!drawer) return;
  drawer.classList.toggle('hidden');
  if (arrow) arrow.textContent = drawer.classList.contains('hidden') ? '▾' : '▴';
  if (!drawer.classList.contains('hidden')) {
    $('animal-sticker-drawer')?.classList.add('hidden');
    if ($('sticker-drawer-arrow')) $('sticker-drawer-arrow').textContent = '▾';
    renderUploadedGallery();
  }
};

window.toggleSummaryDrawer = function() {
  $('quiz-summary-drawer')?.classList.toggle('hidden');
};

window.setCanvasZoom = function(scale) {
  const box = $('canvas-artboard-box');
  if (!box) return;
  box.style.transform = `scale(${scale})`;
  box.style.transformOrigin = 'top center';
};

// ===== KHO 18 MẪU GIÁO ÁN A4 ĐA CHỦ ĐỀ CHUẨN MẦM NON =====
window.A4_TEMPLATE_CATEGORIES = [
  { id: 'all', label: '🌟 Tất cả (18 mẫu)' },
  { id: 'animals', label: '🐾 Thế giới Động vật (3)' },
  { id: 'social', label: '🏫 Trường, Bản thân, Gia đình & Kỹ năng (4)' },
  { id: 'world', label: '🍎 Thực vật, Nghề nghiệp, Giao thông & Môi trường (4)' },
  { id: 'cognitive', label: '🔢 Tự nhiên, Toán, Văn học & Thẩm mỹ (4)' },
  { id: 'health_country', label: '🇻🇳 Thể chất, Quê hương & Lễ hội Tết (3)' }
];

window.A4_LESSON_TEMPLATES = [
  {
    id: 'animals_pet',
    category: 'animals',
    emoji: '🐱',
    badge: 'Thế giới Động vật',
    topic: 'Nhận biết các con vật nuôi quen thuộc trong gia đình (Mèo, Chó, Gà trống, Vịt)',
    mainTitle: 'GIÁO ÁN TỔ CHỨC HOẠT ĐỘNG KHÁM PHÁ KHOA HỌC',
    field: 'Phát triển Nhận thức & Ngôn ngữ (Khám phá Thế giới Động vật)',
    packKey: 'family_pets',
    objectives: {
      knowledge: 'Trẻ nhận biết tên gọi, tiếng kêu đặc trưng (meo meo, gâu gâu, ò ó o, cạp cạp), đặc điểm nổi bật (lông, mỏ, chân), thức ăn và lợi ích của các con vật nuôi trong gia đình.',
      skills: 'Trẻ quan sát, so sánh điểm giống và khác nhau giữa các vật nuôi; lắng nghe tiếng kêu đoán đúng tên con vật và trả lời câu hỏi rõ ràng, mạch lạc.',
      attitudes: 'Trẻ yêu quý, biết chăm sóc, cho vật nuôi ăn và giữ vệ sinh, an toàn khi tiếp xúc với vật nuôi trong nhà.'
    },
    preparation: {
      teacher: 'Trò chơi tương tác "Đố Vui Nhận Biết Con Vật" trên màn hình TV, thẻ hình Mèo, Chó, Gà trống, Vịt; loa phát tiếng kêu con vật; Phiếu bài tập A4.',
      kids: 'Mũ đội đầu hình cún con, mèo con, gà con; bút sáp màu và tâm thế hào hứng tham gia hoạt động.'
    },
    safety: '• Đảm bảo không gian lớp học thông thoáng, an toàn khi trẻ vận động bắt chước dáng đi con vật.\n• Giáo dục trẻ không trêu chọc chó, mèo lạ và rửa tay sạch sẽ sau khi chơi.',
    procedure: [
      {
        actName: '1. Hoạt động 1: Gây hứng thú - "Tiếng kêu kỳ diệu quanh nhà bé" (3 - 5 phút)',
        teacher: '• Cô cho trẻ hát và vận động bài "Gà trống, mèo con và cún con".\n• Cô phát âm thanh tiếng kêu "Meo meo", "Ò ó o", "Gâu gâu" và đố trẻ đoán xem đó là những bạn nhỏ nào.\n• Cô dẫn dắt trẻ đến thăm "Trang Trại Nhỏ Mầm Non Hòa Phước".',
        kids: '• Trẻ vui vẻ hát và nhún nhảy cùng cô.\n• Trẻ lắng nghe và hào hứng gọi tên: Con Mèo, Con Gà Trống, Con Chó ạ!'
      },
      {
        actName: '2. Hoạt động 2: Trọng tâm - Khám phá các con vật nuôi trong gia đình (12 - 15 phút)',
        teacher: '• Cô lần lượt giới thiệu hình ảnh Con Mèo, Con Chó, Con Gà Trống, Con Vịt trên màn hình và đặt câu hỏi đàm thoại:\n  + Con gì kêu "meo meo", có đôi mắt tròn và bắt chuột rất giỏi?\n  + Con gì gáy "ò ó o" đánh thức mọi người dậy mỗi sáng?\n  + Con Gà trống và Con Vịt khác nhau ở điểm nào (chân vịt có màng bơi dưới nước)?\n• Cô khái quát lợi ích của vật nuôi đối với gia đình.',
        kids: '• Trẻ quan sát kỹ hình ảnh, giơ tay phát biểu nhận xét về đặc điểm, tiếng kêu, thức ăn của từng con vật.\n• Trẻ cùng cô bắt chước tiếng kêu và dáng đi của các con vật.'
      },
      {
        actName: '3. Hoạt động 3: Trò chơi củng cố "Đố Vui & Lật Ảnh Con Vật" (5 - 7 phút)',
        teacher: '• Trò chơi 1: Cho trẻ lên màn hình chạm chọn đáp án đúng trong phần "Bé Chơi Đố Vui".\n• Trò chơi 2: Chơi "Lật Ảnh Con Vật" ghép các cặp hình giống nhau và trao phần thưởng cho bé.\n• Nhận xét giờ học, khen ngợi trẻ.',
        kids: '• Trẻ hào hứng lên tham gia trò chơi tương tác và vỗ tay cổ vũ bạn.\n• Trẻ nhận phần thưởng và thu dọn đồ dùng cùng cô.'
      }
    ],
    differentiation: '• Trẻ nhút nhát / Hòa nhập: Cô gợi mở bằng tiếng kêu rõ ràng để trẻ chỉ tay chọn đúng hình con vật.\n• Trẻ nhanh nhẹn: Khuyến khích trẻ mô tả 2-3 đặc điểm của con vật cho cả lớp đoán.',
    weather: '• Dự phòng học liệu: Sử dụng bộ thẻ tranh rời và Phiếu câu hỏi in sẵn trên giấy A4 nếu không dùng màn hình chiếu.',
    assessment: '[Đánh giá cuối ngày] Trẻ nhận biết tốt các con vật nuôi trong gia đình, phát âm rõ tiếng kêu và tích cực tham gia trò chơi.',
    weekActivities: [
      'Khám phá: Vật nuôi trong gia đình bé',
      'Văn học: Thơ "Gà trống, Mèo con và Cún con"',
      'Tạo hình: Tô màu chú Mèo con đáng yêu',
      'Âm nhạc: Hát vận động "Một con vịt"',
      'Toán: Đếm số lượng vật nuôi trong trang trại'
    ]
  },
  {
    id: 'animals_forest',
    category: 'animals',
    emoji: '🐘',
    badge: 'Thế giới Động vật',
    topic: 'Khám phá các con vật sống trong rừng xanh (Voi, Khỉ, Sư tử, Thỏ)',
    mainTitle: 'GIÁO ÁN TỔ CHỨC HOẠT ĐỘNG KHÁM PHÁ KHOA HỌC',
    field: 'Phát triển Nhận thức & Ngôn ngữ (Động vật sống trong rừng)',
    packKey: 'forest_safari',
    objectives: {
      knowledge: 'Trẻ biết tên gọi, đặc điểm nổi bật (voi có vòi dài, khỉ giỏi leo trèo thích ăn chuối, thỏ tai dài ăn cà rốt, sư tử có bờm), nơi sống và thức ăn của các con vật trong rừng.',
      skills: 'Trẻ phân biệt được động vật ăn cỏ hiền lành (Voi, Thỏ, Hươu) và động vật ăn thịt (Sư tử, Hổ); rèn kỹ năng quan sát và diễn đạt câu đầy đủ.',
      attitudes: 'Trẻ có ý thức yêu thiên nhiên, bảo vệ rừng xanh và các loài động vật hoang dã.'
    },
    preparation: {
      teacher: 'Sa bàn "Khu rừng xanh vui nhộn", bộ trò chơi Canvas động vật rừng xanh (Voi, Khỉ, Sư tử, Thỏ, Gấu trúc), nhạc bài hát "Chú voi con ở Bản Đôn".',
      kids: 'Mũ thú rừng (Thỏ trắng, Khỉ con, Voi con), thẻ lô tô các con vật sống trong rừng.'
    },
    safety: '• Nhắc trẻ khi đi tham quan vườn bách thú cùng bố mẹ phải đi cạnh người lớn, không đưa tay vào chuồng thú.',
    procedure: [
      {
        actName: '1. Hoạt động 1: Gây hứng thú - "Chuyến xe buýt thăm Rừng Xanh" (3 - 5 phút)',
        teacher: '• Cô và trẻ cùng làm đoàn tàu/chuyến xe buýt hát vang bài "Chú voi con ở Bản Đôn" đến thăm Khu rừng xanh.\n• Trò chuyện cùng trẻ về những con vật trẻ nhìn thấy trong khu rừng.',
        kids: '• Trẻ nối đuôi nhau đi thành đoàn tàu, vừa đi vừa hát vui vẻ.\n• Trẻ kể tên các con vật trong sa bàn khu rừng.'
      },
      {
        actName: '2. Hoạt động 2: Trọng tâm - Tìm hiểu Voi, Khỉ, Thỏ và Sư tử (12 - 15 phút)',
        teacher: '• Cô mở từng thẻ câu đố trên Canvas để trẻ khám phá:\n  + Con gì có cái vòi dài, tai to như quạt và thích ăn mía? (Con Voi)\n  + Con gì thích leo trèo trên cây và mê ăn quả chuối chín? (Con Khỉ)\n  + Con gì có bờm oai vệ được gọi là Chúa sơn lâm? (Sư tử)\n• Cho trẻ so sánh điểm khác nhau giữa Con Voi và Con Thỏ, phân nhóm thú ăn cỏ và thú ăn thịt.',
        kids: '• Trẻ suy nghĩ giải câu đố, quan sát hình ảnh và nêu đặc điểm từng con vật.\n• Trẻ phân biệt được nhóm con vật hiền lành và nhóm con vật hung dữ.'
      },
      {
        actName: '3. Hoạt động 3: Trò chơi "Ai đoán giỏi" & "Bắt chước dáng đi thú rừng" (5 - 7 phút)',
        teacher: '• Tổ chức cho trẻ chơi trò chơi Đố vui toàn màn hình và Lật thẻ ghép đôi các bạn thú rừng.\n• Cho trẻ vận động bắt chước chú Thỏ nhảy, chú Voi vẫy vòi, chú Khỉ leo cây.',
        kids: '• Trẻ hào hứng tham gia trò chơi trên màn hình và vận động đóng vai các chú thú rừng đáng yêu.'
      }
    ],
    differentiation: '• Trẻ nhút nhát: Cô mời trẻ lên bấm chọn hình con vật quen thuộc như Thỏ, Voi.\n• Trẻ khá giỏi: Đố trẻ kể thêm các con vật sống trong rừng khác (Hươu cao cổ, Ngựa vằn, Gấu trúc).',
    weather: '• Dự phòng: Chơi trò chơi ghép tranh khu rừng xanh ngay tại thảm lớp nếu thời tiết mưa lạnh.',
    assessment: '[Đánh giá cuối ngày] Trẻ hào hứng khám phá khu rừng xanh, nhớ rõ đặc điểm của Voi, Khỉ, Thỏ, Sư tử.',
    weekActivities: [
      'Khám phá: Các con vật sống trong rừng xanh',
      'Văn học: Truyện "Thỏ con không vâng lời"',
      'Tạo hình: Dán lá cây làm bờm chú Sư tử',
      'Âm nhạc: Hát & vận động "Chú voi con ở Bản Đôn"',
      'Thể chất: Bật nhảy như chú Thỏ trắng đi kiếm ăn'
    ]
  },
  {
    id: 'animals_water',
    category: 'animals',
    emoji: '🐠',
    badge: 'Thế giới Động vật',
    topic: 'Khám phá các con vật sống dưới nước & Côn trùng (Cá, Rùa, Tôm, Ong, Bướm)',
    mainTitle: 'GIÁO ÁN TỔ CHỨC HOẠT ĐỘNG KHÁM PHÁ KHOA HỌC',
    field: 'Phát triển Nhận thức (Động vật dưới nước & Côn trùng)',
    packKey: 'water_and_sky',
    objectives: {
      knowledge: 'Trẻ nhận biết tên gọi, môi trường sống và đặc điểm vận động của các con vật dưới nước (Cá bơi bằng vây, Rùa bò chậm có mai cứng, Cá heo thông minh) và côn trùng biết bay (Ong làm mật, Bướm nhiều màu sắc).',
      skills: 'Trẻ phân loại được nhóm con vật sống dưới nước và nhóm côn trùng/chim chóc bay trên không.',
      attitudes: 'Trẻ biết giữ gìn nguồn nước sạch, không vứt rác xuống ao hồ, biển và bảo vệ các loài côn trùng có ích như ong mật.'
    },
    preparation: {
      teacher: 'Bể cá cảnh nhỏ hoặc mô hình đại dương, bộ thẻ câu hỏi Canvas chủ đề Dưới nước & Bầu trời, nhạc bài "Cá vàng bơi" và "Chị ong nâu và em bé".',
      kids: 'Thẻ phân loại môi trường sống (Mặt nước xanh / Vườn hoa), bút màu.'
    },
    safety: '• Giáo dục trẻ không tự ý chơi gần ao, hồ, bể nước sâu khi không có người lớn và không chạm vào tổ ong.',
    procedure: [
      {
        actName: '1. Hoạt động 1: Gây hứng thú - "Vũ điệu Cá vàng bơi" (3 - 5 phút)',
        teacher: '• Cô cùng trẻ hát và làm động tác tay uốn lượn theo bài "Cá vàng bơi".\n• Trò chuyện về nơi sống của bạn Cá vàng và giới thiệu bài học mới.',
        kids: '• Trẻ hào hứng làm động tác chú cá bơi lội và trả lời câu hỏi của cô.'
      },
      {
        actName: '2. Hoạt động 2: Trọng tâm - Khám phá các bạn nhỏ dưới nước & trên bầu trời (12 - 15 phút)',
        teacher: '• Phần 1: Cho trẻ quan sát hình ảnh Cá vàng, Cá heo, Con Rùa, Con Cua và hỏi trẻ: Vì sao cá bơi được dưới nước? Con gì có 8 cẳng 2 càng?\n• Phần 2: Giới thiệu Con Ong chăm chỉ hút mật hoa và Con Bướm có đôi cánh sặc sỡ.\n• Cho trẻ phân loại: Bạn nào sống dưới nước? Bạn nào bay lượn trên vườn hoa?',
        kids: '• Trẻ quan sát, trả lời đặc điểm từng con vật và gắn thẻ con vật vào đúng môi trường sống.'
      },
      {
        actName: '3. Hoạt động 3: Trò chơi "Đưa bạn nhỏ về đúng nhà" & Đố vui trên Canvas (5 - 7 phút)',
        teacher: '• Cho trẻ chơi trò chơi Đố vui trên màn hình và trò chơi vận động "Cá bơi - Chim bay".\n• Nhận xét, tuyên dương cả lớp.',
        kids: '• Trẻ phản xạ nhanh theo hiệu lệnh của cô và tham gia giải đố sôi nổi.'
      }
    ],
    differentiation: '• Trẻ nhút nhát: Cô hướng dẫn trẻ nhận biết các con vật gần gũi như Cá, Rùa, Bướm.\n• Trẻ nhanh nhẹn: Giải thích vì sao Ong mật là côn trùng có ích.',
    weather: '• Dự phòng: Tổ chức trò chơi câu cá nam châm trong lớp học.',
    assessment: '[Đánh giá cuối ngày] Trẻ phân biệt chính xác nhóm động vật dưới nước và nhóm côn trùng biết bay.',
    weekActivities: [
      'Khám phá: Động vật dưới nước & Côn trùng',
      'Văn học: Thơ "Rong và Cá" / "Ong và Bướm"',
      'Tạo hình: In vân tay tạo hình đàn cá bơi lội',
      'Âm nhạc: Hát "Cá vàng bơi" & "Chị ong nâu"',
      'Toán: Phân loại nhóm con vật theo môi trường sống'
    ]
  },
  {
    id: 'school_friends',
    category: 'social',
    emoji: '🏫',
    badge: 'Trường Mầm Non',
    topic: 'Trường Mầm Non Hòa Phước thân yêu của bé – Lớp học, Cô giáo và Các bạn',
    mainTitle: 'GIÁO ÁN PHÁT TRIỂN TÌNH CẢM & KỸ NĂNG XÃ HỘI',
    field: 'Phát triển Tình cảm – Kỹ năng xã hội & Ngôn ngữ (Chủ đề Trường Mầm Non)',
    packKey: '',
    objectives: {
      knowledge: 'Trẻ biết tên trường (Trường Mầm Non Hòa Phước), tên lớp, tên cô giáo, tên các bạn trong lớp và các khu vực vui chơi, đồ dùng đồ chơi quen thuộc ở lớp.',
      skills: 'Trẻ biết chào hỏi lễ phép khi đến lớp, biết nói lời cảm ơn, xin lỗi và biết chia sẻ đồ chơi, đoàn kết với bạn bè.',
      attitudes: 'Trẻ yêu thích đến trường mầm non mỗi ngày, kính trọng cô giáo, yêu thương bạn bè và biết cất đồ chơi gọn gàng đúng nơi quy định.'
    },
    preparation: {
      teacher: 'Hình ảnh thực tế về Trường Mầm Non Hòa Phước, các góc chơi trong lớp; nhạc bài hát "Trường chúng cháu là trường mầm non", "Cháu đi mẫu giáo".',
      kids: 'Trang phục gọn gàng, thẻ ký hiệu cá nhân của từng bé (hình bông hoa, con vật...), đồ chơi các góc.'
    },
    safety: '• Kiểm tra an toàn các kệ đồ chơi, nhắc trẻ không xô đẩy bạn khi xếp hàng hoặc khi lấy đồ chơi ở các góc.',
    procedure: [
      {
        actName: '1. Hoạt động 1: Gây hứng thú - "Bé vui đến Trường Mầm Non Hòa Phước" (3 - 5 phút)',
        teacher: '• Cô bắt nhịp cho cả lớp hát và vỗ tay theo bài hát "Trường chúng cháu là trường mầm non".\n• Trò chuyện cùng trẻ: Sáng nay ai đưa bé đi học? Trường của chúng mình tên là gì?',
        kids: '• Trẻ hát tươi vui và đồng thanh trả lời: Trường Mầm Non Hòa Phước ạ!'
      },
      {
        actName: '2. Hoạt động 2: Trọng tâm - Tìm hiểu Lớp học, Cô giáo và Các bạn (12 - 15 phút)',
        teacher: '• Cô cho trẻ xem hình ảnh cổng trường, sân chơi cầu trượt, các góc hoạt động trong lớp:\n  + Ở lớp ai là người dạy dỗ, chăm sóc bữa ăn giấc ngủ cho các con?\n  + Khi đến lớp gặp cô giáo và các bạn, con làm gì?\n  + Khi chơi đồ chơi cùng bạn, chúng mình cần chơi như thế nào?\n• Mời 2-3 trẻ lên giới thiệu tên mình và ôm người bạn thân của mình.',
        kids: '• Trẻ trả lời các câu hỏi của cô về công việc của cô giáo và nội quy lớp học.\n• Trẻ tự tin giới thiệu tên mình, tên bạn và thực hành khoanh tay chào cô, nói lời cảm ơn bạn.'
      },
      {
        actName: '3. Hoạt động 3: Trò chơi "Tìm bạn thân" & "Thi ai cất đồ chơi khéo" (5 - 7 phút)',
        teacher: '• Tổ chức trò chơi vận động tập thể "Tìm bạn thân" theo nhạc.\n• Tổ chức thi đua phân loại và cất đồ chơi về đúng góc quy định trong lớp.',
        kids: '• Trẻ nắm tay bạn nhảy múa vui vẻ và hào hứng cất đồ chơi gọn gàng đúng kệ.'
      }
    ],
    differentiation: '• Trẻ mới đi học / Nhút nhát: Cô nắm tay trẻ, khích lệ các bạn vỗ tay chào đón để trẻ cảm thấy ấm áp, an toàn.\n• Trẻ mạnh dạn: Giao nhiệm vụ làm "Tổ trưởng nhí" hướng dẫn bạn xếp đồ chơi.',
    weather: '• Dự phòng: Tham quan trực tiếp trên sa bàn hoặc qua album ảnh lớp học nếu trời mưa không ra sân trường được.',
    assessment: '[Đánh giá cuối ngày] Trẻ vui vẻ, nhớ tên trường Mầm Non Hòa Phước, biết chào hỏi lễ phép và chơi đoàn kết cùng bạn.',
    weekActivities: [
      'Khám phá: Trường Mầm Non Hòa Phước thân yêu',
      'Văn học: Thơ "Bạn mới" & Truyện "Đôi bạn tốt"',
      'Tạo hình: Tô màu tranh ngôi trường & đồ chơi của bé',
      'Âm nhạc: Hát "Vui đến trường" & "Cô giáo miền xuôi"',
      'Kỹ năng sống: Thực hành xếp dép & cất đồ chơi đúng nơi'
    ]
  },
  {
    id: 'myself_senses',
    category: 'social',
    emoji: '👶',
    badge: 'Bản Thân Bé',
    topic: 'Khám phá cơ thể đáng yêu của bé & 5 Giác quan kỳ diệu',
    mainTitle: 'GIÁO ÁN TỔ CHỨC HOẠT ĐỘNG KHÁM PHÁ',
    field: 'Phát triển Nhận thức & Thể chất (Chủ đề Bản thân)',
    packKey: '',
    objectives: {
      knowledge: 'Trẻ biết tên gọi, vị trí và chức năng của các bộ phận trên cơ thể cùng 5 giác quan: Mắt để nhìn (thị giác), Tai để nghe (thính giác), Mũi để ngửi (khứu giác), Lưỡi để nếm (vị giác), Đôi bàn tay để sờ/cầm nắm (xúc giác).',
      skills: 'Trẻ sử dụng phối hợp các giác quan để khám phá đồ vật (nghe âm thanh, ngửi hương thơm, nếm vị ngọt/chua, sờ nhẵn/sần) và biết cách vệ sinh cá nhân.',
      attitudes: 'Trẻ yêu quý cơ thể mình, có thói quen giữ vệ sinh thân thể sạch sẽ (rửa tay bằng xà phòng, đánh răng, không dụi tay bẩn lên mắt).'
    },
    preparation: {
      teacher: 'Tranh em bé ngộ nghĩnh, hộp quà bí mật chứa quả cam thơm, xúc xắc phát nhạc, bông gòn mềm, đường/chanh để trẻ trải nghiệm 5 giác quan.',
      kids: 'Tâm thế vui vẻ, khăn lau tay sạch sẽ.'
    },
    safety: '• Đảm bảo thực phẩm nếm thử hoàn toàn sạch sẽ, an toàn vệ sinh thực phẩm.\n• Nhắc trẻ tuyệt đối không nhét hạt nhỏ hay đồ chơi vào mũi, tai, miệng.',
    procedure: [
      {
        actName: '1. Hoạt động 1: Gây hứng thú - Trò chơi "Hãy làm theo cô" (3 - 5 phút)',
        teacher: '• Cô cùng trẻ hát bài "Ồ sao bé không lắc" và chơi trò chơi chỉ nhanh các bộ phận: "Mắt xinh đâu là mắt xinh đâu? Đôi tai thính đâu là đôi tai thính đâu?".',
        kids: '• Trẻ vừa hát vừa chỉ đúng vào mắt, mũi, miệng, tai, đôi bàn tay của mình.'
      },
      {
        actName: '2. Hoạt động 2: Trọng tâm - Trải nghiệm 5 Giác quan kỳ diệu của bé (12 - 15 phút)',
        teacher: '• Cô tổ chức 4 trạm trải nghiệm nhỏ cho trẻ:\n  + Trạm 1 (Thị giác & Thính giác): Nhìn màu sắc chiếc hộp và lắc nghe tiếng chuông kêu.\n  + Trạm 2 (Khứu giác): Nhắm mắt ngửi mùi thơm của quả cam/hoa bưởi rồi đoán xem bộ phận nào giúp bé ngửi được?\n  + Trạm 3 (Xúc giác): Đưa tay vào chiếc túi bí mật sờ quả bóng nhẵn và quả dứa sần sùi.\n• Giáo dục trẻ cách bảo vệ mắt, tai, mũi, răng miệng và quy tắc 5 ngón tay bảo vệ bản thân.',
        kids: '• Trẻ hào hứng tham gia trải nghiệm bằng mắt, tai, mũi, tay.\n• Trẻ trả lời đúng chức năng của từng giác quan và hứa giữ vệ sinh cơ thể sạch sẽ.'
      },
      {
        actName: '3. Hoạt động 3: Trò chơi "Chiếc túi kỳ diệu" & Vũ điệu rửa tay 6 bước (5 - 7 phút)',
        teacher: '• Mời trẻ lên nhắm mắt sờ đồ vật hoặc ngửi hương thơm để đoán tên đồ vật.\n• Cả lớp cùng vận động theo nhạc "Vũ điệu rửa tay".',
        kids: '• Trẻ đoán đúng tên đồ vật qua giác quan và thực hành các động tác rửa tay sạch sẽ.'
      }
    ],
    differentiation: '• Trẻ nhỏ / Hòa nhập: Cô hỗ trợ trẻ chỉ đúng Mắt, Mũi, Miệng, Tai, Tay, Chân.\n• Trẻ lớn: Trẻ giải thích được cách xử lý khi có bụi bay vào mắt hoặc khi tay bị bẩn.',
    weather: '• Dự phòng: Chuẩn bị khăn ấm lau tay cho trẻ ngay sau phần trải nghiệm xúc giác.',
    assessment: '[Đánh giá cuối ngày] Trẻ nhận biết chính xác 5 giác quan và rất thích hoạt động "Chiếc túi kỳ diệu".',
    weekActivities: [
      'Khám phá: Cơ thể bé & 5 giác quan kỳ diệu',
      'Văn học: Thơ "Đôi mắt của em" & "Cái lưỡi"',
      'Tạo hình: In hình bàn tay xinh của bé và trang trí',
      'Âm nhạc: Hát vận động "Ồ sao bé không lắc"',
      'Thể chất: Tập bài phát triển chung & Rửa tay 6 bước'
    ]
  },
  {
    id: 'happy_family',
    category: 'social',
    emoji: '👨‍👩‍👧‍👦',
    badge: 'Gia Đình',
    topic: 'Ngôi nhà hạnh phúc & Những người thân yêu trong gia đình của bé',
    mainTitle: 'GIÁO ÁN PHÁT TRIỂN NHẬN THỨC & TÌNH CẢM XÃ HỘI',
    field: 'Phát triển Tình cảm – Kỹ năng xã hội & Ngôn ngữ (Chủ đề Gia đình)',
    packKey: '',
    objectives: {
      knowledge: 'Trẻ biết họ tên của bố, mẹ, anh chị em trong gia đình; biết công việc hằng ngày, sự quan tâm yêu thương của ông bà, bố mẹ dành cho bé và địa chỉ/đặc điểm ngôi nhà của mình.',
      skills: 'Trẻ kể được về gia đình mình bằng câu trọn vẹn, biết phân biệt gia đình ít con và gia đình nhiều thế hệ.',
      attitudes: 'Trẻ yêu thương, kính trọng ông bà, bố mẹ; biết vâng lời và giúp đỡ bố mẹ những việc nhỏ vừa sức (lấy tăm, cất đồ chơi, gấp quần áo).'
    },
    preparation: {
      teacher: 'Tranh ảnh "Gia đình hạnh phúc", mô hình ngôi nhà ấm áp, nhạc bài hát "Cả nhà thương nhau", "Ba ngọn nến lung linh".',
      kids: 'Ảnh chụp gia đình của bé (nếu có), khung tranh giấy màu để trang trí tặng bố mẹ.'
    },
    safety: '• Giáo dục trẻ an toàn khi ở nhà: Không tự ý cắm ổ điện, không chạm vào nước sôi trong bếp và không mở cửa cho người lạ.',
    procedure: [
      {
        actName: '1. Hoạt động 1: Gây hứng thú - Hát "Cả nhà thương nhau" (3 - 5 phút)',
        teacher: '• Cô và trẻ cùng hát vang bài hát "Cả nhà thương nhau".\n• Trò chuyện: Bài hát nhắc đến ai? Ở nhà ai yêu thương các con nhất?',
        kids: '• Trẻ hát tình cảm và hào hứng kể về bố, mẹ, ông, bà của mình.'
      },
      {
        actName: '2. Hoạt động 2: Trọng tâm - Trò chuyện về những người thân yêu trong gia đình (12 - 15 phút)',
        teacher: '• Cô trình chiếu bức tranh gia đình ấm cúng và đàm thoại cùng trẻ:\n  + Trong gia đình con có những ai? Bố mẹ tên là gì?\n  + Hằng ngày bố mẹ làm những công việc gì để chăm sóc con?\n  + Khi ông bà, bố mẹ đi làm về mệt, bé làm gì để bố mẹ vui lòng?\n• Mời 3-4 trẻ cầm bức ảnh gia đình lên kể cho cô và các bạn nghe về gia đình mình.',
        kids: '• Trẻ chăm chú quan sát và trả lời câu hỏi của cô.\n• Trẻ tự hào giới thiệu các thành viên trong gia đình và nói lời yêu thương dành cho ông bà, bố mẹ.'
      },
      {
        actName: '3. Hoạt động 3: Trò chơi "Gia đình sum họp" & "Bé khéo tay giúp mẹ" (5 - 7 phút)',
        teacher: '• Trò chơi 1: "Tìm đúng ngôi nhà" — trẻ kết nhóm tạo thành gia đình 3 người, 4 người theo hiệu lệnh.\n• Trò chơi 2: Thi phân loại đồ dùng phòng khách và đồ dùng phòng bếp giúp mẹ.',
        kids: '• Trẻ chạy nhanh về các ngôi nhà theo hiệu lệnh và chọn đúng đồ dùng gia đình.'
      }
    ],
    differentiation: '• Trẻ nhút nhát: Cô đặt câu hỏi ngắn gọn về tên bố, tên mẹ để trẻ dễ trả lời.\n• Trẻ mạnh dạn: Khuyến khích trẻ đọc thêm bài thơ "Thăm nhà bà" hoặc "Yêu mẹ".',
    weather: '• Dự phòng: Tổ chức đóng kịch phân vai "Gia đình của bé" ngay tại góc phân vai trong lớp.',
    assessment: '[Đánh giá cuối ngày] Trẻ kể được tên các thành viên trong gia đình, thể hiện tình cảm yêu thương ông bà, bố mẹ.',
    weekActivities: [
      'Khám phá: Những người thân yêu trong gia đình bé',
      'Văn học: Thơ "Yêu mẹ" & Truyện "Tích Chu"',
      'Tạo hình: Dán hình ngôi nhà hạnh phúc của bé',
      'Âm nhạc: Hát vận động "Cả nhà thương nhau"',
      'Toán: Phân loại đồ dùng trong gia đình theo công dụng'
    ]
  },
  {
    id: 'plants_fruits',
    category: 'world',
    emoji: '🍎',
    badge: 'Thế giới Thực vật',
    topic: 'Nhận biết một số loại quả ngọt và hoa đẹp quanh bé (Quả Cam, Quả Chuối, Quả Táo, Hoa Hồng)',
    mainTitle: 'GIÁO ÁN TỔ CHỨC HOẠT ĐỘNG KHÁM PHÁ KHOA HỌC',
    field: 'Phát triển Nhận thức (Khám phá Thế giới Thực vật)',
    packKey: '',
    objectives: {
      knowledge: 'Trẻ nhận biết tên gọi, màu sắc, hình dạng (tròn/dài), đặc điểm vỏ (nhẵn/sần), hạt và mùi vị của một số loại quả quen thuộc (Cam, Chuối, Táo, Xoài) cùng vẻ đẹp của các loài hoa.',
      skills: 'Trẻ biết phân loại quả theo đặc điểm (quả 1 hạt / nhiều hạt, vỏ nhẵn / vỏ sần) và biết quy trình rửa quả, bóc vỏ trước khi ăn.',
      attitudes: 'Trẻ thích ăn nhiều rau củ quả để cơ thể khỏe mạnh, cao lớn; biết chăm sóc cây xanh và không bứt lá, bẻ cành.'
    },
    preparation: {
      teacher: 'Giỏ quả thật (hoặc mô hình đẹp): Quả cam, quả chuối chín vàng, quả táo đỏ, quả thanh long; đĩa đựng, khăn ướt; nhạc bài "Quả gì?".',
      kids: 'Thẻ lô tô các loại hoa quả, rổ phân loại màu hồng và màu xanh.'
    },
    safety: '• Các loại quả dùng cho trẻ quan sát và nếm thử được rửa sạch, gọt sẵn bỏ hạt để tránh hóc hạt cho trẻ.',
    procedure: [
      {
        actName: '1. Hoạt động 1: Gây hứng thú - "Giỏ quà mùa xuân của Cô" (3 - 5 phút)',
        teacher: '• Cô cùng trẻ hát bài "Quả gì?" và mang ra "Giỏ quà bí mật" phủ khăn lụa.\n• Mời trẻ lên thò tay đoán tên các loại quả trong giỏ.',
        kids: '• Trẻ hát vui vẻ và hồi hộp đoán tên các loại quả trong giỏ quà của cô.'
      },
      {
        actName: '2. Hoạt động 2: Trọng tâm - Khám phá Quả Cam, Quả Chuối, Quả Táo (12 - 15 phút)',
        teacher: '• Cô lần lượt cho trẻ quan sát, sờ vỏ và ngửi hương thơm từng loại quả:\n  + Quả Cam có dạng hình gì? Vỏ cam nhẵn hay sần? Bên trong quả cam có gì (nhiều múi, nhiều tép và hạt)?\n  + Quả Chuối có hình dáng như thế nào (cong dài), khi chín vỏ màu gì?\n  + So sánh điểm giống và khác nhau giữa Quả Cam và Quả Chuối.\n• Giáo dục trẻ ăn nhiều trái cây bổ sung Vitamin C và bỏ vỏ vào thùng rác.',
        kids: '• Trẻ sờ vỏ quả, ngửi mùi thơm, trả lời câu hỏi về hình dáng, màu sắc, mùi vị.\n• Trẻ nếm thử múi cam ngọt mát và nói lời cảm ơn cô.'
      },
      {
        actName: '3. Hoạt động 3: Trò chơi "Đi siêu thị mua quả" & "Phân loại quả" (5 - 7 phút)',
        teacher: '• Chia lớp làm 2 đội thi đua chọn quả theo yêu cầu của cô (Đội 1 chọn quả dạng tròn, Đội 2 chọn quả dạng dài / nhiều hạt).\n• Kiểm tra kết quả và tuyên dương cả hai đội.',
        kids: '• Trẻ hào hứng bật qua vòng lên chọn đúng loại quả về giỏ của đội mình.'
      }
    ],
    differentiation: '• Trẻ nhỏ: Nhận biết đúng tên và màu sắc của Cam, Chuối, Táo.\n• Trẻ lớn: Phân biệt được quả 1 hạt (Xoài, Nhãn) và quả nhiều hạt (Cam, Dưa hấu, Thanh long).',
    weather: '• Dự phòng: Bổ sung hoạt động gieo hạt đậu nhỏ vào cốc bông ẩm ở góc thiên nhiên của lớp.',
    assessment: '[Đánh giá cuối ngày] Trẻ phân biệt rõ tên gọi, màu sắc, mùi vị các loại quả và hào hứng nếm thử.',
    weekActivities: [
      'Khám phá: Một số loại quả ngọt quanh bé',
      'Văn học: Thơ "Ăn quả" & Truyện "Cây táo thần"',
      'Tạo hình: Nặn chùm nho / Tô màu giỏ trái cây',
      'Âm nhạc: Hát vận động "Quả gì?" & "Màu hoa"',
      'Hoạt động góc: Cửa hàng bán hoa quả tươi sạch'
    ]
  },
  {
    id: 'jobs_careers',
    category: 'world',
    emoji: '🚒',
    badge: 'Nghề Nghiệp',
    topic: 'Tìm hiểu một số nghề phổ biến trong xã hội (Cô giáo, Bác sĩ, Lính cứu hỏa, Đầu bếp)',
    mainTitle: 'GIÁO ÁN TỔ CHỨC HOẠT ĐỘNG KHÁM PHÁ XÃ HỘI',
    field: 'Phát triển Nhận thức & Kỹ năng xã hội (Chủ đề Nghề nghiệp)',
    packKey: '',
    objectives: {
      knowledge: 'Trẻ biết tên gọi, trang phục, dụng cụ làm việc và sản phẩm/ý nghĩa của các nghề quen thuộc: Nghề Giáo viên, Nghề Bác sĩ, Nghề Lính cứu hỏa, Nghề Đầu bếp, Nghề Xây dựng.',
      skills: 'Trẻ chọn đúng dụng cụ tương ứng với từng nghề (ống nghe của Bác sĩ, phấn bảng của Cô giáo, vòi rồng của Lính cứu hỏa, nồi chảo của Đầu bếp) và diễn đạt ước mơ của bản thân.',
      attitudes: 'Trẻ biết quý trọng người lao động ở mọi ngành nghề và giữ gìn sản phẩm lao động (không bỏ thừa thức ăn, giữ quần áo sạch đẹp).'
    },
    preparation: {
      teacher: 'Trang phục đóng vai (Áo blouse Bác sĩ, mũ Đầu bếp, mũ Lính cứu hỏa), bộ đồ dùng các nghề, thẻ hình nghề nghiệp.',
      kids: 'Thẻ ghép đôi "Nghề nghiệp – Dụng cụ", tâm thế hào hứng đóng vai.'
    },
    safety: '• Giáo dục trẻ không nghịch các dụng cụ sắc nhọn của người lớn (kéo, dao làm bếp, kim tiêm) và nhớ số điện thoại cứu hỏa 114, cấp cứu 115.',
    procedure: [
      {
        actName: '1. Hoạt động 1: Gây hứng thú - "Trình diễn thời trang Nghề nghiệp tí hon" (3 - 5 phút)',
        teacher: '• Cô mời 3-4 bạn nhỏ mặc trang phục Bác sĩ, Đầu bếp, Chú Lính cứu hỏa bước ra trên nền nhạc bài "Lớn lên cháu lái máy cày".\n• Đố cả lớp đoán xem các bạn đang hóa trang làm nghề gì.',
        kids: '• Trẻ vỗ tay reo hò và gọi tên đúng các nghề nghiệp của bạn.'
      },
      {
        actName: '2. Hoạt động 2: Trọng tâm - Khám phá công việc và dụng cụ của các nghề (12 - 15 phút)',
        teacher: '• Cô cùng trẻ tìm hiểu từng nghề:\n  + Bác sĩ mặc áo màu gì, dùng dụng cụ gì để khám chữa bệnh cho mọi người?\n  + Chú Lính cứu hỏa làm nhiệm vụ gì khi có đám cháy? Xe cứu hỏa có màu gì?\n  + Cô giáo và Cô cấp dưỡng ở trường làm những công việc gì mỗi ngày?\n• Hỏi trẻ: "Lớn lên con ước mơ làm nghề gì? Vì sao?".',
        kids: '• Trẻ trả lời đặc điểm trang phục, dụng cụ và lợi ích của từng nghề.\n• Trẻ hào hứng chia sẻ ước mơ khi lớn lên của mình.'
      },
      {
        actName: '3. Hoạt động 3: Trò chơi "Chọn đúng dụng cụ cho các cô chú công nhân" (5 - 7 phút)',
        teacher: '• Tổ chức trò chơi ghép thẻ: Gắn dụng cụ làm việc về đúng bảng của Bác sĩ, Cô giáo, Đầu bếp, Thợ xây.\n• Nhận xét, khen ngợi và chuyển tiếp sang hoạt động góc phân vai.',
        kids: '• Trẻ lên gắn đúng thẻ dụng cụ cho từng nghề và tập đóng vai bác sĩ, đầu bếp.'
      }
    ],
    differentiation: '• Trẻ nhút nhát: Cô mời trẻ chọn dụng cụ quen thuộc như ống nghe bác sĩ, muôi nấu ăn.\n• Trẻ nhanh nhẹn: Trẻ kể được quy trình khám bệnh hoặc nấu món ăn đơn giản.',
    weather: '• Dự phòng: Tổ chức trải nghiệm "Bé tập làm đầu bếp nhí" (pha nước cam / bày đĩa hoa quả) ngay trong lớp.',
    assessment: '[Đánh giá cuối ngày] Trẻ nhận biết tốt các nghề và dụng cụ đặc trưng, rất thích phần hóa trang nghề nghiệp.',
    weekActivities: [
      'Khám phá: Các nghề phổ biến quanh bé',
      'Văn học: Thơ "Làm bác sĩ" & "Bé làm bao nhiêu nghề"',
      'Tạo hình: Trang trí chiếc mũ Đầu bếp / Túi khám bệnh',
      'Âm nhạc: Hát "Cháu yêu cô chú công nhân"',
      'Hoạt động góc: Phòng khám Đa khoa & Siêu đầu bếp nhí'
    ]
  },
  {
    id: 'traffic_safety',
    category: 'world',
    emoji: '🚦',
    badge: 'Giao Thông',
    topic: 'Nhận biết các phương tiện giao thông & Tín hiệu đèn Đỏ - Vàng - Xanh',
    mainTitle: 'GIÁO ÁN KHÁM PHÁ & GIÁO DỤC AN TOÀN GIAO THÔNG',
    field: 'Phát triển Nhận thức & Kỹ năng sống (Chủ đề Giao thông)',
    packKey: '',
    objectives: {
      knowledge: 'Trẻ nhận biết các phương tiện giao thông đường bộ (Xe đạp, Xe máy, Ô tô, Xe buýt), đường thủy (Tàu thủy, Thuyền buồm), đường hàng không (Máy bay) và ý nghĩa 3 màu đèn giao thông: Đèn Đỏ dừng lại, Đèn Vàng đi chậm, Đèn Xanh được đi.',
      skills: 'Trẻ phân loại được phương tiện theo nơi hoạt động và thực hành đúng hiệu lệnh tín hiệu đèn giao thông.',
      attitudes: 'Trẻ có ý thức chấp hành an toàn giao thông: Đội mũ bảo hiểm khi ngồi trên xe máy, cài dây an toàn trên ô tô, không thò đầu/tay ra ngoài cửa xe.'
    },
    preparation: {
      teacher: 'Mô hình cột đèn tín hiệu giao thông (Đỏ - Vàng - Xanh), tranh các phương tiện giao thông, mũ bảo hiểm trẻ em, nhạc bài "Em đi qua ngã tư đường phố".',
      kids: 'Vô lăng đồ chơi bằng bìa cứng, thẻ hình đèn Đỏ - Vàng - Xanh.'
    },
    safety: '• Đảm bảo sân chơi/lớp học rộng rãi để trẻ không va chạm vào nhau khi chơi trò chơi "Ô tô và tín hiệu đèn".',
    procedure: [
      {
        actName: '1. Hoạt động 1: Gây hứng thú - Hát "Em đi qua ngã tư đường phố" (3 - 5 phút)',
        teacher: '• Cô bật nhạc bài hát "Em đi qua ngã tư đường phố", cô cầm bảng tín hiệu đèn giao thông điều khiển đoàn xe của lớp.\n• Trò chuyện: Hằng ngày bố mẹ chở con đi học bằng phương tiện gì?',
        kids: '• Trẻ vừa hát vừa làm bác tài xế lái xe, dừng lại khi cô giơ đèn đỏ.'
      },
      {
        actName: '2. Hoạt động 2: Trọng tâm - Khám phá phương tiện & Quy tắc an toàn giao thông (12 - 15 phút)',
        teacher: '• Cô giới thiệu các nhóm phương tiện:\n  + Đường bộ: Xe đạp (2 bánh, đạp bằng chân), Xe máy, Ô tô (tiếng còi bim bim).\n  + Đường thủy: Tàu thuyền bơi trên mặt nước.\n  + Đường hàng không: Máy bay bay trên bầu trời.\n• Hướng dẫn trẻ quy tắc đèn tín hiệu Đỏ - Vàng - Xanh và thực hành đội mũ bảo hiểm đúng cách (cài quai mũ vừa vặn).',
        kids: '• Trẻ gọi tên, bắt chước tiếng còi xe, tiếng động cơ và phân loại nơi chạy của từng phương tiện.\n• Trẻ lên thực hành đội mũ bảo hiểm an toàn cùng cô.'
      },
      {
        actName: '3. Hoạt động 3: Trò chơi vận động "Tài xế tí hon tuân thủ đèn hiệu" (5 - 7 phút)',
        teacher: '• Phát vô lăng cho trẻ làm tài xế lái xe quanh sa bàn ngã tư đường phố, nhìn đèn tín hiệu của cô Cảnh sát giao thông để đi nhanh, đi chậm hoặc dừng đúng vạch.',
        kids: '• Trẻ phản xạ nhanh, dừng xe ngay ngắn trước vạch trắng khi đèn đỏ bật lên.'
      }
    ],
    differentiation: '• Trẻ nhỏ: Nhận biết Ô tô, Xe máy, Máy bay và 3 màu đèn Đỏ - Vàng - Xanh.\n• Trẻ lớn: Phân biệt được 4 loại hình đường giao thông (đường bộ, đường sắt, đường thủy, đường hàng không).',
    weather: '• Dự phòng: Kẻ vạch ngã tư đường phố bằng băng dính màu ngay trên sàn lớp học nếu trời mưa.',
    assessment: '[Đánh giá cuối ngày] 100% trẻ nhớ ý nghĩa đèn Đỏ - Vàng - Xanh và biết đội mũ bảo hiểm khi ngồi xe máy.',
    weekActivities: [
      'Khám phá: Phương tiện & Đèn tín hiệu giao thông',
      'Văn học: Thơ "Đèn giao thông" & "Cô dạy con"',
      'Tạo hình: Dán hình chiếc Ô tô / Thuyền buồm trên biển',
      'Âm nhạc: Hát "Em đi qua ngã tư đường phố"',
      'Kỹ năng sống: Thực hành đội mũ bảo hiểm & Qua đường cùng người lớn'
    ]
  },
  {
    id: 'nature_water',
    category: 'cognitive',
    emoji: '🌧️',
    badge: 'Tự Nhiên & Nước',
    topic: 'Sự kỳ diệu của Nước – Khám phá thời tiết Nắng, Mưa, Ngày và Đêm',
    mainTitle: 'GIÁO ÁN TỔ CHỨC HOẠT ĐỘNG KHÁM PHÁ KHOA HỌC',
    field: 'Phát triển Nhận thức (Khám phá Nước & Hiện tượng tự nhiên)',
    packKey: '',
    objectives: {
      knowledge: 'Trẻ nhận biết đặc điểm của nước sạch (trong suốt, không màu, không mùi, không vị, hòa tan được đường/muối) và các hiện tượng thời tiết quen thuộc (Trời nắng có ông mặt trời, Trời mưa có mây đen và hạt mưa, Ban ngày và Ban đêm).',
      skills: 'Trẻ được trực tiếp làm thí nghiệm nhỏ với nước (pha màu nước, thả vật chìm – vật nổi) và biết chọn trang phục phù hợp theo thời tiết (đội mũ khi trời nắng, mặc áo mưa/che ô khi trời mưa).',
      attitudes: 'Trẻ biết tiết kiệm nước sạch (khóa vòi nước sau khi rửa tay), uống đủ nước ấm mỗi ngày và bảo vệ môi trường.'
    },
    preparation: {
      teacher: '3 cốc nhựa trong suốt đựng nước lọc, thìa nhỏ, đường/muối, màu thực phẩm an toàn, chậu nước thử nghiệm vật chìm (viên sỏi) – vật nổi (chiếc lá, bóng nhựa).',
      kids: 'Tạp dề chống thấm, khăn lau tay, thẻ hình trang phục ngày nắng và ngày mưa.'
    },
    safety: '• Nhắc trẻ không làm đổ nước ra sàn gây trơn trượt và chỉ uống nước đun sôi để nguội ở bình nước của lớp.',
    procedure: [
      {
        actName: '1. Hoạt động 1: Gây hứng thú - Giải câu đố về Giọt Nước & Cơn Mưa (3 - 5 phút)',
        teacher: '• Cô cùng trẻ hát bài "Cho tôi đi làm mưa với".\n• Cô đố trẻ: "Khi rửa tay, khi tắm mát hay khi khát, chúng mình cần đến cái gì nhỉ?".',
        kids: '• Trẻ hát vui tươi và trả lời: Cần Nước sạch ạ!'
      },
      {
        actName: '2. Hoạt động 2: Trọng tâm - Thí nghiệm vui "Bí mật của Giọt Nước" & Thời tiết (12 - 15 phút)',
        teacher: '• Thí nghiệm 1: Cho trẻ quan sát cốc nước trắng, nhìn viên bi dưới đáy cốc, ngửi và nếm thử để rút ra kết luận: Nước không màu, không mùi, không vị.\n• Thí nghiệm 2: Cho trẻ khuấy đường/màu nước để thấy nước hòa tan được một số chất.\n• Trò chuyện về thời tiết: Trời nắng và Trời mưa khác nhau thế nào? Khi đi học trời nắng/mưa bé cần mang theo gì?',
        kids: '• Trẻ chăm chú quan sát và trực tiếp khuấy cốc nước thí nghiệm cùng cô.\n• Trẻ nêu lợi ích của nước đối với con người, cây cối, con vật và cách chọn mũ, áo mưa phù hợp.'
      },
      {
        actName: '3. Hoạt động 3: Trò chơi "Vật chìm – Vật nổi" & "Chọn trang phục theo mùa" (5 - 7 phút)',
        teacher: '• Cho trẻ dự đoán và thả chiếc lá, quả bóng nhựa, viên sỏi vào chậu nước xem vật nào nổi, vật nào chìm.\n• Chơi trò chơi chọn đúng trang phục cho bạn nhỏ khi trời nắng và trời mưa.',
        kids: '• Trẻ hào hứng thả đồ vật vào nước, reo lên khi đoán đúng vật chìm – vật nổi.'
      }
    ],
    differentiation: '• Trẻ nhỏ: Nhận biết nước dùng để uống, rửa tay, tưới cây và phân biệt trời nắng – trời mưa.\n• Trẻ lớn: Giải thích được vòng tuần hoàn đơn giản của mây – mưa.',
    weather: '• Dự phòng: Chuẩn bị khăn khô lau sàn ngay nếu có nước vương ra ngoài bàn thí nghiệm.',
    assessment: '[Đánh giá cuối ngày] Trẻ vô cùng thích thú với thí nghiệm nước và có ý thức vặn nhỏ vòi nước khi rửa tay.',
    weekActivities: [
      'Khám phá: Sự kỳ diệu của Nước & Thời tiết Nắng - Mưa',
      'Văn học: Truyện "Giọt nước tí xíu" & Thơ "Cầu vồng"',
      'Tạo hình: Vẽ ông Mặt trời & Đám mây mưa sắc màu',
      'Âm nhạc: Hát vận động "Cho tôi đi làm mưa với"',
      'Kỹ năng sống: Tiết kiệm nước sạch & Giữ ấm cơ thể'
    ]
  },
  {
    id: 'math_shapes',
    category: 'cognitive',
    emoji: '🔢',
    badge: 'Làm Quen Với Toán',
    topic: 'Đếm đến 5, nhận biết số lượng và phân biệt Hình Tròn – Hình Vuông – Hình Tam Giác',
    mainTitle: 'GIÁO ÁN TỔ CHỨC HOẠT ĐỘNG LÀM QUEN VỚI TOÁN',
    field: 'Phát triển Nhận thức (Làm quen với Biểu tượng Toán sơ đẳng)',
    packKey: '',
    objectives: {
      knowledge: 'Trẻ biết đếm đến 5 trên đối tượng trong phạm vi 5, nhận biết chữ số tương ứng và phân biệt rõ đặc điểm của Hình Tròn (lăn được, đường bao cong), Hình Vuông (4 cạnh bằng nhau, 4 góc), Hình Tam Giác (3 cạnh, 3 góc).',
      skills: 'Trẻ xếp tương ứng 1-1, đếm từ trái sang phải và chỉ tay đúng từng đối tượng; biết ghép các hình học cơ bản tạo thành ngôi nhà, đoàn tàu, bông hoa.',
      attitudes: 'Trẻ hứng thú với giờ học Toán, rèn tính cẩn thận, tập trung chú ý và biết cất đồ dùng toán học vào rổ gọn gàng.'
    },
    preparation: {
      teacher: 'Bộ thẻ số từ 1 đến 5 cỡ lớn, các hình học phẳng màu sắc tươi sáng (Hình Tròn, Hình Vuông, Hình Tam Giác), bảng từ và các chú thỏ/củ cà rốt gắn nam châm.',
      kids: 'Mỗi trẻ 1 rổ đồ dùng gồm: 5 chú thỏ, 5 củ cà rốt, bộ thẻ số 1-5 và các mảnh ghép hình học.'
    },
    safety: '• Các hình học bằng nhựa/bìa cứng được bo tròn góc cạnh mềm mại, an toàn cho tay trẻ.',
    procedure: [
      {
        actName: '1. Hoạt động 1: Ôn luyện - Trò chơi "Vỗ tay theo số lượng" (3 - 5 phút)',
        teacher: '• Cô giơ thẻ chấm tròn hoặc thẻ hình các con vật, mời trẻ đếm to và vỗ tay/dậm chân đúng số lượng tương ứng.',
        kids: '• Trẻ quan sát nhanh, đếm to và vỗ tay chính xác theo yêu cầu của cô.'
      },
      {
        actName: '2. Hoạt động 2: Trọng tâm - Đếm trong phạm vi 5 & Khám phá Hình học (12 - 15 phút)',
        teacher: '• Phần 1 (Số lượng): Cô hướng dẫn trẻ xếp tất cả các bạn Thỏ trong rổ ra thành hàng ngang từ trái sang phải, sau đó tặng cho mỗi bạn Thỏ 1 củ Cà rốt. Cùng trẻ đếm từ 1 đến 5 và đặt thẻ số tương ứng.\n• Phần 2 (Hình học): Cho trẻ cầm Hình Tròn và Hình Vuông lăn thử trên mặt bàn:\n  + Vì sao Hình Tròn lăn được còn Hình Vuông và Hình Tam Giác không lăn được?\n  + Đếm số cạnh của Hình Tam Giác (3 cạnh) và Hình Vuông (4 cạnh).',
        kids: '• Trẻ xếp tương ứng 1-1 trên bảng con của mình, chỉ tay đếm to từ trái sang phải "1, 2, 3, 4, 5 — tất cả có 5 bạn Thỏ".\n• Trẻ lăn thử các hình và trả lời đặc điểm đường bao cong / các cạnh thẳng.'
      },
      {
        actName: '3. Hoạt động 3: Trò chơi "Bé ghép hình sáng tạo" & "Tìm đúng nhà số" (5 - 7 phút)',
        teacher: '• Trò chơi 1: Thi ghép Hình Vuông và Hình Tam Giác thành ngôi nhà, ghép Hình Tròn làm ông mặt trời hoặc bánh xe.\n• Trò chơi 2: Trẻ cầm thẻ hình chạy về đúng ngôi nhà có gắn chữ số tương ứng.',
        kids: '• Trẻ say mê ghép các hình học thành bức tranh đẹp và chạy về đúng nhà theo hiệu lệnh.'
      }
    ],
    differentiation: '• Trẻ 3-4 tuổi: Đếm thành thạo trong phạm vi 3-5 và nhận biết Hình Tròn, Vuông, Tam Giác.\n• Trẻ 5-6 tuổi: Biết thêm bớt, tách gộp nhóm đối tượng trong phạm vi 5 bằng nhiều cách khác nhau.',
    weather: '• Dự phòng: Bổ sung phiếu bài tập nối số lượng với chữ số tương ứng cho trẻ thực hành tại bàn.',
    assessment: '[Đánh giá cuối ngày] Đa số trẻ đếm đúng thứ tự từ trái sang phải, phân biệt rõ Hình Tròn, Vuông, Tam Giác.',
    weekActivities: [
      'Toán: Đếm đến 5 & Nhận biết Hình Tròn - Vuông - Tam Giác',
      'Khám phá: Tìm các đồ vật quanh lớp có dạng hình học',
      'Tạo hình: Chắp ghép hình học tạo thành Ngôi nhà & Đoàn tàu',
      'Âm nhạc: Hát vận động "Tập đếm" (Một với một là hai)',
      'Hoạt động góc: Góc học tập - Chơi lô tô chữ số và hình khối'
    ]
  },
  {
    id: 'lit_storytelling',
    category: 'cognitive',
    emoji: '📖',
    badge: 'Làm Quen Văn Học',
    topic: 'Kể chuyện sáng tạo cho trẻ nghe: Truyện "Nhổ củ cải" & Đọc thơ diễn cảm',
    mainTitle: 'GIÁO ÁN TỔ CHỨC HOẠT ĐỘNG LÀM QUEN VĂN HỌC',
    field: 'Phát triển Ngôn ngữ (Kể chuyện & Đọc thơ diễn cảm)',
    packKey: '',
    objectives: {
      knowledge: 'Trẻ nhớ tên câu chuyện "Nhổ củ cải", tên các nhân vật theo đúng trình tự xuất hiện (Ông già, Bà già, Cháu gái, Cún con, Mèo con, Chuột nhắt) và hiểu nội dung, ý nghĩa đoàn kết của câu chuyện.',
      skills: 'Trẻ chú ý lắng nghe cô kể chuyện, trả lời được các câu hỏi đàm thoại theo trình tự truyện và bước đầu thể hiện giọng điệu, hành động ("Nhổ cải lên! Nhổ cải lên! Ái chà chà!") của các nhân vật.',
      attitudes: 'Trẻ học được bài học về tinh thần đoàn kết, biết yêu thương và sẵn sàng giúp đỡ ông bà, bố mẹ, bạn bè khi gặp việc khó.'
    },
    preparation: {
      teacher: 'Sa bàn sân khấu rối dẹt câu chuyện "Nhổ củ cải" (Mô hình cây củ cải khổng lồ, rối Ông, Bà, Cháu gái, Chó cún, Mèo hoa, Chuột nhắt), mũ nhân vật để trẻ đóng kịch.',
      kids: 'Ghế ngồi hình chữ U quanh sân khấu rối của cô, mũ đội đầu các nhân vật trong truyện.'
    },
    safety: '• Sắp xếp chỗ ngồi thoải mái, vừa tầm mắt để mọi trẻ đều quan sát rõ sân khấu rối mà không phải chen lấn.',
    procedure: [
      {
        actName: '1. Hoạt động 1: Gây hứng thú - "Cây củ cải khổng lồ trong khu vườn" (3 - 5 phút)',
        teacher: '• Cô mở màn sân khấu nhỏ, cho trẻ xem mô hình cây củ cải trắng to khổng lồ và đố trẻ: "Một mình ông cụ có nhổ được cây củ cải khổng lồ này không nhỉ?".',
        kids: '• Trẻ trầm trồ quan sát cây củ cải và dự đoán cách giúp ông cụ nhổ củ cải.'
      },
      {
        actName: '2. Hoạt động 2: Trọng tâm - Cô kể chuyện diễn cảm & Đàm thoại trích dẫn (12 - 15 phút)',
        teacher: '• Lần 1: Cô kể diễn cảm bằng lời kết hợp cử chỉ, điệu bộ minh họa.\n• Lần 2: Cô kể kết hợp điều khiển rối dẹt trên sa bàn và đàm thoại cùng trẻ:\n  + Ông cụ gọi ai ra giúp đầu tiên? Bà cụ gọi ai? Cô cháu gái gọi ai?\n  + Khi có thêm bạn Chuột nhắt cùng hợp sức thì điều gì đã xảy ra?\n  + Nhờ đâu mà cả nhà đã nhổ được cây củ cải lên?\n• Cho cả lớp cùng hô vang điệp khúc: "Nhổ cải lên! Nhổ cải lên! Lên nào!".',
        kids: '• Trẻ chăm chú lắng nghe, mắt dõi theo từng nhân vật trên sa bàn.\n• Trẻ trả lời đúng thứ tự các nhân vật và hào hứng đọc to lời thoại cùng cô.'
      },
      {
        actName: '3. Hoạt động 3: Hoạt cảnh đóng kịch "Bé làm diễn viên nhí Nhổ củ cải" (5 - 7 phút)',
        teacher: '• Mời 6-7 trẻ lên đội mũ đóng vai Củ cải, Ông, Bà, Cháu gái, Cún con, Mèo con, Chuột nhắt xếp thành hàng bám áo nhau diễn lại cảnh nhổ củ cải.',
        kids: '• Trẻ nhập vai rất tự nhiên, cùng nhau kéo củ cải và nhảy múa hát "Nhổ được củ cải rồi!" cuối vở kịch.'
      }
    ],
    differentiation: '• Trẻ nhút nhát: Cho trẻ đóng vai bạn Mèo hoặc bạn Chuột nhắt cùng cả nhóm để trẻ thêm tự tin.\n• Trẻ ngôn ngữ tốt: Khuyến khích trẻ làm người dẫn chuyện hoặc tự kể lại 1 đoạn truyện.',
    weather: '• Dự phòng: Bổ sung tranh lật khổ lớn 6 cảnh của câu chuyện để trẻ tự xem lại ở Góc Sách.',
    assessment: '[Đánh giá cuối ngày] Trẻ nhớ chính xác trình tự các nhân vật, rất hào hứng khi đóng kịch "Nhổ củ cải".',
    weekActivities: [
      'Văn học: Truyện "Nhổ củ cải" (Đóng kịch sáng tạo)',
      'Khám phá: Tìm hiểu các loại rau củ giàu dinh dưỡng',
      'Tạo hình: Nặn và tô màu Củ cải trắng, Củ cà rốt',
      'Âm nhạc: Hát vận động "Vườn rau của bé"',
      'Hoạt động góc: Góc Sách & Thư viện - Kể chuyện theo tranh'
    ]
  },
  {
    id: 'art_music',
    category: 'cognitive',
    emoji: '🎨',
    badge: 'Tạo Hình & Âm Nhạc',
    topic: 'Hoạt động Tạo hình & Âm nhạc: Tô màu, Dán hoa tặng Cô và Mẹ',
    mainTitle: 'GIÁO ÁN TỔ CHỨC HOẠT ĐỘNG PHÁT TRIỂN THẨM MỸ',
    field: 'Phát triển Thẩm mỹ (Tạo hình & Âm nhạc sáng tạo)',
    packKey: '',
    objectives: {
      knowledge: 'Trẻ biết cách cầm bút màu đúng, di màu đều không chồm ra ngoài nét vẽ và biết phết hồ mặt trái để dán những bông hoa nhiều màu sắc tạo thành bưu thiếp/bức tranh đẹp.',
      skills: 'Rèn kỹ năng vận động tinh của các ngón tay, khả năng phối hợp màu sắc hài hòa và cảm thụ nhịp điệu âm nhạc vui tươi.',
      attitudes: 'Trẻ biết yêu cái đẹp, giữ gìn sản phẩm tạo hình của mình và của bạn, muốn làm món quà xinh xắn gửi tặng bà, mẹ và cô giáo.'
    },
    preparation: {
      teacher: '3 bức tranh mẫu của cô (Tranh tô màu giỏ hoa, tranh dán hoa bằng giấy màu, tranh in ngón tay làm cánh hoa), giá treo sản phẩm "Triển lãm Bé Khéo Tay", nhạc nền nhẹ nhàng.',
      kids: 'Vở tạo hình/Giấy A4 có khung bưu thiếp, bút sáp màu, các hình cánh hoa giấy màu, hồ dán, khăn ẩm lau tay.'
    },
    safety: '• Hồ dán làm từ nguyên liệu an toàn cho trẻ mầm non; nhắc trẻ không bôi hồ lên quần áo và lau tay vào khăn ẩm sau khi dán.',
    procedure: [
      {
        actName: '1. Hoạt động 1: Gây hứng thú - Tham quan "Triển lãm Hoa Mùa Xuân" (3 - 5 phút)',
        teacher: '• Cô cho trẻ hát bài "Màu hoa" (Hoa màu tím, hoa màu đỏ, hoa màu vàng...) và dẫn trẻ đến xem góc trưng bày 3 bức tranh mẫu của cô.\n• Đàm thoại về màu sắc, bố cục và chất liệu của các bức tranh.',
        kids: '• Trẻ hát vui tươi, quan sát tranh mẫu của cô và nhận xét về màu sắc cánh hoa, nhụy hoa, cành lá.'
      },
      {
        actName: '2. Hoạt động 2: Trọng tâm - Cô làm mẫu & Trẻ thực hiện Tạo hình (12 - 15 phút)',
        teacher: '• Cô làm mẫu kết hợp giải thích ngắn gọn:\n  + Xếp thử các bông hoa vào giỏ sao cho cân đối.\n  + Dùng ngón trỏ chấm một lượng hồ vừa đủ phết vào mặt trái bông hoa rồi dán xuống, miết nhẹ.\n  + Cầm bút sáp bằng 3 đầu ngón tay tô màu thêm lá xanh và chiếc nơ xinh.\n• Cô bật nhạc không lời nhẹ nhàng, đi đến từng bàn hướng dẫn, động viên trẻ sáng tạo.',
        kids: '• Trẻ ngồi ngay ngắn, lưng thẳng, say sưa xếp hoa, phết hồ dán và tô màu hoàn thiện bức tranh của mình.'
      },
      {
        actName: '3. Hoạt động 3: Trưng bày & Nhận xét sản phẩm "Bé Yêu Nghệ Thuật" (5 - 7 phút)',
        teacher: '• Cho trẻ mang sản phẩm lên gắn vào giá trưng bày.\n• Mời 2-3 trẻ giới thiệu bài của mình và chọn bài của bạn mà trẻ thích nhất. Cô nhận xét, khen ngợi cả lớp.',
        kids: '• Trẻ tự hào trưng bày bức tranh của mình, ngắm tranh của bạn và chia sẻ cảm nhận.'
      }
    ],
    differentiation: '• Trẻ mới / Vận động tinh còn chậm: Cô cầm tay hướng dẫn trẻ chấm hồ và dán đúng vị trí.\n• Trẻ khéo tay: Khuyến khích trẻ vẽ thêm ông mặt trời, đám mây, đàn bướm bay quanh giỏ hoa.',
    weather: '• Dự phòng: Để tranh trên giá khô hồ hoàn toàn trước khi trả sản phẩm ở góc tuyên truyền phụ huynh.',
    assessment: '[Đánh giá cuối ngày] 100% trẻ hoàn thành bức tranh đẹp, nhiều trẻ có cách phối màu rất sáng tạo.',
    weekActivities: [
      'Tạo hình: Tô màu & Dán giỏ hoa tươi thắm tặng Mẹ và Cô',
      'Âm nhạc: Dạy hát "Màu hoa" & Nghe hát "Bông hồng tặng cô"',
      'Khám phá: Tìm hiểu các loài hoa đẹp mùa xuân',
      'Văn học: Thơ "Hoa kết trái" (Nhà thơ Thu Hà)',
      'Hoạt động góc: Góc Nghệ thuật - Nặn hoa và làm bưu thiếp'
    ]
  },
  {
    id: 'pe_nutrition',
    category: 'health_country',
    emoji: '🏃',
    badge: 'Thể Chất & Dinh Dưỡng',
    topic: 'Vận động cơ bản: Bật liên tục qua các vòng & Nhận biết thực phẩm dinh dưỡng',
    mainTitle: 'GIÁO ÁN PHÁT TRIỂN THỂ CHẤT & GIÁO DỤC DINH DƯỠNG',
    field: 'Phát triển Thể chất & Sức khỏe (Vận động cơ bản & Dinh dưỡng)',
    packKey: '',
    objectives: {
      knowledge: 'Trẻ biết kỹ thuật bật chụm hai chân liên tục qua 4-5 vòng thể dục mà không chạm vòng; đồng thời biết ích lợi của việc tập thể dục kết hợp ăn đủ 4 nhóm thực phẩm giúp cơ thể cao lớn, khỏe mạnh.',
      skills: 'Trẻ biết nhún chân lấy đà, hai tay chống hông, bật nhẹ nhàng bằng mũi bàn chân rơi xuống đúng tâm vòng và giữ thăng bằng tốt.',
      attitudes: 'Trẻ yêu thích tập thể dục buổi sáng, có tinh thần kỷ luật khi xếp hàng chờ đến lượt và ăn hết suất trong giờ ăn tại lớp.'
    },
    preparation: {
      teacher: '8-10 chiếc vòng thể dục màu hồng và xanh, vạch chuẩn, rổ đựng mô hình thực phẩm (Thịt, Cá, Trứng, Sữa, Rau xanh, Trái cây), nhạc khởi động sôi động.',
      kids: 'Trang phục thể thao co giãn thoáng mát, tinh thần khỏe khoắn.'
    },
    safety: '• Kiểm tra mặt sàn phẳng, không trơn trượt; khoảng cách giữa các vòng phù hợp sải chân theo độ tuổi của trẻ.',
    procedure: [
      {
        actName: '1. Hoạt động 1: Khởi động & Trọng động - Bài tập phát triển chung (4 - 5 phút)',
        teacher: '• Cho trẻ đi vòng tròn kết hợp các kiểu đi (đi mũi chân, đi gót chân, chạy chậm, chạy nhanh) rồi về 2 hàng ngang.\n• Tập bài phát triển chung (Tay, Bụng, Chân, Bật) theo nhạc bài "Bé khỏe bé ngoan" (nhấn mạnh động tác chân và bật).',
        kids: '• Trẻ khởi động tích cực và tập đều các động tác tay, chân, bụng, bật cùng cô.'
      },
      {
        actName: '2. Hoạt động 2: Trọng tâm - Vận động cơ bản "Bật liên tục qua các vòng" (12 - 15 phút)',
        teacher: '• Cô làm mẫu 2 lần:\n  + Lần 1: Làm mẫu trọn vẹn, nhịp nhàng.\n  + Lần 2: Làm mẫu kết hợp phân tích: Đứng trước vạch xuất phát, 2 tay chống hông, mắt nhìn thẳng, khuỵu gối lấy đà bật chụm 2 chân liên tục qua từng vòng và tiếp đất bằng mũi bàn chân.\n• Cho lần lượt 2 trẻ ở 2 hàng lên thực hiện (2-3 lượt), cô quan sát và sửa tư thế cho từng trẻ.',
        kids: '• Trẻ quan sát cô làm mẫu, xếp hàng nghiêm túc và lần lượt lên bật qua các vòng thể dục.\n• Trẻ cổ vũ bạn nhiệt tình.'
      },
      {
        actName: '3. Hoạt động 3: Trò chơi vận động "Chuyền thực phẩm bổ dưỡng" & Hồi tĩnh (5 - 6 phút)',
        teacher: '• Tổ chức thi đua bật qua vòng lên chọn thực phẩm tốt cho sức khỏe (rau, quả, sữa, cá, trứng) mang về giỏ của đội.\n• Cho trẻ đi nhẹ nhàng hít thở sâu làm cánh chim bay quanh sân/lớp.',
        kids: '• Trẻ bật nhanh, chọn đúng thực phẩm bổ dưỡng và đi lại hít thở nhẹ nhàng thư giãn.'
      }
    ],
    differentiation: '• Trẻ nhỏ / Thể lực yếu: Bật qua 3 vòng đặt gần nhau, cô đứng cạnh khích lệ.\n• Trẻ khỏe mạnh: Bật liên tục qua 5 vòng kết hợp ném túi cát trúng đích ở cuối đường chạy.',
    weather: '• Dự phòng: Tổ chức trong phòng thể chất hoặc hội trường rộng nếu ngoài sân nắng gắt hoặc mưa.',
    assessment: '[Đánh giá cuối ngày] Trẻ nắm vững kỹ thuật bật chụm chân tiếp đất bằng mũi bàn chân, không khí giờ học rất sôi nổi.',
    weekActivities: [
      'Thể chất: Bật liên tục qua vòng & Trò chơi vận động',
      'Khám phá: Nhận biết 4 nhóm thực phẩm giúp bé cao lớn',
      'Văn học: Thơ "Bé chẳng sợ tiêm" & Truyện "Gấu con bị đau răng"',
      'Tạo hình: Tô màu bữa ăn dinh dưỡng của bé',
      'Kỹ năng sống: Thực hành đánh răng đúng cách & Ăn gọn gàng'
    ]
  },
  {
    id: 'homeland_vietnam',
    category: 'health_country',
    emoji: '🇻🇳',
    badge: 'Quê Hương Đất Nước',
    topic: 'Quê hương tươi đẹp của bé & Bác Hồ kính yêu với các cháu thiếu nhi',
    mainTitle: 'GIÁO ÁN PHÁT TRIỂN NHẬN THỨC & TÌNH CẢM XÃ HỘI',
    field: 'Phát triển Tình cảm – Kỹ năng xã hội (Chủ đề Quê hương – Đất nước – Bác Hồ)',
    packKey: '',
    objectives: {
      knowledge: 'Trẻ biết tên nước Việt Nam, nhận biết Quốc kỳ Việt Nam (lá cờ đỏ sao vàng 5 cánh), biết một số danh lam thắng cảnh quê hương và biết tình cảm yêu thương bao la của Bác Hồ dành cho các cháu thiếu nhi.',
      skills: 'Trẻ trả lời rõ ràng các câu hỏi về quê hương, đất nước; biết hát, múa và đọc thơ thể hiện lòng kính yêu Bác Hồ.',
      attitudes: 'Trẻ tự hào về quê hương tươi đẹp, biết giữ gìn cảnh quan môi trường xanh - sạch - đẹp và phấn đấu làm "Cháu ngoan Bác Hồ".'
    },
    preparation: {
      teacher: 'Lá cờ Tổ quốc Việt Nam, tranh ảnh Bác Hồ vui Tết Trung thu và chia kẹo cho các cháu thiếu nhi, hình ảnh quê hương Hòa Phước – Đà Nẵng – Việt Nam; nhạc bài "Đêm qua em mơ gặp Bác Hồ".',
      kids: 'Cờ đỏ sao vàng nhỏ cầm tay, hoa giấy để múa hát mừng sinh nhật Bác.'
    },
    safety: '• Nhắc trẻ cầm cờ vẫy nhẹ nhàng, giữ khoảng cách an toàn với bạn bên cạnh.',
    procedure: [
      {
        actName: '1. Hoạt động 1: Gây hứng thú - "Lá cờ đỏ sao vàng tung bay" (3 - 5 phút)',
        teacher: '• Cô cho trẻ cầm cờ nhỏ hát và vẫy cờ theo bài hát "Yêu Hà Nội" hoặc "Quê hương tươi đẹp".\n• Đố trẻ: Lá cờ trên tay chúng mình có màu gì? Ở giữa có hình gì? Đó là Quốc kỳ của đất nước nào?',
        kids: '• Trẻ tự hào vẫy lá cờ đỏ sao vàng và đồng thanh trả lời: Đất nước Việt Nam ạ!'
      },
      {
        actName: '2. Hoạt động 2: Trọng tâm - Tìm hiểu Quê hương tươi đẹp & Tình cảm của Bác Hồ (12 - 15 phút)',
        teacher: '• Phần 1: Cho trẻ xem hình ảnh cảnh đẹp quê hương và Thủ đô Hà Nội (Lăng Bác, Hồ Gươm).\n• Phần 2: Trò chuyện về Bác Hồ kính yêu qua các bức ảnh Bác bế em bé, Bác chia kẹo cho thiếu nhi:\n  + Trong ảnh Bác Hồ đang làm gì cùng các bạn nhỏ?\n  + Để xứng đáng là Cháu ngoan Bác Hồ, các con sẽ làm những việc tốt gì ở lớp và ở nhà?\n• Cô đọc diễn cảm bài thơ "Ảnh Bác" của nhà thơ Trần Đăng Khoa cùng trẻ.',
        kids: '• Trẻ chăm chú lắng nghe, xúc động xem tranh ảnh Bác Hồ với các cháu thiếu nhi.\n• Trẻ đọc thơ "Ảnh Bác" và hứa chăm ngoan, học giỏi, nghe lời ông bà bố mẹ và cô giáo.'
      },
      {
        actName: '3. Hoạt động 3: Biểu diễn văn nghệ "Bông hoa dâng Bác" & Trò chơi ghép tranh (5 - 7 phút)',
        teacher: '• Tổ chức cho trẻ múa hát tập thể bài "Đêm qua em mơ gặp Bác Hồ" và dán hoa trang trí khung ảnh Bác Hồ.',
        kids: '• Trẻ múa hát say sưa và cẩn thận dán những bông hoa sen hồng trang trí khung ảnh Bác.'
      }
    ],
    differentiation: '• Trẻ nhỏ: Nhận biết Lá cờ đỏ sao vàng, nhận biết hình ảnh Bác Hồ và hoa sen.\n• Trẻ lớn: Trẻ nhớ được 5 điều Bác Hồ dạy thiếu niên, nhi đồng phù hợp lứa tuổi.',
    weather: '• Dự phòng: Trưng bày góc "Quê hương – Đất nước – Bác Hồ" ngay tại lớp để trẻ quan sát hằng ngày.',
    assessment: '[Đánh giá cuối ngày] Trẻ nhận biết tốt Quốc kỳ Việt Nam, thuộc bài thơ "Ảnh Bác" và rất ngoan ngoãn.',
    weekActivities: [
      'Khám phá: Quê hương tươi đẹp & Bác Hồ kính yêu',
      'Văn học: Thơ "Ảnh Bác" (Trần Đăng Khoa)',
      'Tạo hình: Tô màu Lá cờ đỏ sao vàng & Hoa sen hồng',
      'Âm nhạc: Hát múa "Đêm qua em mơ gặp Bác Hồ"',
      'Hoạt động góc: Xây dựng Lăng Bác & Công viên quê hương'
    ]
  },
  {
    id: 'tet_spring',
    category: 'health_country',
    emoji: '🌸',
    badge: 'Lễ Hội & Mùa Xuân',
    topic: 'Tìm hiểu Ngày Tết Nguyên Đán cổ truyền & Mùa Xuân tươi đẹp',
    mainTitle: 'GIÁO ÁN TỔ CHỨC HOẠT ĐỘNG KHÁM PHÁ XÃ HỘI & LỄ HỘI',
    field: 'Phát triển Tình cảm – Kỹ năng xã hội & Nhận thức (Chủ đề Tết & Mùa Xuân)',
    packKey: '',
    objectives: {
      knowledge: 'Trẻ nhận biết đặc trưng của mùa xuân và ngày Tết cổ truyền dân tộc: Hoa đào, hoa mai nở rộ, bánh chưng xanh, mâm ngũ quả, phong tục chúc Tết ông bà và nhận lì xì đầu năm.',
      skills: 'Trẻ biết nói những lời chúc Tết lễ phép, đáng yêu dành cho ông bà, bố mẹ, cô giáo và tham gia gói bánh chưng / trang trí cành hoa ngày Tết.',
      attitudes: 'Trẻ háo hức đón Tết cổ truyền, yêu nét đẹp văn hóa dân tộc và biết giữ gìn trang phục ngày Tết sạch đẹp.'
    },
    preparation: {
      teacher: 'Cành hoa mai, hoa đào, mô hình bánh chưng xanh, bao lì xì đỏ, mâm ngũ quả ngày Tết; nhạc bài hát "Sắp đến Tết rồi", "Mùa xuân ơi".',
      kids: 'Áo dài truyền thống hoặc trang phục đẹp, hoa giấy để trang trí cây mai/cây đào của lớp.'
    },
    safety: '• Nhắc trẻ khi đi chơi Tết cùng gia đình không ăn quá nhiều bánh kẹo ngọt và luôn nắm tay bố mẹ nơi đông người.',
    procedure: [
      {
        actName: '1. Hoạt động 1: Gây hứng thú - Hát vang "Sắp đến Tết rồi" (3 - 5 phút)',
        teacher: '• Cô và trẻ cùng hát, vỗ tay rộn ràng theo bài hát "Sắp đến Tết rồi" của nhạc sĩ Hoàng Vân.\n• Trò chuyện cùng trẻ về không khí chuẩn bị đón Tết ở gia đình và ở lớp.',
        kids: '• Trẻ hát vui tươi và hào hứng kể về việc đi chợ hoa Tết, mua quần áo mới cùng bố mẹ.'
      },
      {
        actName: '2. Hoạt động 2: Trọng tâm - Khám phá hương vị và phong tục Ngày Tết (12 - 15 phút)',
        teacher: '• Cô giới thiệu mâm ngũ quả, bánh chưng xanh, hoa đào, hoa mai và đàm thoại:\n  + Ngày Tết thường có loại bánh truyền thống gì gói bằng lá dong xanh?\n  + Miền Bắc và miền Trung, miền Nam thường chưng hoa gì vào dịp Tết?\n  + Vào sáng mồng 1 Tết, các con sẽ khoanh tay chúc Tết ông bà, bố mẹ như thế nào?\n• Hướng dẫn cả lớp thực hành nói lời chúc Tết ông bà sống lâu trăm tuổi, bố mẹ mạnh khỏe.',
        kids: '• Trẻ quan sát, gọi tên các biểu tượng ngày Tết và thực hành khoanh tay chúc Tết thật lễ phép.'
      },
      {
        actName: '3. Hoạt động 3: Trải nghiệm "Trang trí cành hoa Xuân" & "Hái lộc đầu năm" (5 - 7 phút)',
        teacher: '• Cho trẻ cùng gắn hoa mai, hoa đào và bao lì xì trang trí góc Xuân của lớp.\n• Nhận xét, khen ngợi và tặng lộc đầu xuân cho các bé.',
        kids: '• Trẻ vui vẻ trang trí cây hoa mùa xuân và múa hát đón Tết.'
      }
    ],
    differentiation: '• Trẻ nhỏ: Nhận biết hoa mai, hoa đào, bánh chưng, bao lì xì.\n• Trẻ lớn: Tự nghĩ ra 2-3 câu chúc Tết hay để chúc ông bà, bố mẹ.',
    weather: '• Dự phòng: Tổ chức phiên chợ Tết mini ngay trong hành lang lớp học.',
    assessment: '[Đánh giá cuối ngày] Trẻ rất phấn khởi, thuộc lời chúc Tết và trang trí cây hoa mùa xuân rất đẹp.',
    weekActivities: [
      'Khám phá: Ngày Tết Nguyên Đán cổ truyền của bé',
      'Văn học: Thơ "Cây đào" & Truyện "Sự tích bánh chưng bánh dày"',
      'Tạo hình: Làm bao lì xì & Dán hoa đào, hoa mai mùa xuân',
      'Âm nhạc: Hát vận động "Sắp đến Tết rồi"',
      'Hoạt động góc: Phiên chợ Tết quê em & Gói bánh chưng'
    ]
  },
  {
    id: 'env_recycle',
    category: 'world',
    emoji: '♻️',
    badge: 'Bảo Vệ Môi Trường',
    topic: 'Bé chung tay bảo vệ môi trường: Bỏ rác đúng nơi quy định & Phân loại rác',
    mainTitle: 'GIÁO ÁN GIÁO DỤC KỸ NĂNG SỐNG & BẢO VỆ MÔI TRƯỜNG',
    field: 'Phát triển Tình cảm – Kỹ năng xã hội & Nhận thức (Bảo vệ môi trường)',
    packKey: '',
    objectives: {
      knowledge: 'Trẻ biết hành vi đúng (bỏ rác vào thùng rác, chăm sóc cây xanh, tiết kiệm nước) và hành vi sai (vứt rác bừa bãi, bẻ cành cây) đối với môi trường; bước đầu phân biệt rác hữu cơ (vỏ trái cây, lá cây) và rác tái chế (chai nhựa, giấy bìa).',
      skills: 'Trẻ thực hành nhặt rác bỏ đúng thùng quy định và biết nhắc nhở bạn cùng giữ vệ sinh lớp học, sân trường.',
      attitudes: 'Trẻ có ý thức giữ gìn môi trường lớp học, gia đình và nơi công cộng luôn xanh – sạch – đẹp.'
    },
    preparation: {
      teacher: '2 mô hình thùng rác thân thiện (Thùng xanh lá: Rác hữu cơ; Thùng hồng/vàng: Rác tái chế), các thẻ hình/đồ vật mô phỏng (vỏ chuối, lá khô, vỏ hộp sữa, chai nhựa, giấy vụn).',
      kids: 'Nơ đeo tay "Chiến sĩ Xanh tí hon", rổ đựng thẻ phân loại rác.'
    },
    safety: '• Đảm bảo các vật mẫu dùng cho trẻ thực hành phân loại rác đều sạch sẽ, không có cạnh sắc nhọn.',
    procedure: [
      {
        actName: '1. Hoạt động 1: Gây hứng thú - Câu chuyện của "Bạn Thùng Rác Vui Vẻ" (3 - 5 phút)',
        teacher: '• Cô đóng vai "Bạn Thùng Rác" xuất hiện chào các bé và hát bài "Không xả rác".\n• Trò chuyện: Vì sao sân trường Mầm Non Hòa Phước của chúng mình luôn sạch đẹp?',
        kids: '• Trẻ chào đón Bạn Thùng Rác và trả lời: Vì chúng mình bỏ rác vào thùng ạ!'
      },
      {
        actName: '2. Hoạt động 2: Trọng tâm - Tìm hiểu cách bảo vệ môi trường & Phân loại rác (12 - 15 phút)',
        teacher: '• Cho trẻ xem tranh tình huống và chọn Mặt Cười (hành vi đúng) hoặc Mặt Buồn (hành vi sai khi xả rác ra đường, xuống sông).\n• Hướng dẫn trẻ cách cho "Bạn Thùng Rác" ăn đúng loại rác:\n  + Thùng Xanh: Vỏ chuối, vỏ cam, lá cây rụng.\n  + Thùng Tái Chế: Chai nhựa, vỏ hộp sữa giấy (đã làmẹp), giấy báo cũ.',
        kids: '• Trẻ giơ thẻ Mặt Cười / Mặt Buồn và giải thích vì sao.\n• Trẻ lên thực hành bỏ từng loại rác vào đúng thùng quy định.'
      },
      {
        actName: '3. Hoạt động 3: Trò chơi "Đội quân Chiến sĩ Xanh" & Tái chế đồ chơi (5 - 7 phút)',
        teacher: '• Hai đội thi đua bật qua chướng ngại vật lên phân loại rác vào 2 thùng.\n• Giới thiệu các đồ chơi xinh xắn làm từ lõi giấy và hộp sữa tái chế.',
        kids: '• Trẻ hào hứng thi đua phân loại rác chính xác và ngắm các đồ chơi tái chế.'
      }
    ],
    differentiation: '• Trẻ nhỏ: Thực hành bỏ rác đúng vào thùng rác sau khi ăn bánh, uống sữa.\n• Trẻ lớn: Phân biệt được rác tái chế và rác hữu cơ.',
    weather: '• Dự phòng: Thực hành vệ sinh các góc chơi và lau lá cây xanh ngay trong lớp.',
    assessment: '[Đánh giá cuối ngày] Trẻ có ý thức tự giác bỏ vỏ hộp sữa vào thùng rác và hào hứng làm Chiến sĩ Xanh.',
    weekActivities: [
      'Kỹ năng sống: Bé bỏ rác đúng nơi & Phân loại rác',
      'Khám phá: Vì sao cần trồng nhiều cây xanh?',
      'Tạo hình: Làm ống đựng bút / Con vật từ lõi giấy tái chế',
      'Âm nhạc: Hát vận động "Không xả rác" & "Em yêu cây xanh"',
      'Hoạt động ngoài trời: Nhặt lá vàng & Tưới cây vườn trường'
    ]
  },
  {
    id: 'life_skills_safety',
    category: 'social',
    emoji: '🛡️',
    badge: 'Kỹ Năng Sống',
    topic: 'Kỹ năng sống: Bé ngoan tự phục vụ & Phòng tránh nguy hiểm khi ở nhà, ở trường',
    mainTitle: 'GIÁO ÁN GIÁO DỤC KỸ NĂNG SỐNG & ĐẢM BẢO AN TOÀN CHO TRẺ',
    field: 'Phát triển Tình cảm – Kỹ năng xã hội (Kỹ năng tự phục vụ & Tự bảo vệ)',
    packKey: '',
    objectives: {
      knowledge: 'Trẻ biết tự làm một số công việc tự phục vụ vừa sức (tự xúc cơm, tự đi giày dép, gấp quần áo, cất ba lô) và nhận biết các vật dụng/nơi nguy hiểm cần tránh xa (ổ điện, phích nước sôi, dao kéo, lan can cao, người lạ cho quà).',
      skills: 'Trẻ có kỹ năng xử lý tình huống an toàn: Không đi theo người lạ, biết kêu cứu hoặc tìm cô giáo, chú bảo vệ, công an khi bị lạc.',
      attitudes: 'Trẻ tự lập, mạnh dạn, tự tin và luôn tuân thủ các quy tắc an toàn ở trường cũng như ở nhà.'
    },
    preparation: {
      teacher: 'Bộ tranh tình huống "An toàn – Không an toàn", ba lô, dép, quần áo trẻ em để thực hành tự phục vụ; bảng quy tắc 5 ngón tay.',
      kids: 'Thẻ tín hiệu Xanh (An toàn) – Đỏ (Nguy hiểm), tâm thế sẵn sàng thực hành.'
    },
    safety: '• Toàn bộ giáo cụ minh họa vật nguy hiểm chỉ dùng tranh ảnh hoặc mô hình giấy bìa tuyệt đối an toàn.',
    procedure: [
      {
        actName: '1. Hoạt động 1: Gây hứng thú - Vũ điệu "Bé tự làm lấy việc của mình" (3 - 5 phút)',
        teacher: '• Cô cùng trẻ vận động theo nhạc bài "Bé quét nhà" / "Tự phục vụ".\n• Hỏi trẻ: Ở lớp và ở nhà, các con đã tự làm được những việc gì không cần bố mẹ làm hộ?',
        kids: '• Trẻ hào hứng kể: Con tự xúc cơm, tự đi dép, tự cất ba lô ạ!'
      },
      {
        actName: '2. Hoạt động 2: Trọng tâm - Nhận biết nguy hiểm & Thực hành kỹ năng tự bảo vệ (12 - 15 phút)',
        teacher: '• Phần 1 (Phòng tránh nguy hiểm): Cô chiếu các tình huống trên màn hình để trẻ giơ thẻ Đỏ (Nguy hiểm) hoặc Xanh (An toàn):\n  + Chạm tay vào ổ điện, ấm nước đang sôi -> Nguy hiểm!\n  + Leo trèo lên cửa sổ, lan can cầu thang -> Nguy hiểm!\n  + Người lạ cho kẹo và rủ đi chơi khi chưa có bố mẹ đồng ý -> Tuyệt đối nói KHÔNG!\n• Phần 2 (Tự phục vụ): Hướng dẫn trẻ thực hành gấp áo gọn gàng và xếp giày dép đúng kệ.',
        kids: '• Trẻ phán đoán nhanh, giơ thẻ chính xác và đồng thanh nói "Không!" với các hành vi nguy hiểm.\n• Trẻ thực hành gấp quần áo và đi giày dép khéo léo.'
      },
      {
        actName: '3. Hoạt động 3: Thi đua "Bé khéo tay tự lập" (5 - 7 phút)',
        teacher: '• Tổ chức hội thi nhỏ: Trong 2 phút, các tổ thi gấp quần áo và cất đồ dùng vào ba lô nhanh, đẹp nhất.',
        kids: '• Trẻ thi đua gấp quần áo phẳng phiu và cất vào ba lô trong tiếng vỗ tay cổ vũ.'
      }
    ],
    differentiation: '• Trẻ nhỏ: Tự đi dép, tự cất mũ/ba lô và nhận biết ổ điện, nước sôi là nguy hiểm.\n• Trẻ lớn: Nhớ số điện thoại của bố mẹ và cách tìm người giúp đỡ khi bị lạc ở siêu thị.',
    weather: '• Dự phòng: Thực hành đóng tình huống "Khi người lạ gõ cửa hoặc cho quà" ngay tại lớp.',
    assessment: '[Đánh giá cuối ngày] Trẻ nắm vững các quy tắc an toàn và rất tự giác trong giờ ăn, giờ ngủ tại lớp.',
    weekActivities: [
      'Kỹ năng sống: Bé tự phục vụ & Phòng tránh nguy hiểm',
      'Khám phá: Những đồ vật an toàn và không an toàn',
      'Văn học: Truyện "Dê con nghe lời mẹ" (Không mở cửa cho Sói)',
      'Tạo hình: Tô màu biển báo An toàn cho bé',
      'Hoạt động chiều: Thực hành gấp chăn, gấp quần áo gọn gàng'
    ]
  }
];

let activeA4Category = 'all';
let activeA4TemplateId = 'animals_pet';

function findMatchingA4Template(topic, packKey) {
  if (packKey === 'forest_safari') return window.A4_LESSON_TEMPLATES.find(t => t.id === 'animals_forest');
  if (packKey === 'water_and_sky') return window.A4_LESSON_TEMPLATES.find(t => t.id === 'animals_water');
  const lower = String(topic || '').toLowerCase();
  if (/rừng|voi|khỉ|sư tử|hổ/.test(lower)) return window.A4_LESSON_TEMPLATES.find(t => t.id === 'animals_forest');
  if (/dưới nước|cá|tôm|cua|rùa|côn trùng|ong|bướm/.test(lower)) return window.A4_LESSON_TEMPLATES.find(t => t.id === 'animals_water');
  if (/trường|lớp học|cô giáo và các bạn/.test(lower)) return window.A4_LESSON_TEMPLATES.find(t => t.id === 'school_friends');
  if (/bản thân|giác quan|cơ thể/.test(lower)) return window.A4_LESSON_TEMPLATES.find(t => t.id === 'myself_senses');
  if (/gia đình|ngôi nhà|bố mẹ|ông bà/.test(lower) && !/vật nuôi/.test(lower)) return window.A4_LESSON_TEMPLATES.find(t => t.id === 'happy_family');
  if (/thực vật|quả|hoa|rau|cây/.test(lower)) return window.A4_LESSON_TEMPLATES.find(t => t.id === 'plants_fruits');
  if (/nghề|bác sĩ|cứu hỏa|đầu bếp|công nhân/.test(lower)) return window.A4_LESSON_TEMPLATES.find(t => t.id === 'jobs_careers');
  if (/giao thông|đèn đỏ|xe|máy bay|tàu/.test(lower)) return window.A4_LESSON_TEMPLATES.find(t => t.id === 'traffic_safety');
  if (/hiện tượng|thời tiết|mưa|nắng|ngày và đêm/.test(lower)) return window.A4_LESSON_TEMPLATES.find(t => t.id === 'nature_water');
  if (/toán|đếm|chữ số|hình tròn|hình vuông|tam giác/.test(lower)) return window.A4_LESSON_TEMPLATES.find(t => t.id === 'math_shapes');
  if (/thơ|truyện|kể chuyện|củ cải|văn học/.test(lower)) return window.A4_LESSON_TEMPLATES.find(t => t.id === 'lit_storytelling');
  if (/tạo hình|vẽ|tô màu|nặn|dán|âm nhạc|hát/.test(lower)) return window.A4_LESSON_TEMPLATES.find(t => t.id === 'art_music');
  if (/thể chất|vận động|bật|ném|dinh dưỡng|thực phẩm/.test(lower)) return window.A4_LESSON_TEMPLATES.find(t => t.id === 'pe_nutrition');
  if (/tết|mùa xuân|lễ hội|bánh chưng|hoa đào|hoa mai/.test(lower)) return window.A4_LESSON_TEMPLATES.find(t => t.id === 'tet_spring');
  if (/môi trường|rác|tái chế|xanh sạch đẹp/.test(lower)) return window.A4_LESSON_TEMPLATES.find(t => t.id === 'env_recycle');
  if (/kỹ năng sống|tự phục vụ|an toàn|nguy hiểm|người lạ/.test(lower)) return window.A4_LESSON_TEMPLATES.find(t => t.id === 'life_skills_safety');
  if (/quê hương|đất nước|bác hồ|việt nam|hà nội/.test(lower)) return window.A4_LESSON_TEMPLATES.find(t => t.id === 'homeland_vietnam');
  return window.A4_LESSON_TEMPLATES[0];
}

function buildLessonDataFromA4Template(tpl, ageKey = '3-4y', isInclusive = false, customTopic = '', customField = '') {
  const chosenTpl = tpl || window.A4_LESSON_TEMPLATES[0];
  const ageText = getAgeLabel(ageKey);
  const dur = getDuration(ageKey);
  const finalTopic = clean(customTopic) || chosenTpl.topic;
  const finalField = clean(customField) || chosenTpl.field;
  const defaultQuestions = (chosenTpl.packKey && window.getQuestionsFromPack)
    ? window.getQuestionsFromPack(chosenTpl.packKey)
    : (window.gState?.bank && window.gState.bank.length ? window.gState.bank : (window.getQuestionsFromPack ? window.getQuestionsFromPack('default_animals') : []));

  const weekActs = chosenTpl.weekActivities || [
    `Khám phá: ${finalTopic}`,
    `Văn học: Thơ & Truyện chủ đề "${finalTopic}"`,
    `Tạo hình: Tô màu & Sáng tạo theo đề tài "${finalTopic}"`,
    `Âm nhạc: Hát và vận động theo chủ đề`,
    `Toán & Trò chơi tổng hợp cuối tuần`
  ];

  return {
    version: 1,
    templateId: chosenTpl.id,
    topic: finalTopic,
    ageKey,
    isInclusive,
    requirements: $('requirements-input')?.value || '',
    schoolDept: $('school-dept-input')?.value || 'PHÒNG GIÁO DỤC VÀ ĐÀO TẠO',
    schoolName: $('school-input')?.value || 'TRƯỜNG MẦM NON HÒA PHƯỚC',
    teacherName: $('teacher-input')?.value || 'Cô Giáo Mầm Non',
    title: chosenTpl.mainTitle || 'GIÁO ÁN TỔ CHỨC HOẠT ĐỘNG GIÁO DỤC',
    subTopic: 'Đề tài: ' + finalTopic,
    field: finalField,
    ageText,
    duration: dur,
    objectives: {
      knowledge: customTopic ? `Trẻ nhận biết đặc điểm, tên gọi, ý nghĩa và kiến thức trọng tâm của đề tài "${finalTopic}" phù hợp độ tuổi ${ageText}.` : chosenTpl.objectives.knowledge,
      skills: customTopic ? `Rèn kỹ năng quan sát, chú ý lắng nghe, trả lời câu hỏi rõ ràng mạch lạc và phối hợp cùng bạn trong hoạt động "${finalTopic}".` : chosenTpl.objectives.skills,
      attitudes: customTopic ? `Trẻ hứng thú, tích cực tham gia hoạt động "${finalTopic}", biết đoàn kết với bạn bè và vâng lời cô giáo.` : chosenTpl.objectives.attitudes
    },
    preparation: JSON.parse(JSON.stringify(chosenTpl.preparation)),
    safety: chosenTpl.safety,
    procedure: JSON.parse(JSON.stringify(chosenTpl.procedure)),
    differentiation: chosenTpl.differentiation,
    weather: chosenTpl.weather,
    assessment: chosenTpl.assessment,
    zalo: `🌸 THÔNG BÁO HOẠT ĐỘNG LỚP MẦM NON HÒA PHƯỚC 🌸\n\nKính gửi Quý Phụ huynh,\nHôm nay tại lớp, các bé đã được tham gia hoạt động học tập vô cùng bổ ích:\n📌 Đề tài: "${finalTopic}"\n📌 Lĩnh vực: ${finalField}\n📌 Độ tuổi: ${ageText}\n\nCác con rất hào hứng quan sát, trả lời câu hỏi và tham gia các trò chơi vận động, sáng tạo cùng cô và các bạn. Tối nay bố mẹ hãy cùng trò chuyện với bé về chủ đề "${finalTopic}" để khích lệ tinh thần học tập của con nhé ạ! 💖`,
    weekRows: [
      {
        label: 'Đón trẻ & Trò chuyện',
        days: [
          `Đón trẻ, trò chuyện đầu tuần về chủ đề: ${finalTopic}`,
          'Xem tranh ảnh, học liệu trực quan tại góc chủ đề của lớp',
          'Trò chuyện về những điều bé yêu thích trong chủ đề',
          'Rèn kỹ năng chào hỏi lễ phép & cất đồ dùng cá nhân',
          'Tổng kết và khen ngợi các bé ngoan cuối tuần'
        ]
      },
      {
        label: 'Hoạt động học',
        days: weekActs
      },
      {
        label: 'Hoạt động góc',
        days: Array(5).fill(`Góc phân vai • Góc xây dựng • Góc nghệ thuật • Góc sách & Học tập theo chủ đề "${finalTopic}"`)
      },
      {
        label: 'Hoạt động chiều',
        days: Array(5).fill('Chơi trò chơi tương tác trên màn hình, hoàn thành Phiếu bài tập & Nêu gương bé ngoan cuối ngày')
      }
    ],
    gameQuestions: defaultQuestions
  };
}

// ===== TẠO BÀI HỌC & BỘ CÂU HỎI MẪU CHUẨN MẦM NON =====
function lessonFromTemplate(topic, ageKey, isInclusive, requirements = '', packKey = 'default_animals') {
  const matched = findMatchingA4Template(topic, packKey);
  activeA4TemplateId = matched?.id || 'animals_pet';
  const data = buildLessonDataFromA4Template(matched, ageKey, isInclusive);
  if (topic) {
    data.topic = topic;
    data.subTopic = 'Đề tài: ' + topic;
  }
  data.requirements = requirements || '';
  return data;
}

window.toggleA4TemplateGallery = function() {
  const panel = $('a4-template-gallery-panel');
  const arrow = $('a4-gallery-arrow');
  if (!panel) return;
  panel.classList.toggle('hidden');
  if (arrow) arrow.textContent = panel.classList.contains('hidden') ? '▾' : '▴';
};

window.setA4TemplateCategory = function(catId) {
  activeA4Category = catId || 'all';
  window.renderA4TemplateGallery();
};

window.renderA4TemplateGallery = function() {
  const selectEl = $('a4-template-select');
  const catPillsEl = $('a4-template-cat-pills');
  const gridEl = $('a4-template-cards-grid');
  if (!gridEl || !window.A4_LESSON_TEMPLATES) return;

  if (selectEl && selectEl.options.length <= 1) {
    selectEl.innerHTML = `<option value="">⚡ Chọn nhanh Mẫu Giáo Án A4 (18 chủ đề)...</option>` +
      window.A4_LESSON_TEMPLATES.map(t => `<option value="${t.id}">${t.emoji} [${esc(t.badge)}] ${esc(t.topic)}</option>`).join('');
  }
  if (selectEl) selectEl.value = activeA4TemplateId || '';

  if (catPillsEl) {
    catPillsEl.innerHTML = (window.A4_TEMPLATE_CATEGORIES || []).map(cat => `
      <button type="button" onclick="setA4TemplateCategory('${cat.id}')" class="text-xs px-3 py-1 rounded-full font-extrabold border transition ${activeA4Category === cat.id ? 'bg-pink-500 text-white border-pink-600 shadow-sm' : 'bg-white text-pink-700 border-pink-200 hover:bg-pink-50'}">
        ${esc(cat.label)}
      </button>
    `).join('');
  }

  const q = ($('a4-template-search')?.value || '').trim().toLowerCase();
  const filtered = window.A4_LESSON_TEMPLATES.filter(t => {
    const matchCat = activeA4Category === 'all' || t.category === activeA4Category;
    if (!matchCat) return false;
    if (!q) return true;
    const hay = `${t.badge} ${t.topic} ${t.field} ${t.mainTitle}`.toLowerCase();
    return hay.includes(q);
  });

  gridEl.innerHTML = filtered.map(t => {
    const isAct = t.id === activeA4TemplateId;
    return `
      <div onclick="applyA4LessonTemplate('${t.id}')" class="a4-template-card ${isAct ? 'is-active' : ''}">
        <div>
          <div class="flex items-center justify-between gap-1.5 mb-1">
            <span class="text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full ${isAct ? 'bg-pink-500 text-white' : 'bg-pink-50 text-pink-700 border border-pink-200'}">
              ${t.emoji} ${esc(t.badge)}
            </span>
            ${isAct ? '<span class="text-[10px] font-extrabold text-emerald-600">✓ Đang mở</span>' : ''}
          </div>
          <h4 class="text-xs font-black text-pink-950 leading-snug mt-1">${esc(t.topic)}</h4>
          <p class="text-[11px] text-pink-600 mt-1 line-clamp-1">${esc(t.field)}</p>
        </div>
        <div class="flex items-center justify-between pt-1.5 border-t border-pink-100 text-[11px] font-extrabold text-pink-700">
          <span>📄 Đủ 6 mục chuẩn A4</span>
          <span class="text-pink-600 hover:underline">Áp dụng mẫu ➔</span>
        </div>
      </div>
    `;
  }).join('') || '<div class="col-span-full text-center text-xs text-pink-500 py-4 italic">Không tìm thấy mẫu giáo án nào phù hợp với từ khóa.</div>';
};

window.applyA4LessonTemplate = function(templateId, switchToA4Tab = false) {
  const found = (window.A4_LESSON_TEMPLATES || []).find(t => t.id === templateId);
  if (!found) return;
  pushUndoState();
  activeA4TemplateId = found.id;
  const ageKey = $('a4-age-quick-select')?.value || $('age-selector')?.value || '3-4y';
  const isInclusive = $('inclusive-toggle')?.checked || false;
  const newData = buildLessonDataFromA4Template(found, ageKey, isInclusive);

  // Giữ nguyên bộ câu hỏi trò chơi hiện tại nếu mẫu giáo án không phải nhóm đổi bộ câu hỏi con vật
  if (!found.packKey && window.gState?.bank?.length) {
    newData.gameQuestions = JSON.parse(JSON.stringify(window.gState.bank));
    newData.gameTitle = window.gState.title;
  }

  populateUI(newData);
  persist();
  window.renderA4TemplateGallery();
  if (switchToA4Tab) {
    window.switchTab('a4');
    window.toggleRightMenu(true);
  }
  showToast(`${found.emoji} Đã nạp Mẫu Giáo Án A4!`, `Chủ đề: "${found.topic}" đã được điền đầy đủ vào trang Giáo án A4.`);
};

window.changeA4AgeGroup = function(ageKey) {
  if ($('age-selector')) $('age-selector').value = ageKey;
  if (!currentLessonData) return;
  currentLessonData.ageKey = ageKey;
  currentLessonData.ageText = getAgeLabel(ageKey);
  currentLessonData.duration = getDuration(ageKey);
  if ($('a4-age')) $('a4-age').textContent = currentLessonData.ageText;
  if ($('a4-duration')) $('a4-duration').textContent = currentLessonData.duration;
  saveCurrentState();
  showToast('👶 Đã cập nhật Độ tuổi & Thời gian!', `${currentLessonData.ageText} • Thời gian: ${currentLessonData.duration}`);
};

window.createCustomTopicA4Lesson = function() {
  const customTopic = clean($('a4-custom-topic-input')?.value);
  const customField = clean($('a4-custom-field-select')?.value);
  if (!customTopic) {
    showToast('✏️ Chưa nhập đề tài', 'Cô vui lòng nhập tên đề tài giáo án vào ô trước khi bấm tạo nhé!', false);
    $('a4-custom-topic-input')?.focus();
    return;
  }
  pushUndoState();
  const matched = findMatchingA4Template(customTopic, '');
  activeA4TemplateId = matched?.id || 'animals_pet';
  const ageKey = $('a4-age-quick-select')?.value || $('age-selector')?.value || '3-4y';
  const isInclusive = $('inclusive-toggle')?.checked || false;
  const newData = buildLessonDataFromA4Template(matched, ageKey, isInclusive, customTopic, customField);
  if (window.gState?.bank?.length) {
    newData.gameQuestions = JSON.parse(JSON.stringify(window.gState.bank));
    newData.gameTitle = window.gState.title;
  }
  populateUI(newData);
  persist();
  window.renderA4TemplateGallery();
  showToast('✨ Đã tạo Giáo Án A4 mới!', `Đã soạn xong giáo án A4 cho đề tài: "${customTopic}".`);
};

window.addA4ProcedureStep = function() {
  if (!currentLessonData) return;
  saveCurrentState();
  if (!Array.isArray(currentLessonData.procedure)) currentLessonData.procedure = [];
  const nextNum = currentLessonData.procedure.length + 1;
  currentLessonData.procedure.push({
    actName: `${nextNum}. Hoạt động ${nextNum}: Hoạt động bổ sung / Nhận xét & Kết thúc (3 - 5 phút)`,
    teacher: '• Cô tổ chức hoạt động củng cố, nhận xét và khen ngợi trẻ.\n• Hướng dẫn trẻ thu dọn đồ dùng học liệu gọn gàng.',
    kids: '• Trẻ hào hứng tham gia, lắng nghe cô nhận xét và cất đồ dùng đúng nơi quy định.'
  });
  populateUI(currentLessonData);
  persist();
  showToast('➕ Đã thêm hoạt động mới!', `Đã thêm Hoạt động ${nextNum} vào bảng Tiến trình tổ chức hoạt động.`);
};

// ===== ĐỔ DỮ LIỆU LÊN GIAO DIỆN =====
function populateUI(data) {
  currentLessonData = data;
  const d = data;
  if (d.schoolName && /Hồng Đào/i.test(d.schoolName)) {
    d.schoolName = d.schoolName.replace(/HỒNG ĐÀO/g, 'HÒA PHƯỚC').replace(/Hồng Đào/gi, 'Hòa Phước');
  }
  if (d.zalo && /Hồng Đào/i.test(d.zalo)) {
    d.zalo = d.zalo.replace(/HỒNG ĐÀO/g, 'HÒA PHƯỚC').replace(/Hồng Đào/gi, 'Hòa Phước');
  }
  if (Array.isArray(d.procedure)) {
    d.procedure.forEach(p => {
      if (p.teacher && /Hồng Đào/i.test(p.teacher)) {
        p.teacher = p.teacher.replace(/Hồng Đào/gi, 'Hòa Phước');
      }
    });
  }

  if ($('age-selector')) $('age-selector').value = d.ageKey || '3-4y';
  if ($('a4-age-quick-select')) $('a4-age-quick-select').value = d.ageKey || '3-4y';
  if (d.templateId) activeA4TemplateId = d.templateId;
  if ($('topic-input')) $('topic-input').value = d.topic || '';
  if ($('header-topic-label')) $('header-topic-label').textContent = d.topic || '';
  if ($('requirements-input')) $('requirements-input').value = d.requirements || '';
  if ($('inclusive-toggle')) $('inclusive-toggle').checked = !!d.isInclusive;

  if ($('school-dept')) $('school-dept').textContent = d.schoolDept;
  if ($('school-name')) $('school-name').textContent = d.schoolName;
  if ($('school-input') && d.schoolName) $('school-input').value = d.schoolName;
  if ($('a4-main-title')) $('a4-main-title').textContent = d.title;
  if ($('a4-sub-topic')) $('a4-sub-topic').textContent = d.subTopic;
  if ($('a4-field')) $('a4-field').textContent = d.field;
  if ($('a4-age')) $('a4-age').textContent = d.ageText;
  if ($('a4-duration')) $('a4-duration').textContent = d.duration;
  if ($('teacher-name-footer')) $('teacher-name-footer').textContent = d.teacherName;

  if ($('a4-objectives')) {
    $('a4-objectives').innerHTML = `
      <p><strong>1. Kiến thức:</strong> <span contenteditable="true" oninput="saveCurrentState()" id="obj-k">${esc(d.objectives.knowledge)}</span></p>
      <p><strong>2. Kỹ năng:</strong> <span contenteditable="true" oninput="saveCurrentState()" id="obj-s">${esc(d.objectives.skills)}</span></p>
      <p><strong>3. Thái độ:</strong> <span contenteditable="true" oninput="saveCurrentState()" id="obj-a">${esc(d.objectives.attitudes)}</span></p>
    `;
  }

  if ($('a4-preparation')) {
    $('a4-preparation').innerHTML = `
      <p><strong>• Đồ dùng của Cô:</strong> <span contenteditable="true" oninput="saveCurrentState()" id="prep-t">${esc(d.preparation.teacher)}</span></p>
      <p><strong>• Đồ dùng của Trẻ:</strong> <span contenteditable="true" oninput="saveCurrentState()" id="prep-k">${esc(d.preparation.kids)}</span></p>
    `;
  }

  if ($('a4-safety')) $('a4-safety').textContent = d.safety;
  if ($('a4-differentiation')) $('a4-differentiation').textContent = d.differentiation;
  if ($('a4-weather')) $('a4-weather').textContent = d.weather;
  if ($('a4-assessment')) $('a4-assessment').textContent = d.assessment;

  if ($('a4-procedure-body')) {
    $('a4-procedure-body').innerHTML = (d.procedure || []).map((p, i) => `
      <tr><td colspan="2" class="border border-pink-300 p-2 font-extrabold bg-pink-50/70 text-pink-900" contenteditable="true" oninput="saveCurrentState()" id="proc-title-${i}">${esc(p.actName)}</td></tr>
      <tr>
        <td class="border border-pink-300 p-2.5 align-top whitespace-pre-line" contenteditable="true" oninput="saveCurrentState()" id="proc-t-${i}">${esc(p.teacher)}</td>
        <td class="border border-pink-300 p-2.5 align-top whitespace-pre-line" contenteditable="true" oninput="saveCurrentState()" id="proc-k-${i}">${esc(p.kids)}</td>
      </tr>
    `).join('');
  }

  if ($('zalo-content')) $('zalo-content').textContent = d.zalo;

  renderWeek(d);
  if (window.renderA4TemplateGallery) window.renderA4TemplateGallery();

  if (d.gameQuestions && d.gameQuestions.length) {
    const gState = {
      index: 0,
      bank: d.gameQuestions,
      title: d.gameTitle || ('Đố Vui: ' + d.topic)
    };
    localStorage.setItem(GAME_KEY, JSON.stringify(gState));
    if (window.ensureGameDesignerReady) window.ensureGameDesignerReady();
  }
}

function renderWeek(d) {
  if (!$('weekly-plan-body')) return;
  $('weekly-plan-body').innerHTML = (d.weekRows || []).map((r, i) => `
    <tr>
      <td class="border border-pink-200 p-2.5 font-extrabold bg-pink-50 text-pink-900" contenteditable="true" oninput="saveCurrentState()" id="week-l-${i}">${esc(r.label)}</td>
      ${r.days.map((day, j) => `<td class="border border-pink-200 p-2.5 hover:bg-pink-50/30" contenteditable="true" oninput="saveCurrentState()" id="week-d-${i}-${j}">${esc(day)}</td>`).join('')}
    </tr>
  `).join('');
}

function readUI() {
  if (!currentLessonData) return;
  const d = currentLessonData;
  if ($('school-dept')) d.schoolDept = $('school-dept').innerText.trim();
  if ($('school-name')) d.schoolName = $('school-name').innerText.trim();
  if ($('a4-main-title')) d.title = $('a4-main-title').innerText.trim();
  if ($('a4-sub-topic')) d.subTopic = $('a4-sub-topic').innerText.trim();
  if ($('a4-field')) d.field = $('a4-field').innerText.trim();
  if ($('a4-age')) d.ageText = $('a4-age').innerText.trim();
  if ($('a4-duration')) d.duration = $('a4-duration').innerText.trim();
  if ($('teacher-name-footer')) d.teacherName = $('teacher-name-footer').innerText.trim();

  if ($('obj-k')) d.objectives.knowledge = $('obj-k').innerText.trim();
  if ($('obj-s')) d.objectives.skills = $('obj-s').innerText.trim();
  if ($('obj-a')) d.objectives.attitudes = $('obj-a').innerText.trim();

  if ($('prep-t')) d.preparation.teacher = $('prep-t').innerText.trim();
  if ($('prep-k')) d.preparation.kids = $('prep-k').innerText.trim();

  if ($('a4-safety')) d.safety = $('a4-safety').innerText.trim();
  if ($('a4-differentiation')) d.differentiation = $('a4-differentiation').innerText.trim();
  if ($('a4-weather')) d.weather = $('a4-weather').innerText.trim();
  if ($('a4-assessment')) d.assessment = $('a4-assessment').innerText.trim();
  if ($('zalo-content')) d.zalo = $('zalo-content').innerText.trim();

  if (d.procedure) {
    d.procedure = d.procedure.map((p, i) => ({
      actName: $(`proc-title-${i}`)?.innerText.trim() || p.actName,
      teacher: $(`proc-t-${i}`)?.innerText.trim() || p.teacher,
      kids: $(`proc-k-${i}`)?.innerText.trim() || p.kids
    }));
  }

  if (window.gState && window.gState.bank) {
    d.gameQuestions = JSON.parse(JSON.stringify(window.gState.bank));
    d.gameTitle = window.gState.title;
  }
}

window.saveCurrentState = function() {
  readUI();
  persist();
};

async function persist() {
  if (!currentLessonData) return;
  if (!currentLessonData.libraryId) currentLessonData.libraryId = 'hd_' + Date.now();
  currentLessonData.updatedAt = new Date().toISOString();

  const idx = lessonLibrary.items.findIndex(x => x.id === currentLessonData.libraryId);
  const entry = {
    id: currentLessonData.libraryId,
    updatedAt: currentLessonData.updatedAt,
    data: JSON.parse(JSON.stringify(currentLessonData))
  };

  if (idx < 0) lessonLibrary.items.push(entry);
  else lessonLibrary.items[idx] = entry;
  lessonLibrary.activeId = currentLessonData.libraryId;

  await dbSetLesson(entry);
  await dbSetState('activeId', currentLessonData.libraryId);

  try {
    localStorage.setItem(LIBRARY_KEY, JSON.stringify({ activeId: lessonLibrary.activeId, count: lessonLibrary.items.length }));
  } catch (e) {}

  if ($('save-status')) {
    $('save-status').textContent = '☁️ Đã lưu tự động';
  }
  renderLibraryUI();
}

// ===== TOAST NOTIFICATION =====
let toastTimer = null;
function showToast(title, msg, isSuccess = true) {
  const el = $('toast-notification');
  if (!el) return;
  $('toast-title').textContent = title;
  $('toast-message').textContent = msg;
  el.className = `no-print fixed top-16 right-5 z-50 max-w-sm w-full bg-white ${isSuccess ? 'border-pink-300 text-pink-950' : 'border-rose-400 text-rose-950'} rounded-2xl p-4 shadow-2xl border-2 flex items-start gap-3 animate-toast`;
  el.classList.remove('hidden');
  if (toastTimer) clearTimeout(toastTimer);
  toastTimer = setTimeout(() => hideToast(), 4500);
}
window.hideToast = function() {
  $('toast-notification')?.classList.add('hidden');
};

// ===== TẠO BÀI HỌC & BỘ CÂU HỎI MẪU =====
window.generateLessonPlan = function() {
  pushUndoState();
  const topic = clean($('topic-input')?.value) || 'Nhận biết các con vật quen thuộc quanh bé';
  const ageKey = $('age-selector')?.value || '3-4y';
  const isInclusive = !!$('inclusive-toggle')?.checked;
  const requirements = clean($('requirements-input')?.value);

  const btn1 = $('generate-btn');
  if (btn1) btn1.disabled = true;

  try {
    const data = lessonFromTemplate(topic, ageKey, isInclusive, requirements);
    populateUI(data);
    persist();
    toggleRightMenu(true);
    showToast('🌸 Đã tạo thành công!', `Chủ đề "${topic}" đã được đồng bộ vào Canvas Trò chơi & Giáo án A4!`);
  } finally {
    if (btn1) btn1.disabled = false;
  }
};

window.selectQuickAnimalTopic = function(topicText, packKey) {
  if ($('topic-input')) $('topic-input').value = topicText;
  const ageKey = $('age-selector')?.value || '3-4y';
  const isInclusive = !!$('inclusive-toggle')?.checked;
  const data = lessonFromTemplate(topicText, ageKey, isInclusive, '', packKey);
  populateUI(data);
  persist();
  loadAnimalPack(packKey, true);
  toggleRightMenu(true);
  showToast('🐾 Đã nạp chủ đề & câu đố con vật!', `Đã cập nhật Canvas theo chủ đề "${topicText}".`);
};

// ===== ĐIỀU HƯỚNG TAB =====
window.switchTab = function(tabId, skipPillReset = false) {
  saveCurrentState();
  document.querySelectorAll('.tab-page').forEach(el => el.classList.add('hidden'));
  const target = $('tab-content-' + tabId);
  if (target) target.classList.remove('hidden');

  document.querySelectorAll('.menu-nav-item').forEach(btn => btn.classList.remove('active'));
  const activeBtn = $('tab-btn-' + tabId);
  if (activeBtn) activeBtn.classList.add('active');

  if (!skipPillReset) {
    if (tabId === 'a4') updateTopHeaderPills('a4');
    else if (tabId === 'games') updateTopHeaderPills(window.gQuizPlay.mode || 'design');
    else updateTopHeaderPills('');
  }

  if (tabId === 'a4' && window.renderA4TemplateGallery) window.renderA4TemplateGallery();
  if (tabId === 'library') renderLibraryUI();
  if (tabId === 'games' && window.ensureGameDesignerReady) window.ensureGameDesignerReady();
};

window.onSettingChange = function() {
  if ($('settings-notice')) {
    $('settings-notice').innerHTML = '🌸 Đã cập nhật lứa tuổi. Bấm <strong>Tạo Trò Chơi & Giáo Án Mẫu</strong> để đồng bộ!';
  }
};

window.syncSchool = function() {
  if ($('school-dept')) $('school-dept').textContent = $('school-dept-input')?.value || 'PHÒNG GIÁO DỤC VÀ ĐÀO TẠO';
  if ($('school-name')) $('school-name').textContent = $('school-input')?.value || 'TRƯỜNG MẦM NON HÒA PHƯỚC';
  if ($('teacher-name-footer')) $('teacher-name-footer').textContent = $('teacher-input')?.value || 'Cô Giáo Mầm Non';
  saveCurrentState();
};

window.startVoiceInput = function() {
  const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
  if (!SR) {
    showToast('🎙️ Thông báo', 'Trình duyệt này chưa hỗ trợ nhập giọng nói.', false);
    return;
  }
  const rec = new SR();
  rec.lang = 'vi-VN';
  rec.onstart = () => { if ($('voice-btn')) $('voice-btn').textContent = '🔴 Đang nghe...'; };
  rec.onresult = e => {
    if ($('topic-input')) $('topic-input').value = e.results[0][0].transcript;
    if ($('voice-btn')) $('voice-btn').textContent = '🎙️ Nói chủ đề';
  };
  rec.onerror = () => {
    if ($('voice-btn')) $('voice-btn').textContent = '🎙️ Nói chủ đề';
  };
  rec.start();
};

// ===== THƯ VIỆN BÀI LƯU =====
async function renderLibraryUI() {
  try {
    const dbItems = await dbGetAllLessons();
    if (dbItems && dbItems.length) lessonLibrary.items = dbItems;
  } catch (e) {}

  const q = ($('library-search')?.value || '').toLowerCase();
  const list = (lessonLibrary.items || []).filter(x => (x.data?.topic || '').toLowerCase().includes(q));
  if ($('library-count')) $('library-count').textContent = lessonLibrary.items?.length || 0;
  if ($('library-result-count')) {
    $('library-result-count').textContent = `Tổng số bài đã lưu: ${lessonLibrary.items?.length || 0} bài • Hiển thị: ${list.length} bài`;
  }

  if ($('library-list')) {
    $('library-list').innerHTML = list.map(item => `
      <div class="bg-pink-50/40 border border-pink-200 p-3.5 rounded-2xl flex flex-wrap items-center justify-between gap-2 shadow-sm">
        <div>
          <h4 class="font-extrabold text-sm text-pink-900">🐾 ${esc(item.data.topic || 'Bài học & Trò chơi')}</h4>
          <p class="text-xs text-pink-600 mt-0.5">${esc(item.data.ageText || '')} • Số câu hỏi trò chơi: ${(item.data.gameQuestions || []).length} câu • Cập nhật: ${new Date(item.updatedAt).toLocaleDateString('vi-VN')}</p>
        </div>
        <div class="flex gap-1.5">
          <button class="bg-gradient-to-r from-pink-500 to-rose-500 text-white text-xs px-3.5 py-1.5 rounded-xl font-bold shadow-sm" onclick="openSavedLesson('${item.id}')">Mở trên Canvas</button>
          <button class="bg-white hover:bg-rose-50 text-rose-600 text-xs px-3 py-1.5 rounded-xl font-bold border border-rose-200" onclick="deleteSavedLesson('${item.id}')">Xóa</button>
        </div>
      </div>
    `).join('') || '<p class="text-xs text-pink-400 p-4 text-center">Chưa có bài lưu nào phù hợp.</p>';
  }
}
window.renderLibraryUI = renderLibraryUI;

window.openSavedLesson = function(id) {
  pushUndoState();
  const item = lessonLibrary.items.find(x => x.id === id);
  if (item) {
    populateUI(item.data);
    openCanvasSubMode('design');
    showToast('📂 Đã mở trên Canvas!', `Đã nạp "${item.data.topic}" thành công.`);
  }
};

window.deleteSavedLesson = async function(id) {
  if (!confirm('Cô có chắc muốn xóa bài học và trò chơi này khỏi thư viện?')) return;
  lessonLibrary.items = lessonLibrary.items.filter(x => x.id !== id);
  await dbDeleteLesson(id);
  renderLibraryUI();
};

window.resetToNew = function() {
  pushUndoState();
  const topic = 'Nhận biết các con vật quen thuộc quanh bé';
  const d = lessonFromTemplate(topic, $('age-selector')?.value || '3-4y', false);
  populateUI(d);
  persist();
  openCanvasSubMode('design');
  showToast('🌸 Đã tạo dự án mới!', 'Đã khôi phục bộ câu hỏi và giáo án mới.');
};

window.downloadBackup = function() {
  saveCurrentState();
  const blob = new Blob([JSON.stringify(currentLessonData, null, 2)], { type: 'application/json' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = `MamNonHoaPhuoc_${(currentLessonData.topic || 'BaiHoc').replace(/\s+/g, '_')}.json`;
  a.click();
};

window.downloadLibraryBackup = function() {
  const blob = new Blob([JSON.stringify(lessonLibrary, null, 2)], { type: 'application/json' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = `Thu_Vien_Mam_Non_Hoa_Phuoc.json`;
  a.click();
};

window.importBackupPicker = function() { $('backup-file')?.click(); };
window.importBackup = function(e) {
  const file = e.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = ev => {
    try {
      const parsed = JSON.parse(ev.target.result);
      if (parsed.items) {
        lessonLibrary = parsed;
        renderLibraryUI();
        showToast('📂 Khôi phục thành công!', 'Đã nạp toàn bộ thư viện bài học!');
      } else if (parsed.bank) {
        window.gState = parsed;
        saveGState();
        ensureGameDesignerReady();
        openCanvasSubMode('design');
        showToast('🎮 Đã mở bộ câu hỏi!', `Đã nạp "${parsed.title || 'Trò chơi'}" lên Canvas!`);
      } else {
        populateUI(parsed);
        persist();
        openCanvasSubMode('design');
        showToast('📂 Đã mở file!', 'Đã nạp bài học và trò chơi thành công!');
      }
      toggleRightMenu(true);
    } catch (err) {
      alert('File không đúng định dạng JSON!');
    }
  };
  reader.readAsText(file);
};

window.copyZaloText = function() {
  saveCurrentState();
  navigator.clipboard.writeText($('zalo-content')?.innerText || '').then(() => {
    showToast('📋 Đã sao chép!', 'Đã sao chép nội dung bản tin gửi phụ huynh vào bộ nhớ tạm!');
  });
};

// ==========================================================================
// CANVA-STYLE GAME & QUESTION STUDIO ENGINE
// ==========================================================================
window.gQuizPlay = { answered: false, score: 0, choice: 0, mode: 'design' };
window.gState = {
  index: 0,
  title: 'Đố Vui Nhận Biết Các Con Vật Quen Thuộc',
  bank: []
};
let fsAutoNextTimer = null;

function processImageUpload(file, callback, maxWidth = 1000) {
  if (!file) return;
  const reader = new FileReader();
  reader.onload = function(e) {
    const dataUrl = e.target?.result;
    if (!dataUrl) return;
    const img = new Image();
    img.onload = function() {
      try {
        const canvas = document.createElement('canvas');
        let width = img.width || 600, height = img.height || 600;
        if (width > maxWidth || height > maxWidth) {
          if (width > height) { height = Math.round((height * maxWidth) / width); width = maxWidth; }
          else { width = Math.round((width * maxWidth) / height); height = maxWidth; }
        }
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);
        const outType = (file.type === 'image/jpeg' || file.type === 'image/jpg') ? 'image/jpeg' : 'image/png';
        const compressed = canvas.toDataURL(outType, 0.88);
        callback(compressed && compressed.length > 32 ? compressed : dataUrl);
      } catch (err) { callback(dataUrl); }
    };
    img.onerror = function() { callback(dataUrl); };
    img.src = dataUrl;
  };
  reader.readAsDataURL(file);
}

// ===== KHO ẢNH TẢI LÊN ĐỂ TẠO CÂU HỎI & TRẢ LỜI (CUSTOM IMAGE STUDIO) =====
function loadCustomUploadedImages() {
  try {
    const raw = localStorage.getItem(CUSTOM_IMG_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) customUploadedImages = parsed;
    }
  } catch (e) {}
}

function saveCustomUploadedImages() {
  try {
    localStorage.setItem(CUSTOM_IMG_KEY, JSON.stringify(customUploadedImages));
  } catch (e) {}
}

function cleanFileNameToLabel(filename) {
  if (!filename) return 'Hình ảnh của cô';
  return String(filename)
    .replace(/\.[^/.]+$/, '')
    .replace(/[_-]+/g, ' ')
    .trim() || 'Hình ảnh của cô';
}

function addImageToCustomGallery(dataUrl, label = 'Hình ảnh mới', silent = false) {
  if (!dataUrl) return;
  const exists = customUploadedImages.some(item => item.dataUrl === dataUrl);
  if (!exists) {
    customUploadedImages.unshift({
      id: 'img_' + Date.now() + '_' + Math.random().toString(36).slice(2, 6),
      name: clean(label) || 'Hình ảnh mới',
      dataUrl
    });
    if (customUploadedImages.length > 40) customUploadedImages.pop();
    saveCustomUploadedImages();
  }
  renderUploadedGallery();
  if (!silent) {
    showToast('🖼️ Đã thêm ảnh vào Kho!', `Đã lưu "${label}" vào Kho ảnh tải lên của Cô!`);
  }
}

window.handleMultiCustomImagesUpload = function(e) {
  const files = Array.from(e.target.files || []);
  if (!files.length) return;
  let processed = 0;
  files.forEach(file => {
    const label = cleanFileNameToLabel(file.name);
    processImageUpload(file, function(dataUrl) {
      addImageToCustomGallery(dataUrl, label, true);
      processed++;
      if (processed === files.length) {
        renderUploadedGallery();
        showToast('📤 Tải ảnh lên thành công!', `Đã thêm ${files.length} ảnh mới vào Kho ảnh để tạo câu hỏi & đáp án!`);
      }
    }, 900);
  });
  e.target.value = '';
};

window.addCustomImageFromUrl = function() {
  const urlInput = $('custom-img-url-input');
  const nameInput = $('custom-img-name-input');
  const url = clean(urlInput?.value);
  const name = clean(nameInput?.value) || 'Hình ảnh từ link';
  if (!url) {
    showToast('🔗 Chưa nhập link ảnh', 'Cô vui lòng dán đường dẫn ảnh (https://...) vào ô nhé!', false);
    return;
  }
  addImageToCustomGallery(url, name, false);
  if (urlInput) urlInput.value = '';
  if (nameInput) nameInput.value = '';
};

window.updateCustomImageName = function(idx, newName) {
  if (!customUploadedImages[idx]) return;
  customUploadedImages[idx].name = clean(newName) || 'Hình ảnh';
  saveCustomUploadedImages();
};

window.deleteCustomImage = function(idx) {
  if (!customUploadedImages[idx]) return;
  customUploadedImages.splice(idx, 1);
  saveCustomUploadedImages();
  renderUploadedGallery();
};

window.clearAllCustomImages = function() {
  if (!customUploadedImages.length) return;
  if (!confirm('Cô có chắc muốn xóa toàn bộ ảnh trong Kho ảnh đã tải lên?')) return;
  customUploadedImages = [];
  saveCustomUploadedImages();
  renderUploadedGallery();
};

window.createQuestionFromCustomImage = function(idx) {
  const item = customUploadedImages[idx];
  if (!item) return;
  window.saveCurrentFormQ();

  // Lấy thêm 2 phương án nhiễu từ các ảnh khác hoặc từ kho con vật
  const otherCustom = customUploadedImages.filter((_, i) => i !== idx);
  const opt2 = otherCustom[0]
    ? { emoji: '🖼️', text: otherCustom[0].name, img: otherCustom[0].dataUrl }
    : { emoji: '🐱', text: 'Con Mèo', img: '' };
  const opt3 = otherCustom[1]
    ? { emoji: '🖼️', text: otherCustom[1].name, img: otherCustom[1].dataUrl }
    : { emoji: '🐶', text: 'Con Chó', img: '' };

  const newQ = {
    question: `Đố bé biết: Hình ảnh bên dưới là gì nhỉ?`,
    soundClue: `Bé hãy quan sát thật kỹ bức ảnh nhé!`,
    questionImg: item.dataUrl,
    options: [
      { emoji: '🖼️', text: item.name || 'Đáp án A', img: item.dataUrl },
      opt2,
      opt3
    ],
    correct: '1',
    feedbackRight: `Hoan hô bé! Chính xác là ${item.name} rồi! 💖`,
    feedbackWrong: `Chưa đúng rồi, bé quan sát kỹ hình ảnh và chọn lại nhé! 🌸`
  };

  window.gState.bank.push(newQ);
  window.chooseGameQ(window.gState.bank.length - 1);
  saveCurrentState();
  showToast('➕ Đã tạo trang câu hỏi từ ảnh!', `Đã tạo Trang ${window.gState.bank.length} với hình ảnh "${item.name}".`);
};

window.applyCustomImgToQuestion = function(idx) {
  const item = customUploadedImages[idx];
  if (!item) return;
  window.saveCurrentFormQ();
  const q = window.gState.bank[window.gState.index];
  if (!q) return;
  q.questionImg = item.dataUrl;
  saveGState();
  loadFormQ(window.gState.index);
  renderPreview();
  renderQuizSummaryTable();
  showToast('🎯 Đã gắn ảnh vào Câu Hỏi!', `Đã đặt ảnh "${item.name}" làm hình minh họa cho câu hỏi hiện tại.`);
};

window.applyCustomImgToOption = function(idx, optNum) {
  const item = customUploadedImages[idx];
  if (!item) return;
  window.saveCurrentFormQ();
  const q = window.gState.bank[window.gState.index];
  if (!q || !q.options || !q.options[optNum - 1]) return;
  q.options[optNum - 1].img = item.dataUrl;
  if (item.name && item.name !== 'Hình ảnh của cô' && item.name !== 'Hình ảnh mới') {
    q.options[optNum - 1].text = item.name;
  }
  saveGState();
  loadFormQ(window.gState.index);
  renderNav();
  renderPreview();
  renderQuizSummaryTable();
  const letter = ['A', 'B', 'C'][optNum - 1] || 'A';
  showToast(`🖼️ Đã gắn ảnh vào Đáp án ${letter}!`, `Đáp án ${letter} đã được cập nhật hình ảnh "${item.name}".`);
};

window.renderUploadedGallery = function() {
  const grid = $('uploaded-gallery-grid');
  const countEl = $('uploaded-gallery-count');
  if (!grid) return;

  if (countEl) {
    countEl.textContent = `📂 Kho ảnh đã tải lên của Cô (${customUploadedImages.length} ảnh) — Bấm nút dưới mỗi ảnh để Tạo câu hỏi mới hoặc gán vào Câu hỏi / Đáp án A, B, C:`;
  }

  if (!customUploadedImages.length) {
    grid.innerHTML = `
      <div class="col-span-full bg-pink-50/50 border-2 border-dashed border-pink-200 rounded-2xl p-5 text-center">
        <p class="text-xs font-extrabold text-pink-700 mb-1">📤 Chưa có ảnh nào trong Kho ảnh tải lên của Cô</p>
        <p class="text-[11px] text-pink-500 mb-2.5">Cô hãy bấm nút <strong>"Chọn Tải Nhiều Ảnh Từ Máy Tính"</strong> ở góc trên bên phải khay này để tải ảnh con vật, đồ vật, hoa quả... lên tạo câu hỏi và đáp án nhé!</p>
        <button type="button" onclick="openFilePicker('multi-custom-img-file')" class="bg-pink-500 hover:bg-pink-600 text-white font-extrabold px-4 py-1.5 rounded-xl text-xs shadow-sm">
          📤 Tải ảnh từ máy tính lên ngay
        </button>
      </div>
    `;
    return;
  }

  grid.innerHTML = customUploadedImages.map((item, idx) => `
    <div class="bg-white border-2 border-pink-200 rounded-2xl p-2.5 flex flex-col justify-between gap-1.5 shadow-xs hover:border-pink-400 transition">
      <div class="relative w-full h-24 bg-pink-50/40 rounded-xl overflow-hidden flex items-center justify-center border border-pink-100">
        <img src="${item.dataUrl}" alt="${esc(item.name)}" class="max-h-full max-w-full object-contain"/>
        <button type="button" onclick="deleteCustomImage(${idx})" class="absolute top-1 right-1 bg-rose-500 hover:bg-rose-600 text-white rounded-full w-5 h-5 text-[10px] font-bold flex items-center justify-center shadow" title="Xóa ảnh này khỏi kho">✕</button>
      </div>
      <input type="text" value="${esc(item.name)}" oninput="updateCustomImageName(${idx}, this.value)" placeholder="Tên ảnh / Đáp án..." class="w-full text-center text-xs font-extrabold text-pink-900 bg-pink-50/60 border border-pink-200 rounded-lg px-2 py-1 outline-none focus:border-pink-400 focus:bg-white"/>
      <button type="button" onclick="createQuestionFromCustomImage(${idx})" class="w-full bg-gradient-to-r from-pink-500 to-rose-400 hover:from-pink-600 hover:to-rose-500 text-white font-extrabold text-[11px] py-1 px-2 rounded-lg shadow-xs transition">
        ➕ Tạo câu hỏi mới từ ảnh
      </button>
      <div class="grid grid-cols-4 gap-1">
        <button type="button" onclick="applyCustomImgToQuestion(${idx})" class="bg-pink-50 hover:bg-pink-200 text-pink-800 border border-pink-200 rounded-md py-1 text-[10px] font-extrabold" title="Đặt làm Ảnh Câu Hỏi của trang hiện tại">Câu hỏi</button>
        <button type="button" onclick="applyCustomImgToOption(${idx}, 1)" class="bg-pink-50 hover:bg-pink-200 text-pink-800 border border-pink-200 rounded-md py-1 text-[10px] font-extrabold" title="Gán làm Ảnh Đáp Án A">Đ.Án A</button>
        <button type="button" onclick="applyCustomImgToOption(${idx}, 2)" class="bg-pink-50 hover:bg-pink-200 text-pink-800 border border-pink-200 rounded-md py-1 text-[10px] font-extrabold" title="Gán làm Ảnh Đáp Án B">Đ.Án B</button>
        <button type="button" onclick="applyCustomImgToOption(${idx}, 3)" class="bg-pink-50 hover:bg-pink-200 text-pink-800 border border-pink-200 rounded-md py-1 text-[10px] font-extrabold" title="Gán làm Ảnh Đáp Án C">Đ.Án C</button>
      </div>
    </div>
  `).join('');
};

function loadGState() {
  try {
    const raw = localStorage.getItem(GAME_KEY);
    if (raw) window.gState = JSON.parse(raw);
  } catch (e) {}
  if (!window.gState.bank || !window.gState.bank.length) {
    window.gState.bank = window.getQuestionsFromPack('default_animals');
    window.gState.title = 'Đố Vui Nhận Biết Các Con Vật Quen Thuộc';
  }
}

function saveGState() {
  try {
    localStorage.setItem(GAME_KEY, JSON.stringify(window.gState));
    if (currentLessonData) {
      currentLessonData.gameQuestions = JSON.parse(JSON.stringify(window.gState.bank));
      currentLessonData.gameTitle = window.gState.title;
    }
  } catch (e) {}
}

function getFilteredAnimalBank() {
  const searchVal = ($('animal-bank-search')?.value || '').trim().toLowerCase();
  return (window.ANIMAL_BANK || []).filter(a => {
    const matchCat = activeAnimalCategory === 'all' || a.category === activeAnimalCategory;
    if (!matchCat) return false;
    if (!searchVal) return true;
    const haystack = `${a.name} ${a.sound} ${a.trait} ${a.question}`.toLowerCase();
    return haystack.includes(searchVal);
  });
}

window.renderAnimalQuickBank = function() {
  const filterBox = $('animal-category-filter');
  const bankBox = $('animal-quick-bank');
  if (!filterBox || !bankBox || !window.ANIMAL_BANK) return;

  filterBox.innerHTML = (window.ANIMAL_CATEGORIES || []).map(cat => `
    <button type="button" onclick="setAnimalCategoryFilter('${cat.id}')" class="text-xs px-3 py-1 rounded-full font-extrabold border transition ${activeAnimalCategory === cat.id ? 'bg-pink-500 text-white border-pink-600 shadow-sm' : 'bg-white text-pink-700 border-pink-200 hover:bg-pink-100'}">
      ${esc(cat.label)}
    </button>
  `).join('');

  const filtered = getFilteredAnimalBank();

  bankBox.innerHTML = filtered.map(animal => `
    <button type="button" onclick="insertAnimalQuestion('${animal.id}')" class="animal-chip" title="Bấm để thêm trang câu hỏi về ${esc(animal.name)} (${esc(animal.sound)})">
      <span class="text-lg">${animal.emoji}</span>
      <span>${esc(animal.name)}</span>
      <span class="text-[10px] text-pink-500 font-semibold">(${esc(animal.sound)})</span>
      <span class="text-pink-500 font-black">+</span>
    </button>
  `).join('') || '<span class="text-xs text-pink-500 italic py-2">Không tìm thấy con vật nào phù hợp với từ khóa.</span>';
};

window.addAllFilteredAnimalsToGame = function() {
  const filtered = getFilteredAnimalBank();
  if (!filtered.length) return;
  window.saveCurrentFormQ();
  filtered.forEach(found => {
    window.gState.bank.push({
      animalId: found.id,
      animalName: found.name,
      soundClue: `${found.sound} — ${found.trait}`,
      question: found.question,
      questionImg: '',
      options: JSON.parse(JSON.stringify(found.options)),
      correct: found.correct,
      feedbackRight: found.feedbackRight,
      feedbackWrong: found.feedbackWrong
    });
  });
  window.chooseGameQ(window.gState.bank.length - 1);
  saveCurrentState();
  showToast(`🐾 Đã thêm ${filtered.length} con vật!`, `Trò chơi hiện có tổng cộng ${window.gState.bank.length} trang câu hỏi trên Canvas!`);
};

window.setAnimalCategoryFilter = function(catId) {
  activeAnimalCategory = catId;
  renderAnimalQuickBank();
};

window.insertAnimalQuestion = function(animalId) {
  const found = (window.ANIMAL_BANK || []).find(a => a.id === animalId);
  if (!found) return;
  window.saveCurrentFormQ();
  const newQ = {
    animalId: found.id,
    animalName: found.name,
    soundClue: `${found.sound} — ${found.trait}`,
    question: found.question,
    questionImg: '',
    options: JSON.parse(JSON.stringify(found.options)),
    correct: found.correct,
    feedbackRight: found.feedbackRight,
    feedbackWrong: found.feedbackWrong
  };
  window.gState.bank.push(newQ);
  window.chooseGameQ(window.gState.bank.length - 1);
  saveCurrentState();
  showToast(`🐾 Đã thêm trang "${found.name}"!`, `Trang ${window.gState.bank.length}: ${found.question}`);
};

window.loadAnimalPack = function(packKey, silent = false) {
  const pack = window.PRESET_GAME_PACKS?.[packKey];
  if (!pack) return;
  const questions = window.getQuestionsFromPack(packKey);
  window.gState = {
    index: 0,
    title: pack.title,
    bank: questions
  };
  if ($('game-title-input')) $('game-title-input').value = pack.title;
  saveGState();
  ensureGameDesignerReady();
  saveCurrentState();
  if (!silent) {
    showToast('🎁 Đã nạp bộ câu hỏi lên Canvas!', `Bộ "${pack.title}" (${questions.length} trang câu hỏi) đã sẵn sàng!`);
  }
};

window.saveCurrentFormQ = function() {
  if (!window.gState.bank || !window.gState.bank[window.gState.index]) return;
  const currentQ = window.gState.bank[window.gState.index];
  window.gState.bank[window.gState.index] = {
    ...currentQ,
    question: $('game-question-input')?.value || '',
    soundClue: $('game-sound-clue-input')?.value || '',
    questionImg: currentQ.questionImg || '',
    options: [1, 2, 3].map(i => ({
      emoji: $('game-opt' + i + '-emoji')?.value || '🐾',
      text: $('game-opt' + i + '-text')?.value || '',
      img: currentQ.options?.[i - 1]?.img || ''
    })),
    correct: $('game-correct-select')?.value || '1',
    feedbackRight: $('game-feedback-right-input')?.value || 'Hoan hô bé! Chính xác rồi! 💖',
    feedbackWrong: $('game-feedback-wrong-input')?.value || 'Chưa đúng rồi, bé thử lại nhé! 🌸'
  };
  window.gState.title = $('game-title-input')?.value || 'Đố Vui Nhận Biết Các Con Vật';
  saveGState();
};

window.ensureGameDesignerReady = function() {
  loadCustomUploadedImages();
  loadGState();
  if (window.gState.index >= window.gState.bank.length) window.gState.index = 0;
  if ($('game-title-input')) $('game-title-input').value = window.gState.title || 'Đố Vui Nhận Biết Các Con Vật';
  renderAnimalQuickBank();
  renderUploadedGallery();
  renderNav();
  loadFormQ(window.gState.index);
  renderPreview();
  renderQuizSummaryTable();
  if (window.gQuizPlay.mode === 'memory') initMemoryGame();
};

// Render Canva-style Bottom Filmstrip Thumbnails
function renderNav() {
  const list = $('quiz-question-list');
  if (!list) return;
  list.innerHTML = window.gState.bank.map((q, i) => {
    const rightOpt = q.options?.[Number(q.correct || 1) - 1] || q.options?.[0];
    const icon = rightOpt?.emoji || '🐾';
    const label = rightOpt?.text || `Câu ${i + 1}`;
    return `
      <button type="button" class="filmstrip-thumb ${i === window.gState.index ? 'is-active' : ''}" onclick="chooseGameQ(${i})">
        <div class="flex items-center justify-between w-full">
          <span class="text-[10px] font-black text-pink-600 bg-white px-2 py-0.5 rounded-md border border-pink-200">Trang ${i + 1}</span>
          <span class="text-xl leading-none">${icon}</span>
        </div>
        <div class="text-[11px] font-extrabold text-pink-950 truncate w-full mt-1">
          ${esc(label)}
        </div>
      </button>
    `;
  }).join('');

  if ($('quiz-question-count')) $('quiz-question-count').textContent = `${window.gState.bank.length} trang câu hỏi`;
  if ($('current-q-indicator')) $('current-q-indicator').textContent = `TRANG CÂU HỎI ${window.gState.index + 1} / ${window.gState.bank.length}`;
}

function loadFormQ(i) {
  const q = window.gState.bank[i] || window.gState.bank[0];
  if (!q) return;
  if ($('game-question-input')) $('game-question-input').value = q.question || '';
  if ($('game-sound-clue-input')) $('game-sound-clue-input').value = q.soundClue || (q.traitClue ? `${q.traitClue}` : 'Bé hãy quan sát và đoán xem là gì nhé!');

  const qImgBox = $('game-question-img-preview');
  const qImgThumb = $('game-question-img-thumb');
  if (q.questionImg) {
    if (qImgThumb) qImgThumb.src = q.questionImg;
    if (qImgBox) qImgBox.classList.remove('hidden');
  } else {
    if (qImgBox) qImgBox.classList.add('hidden');
  }

  [1, 2, 3].forEach(idx => {
    const emojiInput = $('game-opt' + idx + '-emoji');
    if (emojiInput) emojiInput.value = q.options[idx - 1]?.emoji || '🐾';
    if ($('game-opt' + idx + '-text')) $('game-opt' + idx + '-text').value = q.options[idx - 1]?.text || '';

    const optImgBox = $('game-opt' + idx + '-img-preview');
    const optImgThumb = $('game-opt' + idx + '-img-thumb');
    if (q.options?.[idx - 1]?.img) {
      if (optImgThumb) optImgThumb.src = q.options[idx - 1].img;
      if (optImgBox) optImgBox.classList.remove('hidden');
      if (emojiInput) emojiInput.classList.add('hidden');
    } else {
      if (optImgBox) optImgBox.classList.add('hidden');
      if (emojiInput) emojiInput.classList.remove('hidden');
    }
  });

  if ($('game-correct-select')) $('game-correct-select').value = q.correct || '1';
  if ($('game-feedback-right-input')) $('game-feedback-right-input').value = q.feedbackRight || 'Hoan hô bé! Chính xác rồi! 💖';
  if ($('game-feedback-wrong-input')) $('game-feedback-wrong-input').value = q.feedbackWrong || 'Chưa đúng rồi, bé thử lại nhé! 🌸';
  updateCorrectBoxHighlight();
}

function updateCorrectBoxHighlight() {
  const target = $('game-correct-select')?.value || '1';
  [1, 2, 3].forEach(i => {
    const box = $('box-opt-' + i);
    if (box) {
      if (String(i) === String(target)) box.classList.add('is-correct-target');
      else box.classList.remove('is-correct-target');
    }
  });
}

window.selectCorrectOption = function(optVal) {
  if ($('game-correct-select')) $('game-correct-select').value = String(optVal);
  if ($('quiz-stage-correct-select')) $('quiz-stage-correct-select').value = String(optVal);
  updateGameDesigner();
};

window.handleQuestionImgUpload = function(e) {
  const files = Array.from(e.target.files || []);
  if (!files.length) return;
  let processed = 0;
  files.forEach((file, idx) => {
    const label = cleanFileNameToLabel(file.name);
    processImageUpload(file, function(dataUrl) {
      if (idx === 0 && window.gState.bank && window.gState.bank[window.gState.index]) {
        window.gState.bank[window.gState.index].questionImg = dataUrl;
      }
      addImageToCustomGallery(dataUrl, label, true);
      processed++;
      if (processed === files.length) {
        saveGState();
        loadFormQ(window.gState.index);
        renderPreview();
        renderQuizSummaryTable();
        renderUploadedGallery();
        showToast('📤 Đã tải ảnh lên thành công!', files.length > 1
          ? `Đã gắn ảnh đầu tiên vào thẻ câu hỏi và lưu cả ${files.length} ảnh vào Kho ảnh tải lên!`
          : 'Ảnh đã được gắn vào thẻ câu hỏi và lưu vào Kho ảnh tải lên của Cô.');
      }
    });
  });
  e.target.value = '';
};

window.removeQuestionImg = function() {
  if (window.gState.bank && window.gState.bank[window.gState.index]) {
    window.gState.bank[window.gState.index].questionImg = '';
  }
  saveGState();
  loadFormQ(window.gState.index);
  renderPreview();
  renderQuizSummaryTable();
};

window.triggerOptImgUpload = function(i) {
  window.openFilePicker('game-opt' + i + '-img-file');
};

window.handleOptImgUpload = function(i, e) {
  const file = e.target.files[0];
  if (!file) return;
  const label = cleanFileNameToLabel(file.name);
  processImageUpload(file, function(dataUrl) {
    if (window.gState.bank && window.gState.bank[window.gState.index]) {
      const q = window.gState.bank[window.gState.index];
      if (q.options && q.options[i - 1]) {
        q.options[i - 1].img = dataUrl;
      }
    }
    addImageToCustomGallery(dataUrl, label, true);
    saveGState();
    loadFormQ(window.gState.index);
    renderPreview();
    renderQuizSummaryTable();
    const letter = ['A', 'B', 'C'][i - 1] || 'A';
    showToast(`🖼️ Đã tải ảnh cho Đáp án ${letter}!`, `Ảnh đã được gắn vào Đáp án ${letter} và lưu vào Kho ảnh của Cô.`);
  });
  e.target.value = '';
};

window.removeOptImg = function(i) {
  if (window.gState.bank && window.gState.bank[window.gState.index]) {
    const q = window.gState.bank[window.gState.index];
    if (q.options && q.options[i - 1]) q.options[i - 1].img = '';
  }
  saveGState();
  loadFormQ(window.gState.index);
  renderPreview();
  renderQuizSummaryTable();
};

window.chooseGameQ = function(i) {
  window.saveCurrentFormQ();
  window.gState.index = i;
  loadFormQ(i);
  window.gQuizPlay.answered = false;
  renderNav();
  renderPreview();
  renderQuizSummaryTable();
};

window.updateGameDesigner = function() {
  window.saveCurrentFormQ();
  updateCorrectBoxHighlight();
  renderNav();
  renderPreview();
  renderQuizSummaryTable();
};

// ===== TẠO CÂU HỎI & CHỌN ĐÁP ÁN ĐÚNG NGAY TRONG MỤC BÉ CHƠI ĐỐ VUI =====
let qbTempQuestionImg = '';
let qbTempOptImgs = ['', '', ''];

window.changeCorrectFromQuizStage = function(val) {
  const q = window.gState.bank?.[window.gState.index];
  if (!q) return;
  q.correct = String(val || '1');
  if ($('game-correct-select')) $('game-correct-select').value = q.correct;
  updateCorrectBoxHighlight();
  saveGState();
  renderNav();
  renderPreview();
  renderQuizSummaryTable();
  const letter = ['A', 'B', 'C'][Number(q.correct) - 1] || 'A';
  showToast(`✓ Đã chọn Đáp án ${letter} là đáp án đúng!`, `Câu ${window.gState.index + 1} hiện có đáp án đúng là Đáp án ${letter}.`);
};

window.toggleQuizQuickBuilder = function() {
  const panel = $('quiz-quick-builder-panel');
  if (!panel) return;
  panel.classList.toggle('hidden');
  if (!panel.classList.contains('hidden')) {
    window.loadCurrentQuestionIntoQuickBuilder();
  }
};

window.loadCurrentQuestionIntoQuickBuilder = function() {
  const q = window.gState.bank?.[window.gState.index];
  if (!q) return;
  if ($('qb-question-input')) $('qb-question-input').value = q.question || '';
  if ($('qb-clue-input')) $('qb-clue-input').value = q.soundClue || '';
  qbTempQuestionImg = q.questionImg || '';
  if ($('qb-q-img-status')) {
    $('qb-q-img-status').classList.toggle('hidden', !qbTempQuestionImg);
  }
  [1, 2, 3].forEach(i => {
    const opt = q.options?.[i - 1] || { emoji: '🐾', text: '', img: '' };
    if ($('qb-opt' + i + '-emoji')) $('qb-opt' + i + '-emoji').value = opt.emoji || '🐾';
    if ($('qb-opt' + i + '-text')) $('qb-opt' + i + '-text').value = opt.text || '';
    qbTempOptImgs[i - 1] = opt.img || '';
    if ($('qb-opt' + i + '-img-status')) {
      $('qb-opt' + i + '-img-status').classList.toggle('hidden', !qbTempOptImgs[i - 1]);
    }
  });
  const radios = document.querySelectorAll('input[name="qb-correct-radio"]');
  radios.forEach(r => {
    r.checked = String(r.value) === String(q.correct || '1');
  });
};

window.handleQbQuestionImg = function(e) {
  const file = e.target.files?.[0];
  if (!file) return;
  const label = cleanFileNameToLabel(file.name);
  processImageUpload(file, function(dataUrl) {
    qbTempQuestionImg = dataUrl;
    addImageToCustomGallery(dataUrl, label, true);
    if ($('qb-q-img-status')) $('qb-q-img-status').classList.remove('hidden');
    showToast('📤 Đã chọn ảnh câu hỏi!', 'Bấm "Cập nhật" hoặc "Thêm làm câu hỏi mới" để áp dụng.');
  });
  e.target.value = '';
};

window.handleQbOptImg = function(idx, e) {
  const file = e.target.files?.[0];
  if (!file) return;
  const label = cleanFileNameToLabel(file.name);
  processImageUpload(file, function(dataUrl) {
    qbTempOptImgs[idx - 1] = dataUrl;
    if ($('qb-opt' + idx + '-text') && !$('qb-opt' + idx + '-text').value.trim()) {
      $('qb-opt' + idx + '-text').value = label;
    }
    addImageToCustomGallery(dataUrl, label, true);
    if ($('qb-opt' + idx + '-img-status')) $('qb-opt' + idx + '-img-status').classList.remove('hidden');
    const letter = ['A', 'B', 'C'][idx - 1] || 'A';
    showToast(`📤 Đã tải ảnh Đáp án ${letter}!`, 'Bấm "Cập nhật" hoặc "Thêm làm câu hỏi mới" để lưu.');
  });
  e.target.value = '';
};

function buildQuestionObjectFromQuickBuilder() {
  const checkedRadio = document.querySelector('input[name="qb-correct-radio"]:checked');
  const correctVal = checkedRadio ? String(checkedRadio.value) : '1';
  const questionText = clean($('qb-question-input')?.value) || 'Đố bé biết: Đây là con vật gì?';
  const clueText = clean($('qb-clue-input')?.value) || 'Bé hãy quan sát và chọn đáp án đúng nhé!';
  const options = [1, 2, 3].map(i => ({
    emoji: clean($('qb-opt' + i + '-emoji')?.value) || '🐾',
    text: clean($('qb-opt' + i + '-text')?.value) || `Đáp án ${['A', 'B', 'C'][i - 1]}`,
    img: qbTempOptImgs[i - 1] || ''
  }));
  const rightOpt = options[Number(correctVal) - 1] || options[0];
  return {
    question: questionText,
    soundClue: clueText,
    questionImg: qbTempQuestionImg || '',
    options,
    correct: correctVal,
    feedbackRight: `Hoan hô bé! Đáp án chính xác là ${rightOpt.text}! 💖`,
    feedbackWrong: 'Chưa đúng rồi, bé quan sát kỹ và chọn lại nhé! 🌸'
  };
}

window.saveQuickBuilderToCurrentQuestion = function() {
  if (!window.gState.bank || !window.gState.bank[window.gState.index]) return;
  const updated = buildQuestionObjectFromQuickBuilder();
  window.gState.bank[window.gState.index] = {
    ...window.gState.bank[window.gState.index],
    ...updated
  };
  window.gQuizPlay.answered = false;
  saveGState();
  loadFormQ(window.gState.index);
  renderNav();
  renderPreview();
  renderQuizSummaryTable();
  showToast('💾 Đã cập nhật câu hỏi!', 'Đã lưu câu hỏi và đáp án đúng vào câu đang chơi.');
};

window.addQuickBuilderAsNewQuestion = function() {
  const newQ = buildQuestionObjectFromQuickBuilder();
  window.gState.bank.push(newQ);
  window.gState.index = window.gState.bank.length - 1;
  window.gQuizPlay.answered = false;
  saveGState();
  loadFormQ(window.gState.index);
  renderNav();
  renderPreview();
  renderQuizSummaryTable();
  showToast('➕ Đã tạo câu hỏi mới!', `Đã thêm Câu ${window.gState.bank.length} và chuyển sang chơi ngay!`);
};

window.addGameQuestionV7 = function() {
  window.saveCurrentFormQ();
  window.gState.bank.push({
    question: 'Đố bé biết: Con gì có bộ lông mềm, kêu "meo meo" và thích bắt chuột?',
    soundClue: 'Tiếng kêu: Meo meo meo!',
    questionImg: '',
    options: [
      { emoji: '🐱', text: 'Con Mèo', img: '' },
      { emoji: '🐶', text: 'Con Chó', img: '' },
      { emoji: '🦆', text: 'Con Vịt', img: '' }
    ],
    correct: '1',
    feedbackRight: 'Hoan hô bé! Bé trả lời chính xác rồi! 💖',
    feedbackWrong: 'Chưa đúng rồi, bé quan sát và chọn lại nhé! 🌸'
  });
  window.chooseGameQ(window.gState.bank.length - 1);
  showToast('➕ Đã thêm trang mới!', `Hiện có ${window.gState.bank.length} trang câu hỏi.`);
};

window.duplicateCurrentQuestion = function() {
  window.saveCurrentFormQ();
  const currentQ = window.gState.bank[window.gState.index];
  if (!currentQ) return;
  const copy = JSON.parse(JSON.stringify(currentQ));
  window.gState.bank.splice(window.gState.index + 1, 0, copy);
  window.chooseGameQ(window.gState.index + 1);
  showToast('📑 Đã nhân bản trang!', 'Cô có thể sửa lại nội dung trên trang vừa nhân bản.');
};

window.deleteGameQuestionV7 = function() {
  if (window.gState.bank.length <= 1) {
    showToast('⚠️ Lưu ý', 'Trò chơi cần có ít nhất 1 trang câu hỏi!', false);
    return;
  }
  window.gState.bank.splice(window.gState.index, 1);
  window.gState.index = Math.max(0, window.gState.index - 1);
  saveGState();
  loadFormQ(window.gState.index);
  renderNav();
  renderPreview();
  renderQuizSummaryTable();
};

window.generateSingleAnimalQuestionWithAI = function() {
  const existingQuestions = new Set((window.gState.bank || []).map(q => q.question));
  const available = (window.ANIMAL_BANK || []).filter(a => !existingQuestions.has(a.question));
  const pool = available.length ? available : (window.ANIMAL_BANK || []);
  const picked = pool[Math.floor(Math.random() * pool.length)];
  if (picked) {
    window.insertAnimalQuestion(picked.id);
  }
};

function renderQuizSummaryTable() {
  const container = $('quiz-summary-table-body');
  if (!container || !window.gState?.bank) return;
  container.innerHTML = window.gState.bank.map((q, idx) => {
    const rightIdx = Number(q.correct || 1) - 1;
    const rightOpt = q.options?.[rightIdx] || q.options?.[0] || { emoji: '🐾', text: '' };
    const isCurrent = idx === window.gState.index;
    return `
      <div onclick="chooseGameQ(${idx})" class="cursor-pointer p-2.5 rounded-xl border transition flex items-center justify-between gap-2 ${isCurrent ? 'bg-pink-100/90 border-pink-400 shadow-sm' : 'bg-white border-pink-200 hover:bg-pink-50'}">
        <div class="flex items-center gap-2 min-w-0">
          <span class="w-6 h-6 rounded-lg bg-pink-500 text-white font-black text-[11px] flex items-center justify-center flex-shrink-0">${idx + 1}</span>
          <div class="min-w-0">
            <p class="text-xs font-extrabold text-pink-950 truncate">${esc(q.question)}</p>
            <p class="text-[11px] text-pink-600 truncate">
              Đúng: <strong>${rightOpt.emoji} ${esc(rightOpt.text)}</strong>
            </p>
          </div>
        </div>
      </div>
    `;
  }).join('');
}

function renderPreview() {
  const q = window.gState.bank[window.gState.index] || window.gState.bank[0];
  if (!q) return;
  if ($('game-preview-question')) $('game-preview-question').textContent = q.question;
  if ($('game-preview-clue')) {
    $('game-preview-clue').textContent = q.soundClue || q.traitClue || 'Bé hãy quan sát thật kỹ nhé!';
  }
  if ($('quiz-stage-correct-select')) {
    $('quiz-stage-correct-select').value = String(q.correct || '1');
  }

  const pImgContainer = $('game-preview-img-container');
  const pImg = $('game-preview-img');
  if (q.questionImg) {
    if (pImg) pImg.src = q.questionImg;
    if (pImgContainer) pImgContainer.classList.remove('hidden');
  } else {
    if (pImgContainer) pImgContainer.classList.add('hidden');
  }

  [1, 2, 3].forEach(i => {
    const opt = q.options[i - 1];
    if ($('game-preview-emoji-' + i)) $('game-preview-emoji-' + i).textContent = opt?.emoji || '🐾';
    if ($('game-preview-text-' + i)) $('game-preview-text-' + i).textContent = opt?.text || '';

    const pOptBox = $('game-preview-img-box-' + i);
    const pOptImg = $('game-preview-img-' + i);
    const pOptEmoji = $('game-preview-emoji-' + i);
    if (opt?.img) {
      if (pOptImg) pOptImg.src = opt.img;
      if (pOptBox) pOptBox.classList.remove('hidden');
      if (pOptEmoji) pOptEmoji.classList.add('hidden');
    } else {
      if (pOptBox) pOptBox.classList.add('hidden');
      if (pOptEmoji) pOptEmoji.classList.remove('hidden');
    }

    const btn = $('choice-btn-' + i);
    if (btn) {
      btn.className = 'quiz-stage-choice-card group bg-white hover:bg-pink-50 text-pink-950 rounded-3xl border-2 border-pink-200 hover:border-pink-400 shadow-md hover:shadow-lg transition-all flex flex-col items-center justify-center';
    }
  });

  if (!window.gQuizPlay.answered && $('game-preview-answer')) {
    $('game-preview-answer').innerHTML = '<span class="text-pink-600 text-base sm:text-lg">🌸 Bé hãy quan sát hình ảnh và chạm vào thẻ đáp án đúng nhé!</span>';
  }
  if ($('quiz-play-progress')) {
    $('quiz-play-progress').textContent = `CÂU ${window.gState.index + 1} / ${window.gState.bank.length}`;
  }
  if ($('quiz-play-score-pill')) {
    $('quiz-play-score-pill').textContent = `⭐ Điểm của bé: ${window.gQuizPlay.score}`;
  }
}

window.pickGameAnswerV7 = function(choice) {
  const q = window.gState.bank[window.gState.index];
  if (!q) return;
  const isRight = String(choice) === String(q.correct);

  if (isRight) {
    if (!window.gQuizPlay.answered) {
      window.gQuizPlay.score++;
      window.gQuizPlay.answered = true;
    }
    playCheerSound();
    const chosenBtn = $('choice-btn-' + choice);
    if (chosenBtn) {
      chosenBtn.className = 'quiz-stage-choice-card group bg-emerald-50 text-emerald-950 rounded-3xl border-3 border-emerald-500 shadow-lg flex flex-col items-center justify-center scale-105';
    }
    if ($('game-preview-answer')) {
      $('game-preview-answer').innerHTML = `<span class="text-emerald-600 font-black text-lg sm:text-xl">🎉 ${esc(q.feedbackRight || 'Hoan hô bé! Chính xác rồi!')}</span>`;
    }
  } else {
    playGentleRetrySound();
    const chosenBtn = $('choice-btn-' + choice);
    if (chosenBtn) {
      chosenBtn.className = 'quiz-stage-choice-card group bg-rose-50 text-rose-900 rounded-3xl border-2 border-rose-400 opacity-75 flex flex-col items-center justify-center';
    }
    if ($('game-preview-answer')) {
      $('game-preview-answer').innerHTML = `<span class="text-rose-600 font-black text-base sm:text-lg">🌸 ${esc(q.feedbackWrong || 'Chưa đúng rồi! Bé chọn lại nhé.')}</span>`;
    }
  }

  if ($('quiz-play-score-pill')) {
    $('quiz-play-score-pill').textContent = `⭐ Điểm của bé: ${window.gQuizPlay.score}`;
  }
};

window.resetGamePlayState = function() {
  window.gQuizPlay.answered = false;
  window.gQuizPlay.score = 0;
  window.chooseGameQ(0);
  if (window.gQuizPlay.mode === 'memory') initMemoryGame();
};

window.prevGamePreviewQ = function() {
  window.gQuizPlay.answered = false;
  if (window.gState.index > 0) {
    window.chooseGameQ(window.gState.index - 1);
  }
};

window.nextGamePreviewV7 = function() {
  window.gQuizPlay.answered = false;
  if (window.gState.index + 1 < window.gState.bank.length) {
    window.chooseGameQ(window.gState.index + 1);
  } else {
    playCheerSound();
    showToast('🎉 Hoàn thành trò chơi!', `Xuất sắc quá! Bé đã đạt ${window.gQuizPlay.score} / ${window.gState.bank.length} điểm!`);
    window.resetGamePlayState();
  }
};

// ===== TRÒ CHƠI LẬT ẢNH CON VẬT (CHO PHÉP TẢI ẢNH TẠO CẶP THẺ ĐÚNG MỚI & TÙY CHỈNH PHẦN THƯỞNG) =====
const MEMORY_PAIRS_KEY = 'mamnon_hoaphuoc_memory_pairs_v1';
const MEMORY_REWARDS_KEY = 'mamnon_hoaphuoc_memory_rewards_v1';

const DEFAULT_MEMORY_REWARDS = [
  { icon: '🍬', text: 'Bé được tặng 1 viên kẹo ngọt ngào!' },
  { icon: '👏', text: 'Bé được nhận 1 tràng vỗ tay thật lớn từ cả lớp!' },
  { icon: '⭐', text: 'Bé được tặng 1 sticker ngôi sao bé ngoan!' },
  { icon: '👑', text: 'Bé được làm Đội Trưởng Tí Hon hôm nay!' },
  { icon: '🎈', text: 'Bé được tặng 1 quả bóng bay màu hồng!' }
];

let customMemoryPairs = [];
let memoryRewards = [];
let autoRewardOnMatch = true;
let activeMemoryPairsPool = [];
let memoryCards = [];
let flippedIndices = [];
let matchedPairs = 0;
let totalMemoryPairs = 6;
let memoryLock = false;

function loadMemorySettings() {
  try {
    const rawPairs = localStorage.getItem(MEMORY_PAIRS_KEY);
    if (rawPairs) {
      const parsed = JSON.parse(rawPairs);
      if (Array.isArray(parsed)) customMemoryPairs = parsed;
    }
  } catch (e) {}

  try {
    const rawRewards = localStorage.getItem(MEMORY_REWARDS_KEY);
    if (rawRewards) {
      const parsed = JSON.parse(rawRewards);
      if (Array.isArray(parsed) && parsed.length) memoryRewards = parsed;
    }
  } catch (e) {}

  if (!memoryRewards || !memoryRewards.length) {
    memoryRewards = JSON.parse(JSON.stringify(DEFAULT_MEMORY_REWARDS));
  }
}

function saveCustomMemoryPairs() {
  try {
    localStorage.setItem(MEMORY_PAIRS_KEY, JSON.stringify(customMemoryPairs));
  } catch (e) {}
}

function saveMemoryRewards() {
  try {
    localStorage.setItem(MEMORY_REWARDS_KEY, JSON.stringify(memoryRewards));
  } catch (e) {}
}

window.toggleMemoryPairsPanel = function() {
  const panel = $('memory-pairs-panel');
  if (!panel) return;
  panel.classList.toggle('hidden');
  renderMemoryPairsList();
};

window.toggleMemoryRewardsPanel = function() {
  const panel = $('memory-rewards-panel');
  if (!panel) return;
  panel.classList.toggle('hidden');
  renderMemoryRewardsList();
};

window.handleMemoryPairFilesUpload = function(e) {
  const files = Array.from(e.target.files || []);
  if (!files.length) return;
  loadMemorySettings();
  let processed = 0;
  files.forEach(file => {
    const label = cleanFileNameToLabel(file.name);
    processImageUpload(file, function(dataUrl) {
      customMemoryPairs.unshift({
        id: 'mp_' + Date.now() + '_' + Math.random().toString(36).slice(2, 6),
        emoji: '🖼️',
        name: label,
        img: dataUrl,
        sound: ''
      });
      addImageToCustomGallery(dataUrl, label, true);
      processed++;
      if (processed === files.length) {
        saveCustomMemoryPairs();
        initMemoryGame();
        if ($('memory-pairs-panel')) $('memory-pairs-panel').classList.remove('hidden');
        renderMemoryPairsList();
        showToast('🃏 Đã tạo cặp thẻ mới từ ảnh!', `Đã thêm ${files.length} cặp thẻ hình ảnh mới vào bàn chơi Lật Ảnh Con Vật!`);
      }
    }, 800);
  });
  e.target.value = '';
};

window.handleSingleMemoryPairUpload = function(e) {
  const file = e.target.files?.[0];
  if (!file) return;
  loadMemorySettings();
  const customName = clean($('custom-pair-name-input')?.value) || cleanFileNameToLabel(file.name);
  processImageUpload(file, function(dataUrl) {
    customMemoryPairs.unshift({
      id: 'mp_' + Date.now() + '_' + Math.random().toString(36).slice(2, 6),
      emoji: '🖼️',
      name: customName,
      img: dataUrl,
      sound: ''
    });
    addImageToCustomGallery(dataUrl, customName, true);
    if ($('custom-pair-name-input')) $('custom-pair-name-input').value = '';
    saveCustomMemoryPairs();
    initMemoryGame();
    renderMemoryPairsList();
    showToast('🃏 Đã thêm cặp thẻ mới!', `Cặp thẻ "${customName}" đã được đưa vào bàn chơi!`);
  }, 800);
  e.target.value = '';
};

window.updateCustomMemoryPairName = function(idx, newName) {
  if (!customMemoryPairs[idx]) return;
  customMemoryPairs[idx].name = clean(newName) || 'Cặp thẻ';
  saveCustomMemoryPairs();
  initMemoryGame();
};

window.removeCustomMemoryPair = function(idx) {
  if (!customMemoryPairs[idx]) return;
  customMemoryPairs.splice(idx, 1);
  saveCustomMemoryPairs();
  initMemoryGame();
  renderMemoryPairsList();
};

window.clearCustomMemoryPairs = function() {
  customMemoryPairs = [];
  saveCustomMemoryPairs();
  initMemoryGame();
  renderMemoryPairsList();
  showToast('🔄 Đã khôi phục cặp thẻ mẫu!', 'Bàn chơi đang sử dụng các cặp thẻ con vật từ bộ câu hỏi.');
};

function renderMemoryPairsList() {
  const grid = $('memory-pairs-list-grid');
  const label = $('memory-pairs-list-label');
  if (!grid) return;

  if (label) {
    label.textContent = customMemoryPairs.length
      ? `📂 Các cặp thẻ ảnh Cô đã tải lên (${customMemoryPairs.length} cặp — được ưu tiên hiển thị trên bàn chơi):`
      : `📂 Đang dùng ${activeMemoryPairsPool.length} cặp thẻ mặc định (Tải ảnh lên để tạo cặp thẻ mới của riêng Cô):`;
  }

  if (customMemoryPairs.length) {
    grid.innerHTML = customMemoryPairs.map((item, idx) => `
      <div class="bg-white border border-pink-200 rounded-2xl p-2 flex flex-col items-center gap-1 relative shadow-xs">
        <button type="button" onclick="removeCustomMemoryPair(${idx})" class="absolute top-1 right-1 bg-rose-500 text-white rounded-full w-4 h-4 text-[10px] font-bold flex items-center justify-center" title="Xóa cặp thẻ này">✕</button>
        <div class="w-16 h-14 rounded-xl bg-pink-50 flex items-center justify-center overflow-hidden border border-pink-100">
          ${item.img ? `<img src="${item.img}" alt="${esc(item.name)}" class="w-full h-full object-contain"/>` : `<span class="text-2xl">${item.emoji}</span>`}
        </div>
        <input type="text" value="${esc(item.name)}" oninput="updateCustomMemoryPairName(${idx}, this.value)" class="w-full text-center text-[11px] font-extrabold text-pink-900 bg-pink-50/70 border border-pink-200 rounded-lg px-1.5 py-0.5 outline-none"/>
        <span class="text-[10px] text-emerald-600 font-bold">✓ 2 thẻ giống nhau</span>
      </div>
    `).join('');
  } else {
    grid.innerHTML = activeMemoryPairsPool.map(item => `
      <div class="bg-white border border-pink-200 rounded-2xl p-2 flex flex-col items-center gap-1 shadow-xs">
        <div class="w-14 h-12 rounded-xl bg-pink-50 flex items-center justify-center overflow-hidden">
          ${item.img ? `<img src="${item.img}" alt="${esc(item.name)}" class="w-full h-full object-contain"/>` : `<span class="text-2xl">${item.emoji}</span>`}
        </div>
        <span class="text-[11px] font-extrabold text-pink-900 truncate w-full text-center">${esc(item.name)}</span>
      </div>
    `).join('');
  }
}

// Quản lý Phần Thưởng Lật Thẻ
window.toggleAutoRewardOnMatch = function(checked) {
  autoRewardOnMatch = Boolean(checked);
};

window.addCustomMemoryReward = function() {
  const icon = clean($('new-reward-icon-input')?.value) || '🎁';
  const text = clean($('new-reward-text-input')?.value);
  if (!text) {
    showToast('🎁 Chưa nhập phần thưởng', 'Cô hãy nhập nội dung phần thưởng (VD: Bé được tặng 1 viên kẹo) nhé!', false);
    return;
  }
  memoryRewards.unshift({ icon, text });
  saveMemoryRewards();
  if ($('new-reward-text-input')) $('new-reward-text-input').value = '';
  renderMemoryRewardsList();
  showToast('🎁 Đã thêm phần thưởng mới!', `"${icon} ${text}" đã được thêm vào danh sách phần thưởng!`);
};

window.updateMemoryRewardItem = function(idx, field, val) {
  if (!memoryRewards[idx]) return;
  memoryRewards[idx][field] = clean(val) || (field === 'icon' ? '🎁' : 'Phần thưởng cho bé');
  saveMemoryRewards();
};

window.deleteMemoryRewardItem = function(idx) {
  if (memoryRewards.length <= 1) {
    showToast('⚠️ Lưu ý', 'Cần giữ lại ít nhất 1 phần thưởng trong danh sách!', false);
    return;
  }
  memoryRewards.splice(idx, 1);
  saveMemoryRewards();
  renderMemoryRewardsList();
};

window.resetDefaultMemoryRewards = function() {
  memoryRewards = JSON.parse(JSON.stringify(DEFAULT_MEMORY_REWARDS));
  saveMemoryRewards();
  renderMemoryRewardsList();
  showToast('🎁 Đã khôi phục phần thưởng mẫu!', 'Đã nạp lại 5 phần thưởng mẫu đáng yêu cho bé.');
};

function renderMemoryRewardsList() {
  const container = $('memory-rewards-list');
  if (!container) return;
  container.innerHTML = memoryRewards.map((rw, idx) => `
    <div class="bg-white border border-pink-200 rounded-2xl p-2 flex items-center gap-1.5 shadow-xs">
      <input type="text" value="${esc(rw.icon)}" oninput="updateMemoryRewardItem(${idx}, 'icon', this.value)" class="w-9 text-center text-base bg-pink-50 border border-pink-200 rounded-lg py-1 outline-none"/>
      <input type="text" value="${esc(rw.text)}" oninput="updateMemoryRewardItem(${idx}, 'text', this.value)" class="flex-1 bg-pink-50/40 border border-pink-200 rounded-lg px-2 py-1 text-xs font-bold text-pink-950 outline-none focus:bg-white"/>
      <button type="button" onclick="showMemoryRewardBanner(${idx})" class="bg-pink-500 hover:bg-pink-600 text-white font-extrabold px-2.5 py-1 rounded-lg text-[11px] whitespace-nowrap" title="Trao phần thưởng này ngay">
        🎁 Trao ngay
      </button>
      <button type="button" onclick="deleteMemoryRewardItem(${idx})" class="bg-rose-50 hover:bg-rose-100 text-rose-600 font-bold px-2 py-1 rounded-lg text-xs" title="Xóa phần thưởng này">✕</button>
    </div>
  `).join('');
}

window.showMemoryRewardBanner = function(specificIdx = null) {
  if (!memoryRewards || !memoryRewards.length) {
    loadMemorySettings();
  }
  const idx = (specificIdx !== null && memoryRewards[specificIdx])
    ? specificIdx
    : Math.floor(Math.random() * memoryRewards.length);
  const chosen = memoryRewards[idx] || DEFAULT_MEMORY_REWARDS[0];
  const banner = $('memory-reward-banner');
  if ($('memory-reward-banner-icon')) $('memory-reward-banner-icon').textContent = chosen.icon || '🎁';
  if ($('memory-reward-banner-text')) $('memory-reward-banner-text').textContent = chosen.text;
  if (banner) banner.classList.remove('hidden');
  playCheerSound();
};

window.drawRandomMemoryReward = function() {
  window.showMemoryRewardBanner(null);
};

window.hideMemoryRewardBanner = function() {
  $('memory-reward-banner')?.classList.add('hidden');
};

window.initMemoryGame = function() {
  loadMemorySettings();
  const pairsPool = [];
  const seenKeys = new Set();

  // 1. Ưu tiên đưa tất cả các cặp thẻ ảnh Cô tải lên vào bàn chơi trước
  (customMemoryPairs || []).forEach(cp => {
    const key = cp.id || cp.name;
    if (!seenKeys.has(key)) {
      seenKeys.add(key);
      pairsPool.push({
        emoji: cp.emoji || '🖼️',
        name: cp.name || 'Hình ảnh',
        img: cp.img || '',
        sound: cp.sound || ''
      });
    }
  });

  // 2. Nếu số cặp thẻ tải lên chưa đủ 6 cặp, lấy bổ sung từ các câu hỏi hiện có hoặc kho con vật
  (window.gState.bank || []).forEach(q => {
    if (pairsPool.length >= 6 && customMemoryPairs.length < 6) return;
    const rightOpt = q.options?.[Number(q.correct || 1) - 1];
    if (rightOpt && !seenKeys.has(rightOpt.text) && pairsPool.length < Math.max(6, customMemoryPairs.length)) {
      seenKeys.add(rightOpt.text);
      pairsPool.push({
        emoji: rightOpt.emoji || '🐾',
        name: rightOpt.text || 'Con vật',
        img: rightOpt.img || q.questionImg || '',
        sound: q.soundClue || ''
      });
    }
  });

  (window.ANIMAL_BANK || []).forEach(a => {
    if (pairsPool.length < 6 && !seenKeys.has(a.name)) {
      seenKeys.add(a.name);
      pairsPool.push({ emoji: a.emoji, name: a.name, img: '', sound: a.sound });
    }
  });

  const maxPairs = customMemoryPairs.length >= 6 ? Math.min(customMemoryPairs.length, 9) : 6;
  activeMemoryPairsPool = pairsPool.slice(0, maxPairs);
  totalMemoryPairs = activeMemoryPairsPool.length;

  const deck = [];
  activeMemoryPairsPool.forEach((item, idx) => {
    deck.push({ pairId: idx, emoji: item.emoji, name: item.name, img: item.img || '', sound: item.sound, flipped: false, matched: false });
    deck.push({ pairId: idx, emoji: item.emoji, name: item.name, img: item.img || '', sound: item.sound, flipped: false, matched: false });
  });

  for (let i = deck.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [deck[i], deck[j]] = [deck[j], deck[i]];
  }

  memoryCards = deck;
  flippedIndices = [];
  matchedPairs = 0;
  memoryLock = false;
  hideMemoryRewardBanner();
  renderMemoryBoard();
  renderMemoryPairsList();
  renderMemoryRewardsList();
  if ($('memory-feedback-bar')) {
    $('memory-feedback-bar').innerHTML = '🐾 Bé hãy chạm vào 2 ô dấu hỏi (?) màu hồng để tìm cặp thẻ giống nhau và nhận phần thưởng nhé!';
  }
};

function renderMemoryBoard() {
  const container = $('memory-cards-container');
  if (!container) return;
  if ($('memory-status-badge')) {
    $('memory-status-badge').textContent = `Đã ghép: ${matchedPairs} / ${totalMemoryPairs} cặp`;
  }
  container.innerHTML = memoryCards.map((card, i) => {
    if (card.matched || card.flipped) {
      return `
        <div class="memory-card ${card.matched ? 'matched' : 'face-up'} animate-pop">
          ${card.img
            ? `<img src="${card.img}" alt="${esc(card.name)}" class="w-16 h-14 sm:w-20 sm:h-16 object-contain rounded-xl bg-white p-1 border border-pink-200 shadow-xs mb-1"/>`
            : `<span class="text-3xl sm:text-4xl mb-1">${card.emoji}</span>`
          }
          <span class="text-[11px] sm:text-xs font-extrabold text-pink-900 leading-tight line-clamp-1">${esc(card.name)}</span>
        </div>
      `;
    }
    return `
      <div onclick="flipMemoryCard(${i})" class="memory-card face-down hover:scale-105">
        <span class="text-2xl sm:text-3xl">🐾</span>
        <span class="text-xs mt-1 opacity-90">Ô số ${i + 1}</span>
      </div>
    `;
  }).join('');
}

window.flipMemoryCard = function(index) {
  if (memoryLock) return;
  const card = memoryCards[index];
  if (!card || card.flipped || card.matched) return;

  card.flipped = true;
  flippedIndices.push(index);
  renderMemoryBoard();

  if (flippedIndices.length === 2) {
    memoryLock = true;
    const [idx1, idx2] = flippedIndices;
    const c1 = memoryCards[idx1];
    const c2 = memoryCards[idx2];

    if (c1.pairId === c2.pairId) {
      c1.matched = c2.matched = true;
      matchedPairs++;
      flippedIndices = [];
      memoryLock = false;
      playCheerSound();
      renderMemoryBoard();

      const chosenReward = (memoryRewards && memoryRewards.length)
        ? memoryRewards[Math.floor(Math.random() * memoryRewards.length)]
        : DEFAULT_MEMORY_REWARDS[0];

      if (autoRewardOnMatch) {
        showMemoryRewardBanner();
      }

      if ($('memory-feedback-bar')) {
        $('memory-feedback-bar').innerHTML = `🎉 <span class="text-emerald-600">Hoan hô! Bé đã ghép đúng cặp <strong>${esc(c1.name)}</strong>! Phần thưởng: <strong>${chosenReward.icon} ${esc(chosenReward.text)}</strong></span>`;
      }
      if (matchedPairs === totalMemoryPairs) {
        showMemoryRewardBanner();
        showToast('🏆 Bé xuất sắc quá!', `Bé đã mở hết cả ${totalMemoryPairs} cặp thẻ! ${chosenReward.icon} ${chosenReward.text}`);
      }
    } else {
      playGentleRetrySound();
      if ($('memory-feedback-bar')) {
        $('memory-feedback-bar').innerHTML = `🌸 Hai thẻ <strong>${esc(c1.name)}</strong> và <strong>${esc(c2.name)}</strong> chưa giống nhau rồi, bé nhớ vị trí để lật lại nhé!`;
      }
      setTimeout(() => {
        c1.flipped = false;
        c2.flipped = false;
        flippedIndices = [];
        memoryLock = false;
        renderMemoryBoard();
      }, 950);
    }
  }
};

// ===== TRÌNH CHIẾU TRÒ CHƠI TOÀN MÀN HÌNH (TV / MÁY CHIẾU) =====
window.startFullscreenQuiz = function(keepCurrentIndex = false) {
  window.saveCurrentFormQ();
  window.gQuizPlay.answered = false;
  if (!keepCurrentIndex) {
    window.gQuizPlay.score = 0;
    window.gState.index = 0;
  }
  updateFullscreenQuizUI();
  const modal = $('fullscreen-quiz-modal');
  if (modal) {
    modal.classList.remove('hidden');
    if (document.documentElement.requestFullscreen && !document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
    }
  }
};

window.toggleBrowserFullscreen = function() {
  if (!document.fullscreenElement) {
    document.documentElement.requestFullscreen?.().catch(() => {});
  } else {
    document.exitFullscreen?.().catch(() => {});
  }
};

window.closeFullscreenQuiz = function() {
  if (fsAutoNextTimer) clearTimeout(fsAutoNextTimer);
  $('fullscreen-quiz-modal')?.classList.add('hidden');
  if (document.fullscreenElement && document.exitFullscreen) {
    document.exitFullscreen().catch(() => {});
  }
};

function updateFullscreenQuizUI() {
  const bank = window.gState.bank || [];
  const index = window.gState.index || 0;
  const q = bank[index] || bank[0];
  if (!q) return;

  if ($('fs-quiz-title')) $('fs-quiz-title').textContent = window.gState.title || 'Đố Vui Nhận Biết Các Con Vật';
  if ($('fs-quiz-progress')) $('fs-quiz-progress').textContent = `CÂU HỎI ${index + 1} / ${bank.length}`;
  if ($('fs-quiz-score')) $('fs-quiz-score').textContent = `Điểm: ${window.gQuizPlay.score}`;
  if ($('fs-quiz-question')) $('fs-quiz-question').textContent = q.question;
  if ($('fs-quiz-clue')) $('fs-quiz-clue').textContent = q.soundClue || 'Bé hãy quan sát và chọn đáp án đúng nhé!';

  const fsQContainer = $('fs-quiz-img-container');
  const fsQImg = $('fs-quiz-img');
  if (q.questionImg) {
    if (fsQImg) fsQImg.src = q.questionImg;
    if (fsQContainer) fsQContainer.classList.remove('hidden');
  } else {
    if (fsQContainer) fsQContainer.classList.add('hidden');
  }

  [1, 2, 3].forEach(i => {
    const opt = q.options[i - 1];
    if ($('fs-choice-emoji-' + i)) $('fs-choice-emoji-' + i).textContent = opt?.emoji || '🐾';
    if ($('fs-choice-text-' + i)) $('fs-choice-text-' + i).textContent = opt?.text || '';

    const fsImgBox = $('fs-choice-img-box-' + i);
    const fsImg = $('fs-choice-img-' + i);
    const fsEmoji = $('fs-choice-emoji-' + i);
    if (opt?.img) {
      if (fsImg) fsImg.src = opt.img;
      if (fsImgBox) fsImgBox.classList.remove('hidden');
      if (fsEmoji) fsEmoji.classList.add('hidden');
    } else {
      if (fsImgBox) fsImgBox.classList.add('hidden');
      if (fsEmoji) fsEmoji.classList.remove('hidden');
    }

    const btn = $('fs-choice-btn-' + i);
    if (btn) {
      btn.disabled = false;
      btn.style.opacity = '1';
      btn.className = 'fs-presentation-choice-card group relative bg-white hover:bg-pink-50 text-pink-950 border-pink-200 hover:border-pink-400 shadow-xl transition-all duration-300 transform active:scale-95 flex flex-col items-center justify-center';
    }
  });

  $('fs-quiz-feedback')?.classList.add('hidden');
  $('fs-quiz-next-btn')?.classList.add('hidden');
}

window.pickFullscreenQuizAnswer = function(choice) {
  if (window.gQuizPlay.answered) return;
  const q = window.gState.bank[window.gState.index];
  if (!q) return;

  window.gQuizPlay.answered = true;
  const isRight = String(choice) === String(q.correct);
  const fb = $('fs-quiz-feedback');
  if (fb) fb.classList.remove('hidden');

  if (isRight) {
    window.gQuizPlay.score++;
    playCheerSound();
    if ($('fs-quiz-score')) $('fs-quiz-score').textContent = `Điểm: ${window.gQuizPlay.score}`;
    if (fb) {
      fb.className = 'px-8 py-4 rounded-3xl text-lg sm:text-3xl font-black bg-emerald-500 text-white border-2 border-emerald-300 shadow-xl animate-bounce';
      fb.innerHTML = `🎉 ${esc(q.feedbackRight || 'Hoan hô bé! Chính xác rồi! 💖')}`;
    }
  } else {
    playGentleRetrySound();
    if (fb) {
      fb.className = 'px-8 py-4 rounded-3xl text-lg sm:text-3xl font-black bg-rose-500 text-white border-2 border-rose-300 shadow-xl';
      fb.innerHTML = `🌸 ${esc(q.feedbackWrong || 'Chưa đúng rồi! Bé thử lại nhé!')}`;
    }
  }

  [1, 2, 3].forEach(i => {
    const btn = $('fs-choice-btn-' + i);
    if (!btn) return;
    btn.disabled = true;
    if (String(i) === String(q.correct)) {
      btn.className = 'fs-presentation-choice-card group relative bg-emerald-50 text-emerald-950 border-emerald-500 shadow-2xl flex flex-col items-center justify-center scale-105';
    } else {
      btn.style.opacity = '0.45';
    }
  });

  const nextBtn = $('fs-quiz-next-btn');
  if (nextBtn) {
    nextBtn.classList.remove('hidden');
    setTimeout(() => nextBtn.scrollIntoView({ behavior: 'smooth', block: 'end' }), 100);
  }

  if (fsAutoNextTimer) clearTimeout(fsAutoNextTimer);
  fsAutoNextTimer = setTimeout(() => {
    if (window.gQuizPlay.answered) nextFullscreenQuizQuestion();
  }, 3000);
};

window.nextFullscreenQuizQuestion = function() {
  if (fsAutoNextTimer) clearTimeout(fsAutoNextTimer);
  window.gQuizPlay.answered = false;
  const bank = window.gState.bank || [];
  if (window.gState.index + 1 < bank.length) {
    window.gState.index++;
    updateFullscreenQuizUI();
    $('fullscreen-quiz-modal')?.scrollTo({ top: 0, behavior: 'smooth' });
  } else {
    playCheerSound();
    alert(`🎉 HOÀN THÀNH XUẤT SẮC! Các bé đã đạt ${window.gQuizPlay.score} / ${bank.length} điểm!`);
    window.closeFullscreenQuiz();
  }
};

// ==========================================================================
// XUẤT BỘ CÂU HỎI & TRÒ CHƠI RA FILE WORD (.DOC) VÀ PDF (.PDF)
// ==========================================================================
function buildQuizPrintableHTML() {
  window.saveCurrentFormQ();
  const schoolDept = $('school-dept-input')?.value || 'PHÒNG GIÁO DỤC VÀ ĐÀO TẠO';
  const schoolName = $('school-input')?.value || 'TRƯỜNG MẦM NON HÒA PHƯỚC';
  const teacherName = $('teacher-input')?.value || 'Cô Giáo Mầm Non';
  const ageText = getAgeLabel($('age-selector')?.value || '3-4y');
  const gameTitle = window.gState.title || 'Đố Vui Nhận Biết Các Con Vật Quen Thuộc';
  const bank = window.gState.bank || [];

  return `
    <div style="font-family: 'Times New Roman', serif; color: #1f2937; line-height: 1.45;">
      <table style="width: 100%; border-collapse: collapse; margin-bottom: 14px; border-bottom: 2px solid #db2777; padding-bottom: 8px;">
        <tr>
          <td style="width: 48%; text-align: center; vertical-align: top; font-size: 11pt; font-weight: bold;">
            <div>${esc(schoolDept)}</div>
            <div style="color: #be185d;">${esc(schoolName)}</div>
          </td>
          <td style="width: 52%; text-align: center; vertical-align: top; font-size: 11pt; font-weight: bold;">
            <div>CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM</div>
            <div style="font-style: italic; font-weight: normal;">Độc lập - Tự do - Hạnh phúc</div>
          </td>
        </tr>
      </table>

      <div style="text-align: center; margin-bottom: 18px;">
        <h1 style="font-size: 16pt; font-weight: bold; color: #9d174d; text-transform: uppercase; margin: 4px 0;">
          BỘ CÂU HỎI & TRÒ CHƠI NHẬN BIẾT CÁC CON VẬT
        </h1>
        <h2 style="font-size: 13.5pt; font-weight: bold; color: #db2777; margin: 4px 0;">
          Tên trò chơi: ${esc(gameTitle)}
        </h2>
        <p style="font-size: 11pt; font-style: italic; margin: 4px 0;">
          Độ tuổi: <strong>${esc(ageText)}</strong> • Số lượng: <strong>${bank.length} câu hỏi</strong> • Giáo viên biên soạn: <strong>${esc(teacherName)}</strong>
        </p>
      </div>

      <div style="font-size: 12pt; font-weight: bold; color: #9d174d; border-bottom: 1.5px solid #f472b6; padding-bottom: 4px; margin-bottom: 12px; text-transform: uppercase;">
        I. CHI TIẾT BỘ CÂU HỎI ĐỐ VUI & KỊCH BẢN TRÒ CHƠI
      </div>

      ${bank.map((q, idx) => {
        const rightIdx = Number(q.correct || 1) - 1;
        const letters = ['A', 'B', 'C'];
        return `
          <div style="border: 1.5px solid #fbcfe8; background-color: #fffbfe; border-radius: 10px; padding: 10px 14px; margin-bottom: 12px; page-break-inside: avoid;">
            <p style="margin: 0 0 6px 0; font-size: 12pt; font-weight: bold; color: #831843;">
              Câu ${idx + 1}: ${esc(q.question)}
            </p>
            ${q.soundClue ? `<p style="margin: 0 0 8px 0; font-size: 10.5pt; font-style: italic; color: #be185d;">💡 Gợi ý / Đặc điểm: ${esc(q.soundClue)}</p>` : ''}
            ${q.questionImg ? `<div style="margin: 6px 0;"><img src="${q.questionImg}" style="max-height: 90px; border-radius: 8px; border: 1px solid #f9a8d4;"/></div>` : ''}
            <table style="width: 100%; border-collapse: collapse; margin-top: 6px;">
              <tr>
                ${(q.options || []).map((opt, oIdx) => {
                  const isCorrect = oIdx === rightIdx;
                  const visualHTML = opt.img
                    ? `<img src="${opt.img}" style="max-height: 58px; max-width: 90px; object-fit: contain; border-radius: 6px; margin: 0 auto 4px auto; display: block;"/>`
                    : `<div style="font-size: 18pt;">${opt.emoji || '🐾'}</div>`;
                  return `
                    <td style="width: 33.3%; border: 1px solid ${isCorrect ? '#db2777' : '#e5e7eb'}; background-color: ${isCorrect ? '#fdf2f8' : '#ffffff'}; padding: 8px; text-align: center; font-size: 11pt;">
                      ${visualHTML}
                      <div style="font-weight: bold; color: ${isCorrect ? '#9d174d' : '#1f2937'};">
                        ${letters[oIdx]}. ${esc(opt.text)} ${isCorrect ? '✓ (Đúng)' : ''}
                      </div>
                    </td>
                  `;
                }).join('')}
              </tr>
            </table>
            <p style="margin: 6px 0 0 0; font-size: 10pt; color: #047857;">
              <strong>• Lời khen khi trẻ trả lời đúng:</strong> ${esc(q.feedbackRight || 'Hoan hô bé!')}
            </p>
          </div>
        `;
      }).join('')}

      <div style="font-size: 12pt; font-weight: bold; color: #9d174d; border-bottom: 1.5px solid #f472b6; padding-bottom: 4px; margin: 18px 0 10px 0; text-transform: uppercase; page-break-inside: avoid;">
        II. BẢNG TỔNG HỢP ĐÁP ÁN NHANH DÀNH CHO GIÁO VIÊN
      </div>
      <table style="width: 100%; border-collapse: collapse; margin-bottom: 18px; font-size: 11pt;">
        <thead>
          <tr style="background-color: #fce7f3; color: #831843; font-weight: bold;">
            <th style="border: 1px solid #f472b6; padding: 6px; width: 12%; text-align: center;">Câu số</th>
            <th style="border: 1px solid #f472b6; padding: 6px; width: 53%; text-align: left;">Tóm tắt câu hỏi đố bé</th>
            <th style="border: 1px solid #f472b6; padding: 6px; width: 35%; text-align: left;">Đáp án đúng</th>
          </tr>
        </thead>
        <tbody>
          ${bank.map((q, idx) => {
            const rightIdx = Number(q.correct || 1) - 1;
            const rightOpt = q.options?.[rightIdx] || { emoji: '🐾', text: '' };
            const letter = ['A', 'B', 'C'][rightIdx] || 'A';
            return `
              <tr>
                <td style="border: 1px solid #fbcfe8; padding: 6px; text-align: center; font-weight: bold;">Câu ${idx + 1}</td>
                <td style="border: 1px solid #fbcfe8; padding: 6px;">${esc(q.question)}</td>
                <td style="border: 1px solid #fbcfe8; padding: 6px; font-weight: bold; color: #be185d;">${letter}. ${rightOpt.emoji || ''} ${esc(rightOpt.text)}</td>
              </tr>
            `;
          }).join('')}
        </tbody>
      </table>

      <div style="font-size: 12pt; font-weight: bold; color: #9d174d; border-bottom: 1.5px solid #f472b6; padding-bottom: 4px; margin: 18px 0 10px 0; text-transform: uppercase;">
        III. PHIẾU BÀI TẬP NHẬN BIẾT CON VẬT CHO BÉ (PHÁT CHO TRẺ KHOANH TRÒN)
      </div>
      <p style="font-size: 11pt; margin-bottom: 10px;">
        <strong>Họ và tên bé:</strong> ........................................................................ <strong>Lớp:</strong> ........................................
      </p>
      ${bank.map((q, idx) => `
        <div style="border: 1px dashed #f472b6; border-radius: 8px; padding: 8px 12px; margin-bottom: 10px; page-break-inside: avoid;">
          <p style="margin: 0 0 6px 0; font-size: 11.5pt; font-weight: bold;">
            Câu ${idx + 1}: ${esc(q.question)}
          </p>
          ${q.questionImg ? `<div style="margin: 4px 0 6px 0;"><img src="${q.questionImg}" style="max-height: 75px; border-radius: 6px; border: 1px solid #f9a8d4;"/></div>` : ''}
          <table style="width: 100%; border-collapse: collapse;">
            <tr>
              ${(q.options || []).map((opt, oIdx) => {
                const visualHTML = opt.img
                  ? `<img src="${opt.img}" style="max-height: 55px; max-width: 85px; object-fit: contain; border-radius: 6px; margin: 0 auto 4px auto; display: block;"/>`
                  : `<div style="font-size: 20pt;">${opt.emoji || '🐾'}</div>`;
                return `
                  <td style="width: 33.3%; border: 1px solid #d1d5db; padding: 8px; text-align: center; font-size: 11pt;">
                    ${visualHTML}
                    <div>[ &nbsp; ] <strong>${['A', 'B', 'C'][oIdx]}. ${esc(opt.text)}</strong></div>
                  </td>
                `;
              }).join('')}
            </tr>
          </table>
        </div>
      `).join('')}

      <table style="width: 100%; border: none; margin-top: 28px; text-align: center; font-size: 11pt; page-break-inside: avoid;">
        <tr>
          <td style="width: 50%;">
            <strong>BAN GIÁM HIỆU DUYỆT</strong><br/><br/><br/><br/>
            <em>(Ký và ghi rõ họ tên)</em>
          </td>
          <td style="width: 50%;">
            <strong>GIÁO VIÊN BIÊN SOẠN</strong><br/><br/><br/><br/>
            <strong>${esc(teacherName)}</strong>
          </td>
        </tr>
      </table>
    </div>
  `;
}

window.exportGameQuestionsToWord = function() {
  window.saveCurrentFormQ();
  const gameTitle = window.gState.title || 'Tro_Choi_Con_Vat';
  const innerHTML = buildQuizPrintableHTML();

  const wordDoc = `<html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
    <head>
      <meta charset='utf-8'>
      <title>${esc(gameTitle)}</title>
      <style>
        @page { size: A4; margin: 20mm 18mm 20mm 20mm; }
        body { font-family: 'Times New Roman', serif; font-size: 12pt; line-height: 1.45; }
      </style>
    <\/head>
    <body>${innerHTML}<\/body>
  <\/html>`;

  const blob = new Blob(['\ufeff' + wordDoc], { type: 'application/msword;charset=utf-8' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  const safeName = gameTitle.normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-zA-Z0-9_]+/g, '_');
  a.download = `Bo_Cau_Hoi_Tro_Choi_${safeName}.doc`;
  a.click();

  showToast('📄 Đã xuất file Word (.doc)!', `Đã tải xuống "Bo_Cau_Hoi_Tro_Choi_${safeName}.doc" gồm Đề câu hỏi, Đáp án & Phiếu bài tập cho bé!`);
};

window.openQuizPrintPreviewModal = function() {
  const html = buildQuizPrintableHTML();
  if ($('quiz-export-preview-content')) $('quiz-export-preview-content').innerHTML = html;
  if ($('quiz-printable-sheet')) $('quiz-printable-sheet').innerHTML = `<div class="a4-page">${html}</div>`;
  $('quiz-export-modal')?.classList.remove('hidden');
};

window.closeQuizPrintPreviewModal = function() {
  $('quiz-export-modal')?.classList.add('hidden');
};

window.exportGameQuestionsToPDF = function() {
  openQuizPrintPreviewModal();
  downloadDirectQuizPDF();
};

window.downloadDirectQuizPDF = function() {
  const html = buildQuizPrintableHTML();
  if ($('quiz-export-preview-content')) $('quiz-export-preview-content').innerHTML = html;
  if ($('quiz-printable-sheet')) $('quiz-printable-sheet').innerHTML = `<div class="a4-page">${html}</div>`;

  const element = $('quiz-export-preview-content');
  if (!element) return;

  const gameTitle = window.gState.title || 'Tro_Choi_Con_Vat';
  const safeName = gameTitle.normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-zA-Z0-9_]+/g, '_');

  if (typeof window.html2pdf === 'function') {
    const btn = $('btn-direct-pdf');
    if (btn) btn.textContent = '⏳ Đang tạo PDF...';
    const opt = {
      margin: [10, 10, 10, 10],
      filename: `Bo_Cau_Hoi_Tro_Choi_${safeName}.pdf`,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2, useCORS: true },
      jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
    };
    window.html2pdf().set(opt).from(element).save().then(() => {
      if (btn) btn.innerHTML = '<span>📥</span> <span>Tải File PDF (.pdf)</span>';
      showToast('🖨️ Đã tải file PDF thành công!', `Đã lưu "Bo_Cau_Hoi_Tro_Choi_${safeName}.pdf" về máy tính của cô!`);
    }).catch(() => {
      if (btn) btn.innerHTML = '<span>📥</span> <span>Tải File PDF (.pdf)</span>';
      printQuizSheetNow();
    });
  } else {
    printQuizSheetNow();
  }
};

window.printQuizSheetNow = function() {
  const html = buildQuizPrintableHTML();
  if ($('quiz-printable-sheet')) $('quiz-printable-sheet').innerHTML = `<div class="a4-page">${html}</div>`;
  document.body.classList.add('print-mode-quiz');
  window.print();
  setTimeout(() => {
    document.body.classList.remove('print-mode-quiz');
  }, 600);
};

// ===== XUẤT GIÁO ÁN A4 RA WORD & PDF =====
window.exportToWord = function() {
  saveCurrentState();
  const d = currentLessonData;
  if (!d) return;
  const content = `
    <html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
    <head><meta charset='utf-8'><title>${esc(d.topic)}</title>
    <style>
      @page { size: A4; margin: 20mm 18mm 20mm 22mm; }
      body { font-family: 'Times New Roman', serif; font-size: 13pt; line-height: 1.45; }
      h1 { font-size: 15pt; font-weight: bold; text-align: center; color: #9d174d; margin-bottom: 4px; }
      h2 { font-size: 13.5pt; font-weight: bold; text-align: center; color: #db2777; margin-top: 4px; }
      .header-table { width: 100%; border: none; margin-bottom: 18px; }
      .header-table td { text-align: center; font-weight: bold; font-size: 11pt; vertical-align: top; }
      .section-title { font-weight: bold; text-transform: uppercase; color: #9d174d; margin-top: 14px; border-bottom: 1px solid #db2777; padding-bottom: 3px; }
      table.proc-table { width: 100%; border-collapse: collapse; margin-top: 10px; }
      table.proc-table th, table.proc-table td { border: 1px solid #000; padding: 6px; font-size: 11.5pt; text-align: left; vertical-align: top; }
      table.proc-table th { background-color: #fdf2f8; text-align: center; font-weight: bold; }
      .footer-table { width: 100%; margin-top: 35px; border: none; text-align: center; font-size: 11pt; }
    </style>
    <\/head>
    <body>
      <table class="header-table">
        <tr>
          <td>${esc(d.schoolDept)}<br><span style="color:#be185d;">${esc(d.schoolName)}</span></td>
          <td>CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM<br><i>Độc lập - Tự do - Hạnh phúc</i></td>
        </tr>
      </table>
      <h1>${esc(d.title)}</h1>
      <h2>${esc(d.subTopic)}</h2>
      <p style="text-align:center; font-style:italic;">Lĩnh vực: <b>${esc(d.field)}</b> • Độ tuổi: <b>${esc(d.ageText)}</b> • Thời gian: <b>${esc(d.duration)}</b></p>

      <div class="section-title">I. MỤC TIÊU CẦN ĐẠT</div>
      <p><b>1. Kiến thức:</b> ${esc(d.objectives.knowledge)}</p>
      <p><b>2. Kỹ năng:</b> ${esc(d.objectives.skills)}</p>
      <p><b>3. Thái độ:</b> ${esc(d.objectives.attitudes)}</p>

      <div class="section-title">II. CHUẨN BỊ ĐỒ DÙNG & HỌC LIỆU</div>
      <p><b>• Đồ dùng của Cô:</b> ${esc(d.preparation.teacher)}</p>
      <p><b>• Đồ dùng của Trẻ:</b> ${esc(d.preparation.kids)}</p>

      <div class="section-title">III. LƯU Ý AN TOÀN</div>
      <p>${esc(d.safety).replace(/\n/g, '<br>')}</p>

      <div class="section-title">IV. TIẾN TRÌNH TỔ CHỨC HOẠT ĐỘNG</div>
      <table class="proc-table">
        <thead>
          <tr><th style="width:50%;">HOẠT ĐỘNG CỦA CÔ</th><th style="width:50%;">HOẠT ĐỘNG CỦA TRẺ</th></tr>
        </thead>
        <tbody>
          ${(d.procedure || []).map(p => `
            <tr><td colspan="2" style="background:#fdf2f8; font-weight:bold;">${esc(p.actName)}</td></tr>
            <tr><td>${esc(p.teacher).replace(/\n/g, '<br>')}</td><td>${esc(p.kids).replace(/\n/g, '<br>')}</td></tr>
          `).join('')}
        </tbody>
      </table>

      <div class="section-title">V. PHÂN HÓA & DỰ PHÒNG</div>
      <p><b>• Phân hóa:</b> ${esc(d.differentiation).replace(/\n/g, '<br>')}</p>
      <p><b>• Dự phòng:</b> ${esc(d.weather).replace(/\n/g, '<br>')}</p>

      <div class="section-title">VI. ĐÁNH GIÁ CUỐI HOẠT ĐỘNG</div>
      <p>${esc(d.assessment)}</p>

      <table class="footer-table">
        <tr>
          <td><b>BAN GIÁM HIỆU DUYỆT</b><br><br><br><br><i>(Ký và ghi rõ họ tên)</i></td>
          <td><b>GIÁO VIÊN SOẠN BÀI</b><br><br><br><br><b>${esc(d.teacherName)}</b></td>
        </tr>
      </table>
    <\/body>
    <\/html>
  `;
  const blob = new Blob(['\ufeff' + content], { type: 'application/msword;charset=utf-8' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  const safeName = (d.topic || 'Mam_Non').normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-zA-Z0-9_]+/g, '_');
  a.download = `Giao_An_${safeName}.doc`;
  a.click();
  showToast('📄 Đã xuất Giáo án Word!', `Đã tải xuống file "Giao_An_${safeName}.doc".`);
};

window.exportLessonPlanToPDF = function() {
  saveCurrentState();
  document.body.classList.remove('print-mode-quiz');
  const el = $('lesson-a4-printable');
  const safeName = (currentLessonData?.topic || 'Mam_Non').normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-zA-Z0-9_]+/g, '_');
  if (el && typeof window.html2pdf === 'function') {
    const opt = {
      margin: [8, 8, 8, 8],
      filename: `Giao_An_${safeName}.pdf`,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2, useCORS: true },
      jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
    };
    window.html2pdf().set(opt).from(el).save().then(() => {
      showToast('🖨️ Đã tải Giáo án PDF!', `Đã lưu "Giao_An_${safeName}.pdf" về máy tính!`);
    }).catch(() => window.print());
  } else {
    window.print();
  }
};

// ===== XUẤT FILE TRÒ CHƠI ĐỘC LẬP (.HTML) =====
window.saveGameProjectV7 = function() {
  window.saveCurrentFormQ();
  const blob = new Blob([JSON.stringify(window.gState, null, 2)], { type: 'application/json' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = 'Bo_Cau_Hoi_Tro_Choi_Con_Vat.json';
  a.click();
};

window.exportPlayableGameV7 = function() {
  window.saveCurrentFormQ();
  const title = $('game-title-input')?.value || 'Đố Vui Nhận Biết Các Con Vật';
  const html = `<!DOCTYPE html><html lang="vi"><head><meta charset="utf-8"/><meta name="viewport" content="width=device-width,initial-scale=1"/><title>${esc(title)}</title><style>body{font-family:'Segoe UI',sans-serif;background:linear-gradient(135deg,#fff5f9 0%,#fce7f3 100%);display:grid;place-items:center;min-height:100vh;margin:0;padding:14px;color:#4a1d35;}main{background:#ffffff;padding:28px;border-radius:28px;border:3px solid #fbcfe8;box-shadow:0 14px 36px rgba(236,72,153,0.15);max-width:580px;width:100%;text-align:center;}h1{color:#9d174d;font-size:22px;margin:0 0 14px 0;}.clue{display:inline-block;background:#fdf2f8;color:#be185d;border:1px solid #fbcfe8;padding:7px 15px;border-radius:99px;font-size:13px;font-weight:bold;margin-bottom:14px;}.btn{background:linear-gradient(135deg,#ec4899,#f43f5e);color:white;border:none;padding:12px 26px;border-radius:16px;font-size:15px;font-weight:bold;cursor:pointer;margin-top:14px;box-shadow:0 4px 12px rgba(236,72,153,0.3);}.choice{display:flex;align-items:center;justify-content:center;gap:12px;width:100%;margin:10px 0;padding:14px;border:2px solid #fbcfe8;border-radius:18px;background:#ffffff;font-size:17px;font-weight:bold;color:#831843;cursor:pointer;transition:all 0.2s;}.choice:hover{border-color:#ec4899;background:#fdf2f8;transform:translateY(-2px);}.feedback{margin-top:14px;padding:14px;border-radius:16px;font-weight:bold;font-size:15px;}.q-img{max-height:180px;border-radius:16px;margin:10px auto;display:block;border:2px solid #fbcfe8;}.opt-img{width:64px;height:64px;object-fit:contain;border-radius:12px;background:#fff;border:1px solid #fbcfe8;padding:2px;}</style><\/head><body><main><h1>🐾 ${esc(title)}</h1><div id="quiz"></div></main><script>const bank=${JSON.stringify(window.gState.bank)};let idx=0,score=0;function show(){if(idx>=bank.length){document.getElementById('quiz').innerHTML='<h2>🎉 Hoàn thành xuất sắc!</h2><p style="font-size:18px;margin:16px 0;">Bé đạt <strong>'+score+' / '+bank.length+'</strong> điểm!</p><button class="btn" onclick="location.reload()">🔄 Chơi lại lần nữa</button>';return;}const q=bank[idx];const qImg=q.questionImg?'<img src="'+q.questionImg+'" class="q-img"/>':'';const clue=q.soundClue?'<div class="clue">💡 '+q.soundClue+'</div>':'';document.getElementById('quiz').innerHTML='<p style="font-size:13px;color:#db2777;font-weight:bold;">CÂU '+(idx+1)+' / '+bank.length+' • ⭐ Điểm: '+score+'</p><h3 style="font-size:20px;margin:10px 0;">'+q.question+'</h3>'+clue+qImg+q.options.map((o,i)=>{const imgTag=o.img?'<img src="'+o.img+'" class="opt-img"/>':'<span style="font-size:28px;">'+o.emoji+'</span>';return '<button class="choice" onclick="ans('+(i+1)+')">'+imgTag+' <span>'+o.text+'</span></button>';}).join('')+'<div id="fb"></div>';}function ans(c){const q=bank[idx];const right=String(c)===String(q.correct);if(right)score++;const fbText=right?'🎉 '+(q.feedbackRight||'Hoan hô bé! Đúng rồi!'):'🌸 '+(q.feedbackWrong||'Thử lại nhé!');const fb=document.getElementById('fb');fb.className='feedback';fb.style.cssText=right?'background:#ecfdf5;color:#065f46;border:2px solid #6ee7b7;':'background:#fff1f2;color:#9f1239;border:2px solid #fda4af;';fb.innerHTML=fbText+'<br/><button class="btn" onclick="idx++;show();">Câu tiếp theo ➔</button>';}show();<\/script><\/body><\/html>`;
  const blob = new Blob([html], { type: 'text/html;charset=utf-8' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  const safeName = title.normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-zA-Z0-9_]+/g, '_');
  a.download = `Tro_Choi_${safeName}.html`;
  a.click();
  showToast('🎮 Đã tải file Game (.html)!', 'Cô có thể mở file này trực tiếp trên bất kỳ máy tính hay TV nào!');
};

// ===== HỆ THỐNG ĐỔI MÀU GIAO DIỆN (THEME MÀU NHẸ CHO TRẺ EM) =====
const KIDS_THEME_KEY = 'mamnon_hoaphuoc_theme_v1';
const KIDS_THEMES = {
  pink: { emoji: '🌸', label: 'Màu Hồng Phấn', desc: 'Hồng phấn dịu dàng & trắng' },
  sky: { emoji: '☁️', label: 'Xanh Da Trời', desc: 'Xanh bầu trời mát mắt cho bé' },
  mint: { emoji: '🌿', label: 'Xanh Lá Mầm', desc: 'Xanh lá non tươi mát tự nhiên' },
  sunny: { emoji: '🌼', label: 'Vàng Nắng Mai', desc: 'Vàng kem ấm áp vui tươi' },
  lavender: { emoji: '💜', label: 'Tím Lavender', desc: 'Tím cổ tích nhẹ nhàng đáng yêu' },
  peach: { emoji: '🍑', label: 'Cam Đào Nhạt', desc: 'Cam sữa ngọt ngào năng động' }
};

window.toggleThemePopover = function(forceClose = false) {
  const pop = $('theme-popover');
  if (!pop) return;
  if (forceClose || !pop.classList.contains('hidden')) {
    pop.classList.add('hidden');
  } else {
    pop.classList.remove('hidden');
  }
};

window.applyKidsTheme = function(themeKey, silent = false) {
  const validKey = KIDS_THEMES[themeKey] ? themeKey : 'pink';
  const info = KIDS_THEMES[validKey];
  document.body.setAttribute('data-theme', validKey);

  try {
    localStorage.setItem(KIDS_THEME_KEY, validKey);
  } catch (e) {}

  if ($('current-theme-emoji')) $('current-theme-emoji').textContent = info.emoji;
  if ($('current-theme-label')) $('current-theme-label').textContent = info.label;

  document.querySelectorAll('[data-theme-item]').forEach(btn => {
    if (btn.getAttribute('data-theme-item') === validKey) {
      btn.classList.add('is-active');
    } else {
      btn.classList.remove('is-active');
    }
  });

  window.toggleThemePopover(true);
  if (!silent) {
    showToast(`${info.emoji} Đã đổi giao diện ${info.label}!`, `Trang web đã chuyển sang tông màu: ${info.desc}.`);
  }
};

function initSavedKidsTheme() {
  let saved = 'pink';
  try {
    saved = localStorage.getItem(KIDS_THEME_KEY) || 'pink';
  } catch (e) {}
  window.applyKidsTheme(saved, true);
}

document.addEventListener('click', function(e) {
  const pop = $('theme-popover');
  const btn = $('theme-picker-btn');
  if (!pop || pop.classList.contains('hidden')) return;
  if (!pop.contains(e.target) && (!btn || !btn.contains(e.target))) {
    pop.classList.add('hidden');
  }
});

// ===== KHỞI ĐỘNG ỨNG DỤNG (CHẠY TỨC THÌ, KHÔNG BỊ CHẶN BỞI INDEXEDDB HAY TRỄ DOMCONTENTLOADED) =====
async function bootApplication() {
  if (window.__mamNonHoaPhuocBooted) return;
  window.__mamNonHoaPhuocBooted = true;

  initSavedKidsTheme();

  // Khởi tạo giao diện tức thì trước khi đọc IndexedDB để mọi nút bấm hoạt động ngay lập tức
  const initialData = lessonFromTemplate('Nhận biết các con vật quen thuộc quanh bé', '3-4y', false, '', 'default_animals');
  populateUI(initialData);
  ensureGameDesignerReady();

  try {
    const dbItems = await dbGetAllLessons();
    if (dbItems && dbItems.length) {
      lessonLibrary.items = dbItems;
      const activeId = await dbGetState('activeId');
      if (activeId) lessonLibrary.activeId = activeId;
      const active = lessonLibrary.items.find(x => x.id === lessonLibrary.activeId) || lessonLibrary.items[0];
      if (active && active.data) {
        populateUI(active.data);
        ensureGameDesignerReady();
      }
    } else {
      persist();
    }
  } catch (e) {}

  renderLibraryUI();
}

if (document.readyState === 'loading') {
  window.addEventListener('DOMContentLoaded', bootApplication);
} else {
  bootApplication();
}

})();
