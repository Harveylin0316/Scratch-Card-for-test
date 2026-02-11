// 概率設定
const PROBABILITIES = {
    grandPrize: 0.2,    // 20% - 1000元
    regularPrize: 0.4,  // 40% - 100元
    noPrize: 0.4        // 40% - 謝謝惠顧
};

// DOM 元素
const scratchCard = document.getElementById('scratchCard');
const scratchCanvas = document.getElementById('scratchCanvas');
const prizeContent = document.getElementById('prizeContent');
const prizeText = document.getElementById('prizeText');
const newCardBtn = document.getElementById('newCardBtn');
const cardsScratchedEl = document.getElementById('cardsScratched');

// Canvas 設定
const ctx = scratchCanvas.getContext('2d');
let isScratching = false;
let cardsScratched = 0;
let currentPrize = null;
let scratchedPercentage = 0;

// 初始化 Canvas
function initCanvas() {
    const rect = scratchCard.getBoundingClientRect();
    scratchCanvas.width = rect.width;
    scratchCanvas.height = rect.height;
    
    // 繪製覆蓋層（銀色/灰色）
    ctx.fillStyle = '#95a5a6';
    ctx.fillRect(0, 0, scratchCanvas.width, scratchCanvas.height);
    
    // 添加一些裝飾性文字
    ctx.fillStyle = '#7f8c8d';
    ctx.font = 'bold 30px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('刮開這裡', scratchCanvas.width / 2, scratchCanvas.height / 2 - 20);
    ctx.font = '20px Arial';
    ctx.fillText('👆 滑動刮開', scratchCanvas.width / 2, scratchCanvas.height / 2 + 20);
    
    // 設置混合模式為 destination-out，這樣繪製時會清除像素
    ctx.globalCompositeOperation = 'destination-out';
}

// 生成獎品
function generatePrize() {
    const random = Math.random();
    
    if (random < PROBABILITIES.grandPrize) {
        return {
            type: 'grandPrize',
            text: '1000元',
            class: 'grand-prize'
        };
    } else if (random < PROBABILITIES.grandPrize + PROBABILITIES.regularPrize) {
        return {
            type: 'regularPrize',
            text: '100元',
            class: 'regular-prize'
        };
    } else {
        return {
            type: 'noPrize',
            text: '謝謝惠顧',
            class: 'no-prize'
        };
    }
}

// 創建新卡片
function createNewCard() {
    // 重置狀態
    isScratching = false;
    scratchedPercentage = 0;
    currentPrize = generatePrize();
    
    // 更新獎品顯示
    prizeText.textContent = currentPrize.text;
    prizeText.className = `prize-text ${currentPrize.class}`;
    
    // 重新初始化 Canvas
    initCanvas();
    
    // 更新統計
    cardsScratched++;
    cardsScratchedEl.textContent = cardsScratched;
}

// 獲取滑鼠/觸摸位置
function getEventPos(e) {
    const rect = scratchCard.getBoundingClientRect();
    if (e.touches) {
        return {
            x: e.touches[0].clientX - rect.left,
            y: e.touches[0].clientY - rect.top
        };
    } else {
        return {
            x: e.clientX - rect.left,
            y: e.clientY - rect.top
        };
    }
}

// 刮除效果
function scratch(x, y) {
    ctx.beginPath();
    ctx.arc(x, y, 30, 0, Math.PI * 2);
    ctx.fill();
    
    // 計算已刮除的百分比
    updateScratchedPercentage();
}

// 更新已刮除百分比
function updateScratchedPercentage() {
    const imageData = ctx.getImageData(0, 0, scratchCanvas.width, scratchCanvas.height);
    const pixels = imageData.data;
    let transparentPixels = 0;
    
    for (let i = 3; i < pixels.length; i += 4) {
        if (pixels[i] === 0) {
            transparentPixels++;
        }
    }
    
    scratchedPercentage = (transparentPixels / (pixels.length / 4)) * 100;
    
    // 如果刮除超過 50%，顯示完整結果
    if (scratchedPercentage > 50 && currentPrize) {
        // 可以選擇完全清除覆蓋層
        if (scratchedPercentage > 70) {
            ctx.clearRect(0, 0, scratchCanvas.width, scratchCanvas.height);
        }
    }
}

// 滑鼠事件
scratchCanvas.addEventListener('mousedown', (e) => {
    isScratching = true;
    const pos = getEventPos(e);
    scratch(pos.x, pos.y);
});

scratchCanvas.addEventListener('mousemove', (e) => {
    if (isScratching) {
        const pos = getEventPos(e);
        scratch(pos.x, pos.y);
    }
});

scratchCanvas.addEventListener('mouseup', () => {
    isScratching = false;
});

scratchCanvas.addEventListener('mouseleave', () => {
    isScratching = false;
});

// 觸摸事件（手機支援）
scratchCanvas.addEventListener('touchstart', (e) => {
    e.preventDefault();
    isScratching = true;
    const pos = getEventPos(e);
    scratch(pos.x, pos.y);
});

scratchCanvas.addEventListener('touchmove', (e) => {
    e.preventDefault();
    if (isScratching) {
        const pos = getEventPos(e);
        scratch(pos.x, pos.y);
    }
});

scratchCanvas.addEventListener('touchend', (e) => {
    e.preventDefault();
    isScratching = false;
});

// 視窗大小改變時重新初始化
window.addEventListener('resize', () => {
    initCanvas();
});

// 新卡片按鈕
newCardBtn.addEventListener('click', createNewCard);

// 初始化
createNewCard();
