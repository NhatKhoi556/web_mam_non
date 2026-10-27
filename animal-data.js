if (!window.__ANIMAL_DATA_LOADED__) {
window.__ANIMAL_DATA_LOADED__ = true;
/* ==========================================================================
   KHO DỮ LIỆU THẾ GIỚI ĐỘNG VẬT & CÂU HỎI MẦM NON (38 CON VẬT MẪU)
   Giúp các bé nhận biết các con vật qua tiếng kêu, đặc điểm, lợi ích
   ========================================================================== */

window.ANIMAL_CATEGORIES = [
  { id: 'all', label: '🐾 Tất cả (38 con vật)', color: 'pink' },
  { id: 'family', label: '🏡 Vật nuôi & Trang trại (13)', color: 'rose' },
  { id: 'forest', label: '🌳 Động vật trong rừng (11)', color: 'amber' },
  { id: 'water', label: '🌊 Động vật dưới nước (8)', color: 'sky' },
  { id: 'flying', label: '🦋 Côn trùng & Chim chóc (6)', color: 'purple' }
];

window.ANIMAL_BANK = [
  // ==================== 1. VẬT NUÔI TRONG GIA ĐÌNH & TRANG TRẠI (13 CON) ====================
  {
    id: 'cat',
    name: 'Con Mèo',
    emoji: '🐱',
    category: 'family',
    sound: 'Meo meo meo!',
    trait: 'Có bộ lông mềm mượt, đôi mắt tròn xoe và rất giỏi bắt chuột.',
    question: 'Đố bé biết: Con gì kêu "meo meo" và rất thích bắt chuột trong nhà?',
    options: [
      { emoji: '🐱', text: 'Con Mèo', img: '' },
      { emoji: '🐶', text: 'Con Chó', img: '' },
      { emoji: '🐷', text: 'Con Lợn (Heo)', img: '' }
    ],
    correct: '1',
    feedbackRight: 'Hoan hô bé! Đúng là chú Mèo kêu "meo meo" rồi! 🐱💖',
    feedbackWrong: 'Chưa đúng rồi, bạn nào kêu "meo meo" nhỉ? Bé chọn lại nhé! 🌸'
  },
  {
    id: 'rooster',
    name: 'Con Gà Trống',
    emoji: '🐓',
    category: 'family',
    sound: 'Ò ó o... o!',
    trait: 'Có cái mào đỏ chót trên đầu, gáy vang đánh thức mọi người mỗi buổi sáng.',
    question: 'Con gì giúp đánh thức chúng ta dậy mỗi sáng bằng tiếng gáy "ò ó o"?',
    options: [
      { emoji: '🦆', text: 'Con Vịt', img: '' },
      { emoji: '🐓', text: 'Con Gà Trống', img: '' },
      { emoji: '🐦', text: 'Con Chim Sẻ', img: '' }
    ],
    correct: '2',
    feedbackRight: 'Xuất sắc quá! Chú Gà Trống gáy "ò ó o" đánh thức mọi người dậy mỗi sáng đấy! 🐓☀️',
    feedbackWrong: 'Ồ, chưa phải rồi! Bạn nào có mào đỏ gáy "ò ó o" mỗi sáng nhỉ? 🌸'
  },
  {
    id: 'hen',
    name: 'Con Gà Mái',
    emoji: '🐔',
    category: 'family',
    sound: 'Cục ta cục tác!',
    trait: 'Chăm chỉ kiếm mồi, đẻ những quả trứng tròn bổ dưỡng và kêu "cục ta cục tác".',
    question: 'Con gì kêu "cục ta cục tác" mỗi khi đẻ xong quả trứng hồng tròn xoe cho bé?',
    options: [
      { emoji: '🐔', text: 'Con Gà Mái', img: '' },
      { emoji: '🐸', text: 'Con Ếch', img: '' },
      { emoji: '🐰', text: 'Con Thỏ', img: '' }
    ],
    correct: '1',
    feedbackRight: 'Giỏi quá! Cô Gà Mái kêu "cục ta cục tác" và đẻ trứng thơm ngon cho bé! 🐔🥚',
    feedbackWrong: 'Bạn nào đẻ trứng và kêu "cục ta cục tác" nhỉ? Bé thử lại nhé! 🌸'
  },
  {
    id: 'chick',
    name: 'Con Gà Con',
    emoji: '🐥',
    category: 'family',
    sound: 'Chiếp chiếp chiếp!',
    trait: 'Bộ lông vàng ươm mềm mại, chạy lon ton theo mẹ và kêu "chiếp chiếp".',
    question: 'Con gì bé xíu có bộ lông vàng ươm, kêu "chiếp chiếp" đi tìm sâu cùng gà mẹ?',
    options: [
      { emoji: '🐷', text: 'Con Heo', img: '' },
      { emoji: '🐥', text: 'Con Gà Con', img: '' },
      { emoji: '🐢', text: 'Con Rùa', img: '' }
    ],
    correct: '2',
    feedbackRight: 'Đúng rồi! Đàn Gà Con lông vàng ươm kêu "chiếp chiếp" đáng yêu lắm! 🐥💛',
    feedbackWrong: 'Bạn nhỏ nào lông vàng kêu "chiếp chiếp" đi theo gà mẹ nhỉ? 🌸'
  },
  {
    id: 'dog',
    name: 'Con Chó (Cún Con)',
    emoji: '🐶',
    category: 'family',
    sound: 'Gâu gâu gâu!',
    trait: 'Rất trung thành, biết vẫy đuôi mừng khi bé đi học về và giúp trông giữ nhà.',
    question: 'Con gì kêu "gâu gâu" và rất ngoan ngoãn giúp ông bà trông giữ nhà cửa?',
    options: [
      { emoji: '🐶', text: 'Con Chó (Cún Con)', img: '' },
      { emoji: '🐱', text: 'Con Mèo', img: '' },
      { emoji: '🐰', text: 'Con Thỏ Trắng', img: '' }
    ],
    correct: '1',
    feedbackRight: 'Giỏi lắm bé ơi! Bạn Cún Con kêu "gâu gâu" giữ nhà rất giỏi! 🐶💗',
    feedbackWrong: 'Bé lắng nghe lại nhé: "Gâu gâu gâu" là tiếng kêu của con gì nào? 🌸'
  },
  {
    id: 'duck',
    name: 'Con Vịt',
    emoji: '🦆',
    category: 'family',
    sound: 'Cạp cạp cạp!',
    trait: 'Có cái mỏ dẹt màu vàng, bàn chân có màng bơi lội tung tăng trên mặt ao hồ.',
    question: 'Con gì kêu "cạp cạp", xòe ra hai cái cánh và bơi rất giỏi trên mặt hồ?',
    options: [
      { emoji: '🐓', text: 'Con Gà Trống', img: '' },
      { emoji: '🦆', text: 'Con Vịt', img: '' },
      { emoji: '🐖', text: 'Con Heo Hồng', img: '' }
    ],
    correct: '2',
    feedbackRight: 'Chính xác luôn! Chú Vịt kêu "cạp cạp" bơi trên mặt hồ! 🦆✨',
    feedbackWrong: 'Chưa đúng rồi! "Một con vịt xòe ra hai cái cánh, nó kêu rằng cạp cạp cạp..." là con gì nhỉ? 🌸'
  },
  {
    id: 'rabbit',
    name: 'Con Thỏ Trắng',
    emoji: '🐰',
    category: 'family',
    sound: 'Nhảy tưng tưng - Gặm cà rốt!',
    trait: 'Có bộ lông trắng muốt, hai cái tai dài thật dài và rất thích ăn củ cà rốt đỏ.',
    question: 'Con gì có đôi tai dài thật dài, bộ lông trắng tinh và rất thích ăn củ cà rốt?',
    options: [
      { emoji: '🐒', text: 'Con Khỉ', img: '' },
      { emoji: '🐘', text: 'Con Voi', img: '' },
      { emoji: '🐰', text: 'Con Thỏ Trắng', img: '' }
    ],
    correct: '3',
    feedbackRight: 'Tuyệt vời! Bạn Thỏ Trắng có đôi tai dài và mê ăn cà rốt lắm đấy! 🐰🥕',
    feedbackWrong: 'Bé nhìn kỹ xem bạn nào có đôi tai dài và thích ăn cà rốt nhé! 🌸'
  },
  {
    id: 'cow',
    name: 'Con Bò Sữa',
    emoji: '🐄',
    category: 'family',
    sound: 'Ùm bò... ùm bò!',
    trait: 'Ăn cỏ xanh non trên đồng và cho chúng ta những ly sữa tươi thơm ngon mỗi ngày.',
    question: 'Con gì kêu "ùm bò", thích ăn cỏ xanh và cho bé dòng sữa tươi thơm ngon mỗi ngày?',
    options: [
      { emoji: '🐄', text: 'Con Bò Sữa', img: '' },
      { emoji: '🐎', text: 'Con Ngựa', img: '' },
      { emoji: '🐐', text: 'Con Dê', img: '' }
    ],
    correct: '1',
    feedbackRight: 'Đúng rồi! Bạn Bò Sữa cho chúng mình những hộp sữa tươi bổ dưỡng! 🐄🥛',
    feedbackWrong: 'Bạn nào có đốm đen trắng và cho sữa tươi kêu "ùm bò" nhỉ? Bé chọn lại nhé! 🌸'
  },
  {
    id: 'buffalo',
    name: 'Con Trâu',
    emoji: '🐃',
    category: 'family',
    sound: 'Nghé ọ... Chăm chỉ kéo cày!',
    trait: 'Có cặp sừng cong khỏe khoắn, thích ăn cỏ đồng quê và giúp bác nông dân cày ruộng.',
    question: 'Con gì có đôi sừng cong, rất chăm chỉ giúp bác nông dân cày ruộng trồng lúa?',
    options: [
      { emoji: '🐱', text: 'Con Mèo', img: '' },
      { emoji: '🐃', text: 'Con Trâu', img: '' },
      { emoji: '🦆', text: 'Con Vịt', img: '' }
    ],
    correct: '2',
    feedbackRight: 'Hoan hô bé! Bác Trâu chăm chỉ giúp bác nông dân ngoài đồng ruộng đấy! 🐃🌾',
    feedbackWrong: 'Bạn nào có hai sừng cong giúp bác nông dân cày ruộng nhỉ? 🌸'
  },
  {
    id: 'pig',
    name: 'Con Lợn (Heo)',
    emoji: '🐷',
    category: 'family',
    sound: 'Ủn à ủn ỉn!',
    trait: 'Có cái mũi hồng xinh xắn, thân hình tròn trịa đáng yêu, hay kêu ủn à ủn ỉn.',
    question: 'Con gì có cái mũi tròn màu hồng, bụng no tròn và kêu "ủn à ủn ỉn"?',
    options: [
      { emoji: '🐱', text: 'Con Mèo', img: '' },
      { emoji: '🐷', text: 'Con Lợn (Heo)', img: '' },
      { emoji: '🐶', text: 'Con Chó', img: '' }
    ],
    correct: '2',
    feedbackRight: 'Giỏi quá! Đúng là chú Heo Hồng kêu "ủn à ủn ỉn" rồi! 🐷💗',
    feedbackWrong: 'Chưa đúng rồi! Bé thử tìm bạn nào có cái mũi hồng kêu "ủn ỉn" nhé! 🌸'
  },
  {
    id: 'horse',
    name: 'Con Ngựa',
    emoji: '🐎',
    category: 'family',
    sound: 'Hí... hí... Lộc cộc lộc cộc!',
    trait: 'Có bốn chân khỏe mạnh, chạy phi nước đại rất nhanh, tiếng vó ngựa kêu lộc cộc.',
    question: 'Con gì chạy phi thật nhanh trên thảo nguyên, kêu "hí hí" và tiếng chân gõ "lộc cộc"?',
    options: [
      { emoji: '🐎', text: 'Con Ngựa', img: '' },
      { emoji: '🐢', text: 'Con Rùa', img: '' },
      { emoji: '🦆', text: 'Con Vịt', img: '' }
    ],
    correct: '1',
    feedbackRight: 'Hoan hô bé! Chú Ngựa phi nhanh "nhong nhong nhong"! 🐎🌟',
    feedbackWrong: 'Bạn nào chạy thật nhanh kêu "hí hí" nhỉ? Bé chọn lại nhé! 🌸'
  },
  {
    id: 'goat',
    name: 'Con Dê',
    emoji: '🐐',
    category: 'family',
    sound: 'Be be... be be!',
    trait: 'Có chòm râu nhỏ dưới cằm, hai sừng ngắn, thích ăn lá cây và kêu "be be".',
    question: 'Con gì có chòm râu dưới cằm, thích ăn lá non trên đồi và kêu "be be"?',
    options: [
      { emoji: '🐠', text: 'Con Cá', img: '' },
      { emoji: '🐶', text: 'Con Chó', img: '' },
      { emoji: '🐐', text: 'Con Dê', img: '' }
    ],
    correct: '3',
    feedbackRight: 'Chính xác! Chú Dê có chòm râu dưới cằm kêu "be be"! 🐐🌿',
    feedbackWrong: 'Bạn nào kêu "be be" và có chòm râu dưới cằm nhỉ? 🌸'
  },
  {
    id: 'sheep',
    name: 'Con Cừu',
    emoji: '🐑',
    category: 'family',
    sound: 'Bêê... Lông xù trắng muốt!',
    trait: 'Khoác bộ lông len trắng xù bồng bềnh như đám mây, cho sợi len đan áo ấm mùa đông.',
    question: 'Con gì có bộ lông trắng xù bồng bềnh như đám mây, cho sợi len may áo ấm cho bé?',
    options: [
      { emoji: '🐑', text: 'Con Cừu', img: '' },
      { emoji: '🐸', text: 'Con Ếch', img: '' },
      { emoji: '🦀', text: 'Con Cua', img: '' }
    ],
    correct: '1',
    feedbackRight: 'Tuyệt vời! Bạn Cừu có bộ lông trắng xù ấm áp như đám mây! 🐑☁️',
    feedbackWrong: 'Bé nhìn xem bạn nào có bộ lông trắng xù giống đám mây nhé! 🌸'
  },

  // ==================== 2. ĐỘNG VẬT SỐNG TRONG RỪNG XANH (11 CON) ====================
  {
    id: 'elephant',
    name: 'Con Voi',
    emoji: '🐘',
    category: 'forest',
    sound: 'Ập ồ - Huơ vòi dài!',
    trait: 'Thân hình to lớn, có hai tai to như cái quạt và cái vòi dài thích ăn mía.',
    question: 'Con gì ở Bản Đôn có thân hình to lớn, có cái vòi dài đi trước và thích ăn mía?',
    options: [
      { emoji: '🐘', text: 'Con Voi', img: '' },
      { emoji: '🦁', text: 'Con Sư Tử', img: '' },
      { emoji: '🐻', text: 'Con Gấu Nâu', img: '' }
    ],
    correct: '1',
    feedbackRight: 'Hoan hô bé! Chú Voi con có cái vòi dài thật đáng yêu! 🐘🌿',
    feedbackWrong: 'Chưa chính xác! Bạn nào có cái vòi dài thích ăn mía nhỉ? 🌸'
  },
  {
    id: 'monkey',
    name: 'Con Khỉ',
    emoji: '🐒',
    category: 'forest',
    sound: 'Khẹc khẹc - Chuyền cành!',
    trait: 'Rất thông minh, leo trèo chuyền cành cây thoăn thoắt và thích ăn quả chuối chín vàng.',
    question: 'Con gì leo trèo trên cây nhanh thoăn thoắt và rất thích ăn quả chuối vàng?',
    options: [
      { emoji: '🐯', text: 'Con Hổ', img: '' },
      { emoji: '🐒', text: 'Con Khỉ', img: '' },
      { emoji: '🦌', text: 'Con Nai', img: '' }
    ],
    correct: '2',
    feedbackRight: 'Chuẩn luôn! Chú Khỉ con leo cây giỏi và cực kỳ thích ăn chuối! 🐒🍌',
    feedbackWrong: 'Bé đoán lại xem bạn nào thích ăn chuối và leo cây giỏi nhé! 🌸'
  },
  {
    id: 'lion',
    name: 'Con Sư Tử',
    emoji: '🦁',
    category: 'forest',
    sound: 'Gầm vang núi rừng!',
    trait: 'Được gọi là Chúa tể sơn lâm, có bờm tóc xù quanh cổ trông như ông mặt trời.',
    question: 'Con gì có cái bờm xù quanh cổ trông như mặt trời và được gọi là "Chúa tể rừng xanh"?',
    options: [
      { emoji: '🐰', text: 'Con Thỏ', img: '' },
      { emoji: '🐸', text: 'Con Ếch', img: '' },
      { emoji: '🦁', text: 'Con Sư Tử', img: '' }
    ],
    correct: '3',
    feedbackRight: 'Bé giỏi quá! Sư Tử có cái bờm tuyệt đẹp quanh cổ! 🦁👑',
    feedbackWrong: 'Bé nhìn xem bạn nào có bờm xù quanh cổ giống mặt trời nhé! 🌸'
  },
  {
    id: 'tiger',
    name: 'Con Hổ',
    emoji: '🐯',
    category: 'forest',
    sound: 'Gừm... Áo vàng vằn đen!',
    trait: 'Sống trong rừng sâu, có bộ lông màu vàng cam điểm những sọc vằn đen khỏe khoắn.',
    question: 'Con gì sống trong rừng xanh, khoác chiếc áo lông màu vàng cam có những sọc vằn đen?',
    options: [
      { emoji: '🐯', text: 'Con Hổ', img: '' },
      { emoji: '🐑', text: 'Con Cừu', img: '' },
      { emoji: '🦆', text: 'Con Vịt', img: '' }
    ],
    correct: '1',
    feedbackRight: 'Đúng rồi! Bạn Hổ có bộ lông vàng sọc vằn đen rất oai vệ! 🐯🌟',
    feedbackWrong: 'Bạn nào trong rừng có bộ lông vàng với sọc vằn đen nhỉ? 🌸'
  },
  {
    id: 'bear',
    name: 'Con Gấu Nâu',
    emoji: '🐻',
    category: 'forest',
    sound: 'Ùm ùm - Mê ăn mật ong!',
    trait: 'Thân hình to tròn ấm áp, dáng đi lắc lư và đặc biệt rất thích ăn mật ong ngọt.',
    question: 'Con gì có thân hình to tròn, bộ lông nâu dày ấm áp và rất thích ăn mật ong rừng?',
    options: [
      { emoji: '🐦', text: 'Con Chim', img: '' },
      { emoji: '🐻', text: 'Con Gấu Nâu', img: '' },
      { emoji: '🐠', text: 'Con Cá', img: '' }
    ],
    correct: '2',
    feedbackRight: 'Hoan hô bé! Bạn Gấu Nâu tròn trĩnh cực kỳ mê ăn mật ong! 🐻🍯',
    feedbackWrong: 'Bạn nào trong rừng có bộ lông nâu và thích ăn mật ong nhỉ? 🌸'
  },
  {
    id: 'panda',
    name: 'Con Gấu Trúc',
    emoji: '🐼',
    category: 'forest',
    sound: 'Nhai lá trúc giòn tan!',
    trait: 'Bộ lông hai màu đen trắng, quanh hai mắt có vòng tròn đen như đeo kính, thích ăn cây trúc.',
    question: 'Con gì có bộ lông đen trắng, đôi mắt tròn như đeo kính râm và rất thích ăn lá trúc?',
    options: [
      { emoji: '🐼', text: 'Con Gấu Trúc', img: '' },
      { emoji: '🐓', text: 'Con Gà Trống', img: '' },
      { emoji: '🐷', text: 'Con Heo', img: '' }
    ],
    correct: '1',
    feedbackRight: 'Xuất sắc! Bạn Gấu Trúc đeo kính đen ăn lá trúc siêu dễ thương! 🐼🎋',
    feedbackWrong: 'Bạn nào có bộ lông đen trắng và thích ăn lá trúc nhỉ? 🌸'
  },
  {
    id: 'giraffe',
    name: 'Con Hươu Cao Cổ',
    emoji: '🦒',
    category: 'forest',
    sound: 'Vươn cái cổ cao ăn lá non!',
    trait: 'Có chiếc cổ cao nhất trong thế giới loài vật, giúp hái lá non trên ngọn cây cao.',
    question: 'Con gì có chiếc cổ dài và cao nhất trong khu rừng, ăn được lá non trên ngọn cây?',
    options: [
      { emoji: '🦒', text: 'Con Hươu Cao Cổ', img: '' },
      { emoji: '🐻', text: 'Con Gấu', img: '' },
      { emoji: '🐷', text: 'Con Heo', img: '' }
    ],
    correct: '1',
    feedbackRight: 'Tuyệt vời! Bạn Hươu Cao Cổ có chiếc cổ cao vút luôn! 🦒🌳',
    feedbackWrong: 'Bạn nào có chiếc cổ dài thật dài để hái lá trên cây cao nhỉ? 🌸'
  },
  {
    id: 'deer',
    name: 'Con Nai (Hươu Sao)',
    emoji: '🦌',
    category: 'forest',
    sound: 'Ngơ ngác chạy nhanh trong rừng!',
    trait: 'Tính tình hiền lành, đôi mắt to tròn ngơ ngác và trên đầu có cặp sừng nhiều nhánh như cành cây.',
    question: 'Con gì hiền lành sống trong rừng, trên đầu có cặp sừng đẹp giống như nhánh cây khô?',
    options: [
      { emoji: '🐸', text: 'Con Ếch', img: '' },
      { emoji: '🦌', text: 'Con Nai (Hươu)', img: '' },
      { emoji: '🦆', text: 'Con Vịt', img: '' }
    ],
    correct: '2',
    feedbackRight: 'Đúng rồi! Bạn Nai nhỏ hiền lành có cặp sừng như nhánh cây! 🦌🌲',
    feedbackWrong: 'Bé nhìn xem bạn nào có cặp sừng giống nhánh cây trên đầu nhé! 🌸'
  },
  {
    id: 'squirrel',
    name: 'Con Sóc Nâu',
    emoji: '🐿️',
    category: 'forest',
    sound: 'Chuyền cành nhặt hạt dẻ!',
    trait: 'Nhỏ nhắn, nhanh nhẹn, có cái đuôi bông xù to thật đẹp và thích nhặt hạt dẻ, hạt thông.',
    question: 'Con gì nhỏ nhắn có cái đuôi bông xù thật to, nhảy chuyền cành đi nhặt hạt dẻ?',
    options: [
      { emoji: '🐢', text: 'Con Rùa', img: '' },
      { emoji: '🐘', text: 'Con Voi', img: '' },
      { emoji: '🐿️', text: 'Con Sóc Nâu', img: '' }
    ],
    correct: '3',
    feedbackRight: 'Giỏi lắm! Bạn Sóc Nâu có cái đuôi bông xù chăm chỉ nhặt hạt dẻ! 🐿️🌰',
    feedbackWrong: 'Bạn nhỏ nào có cái đuôi bông xù thích ăn hạt dẻ nhỉ? 🌸'
  },
  {
    id: 'kangaroo',
    name: 'Con Chuột Túi (Kangaroo)',
    emoji: '🦘',
    category: 'forest',
    sound: 'Bật nhảy xa - Địu con trong túi!',
    trait: 'Có đôi chân sau khỏe, nhảy bật rất xa và có chiếc túi ấm áp ở trước bụng để địu con.',
    question: 'Con gì có chiếc túi thần kỳ ở trước bụng để địu em bé và bật nhảy rất xa?',
    options: [
      { emoji: '🦘', text: 'Con Chuột Túi', img: '' },
      { emoji: '🐱', text: 'Con Mèo', img: '' },
      { emoji: '🐓', text: 'Con Gà', img: '' }
    ],
    correct: '1',
    feedbackRight: 'Quá chuẩn! Bạn Chuột Túi Kangaroo có chiếc túi trước bụng địu con! 🦘💖',
    feedbackWrong: 'Bạn nào có chiếc túi trước bụng để địu con nhảy tưng tưng nhỉ? 🌸'
  },
  {
    id: 'zebra',
    name: 'Con Ngựa Vằn',
    emoji: '🦓',
    category: 'forest',
    sound: 'Phi nhanh với áo sọc đen trắng!',
    trait: 'Giống chú ngựa nhưng khoác bộ lông toàn những sọc vằn đen và trắng xen kẽ nhau.',
    question: 'Con gì trông giống chú ngựa nhưng lại mặc chiếc áo kẻ sọc đen trắng khắp mình?',
    options: [
      { emoji: '🐷', text: 'Con Heo', img: '' },
      { emoji: '🦓', text: 'Con Ngựa Vằn', img: '' },
      { emoji: '🐰', text: 'Con Thỏ', img: '' }
    ],
    correct: '2',
    feedbackRight: 'Hoan hô bé! Bạn Ngựa Vằn có chiếc áo sọc đen trắng thật nổi bật! 🦓✨',
    feedbackWrong: 'Bạn ngựa nào mặc chiếc áo sọc đen trắng khắp người nhỉ? 🌸'
  },

  // ==================== 3. ĐỘNG VẬT SỐNG DƯỚI NƯỚC (8 CON) ====================
  {
    id: 'fish',
    name: 'Con Cá Vàng',
    emoji: '🐠',
    category: 'water',
    sound: 'Bơi lội tung tăng dưới nước!',
    trait: 'Sống dưới nước, có vây xinh xắn và thở bằng mang, bơi lượn mềm mại.',
    question: 'Con gì có vây xinh, sống dưới nước, bơi lội tung tăng và bắt bọ gậy?',
    options: [
      { emoji: '🐦', text: 'Con Chim', img: '' },
      { emoji: '🐠', text: 'Con Cá Vàng', img: '' },
      { emoji: '🐱', text: 'Con Mèo', img: '' }
    ],
    correct: '2',
    feedbackRight: 'Hoan hô bé! Cá Vàng bơi trong bể nước ngoi lên lặn xuống múa tung tăng! 🐠💧',
    feedbackWrong: 'Con gì sống dưới nước và có vây bơi lội nhỉ? Bé thử lại nhé! 🌸'
  },
  {
    id: 'dolphin',
    name: 'Con Cá Heo',
    emoji: '🐬',
    category: 'water',
    sound: 'Búng mình nhảy cao trên sóng biển!',
    trait: 'Sống ngoài biển khơi, rất thông minh, thân thiện với con người và biết nhảy qua vòng.',
    question: 'Con gì sống ở biển, rất thông minh, thân thiện và có tài nhảy vọt lên khỏi mặt sóng?',
    options: [
      { emoji: '🐬', text: 'Con Cá Heo', img: '' },
      { emoji: '🐶', text: 'Con Chó', img: '' },
      { emoji: '🐓', text: 'Con Gà', img: '' }
    ],
    correct: '1',
    feedbackRight: 'Tuyệt vời! Bạn Cá Heo thông minh nhảy lượn trên sóng biển! 🐬🌊',
    feedbackWrong: 'Bạn cá nào rất thông minh và hay nhảy qua vòng trên biển nhỉ? 🌸'
  },
  {
    id: 'whale',
    name: 'Con Cá Voi Xanh',
    emoji: '🐋',
    category: 'water',
    sound: 'Phun cột nước trắng xóa trên biển!',
    trait: 'Là loài vật to lớn nhất đại dương, mỗi khi ngoi lên mặt biển lại phun một vòi nước cao trên lưng.',
    question: 'Con gì to lớn nhất đại dương, khi bơi lên mặt biển thường phun cột nước cao trên lưng?',
    options: [
      { emoji: '🐸', text: 'Con Ếch', img: '' },
      { emoji: '🐋', text: 'Con Cá Voi Xanh', img: '' },
      { emoji: '🐝', text: 'Con Ong', img: '' }
    ],
    correct: '2',
    feedbackRight: 'Quá giỏi! Cá Voi Xanh khổng lồ phun cột nước trắng xóa trên biển! 🐋💦',
    feedbackWrong: 'Bạn nào to lớn nhất biển khơi và phun cột nước trên lưng nhỉ? 🌸'
  },
  {
    id: 'turtle',
    name: 'Con Rùa',
    emoji: '🐢',
    category: 'water',
    sound: 'Bò chậm rãi - Cõng nhà trên lưng!',
    trait: 'Đi chậm rãi từng bước nhưng rất kiên trì, trên lưng luôn cõng chiếc mai cứng như ngôi nhà.',
    question: 'Con gì đi chậm rãi và luôn cõng "ngôi nhà" (chiếc mai cứng) ở trên lưng?',
    options: [
      { emoji: '🐰', text: 'Con Thỏ', img: '' },
      { emoji: '🐎', text: 'Con Ngựa', img: '' },
      { emoji: '🐢', text: 'Con Rùa', img: '' }
    ],
    correct: '3',
    feedbackRight: 'Đúng rồi! Bạn Rùa luôn mang chiếc mai xinh xắn trên lưng! 🐢💚',
    feedbackWrong: 'Bé tìm xem bạn nào có chiếc mai cứng như ngôi nhà ở trên lưng nhé! 🌸'
  },
  {
    id: 'frog',
    name: 'Con Ếch Xanh',
    emoji: '🐸',
    category: 'water',
    sound: 'Ộp ộp... ộp ộp!',
    trait: 'Có hai mắt tròn, da màu xanh lá, ngồi trên lá sen và kêu "ộp ộp" mỗi khi trời mưa.',
    question: 'Con gì có hai mắt tròn ngồi trên lá sen, kêu "ộp ộp" mỗi khi trời sắp mưa?',
    options: [
      { emoji: '🐸', text: 'Con Ếch Xanh', img: '' },
      { emoji: '🐢', text: 'Con Rùa', img: '' },
      { emoji: '🦀', text: 'Con Cua', img: '' }
    ],
    correct: '1',
    feedbackRight: 'Chính xác! Chú Ếch Con có hai là hai mắt tròn kêu "ộp ộp"! 🐸🪷',
    feedbackWrong: 'Bạn nào kêu "ộp ộp" ngồi trên lá sen ở ao hồ nhỉ? 🌸'
  },
  {
    id: 'crab',
    name: 'Con Cua Đồng / Cua Biển',
    emoji: '🦀',
    category: 'water',
    sound: 'Tám cẳng hai càng - Bò ngang!',
    trait: 'Có 8 cái cẳng và 2 cái càng to khỏe, chẳng đi thẳng mà lại bò ngang lắc lư.',
    question: 'Con gì "tám cẳng hai càng, chẳng đi mà lại bò ngang cả ngày"?',
    options: [
      { emoji: '🐠', text: 'Con Cá', img: '' },
      { emoji: '🦀', text: 'Con Cua', img: '' },
      { emoji: '🦆', text: 'Con Vịt', img: '' }
    ],
    correct: '2',
    feedbackRight: 'Hoan hô bé! Đúng là chú Cua có tám cẳng hai càng bò ngang rồi! 🦀🏖️',
    feedbackWrong: 'Bạn nào có hai cái càng to và đi bò ngang nhỉ? 🌸'
  },
  {
    id: 'octopus',
    name: 'Con Bạch Tuộc',
    emoji: '🐙',
    category: 'water',
    sound: 'Múa 8 chiếc vòi dưới đáy biển!',
    trait: 'Sống dưới đáy biển sâu, có cái đầu tròn và 8 chiếc xúc tu (vòi) mềm dẻo uốn lượn.',
    question: 'Con gì sống dưới biển có cái đầu tròn và tới 8 chiếc vòi mềm dẻo bơi múa?',
    options: [
      { emoji: '🐱', text: 'Con Mèo', img: '' },
      { emoji: '🐶', text: 'Con Chó', img: '' },
      { emoji: '🐙', text: 'Con Bạch Tuộc', img: '' }
    ],
    correct: '3',
    feedbackRight: 'Giỏi quá! Bạn Bạch Tuộc có 8 chiếc xúc tu dưới đáy biển! 🐙🌊',
    feedbackWrong: 'Bạn nào dưới biển có tới 8 chiếc vòi uốn lượn nhỉ? 🌸'
  },
  {
    id: 'shrimp',
    name: 'Con Tôm',
    emoji: '🦐',
    category: 'water',
    sound: 'Lưng cong cong - Búng càng bơi lùi!',
    trait: 'Sống dưới nước, có râu dài, cái lưng cong cong và có tài búng mình bơi giật lùi.',
    question: 'Con gì sống dưới nước, có đôi râu dài, chiếc lưng cong cong và hay búng mình bơi lùi?',
    options: [
      { emoji: '🦐', text: 'Con Tôm', img: '' },
      { emoji: '🐘', text: 'Con Voi', img: '' },
      { emoji: '🦁', text: 'Con Sư Tử', img: '' }
    ],
    correct: '1',
    feedbackRight: 'Chính xác! Chú Tôm có cái lưng cong cong và đôi râu dài! 🦐💧',
    feedbackWrong: 'Bạn nào dưới nước có râu dài và cái lưng cong cong nhỉ? 🌸'
  },

  // ==================== 4. CÔN TRÙNG & CHIM CHÓC (6 CON) ====================
  {
    id: 'bee',
    name: 'Con Ong Vàng',
    emoji: '🐝',
    category: 'flying',
    sound: 'Vo ve... vo ve!',
    trait: 'Chăm chỉ bay khắp vườn hoa mỗi sáng để tìm nhụy hoa làm ra mật ngọt.',
    question: 'Con gì kêu "vo ve", chăm chỉ bay đi tìm hoa làm mật ngọt cho đời?',
    options: [
      { emoji: '🐝', text: 'Con Ong Vàng', img: '' },
      { emoji: '🐢', text: 'Con Rùa', img: '' },
      { emoji: '🐟', text: 'Con Cá', img: '' }
    ],
    correct: '1',
    feedbackRight: 'Quá giỏi luôn! Chị Ong Vàng chăm chỉ hút mật hoa thơm ngọt! 🐝🍯',
    feedbackWrong: 'Bạn nào bay "vo ve" bên những bông hoa để làm mật ngọt nhỉ? 🌸'
  },
  {
    id: 'butterfly',
    name: 'Con Bướm Xinh',
    emoji: '🦋',
    category: 'flying',
    sound: 'Chập chờn đôi cánh sặc sỡ!',
    trait: 'Có đôi cánh nhiều màu sắc rực rỡ, bay lượn nhẹ nhàng bên những bông hoa.',
    question: 'Con gì có đôi cánh rực rỡ sắc màu, thích bay lượn múa vui bên những bông hoa hồng?',
    options: [
      { emoji: '🦀', text: 'Con Cua', img: '' },
      { emoji: '🦋', text: 'Con Bướm Xinh', img: '' },
      { emoji: '🐶', text: 'Con Chó', img: '' }
    ],
    correct: '2',
    feedbackRight: 'Tuyệt vời! Bạn Bướm Xinh xòe đôi cánh rực rỡ bên vườn hoa! 🦋🌸',
    feedbackWrong: 'Bé nhìn xem bạn nào có đôi cánh nhiều màu sắc biết bay lượn nhé! 🌸'
  },
  {
    id: 'bird',
    name: 'Con Chim Sơn Ca / Chim Sẻ',
    emoji: '🐦',
    category: 'flying',
    sound: 'Líu lo... chíp chíp!',
    trait: 'Bay lượn trên bầu trời, đậu trên cành cây và cất tiếng hót líu lo vui tai.',
    question: 'Con gì có đôi cánh bay trên bầu trời và đậu trên cành cây hót "líu lo" mỗi sáng?',
    options: [
      { emoji: '🐷', text: 'Con Heo', img: '' },
      { emoji: '🐘', text: 'Con Voi', img: '' },
      { emoji: '🐦', text: 'Con Chim Nhỏ', img: '' }
    ],
    correct: '3',
    feedbackRight: 'Đúng rồi! Chú Chim Nhỏ hót líu lo trên cành cây xanh! 🐦🎶',
    feedbackWrong: 'Bạn nào biết bay trên bầu trời và hót "líu lo" nhỉ? 🌸'
  },
  {
    id: 'owl',
    name: 'Con Cú Mèo',
    emoji: '🦉',
    category: 'flying',
    sound: 'Đôi mắt tròn xoe thức canh ban đêm!',
    trait: 'Loài chim có đôi mắt to tròn như hai hòn bi, ngủ ban ngày và thức dậy vào ban đêm.',
    question: 'Con chim gì có đôi mắt to tròn xoe như khuôn mặt mèo và thường thức vào ban đêm?',
    options: [
      { emoji: '🦉', text: 'Con Cú Mèo', img: '' },
      { emoji: '🦆', text: 'Con Vịt', img: '' },
      { emoji: '🐠', text: 'Con Cá', img: '' }
    ],
    correct: '1',
    feedbackRight: 'Hoan hô bé! Bạn Cú Mèo có đôi mắt to tròn thật đặc biệt! 🦉🌙',
    feedbackWrong: 'Bạn chim nào có đôi mắt to tròn thức vào ban đêm nhỉ? 🌸'
  },
  {
    id: 'peacock',
    name: 'Con Công',
    emoji: '🦚',
    category: 'flying',
    sound: 'Xòe đuôi rực rỡ múa đẹp!',
    trait: 'Có bộ lông đuôi dài tuyệt đẹp, khi múa sẽ xòe tròn lấp lánh như chiếc quạt khổng lồ.',
    question: 'Con gì có chiếc đuôi dài lấp lánh, mỗi khi múa lại xòe tròn như chiếc quạt nan rực rỡ?',
    options: [
      { emoji: '🐸', text: 'Con Ếch', img: '' },
      { emoji: '🦚', text: 'Con Công', img: '' },
      { emoji: '🐷', text: 'Con Heo', img: '' }
    ],
    correct: '2',
    feedbackRight: 'Tuyệt vời! Bạn Công xòe chiếc đuôi quạt múa đẹp mê ly! 🦚✨',
    feedbackWrong: 'Bạn nào biết xòe đuôi tròn lấp lánh để múa nhỉ? 🌸'
  },
  {
    id: 'ladybug',
    name: 'Con Bọ Rùa',
    emoji: '🐞',
    category: 'flying',
    sound: 'Cánh đỏ chấm bi đen đậu trên lá!',
    trait: 'Côn trùng nhỏ xíu hiền lành, lưng tròn màu đỏ tươi điểm những chấm tròn màu đen.',
    question: 'Con gì nhỏ xíu đậu trên chiếc lá, khoác chiếc áo tròn màu đỏ có những chấm bi đen?',
    options: [
      { emoji: '🐘', text: 'Con Voi', img: '' },
      { emoji: '🐕', text: 'Con Chó', img: '' },
      { emoji: '🐞', text: 'Con Bọ Rùa', img: '' }
    ],
    correct: '3',
    feedbackRight: 'Giỏi lắm bé ơi! Bạn Bọ Rùa nhỏ xíu mặc áo đỏ chấm bi đen! 🐞🍀',
    feedbackWrong: 'Bạn nhỏ nào mặc chiếc áo tròn màu đỏ có chấm bi đen nhỉ? 🌸'
  }
];

// Tạo hình ảnh thẻ SVG sắc nét tự động cho con vật
window.generateAnimalIllustrationSVG = function(animal) {
  const emoji = animal.emoji || '🐾';
  const name = animal.name || 'Con vật';
  const sound = animal.sound || '';
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="480" height="300" viewBox="0 0 480 300">
    <defs>
      <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#fff1f7"/>
        <stop offset="50%" stop-color="#fce7f3"/>
        <stop offset="100%" stop-color="#fbcfe8"/>
      </linearGradient>
    </defs>
    <rect width="480" height="300" rx="28" fill="url(#bg)" stroke="#f472b6" stroke-width="6"/>
    <circle cx="80" cy="60" r="35" fill="#ffffff" opacity="0.6"/>
    <circle cx="400" cy="240" r="45" fill="#ffffff" opacity="0.6"/>
    <circle cx="240" cy="125" r="78" fill="#ffffff" stroke="#f9a8d4" stroke-width="4"/>
    <text x="240" y="150" font-size="86" text-anchor="middle" dominant-baseline="middle">${emoji}</text>
    <rect x="70" y="218" width="340" height="52" rx="26" fill="#ffffff" stroke="#f472b6" stroke-width="2.5"/>
    <text x="240" y="248" font-family="Arial, sans-serif" font-size="19" font-weight="bold" fill="#be185d" text-anchor="middle">${sound || name}</text>
  </svg>`;
  return 'data:image/svg+xml;utf8,' + encodeURIComponent(svg);
};

// Các gói bộ câu hỏi mẫu để Giáo viên nạp nhanh 1 chạm
window.PRESET_GAME_PACKS = {
  default_animals: {
    title: 'Đố Vui Nhận Biết Các Con Vật Quen Thuộc',
    description: 'Giúp bé nhận biết các con vật qua tiếng kêu (meo meo, ò ó o, gâu gâu...) và lợi ích',
    animalIds: ['cat', 'rooster', 'dog', 'rabbit', 'elephant', 'duck', 'cow', 'bee', 'monkey', 'frog']
  },
  family_pets: {
    title: 'Bé Yêu Vật Nuôi Trong Gia Đình & Trang Trại (13 Con)',
    description: 'Nhận biết Mèo, Gà Trống, Gà Mái, Gà Con, Chó, Vịt, Thỏ, Bò Sữa, Trâu, Heo, Ngựa, Dê, Cừu',
    animalIds: ['cat', 'rooster', 'hen', 'chick', 'dog', 'duck', 'rabbit', 'cow', 'buffalo', 'pig', 'horse', 'goat', 'sheep']
  },
  forest_safari: {
    title: 'Khám Phá Khu Rừng Xanh Kỳ Thú (11 Con)',
    description: 'Nhận biết Voi, Khỉ, Sư Tử, Hổ, Gấu Nâu, Gấu Trúc, Hươu Cao Cổ, Nai, Sóc, Chuột Túi, Ngựa Vằn',
    animalIds: ['elephant', 'monkey', 'lion', 'tiger', 'bear', 'panda', 'giraffe', 'deer', 'squirrel', 'kangaroo', 'zebra']
  },
  water_and_sky: {
    title: 'Những Người Bạn Dưới Nước & Bầu Trời (14 Con)',
    description: 'Nhận biết Cá Vàng, Cá Heo, Cá Voi, Rùa, Ếch, Cua, Bạch Tuộc, Tôm, Ong, Bướm, Chim, Cú Mèo, Công, Bọ Rùa',
    animalIds: ['fish', 'dolphin', 'whale', 'turtle', 'frog', 'crab', 'octopus', 'shrimp', 'bee', 'butterfly', 'bird', 'owl', 'peacock', 'ladybug']
  },
  sound_guessing: {
    title: 'Lắng Nghe Tiếng Kêu - Đoán Tên Con Vật',
    description: 'Trò chơi rèn luyện thính giác: Con gì kêu meo meo, ò ó o, cục tác, chiếp chiếp, gâu gâu, cạp cạp, ộp ộp?',
    animalIds: ['cat', 'rooster', 'hen', 'chick', 'dog', 'duck', 'cow', 'pig', 'horse', 'goat', 'frog', 'bee']
  },
  all_38_animals: {
    title: 'Đại Từ Điển Đố Vui 38 Con Vật Quanh Bé',
    description: 'Trọn bộ 38 câu hỏi đố vui nhận biết tất cả các loài vật nuôi, động vật rừng, dưới nước và côn trùng',
    animalIds: window.ANIMAL_BANK.map(a => a.id)
  }
};

window.getQuestionsFromPack = function(packKey) {
  const pack = window.PRESET_GAME_PACKS[packKey] || window.PRESET_GAME_PACKS.default_animals;
  return pack.animalIds.map(id => {
    const found = window.ANIMAL_BANK.find(a => a.id === id);
    if (!found) return null;
    return {
      animalId: found.id,
      animalName: found.name,
      soundClue: found.sound,
      traitClue: found.trait,
      question: found.question,
      questionImg: '',
      options: JSON.parse(JSON.stringify(found.options)),
      correct: found.correct,
      feedbackRight: found.feedbackRight,
      feedbackWrong: found.feedbackWrong
    };
  }).filter(Boolean);
};

}
