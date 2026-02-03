const tg = window.Telegram.WebApp;
tg.expand();

const oxfordColors = {
    "2 - Коричневий": "#4b3621", "3 - Какао": "#8b5a2b", "4 - Бежевий": "#f5f5dc",
    "4/1 - Пісочно-сірий": "#c2b2a3", "4/2 - Пудровий": "#e1c4c4", "5 - Електрик": "#0000ff",
    "6 - Трава": "#4caf50", "7 - Малина": "#e91e63", "8 - Темно-синій": "#000080",
    "9 - Блакитний": "#87ceeb", "10 - Фіолетовий": "#800080", "11 - М'ята": "#3eb489",
    "12 - Червоний": "#ff0000", "13 - Гірчичний": "#e1ad01", "14 - Жовтий": "#ffff00",
    "14/1 - Жовтогарячий": "#ff8c00", "15 - Сірий": "#808080", "17 - Темно-сірий": "#4f4f4f",
    "18 - Вино": "#722f37", "20 - Біливй": "#ffffff", "21 - Рожевий пиловий": "#dcaebb",
    "22 - Оранжевий": "#ffa500", "26 - Салат": "#7fff00", "27 - Бузок": "#c8a2c8",
    "28 - Темно-зелений": "#006400", "29 - Хакі": "#4b5320", "30 - Чорний": "#000000",
    "32 - Рожевий (Барбі)": "#da1884"
};

const products = [
    {
        id: 'beanbag',
        name: 'Крісла (Груші / Овали)',
        image: 'grusha.jpg',
        types: { 'Груша': 0, 'Овал': 80 },
        sizes: { 'L (65*85)': 1100, 'XL (85*105)': 1280, '2XL (90*130)': 1460, '3XL (100*140)': 1620, '4XL (110*150)': 2000 },
        fabrics: { 'Оксфорд 600D': 0, 'Велюр': 550, 'Екошкіра': 450 },
        hasInnerCase: true,
        casePrice: 190,
        allowCombine: true
    },
    {
        id: 'ball',
        name: 'Крісло-М’яч',
        image: 'ball.jpg',
        sizes: { 'L (50см)': 810, 'XL (70см)': 1200, '2XL (100см)': 1700, '3XL (130см)': 2025 },
        isBall: true,
        hasInnerCase: true,
        casePrice: 190
    },
    {
        id: 'swing',
        name: 'Підвісні гойдалки',
        image: 'swing.jpg',
        types: { 'Одинарна (95см) + Пряма': 1643, 'Одинарна (95см) + Кругла': 2015, 'Двомісна (120х80)': 3360, 'Двомісна (150х80)': 3700 },
        options: { 'Стандарт': 0, 'Розбірна (+480грн)': 480 }
    }
];

let cart = [];

function renderCatalog() {
    const catalog = document.getElementById('catalog');
    catalog.innerHTML = '';
    products.forEach(p => {
        const card = document.createElement('div');
        card.className = 'product-card';
        let html = `<img src="${p.image}" alt="${p.name}"><div class="product-title">${p.name}</div>`;
        
        if (p.types) html += `<label>Модель:</label><select id="type-${p.id}" onchange="updatePrice('${p.id}')">${Object.keys(p.types).map(t => `<option value="${t}">${t}</option>`).join('')}</select>`;
        if (p.sizes) html += `<label>Розмір:</label><select id="size-${p.id}" onchange="updatePrice('${p.id}')">${Object.keys(p.sizes).map(s => `<option value="${s}">${s}</option>`).join('')}</select>`;
        
        html += `<label>Колір:</label>${renderColorSelect(p.isBall ? `color1-${p.id}` : `color-${p.id}`, oxfordColors)}`;
        if (p.isBall) html += `<label>Колір 2:</label>${renderColorSelect(`color2-${p.id}`, oxfordColors)}`;
        
        if (p.hasInnerCase) html += `<div class="checkbox-group"><input type="checkbox" id="case-${p.id}" onchange="updatePrice('${p.id}')"> Додати внутр. чохол (+190 грн)</div>`;
        if (p.options) html += `<label>Опції:</label><select id="opt-${p.id}" onchange="updatePrice('${p.id}')">${Object.keys(p.options).map(o => `<option value="${o}">${o}</option>`).join('')}</select>`;
        
        html += `<div class="qty-container"><label style="margin:0">Кількість:</label><input type="number" id="qty-${p.id}" class="qty-input" value="1" min="1" onchange="updatePrice('${p.id}')"></div>`;
        
        html += `<div class="price-tag"><span id="price-val-${p.id}">0</span> грн</div><button class="btn" onclick="addToCart('${p.id}')">В кошик</button>`;
        card.innerHTML = html;
        catalog.appendChild(card);
        updatePrice(p.id);
    });
}

