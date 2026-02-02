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

const ecoColors = { "ЕК3 Чорний": "#000000", "ЕК19 Білий": "#ffffff" };

const products = [
    {
        id: 'beanbag',
        name: 'Крісла (Груші / Овали)',
        image: 'grusha.jpg',
        types: { 'Груша': 0, 'Овал': 80 },
        sizes: {
            'L (65*85)': 1100, 'XL (85*105)': 1280, '2XL (90*130)': 1460,
            '3XL (100*140)': 1620, '4XL (110*150)': 2000
        },
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
        isBall: true 
    },
    {
        id: 'swing',
        name: 'Підвісні гойдалки',
        image: 'swing.jpg',
        types: { 
            'Одинарна (95см) + Пряма': 1643, 'Одинарна (95см) + Кругла': 2015,
            'Двомісна (120х80)': 3360, 'Двомісна (150х80)': 3700,
            'Двомісна (180х90)': 4140, 'Двомісна (195х110)': 4560
        },
        options: { 'Стандарт': 0, 'Розбірна (+200грн)': 200 }
    },
    {
        id: 'futon',
        name: 'Футони',
        image: 'futon.jpg',
        sizes: { '160х80': 1730, '180х90': 1880 },
        options: { 'Без посилення': 0, 'Посилення форми (+190грн)': 190 }
    }
];

let cart = [];

function renderCatalog() {
    const catalog = document.getElementById('catalog');
    catalog.innerHTML = '';
    products.forEach(p => {
        const card = document.createElement('div');
        card.className = 'product-card';
        let html = `<img src="${p.image}" style="width:100%; border-radius:12px; margin-bottom:10px;"><div class="product-title">${p.name}</div>`;
        if (p.types) html += `<label>Модель:</label><select id="type-${p.id}" onchange="updatePrice('${p.id}')">${Object.keys(p.types).map(t => `<option value="${t}">${t}</option>`).join('')}</select>`;
        if (p.sizes) html += `<label>Розмір:</label><select id="size-${p.id}" onchange="updatePrice('${p.id}')">${Object.keys(p.sizes).map(s => `<option value="${s}">${s}</option>`).join('')}</select>`;
        if (p.fabrics) html += `<label>Тканина:</label><select id="fabric-${p.id}" onchange="updateFabric('${p.id}')">${Object.keys(p.fabrics).map(f => `<option value="${f}">${f}</option>`).join('')}</select>`;
        html += `<div id="color-section-${p.id}">`;
        if (p.isBall) {
            html += `<label>Колір основи:</label>${renderColorSelect(`color1-${p.id}`, oxfordColors)}<label>Колір вставок:</label>${renderColorSelect(`color2-${p.id}`, oxfordColors)}`;
        } else {
            html += `<label>Колір:</label>${renderColorSelect(`color-${p.id}`, oxfordColors)}`;
            if (p.allowCombine) html += `<div class="checkbox-group"><input type="checkbox" id="combine-${p.id}" onchange="toggleCombine('${p.id}')"> Комбінований (4+2)</div><div id="extra-color-${p.id}" style="display:none;"><label>Другий колір:</label>${renderColorSelect(`color2-${p.id}`, oxfordColors)}</div>`;
        }
        html += `</div>`;
        if (p.hasInnerCase) html += `<div class="checkbox-group"><input type="checkbox" id="case-${p.id}" onchange="updatePrice('${p.id}')"> Внутрішній чохол (+${p.casePrice} грн)</div>`;
        if (p.options) html += `<label>Додатково:</label><select id="opt-${p.id}" onchange="updatePrice('${p.id}')">${Object.keys(p.options).map(o => `<option value="${o}">${o}</option>`).join('')}</select>`;
        html += `<div class="price-tag"><span id="price-val-${p.id}">0</span> грн</div><button class="btn" onclick="addToCart('${p.id}')">В кошик</button>`;
        card.innerHTML = html;
        catalog.appendChild(card);
        updatePrice(p.id);
    });
}

function renderColorSelect(id, palette) {
    const firstHex = Object.values(palette)[0];
    return `<select id="${id}" style="border-left: 15px solid ${firstHex}; padding-left: 10px;" onchange="this.style.borderLeftColor=this.options[this.selectedIndex].dataset.color">${Object.entries(palette).map(([name, hex]) => `<option value="${name}" data-color="${hex}">${name}</option>`).join('')}</select>`;
}

function updateFabric(id) {
    const fabric = document.getElementById(`fabric-${id}`).value;
    const colorSection = document.getElementById(`color-section-${id}`);
    const p = products.find(prod => prod.id === id);
    let palette = fabric === 'Екошкіра' ? ecoColors : oxfordColors;
    colorSection.innerHTML = `<label>Колір:</label>${renderColorSelect(`color-${id}`, palette)}`;
    if (p.allowCombine) colorSection.innerHTML += `<div class="checkbox-group"><input type="checkbox" id="combine-${id}" onchange="toggleCombine('${id}')"> Комбінований (4+2)</div><div id="extra-color-${id}" style="display:none;"><label>Другий колір:</label>${renderColorSelect(`color2-${id}`, palette)}</div>`;
    updatePrice(id);
}

function toggleCombine(id) {
    document.getElementById(`extra-color-${id}`).style.display = document.getElementById(`combine-${id}`).checked ? 'block' : 'none';
}

function updatePrice(id) {
    const p = products.find(prod => prod.id === id);
    let total = 0;
    if (p.sizes) total += p.sizes[document.getElementById(`size-${id}`).value];
    if (p.types) total += p.types[document.getElementById(`type-${id}`).value];
    if (p.fabrics) total += p.fabrics[document.getElementById(`fabric-${id}`).value];
    if (p.hasInnerCase && document.getElementById(`case-${id}`).checked) total += p.casePrice;
    if (p.options) total += p.options[document.getElementById(`opt-${id}`).value];
    document.getElementById(`price-val-${id}`).innerText = total;
}

function addToCart(id) {
    const p = products.find(prod => prod.id === id);
    const price = document.getElementById(`price-val-${id}`).innerText;
    const size = p.sizes ? document.getElementById(`size-${id}`).value : '';
    const type = p.types ? document.getElementById(`type-${id}`).value : '';
    const fabric = p.fabrics ? document.getElementById(`fabric-${id}`).value : '';
    const color = document.getElementById(`color-${id}`)?.value || document.getElementById(`color1-${id}`).value;
    
    let displayName = p.id === 'beanbag' ? `Крісло (${type})` : p.name;
    let desc = `${displayName} | Розмір: ${size}`;
    if (fabric) desc += ` | Тканина: ${fabric}`;
    desc += ` | Колір: ${color}`;
    if (document.getElementById(`combine-${id}`)?.checked || p.isBall) desc += ` + ${document.getElementById(`color2-${id}`).value}`;
    if (document.getElementById(`case-${id}`)?.checked) desc += ` + Внутр. чохол`;

    cart.push({ name: desc, price: parseInt(price) });
    updateCartUI();
}

function updateCartUI() {
    const total = cart.reduce((sum, item) => sum + item.price, 0);
    document.getElementById('cart-bar').style.display = 'block';
    document.getElementById('total-price').innerText = total;
}

function sendOrder() {
    tg.sendData(JSON.stringify({ action: 'order', items: cart.map(i => i.name).join(', '), totalPrice: document.getElementById('total-price').innerText }));
    tg.close();
}

renderCatalog();
