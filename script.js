const tg = window.Telegram.WebApp;
tg.expand();

const oxfordColors = {
    "2 - Коричневий": "#4b3621", "3 - Какао": "#8b5a2b", "4 - Бежевий": "#f5f5dc",
    "4/1 - Пісочно-сірий": "#c2b2a3", "4/2 - Пудровий": "#e1c4c4", "5 - Електрик": "#0000ff",
    "6 - Трава": "#4caf50", "7 - Малина": "#e91e63", "8 - Темно-синій": "#000080",
    "9 - Блакитний": "#87ceeb", "10 - Фіолетовий": "#800080", "11 - М'ята": "#3eb489",
    "12 - Червоний": "#ff0000", "13 - Гірчичний": "#e1ad01", "14 - Жовтий": "#ffff00",
    "14/1 - Жовтогарячий": "#ff8c00", "15 - Сірий": "#808080", "17 - Темно-сірий": "#4f4f4f",
    "18 - Вино": "#722f37", "20 - Білий": "#ffffff", "21 - Рожевий пиловий": "#dcaebb",
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
        fabrics: { 'Оксфорд': 0 },
        isBall: true,
        hasInnerCase: true, // Додано внутрішній чохол для м'ячів
        casePrice: 190
    },
    {
        id: 'swing',
        name: 'Підвісні гойдалки',
        image: 'swing.jpg',
        types: { 'Одинарна (95см) + Пряма': 1643, 'Одинарна (95см) + Кругла': 2015, 'Двомісна (120х80)': 3360, 'Двомісна (150х80)': 3700 },
        options: { 'Стандарт': 0, 'Розбірна (+480грн)': 480 } // Оновлено ціну на 480
    }
];

let cart = [];

function renderCatalog() {
    const catalog = document.getElementById('catalog');
    catalog.innerHTML = '';
    products.forEach(p => {
        const card = document.createElement('div');
        card.className = 'product-card';
        let html = `<img src="${p.image}" style="width:100%; border-radius:12px;"><div class="product-title">${p.name}</div>`;
        
        if (p.types) html += `<label>Модель:</label><select id="type-${p.id}" onchange="updatePrice('${p.id}')">${Object.keys(p.types).map(t => `<option value="${t}">${t}</option>`).join('')}</select>`;
        if (p.sizes) html += `<label>Розмір:</label><select id="size-${p.id}" onchange="updatePrice('${p.id}')">${Object.keys(p.sizes).map(s => `<option value="${s}">${s}</option>`).join('')}</select>`;
        
        html += `<label>Колір:</label>${renderColorSelect(p.isBall ? `color1-${p.id}` : `color-${p.id}`, oxfordColors)}`;
        if (p.isBall) html += `<label>Колір 2:</label>${renderColorSelect(`color2-${p.id}`, oxfordColors)}`;
        
        if (p.hasInnerCase) html += `<div class="checkbox-group"><input type="checkbox" id="case-${p.id}" onchange="updatePrice('${p.id}')"> Додати внутр. чохол (+${p.casePrice} грн)</div>`;
        if (p.options) html += `<label>Опції:</label><select id="opt-${p.id}" onchange="updatePrice('${p.id}')">${Object.keys(p.options).map(o => `<option value="${o}">${o}</option>`).join('')}</select>`;
        
        html += `<div class="price-tag"><span id="price-val-${p.id}">0</span> грн</div><button class="btn" onclick="addToCart('${p.id}')">В кошик</button>`;
        card.innerHTML = html;
        catalog.appendChild(card);
        updatePrice(p.id);
    });
}

// Функція для створення кольорового випадаючого списку
function renderColorSelect(id, palette) {
    return `<select id="${id}" class="color-select" onchange="this.style.backgroundColor=this.options[this.selectedIndex].style.backgroundColor">
        ${Object.entries(palette).map(([name, hex]) => 
            `<option value="${name}" style="background-color: ${hex}; color: ${hex === '#ffffff' ? 'black' : 'white'};">${name}</option>`
        ).join('')}
    </select>`;
}

function updatePrice(id) {
    const p = products.find(prod => prod.id === id);
    let total = 0;
    if (p.sizes) total += p.sizes[document.getElementById(`size-${id}`).value];
    if (p.types) total += p.types[document.getElementById(`type-${id}`).value];
    if (p.hasInnerCase && document.getElementById(`case-${id}`).checked) total += p.casePrice;
    if (p.options) total += p.options[document.getElementById(`opt-${id}`).value];
    document.getElementById(`price-val-${id}`).innerText = total;
}

function addToCart(id) {
    const p = products.find(prod => prod.id === id);
    const price = document.getElementById(`price-val-${id}`).innerText;
    const type = p.types ? document.getElementById(`type-${id}`).value : '';
    const size = p.sizes ? document.getElementById(`size-${id}`).value : '';
    const color = document.getElementById(`color-${id}`)?.value || document.getElementById(`color1-${id}`).value;
    
    let desc = `${p.id === 'beanbag' ? `Крісло (${type})` : p.name} | ${size} | ${color}`;
    if (p.isBall) desc += ` + ${document.getElementById(`color2-${id}`).value}`;
    if (p.hasInnerCase && document.getElementById(`case-${id}`).checked) desc += ` + Внутр. чохол`;

    cart.push({ id: Date.now(), name: desc, price: parseInt(price) });
    updateCartUI();
}

function updateCartUI() {
    const cartItems = document.getElementById('cart-items');
    cartItems.innerHTML = cart.map(item => `
        <div class="cart-item">
            <span>${item.name} - ${item.price} грн</span>
            <button onclick="removeFromCart(${item.id})" style="background:none; border:none; color:red; cursor:pointer; font-weight:bold;">❌</button>
        </div>
    `).join('');
    
    const total = cart.reduce((sum, item) => sum + item.price, 0);
    document.getElementById('cart-bar').style.display = cart.length > 0 ? 'block' : 'none';
    document.getElementById('total-price').innerText = total;
}

function removeFromCart(uid) {
    cart = cart.filter(item => item.id !== uid);
    updateCartUI();
}

function sendOrder() {
    if (cart.length === 0) return;
    tg.sendData(JSON.stringify({ action: 'order', items: cart.map(i => i.name).join(', '), totalPrice: document.getElementById('total-price').innerText }));
    tg.close();
}

renderCatalog();