function renderColorSelect(id, palette) {
    const firstHex = Object.values(palette)[0];
    return `<select id="${id}" class="color-select" style="background-color: ${firstHex}; color: ${firstHex === '#ffffff' ? 'black' : 'white'}; border-left: 10px solid rgba(0,0,0,0.1);" onchange="const c=this.options[this.selectedIndex].dataset.color; this.style.backgroundColor=c; this.style.color=(c==='#ffffff'?'black':'white');">
        ${Object.entries(palette).map(([name, hex]) => 
            `<option value="${name}" data-color="${hex}" style="background-color: ${hex}; color: ${hex === '#ffffff' ? 'black' : 'white'};">${name}</option>`
        ).join('')}
    </select>`;
}

function updatePrice(id) {
    const p = products.find(prod => prod.id === id);
    let unitPrice = 0;
    if (p.sizes) unitPrice += p.sizes[document.getElementById(`size-${id}`).value];
    if (p.types) unitPrice += p.types[document.getElementById(`type-${id}`).value];
    if (p.hasInnerCase && document.getElementById(`case-${id}`).checked) unitPrice += p.casePrice;
    if (p.options) unitPrice += p.options[document.getElementById(`opt-${id}`).value];
    
    const qty = parseInt(document.getElementById(`qty-${id}`).value) || 1;
    document.getElementById(`price-val-${id}`).innerText = unitPrice * qty;
}

function addToCart(id) {
    const p = products.find(prod => prod.id === id);
    const qty = parseInt(document.getElementById(`qty-${id}`).value) || 1;
    const unitPrice = parseInt(document.getElementById(`price-val-${id}`).innerText) / qty;
    
    const type = p.types ? document.getElementById(`type-${id}`).value : '';
    const size = p.sizes ? document.getElementById(`size-${id}`).value : '';
    const color = document.getElementById(`color-${id}`)?.value || document.getElementById(`color1-${id}`).value;
    
    let displayName = p.id === 'beanbag' ? `Крісло (${type})` : p.name;
    let desc = `${displayName} | ${size} | ${color}`;
    
    if (p.isBall) desc += ` + ${document.getElementById(`color2-${id}`).value}`;
    if (p.hasInnerCase && document.getElementById(`case-${id}`).checked) desc += ` + Внутр. чохол`;

    cart.push({ id: Date.now(), name: desc, qty: qty, price: unitPrice * qty });
    updateCartUI();
    document.getElementById(`qty-${id}`).value = 1;
    
    // Візуальний відгук
    tg.HapticFeedback.impactOccurred('medium');
}

function updateCartUI() {
    const details = document.getElementById('cart-details');
    details.innerHTML = cart.map(item => `
        <div class="cart-item">
            <div style="flex:1;">
                <div style="font-weight:bold; font-size:14px;">${item.name}</div>
                <div style="font-size:12px; color:#666;">Кількість: ${item.qty} шт. | Сума: ${item.price} грн</div>
            </div>
            <div class="remove-item" onclick="removeFromCart(${item.id})">❌</div>
        </div>
    `).join('');
    
    const total = cart.reduce((sum, item) => sum + item.price, 0);
    const cartBar = document.getElementById('cart-bar');
    
    // Якщо це перший товар — переконуємось, що список прихований
    if (cart.length > 0 && cartBar.style.display === 'none') {
        details.style.display = 'none'; // Гарантовано ховаємо список при першій появі
        document.querySelector('.toggle-cart-btn').innerText = '🛒 Подивитись кошик';
    }

    cartBar.style.display = cart.length > 0 ? 'block' : 'none';
    document.getElementById('total-price').innerText = total;
}

function removeFromCart(uid) {
    cart = cart.filter(item => item.id !== uid);
    updateCartUI();
    // Якщо видалили останній товар — повністю ховаємо панель
    if(cart.length === 0) {
        document.getElementById('cart-details').style.display = 'none';
        document.getElementById('cart-bar').style.display = 'none';
    }
}

function sendOrder() {
    if (cart.length === 0) return;
    
    const totalQty = cart.reduce((sum, item) => sum + item.qty, 0);
    const itemsDesc = cart.map(i => `${i.name} (x${i.qty})`).join(', ');

    tg.sendData(JSON.stringify({ 
        action: 'order', 
        items: itemsDesc, 
        totalPrice: document.getElementById('total-price').innerText,
        totalQty: totalQty
    }));
    tg.close();
}

renderCatalog();
