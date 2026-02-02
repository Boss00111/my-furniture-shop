const tg = window.Telegram.WebApp;
tg.expand();

// Словник кольорів Oxford
const oxfordColors = {
    "№1 Білий": "#ffffff", "№2 Бежевий": "#f5f5dc", "№3 Жовтий": "#ffff00",
    "№4 Помаранчевий": "#ffa500", "№5 Червоний": "#ff0000", "№6 Рожевий": "#ffc0cb",
    "№7 Бордо": "#800000", "№8 Салатовий": "#7fff00", "№9 Зелений": "#008000",
    "№10 Т.-зелений": "#006400", "№11 Блакитний": "#87ceeb", "№12 Синій": "#0000ff",
    "№13 Т.-синій": "#00008b", "№14 Фіолетовий": "#800080", "№15 С.-сірий": "#d3d3d3",
    "№16 Т.-сірий": "#a9a9a9", "№17 Коричневий": "#a52a2a", "№18 Чорний": "#000000",
    "№19 Бірюзовий": "#40e0d0", "№20 Малиновий": "#dc143c", "№21 Хакі": "#bdb76b",
    "№22 Оливковий": "#808000", "№23 Кораловий": "#ff7f50", "№24 Т. м’ята": "#3eb489",
    "№25 Шоколад": "#4b3621", "№26 Графіт": "#383e42"
};

const products = [
    {
        id: 'beanbag',
        name: 'Крісла (Груші / Овали)',
        image: 'grusha.jpg', // Завантаж файл з такою назвою на GitHub
        types: { 'Груша': 0, 'Овал': 80 },
        sizes: {
            'L (65*85)': 1100, 'XL (85*105)': 1280, '2XL (90*130)': 1460,
            '3XL (100*140)': 1620, '4XL (110*150)': 2000
        },
        fabrics: { 'Оксфорд 600D': 0, 'Велюр': 500, 'Екошкіра': 400 },
        hasInnerCase: true,
        casePrice: 190
    },
    {
        id: 'swing',
        name: 'Підвісні гойдалки',
        image: 'swing.jpg',
        types: { 
            'Одномісна (95см) + Пряма подушка': 1643,
            'Одномісна (95см) + Кругла подушка': 2015,
            'Двомісна (120х80)': 3360,
            'Двомісна (150х80)': 3700,
            'Двомісна (180х90)': 4140,
            'Двомісна (195х110)': 4560
        },
        options: { 'Стандарт': 0, 'Розбірна (+200грн)': 200 }
    },
    {
        id: 'futon',
        name: 'Футони',
        image: 'futon.jpg',
        sizes: { '160х80': 1730, '180х90': 1880 },
        options: { 'Без посилення': 0, 'Посилення форми (+190грн)': 190 }
    },
    {
        id: 'ball',
        name: 'Крісло-М’яч',
        image: 'ball.jpg',
        sizes: { 
            'L (50см)': 810, 'XL (70см)': 1200, 
            '2XL (100см)': 1700, '3XL (130см)': 2025 
        },
        fabrics: { 'Оксфорд': 0 },
        isBall: true // Для вибору кольору основи та вставок
    }
];

let cart = [];

function renderCatalog() {
    const catalog = document.getElementById('catalog');
    catalog.innerHTML = '';

    products.forEach(p => {
        const card = document.createElement('div');
        card.className = 'product-card';
        
        let html = `<img src="${p.image}" style="width:100%; border-radius:8px; margin-bottom:10px;" alt="${p.name}">
                    <div class="product-title">${p.name}</div>`;

        // Вибір типу (для груш/овалів або гойдалок)
        if (p.types) {
            html += `<label>Модель:</label><select id="type-${p.id}" onchange="updatePrice('${p.id}')">
                     ${Object.keys(p.types).map(t => `<option value="${t}">${t}</option>`).join('')}</select>`;
        }

        // Вибір розміру
        if (p.sizes) {
            html += `<label>Розмір:</label><select id="size-${p.id}" onchange="updatePrice('${p.id}')">
                     ${Object.keys(p.sizes).map(s => `<option value="${s}">${s}</option>`).join('')}</select>`;
        }

        // Кольори (якщо М'яч - два вибори)
        if (p.isBall) {
            html += `<label>Колір основи:</label>${renderColorSelect(`color1-${p.id}`)}
                     <label>Колір вставок:</label>${renderColorSelect(`color2-${p.id}`)}`;
        } else {
            html += `<label>Колір:</label>${renderColorSelect(`color-${p.id}`)}`;
        }

        // Чохол або Опції
        if (p.hasInnerCase) {
            html += `<div class="checkbox-group"><input type="checkbox" id="case-${p.id}" onchange="updatePrice('${p.id}')"> Додати внутр. чохол (+${p.casePrice} грн)</div>`;
        }
        if (p.options) {
            html += `<label>Додатково:</label><select id="opt-${p.id}" onchange="updatePrice('${p.id}')">
                     ${Object.keys(p.options).map(o => `<option value="${o}">${o}</option>`).join('')}</select>`;
        }

        html += `<div class="price-tag"><span id="price-val-${p.id}">0</span> грн</div>
                 <button class="btn" onclick="addToCart('${p.id}')">В кошик</button>`;
        
        card.innerHTML = html;
        catalog.appendChild(card);
        updatePrice(p.id);
    });
}

function renderColorSelect(id) {
    return `<select id="${id}" style="border-left: 10px solid #ccc;" onchange="this.style.borderLeftColor=this.options[this.selectedIndex].dataset.color">
            ${Object.entries(oxfordColors).map(([name, hex]) => 
                `<option value="${name}" data-color="${hex}">${name}</option>`).join('')}
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
    
    let desc = `${p.name} ${type} ${size}`;
    cart.push({ name: desc, price: parseInt(price) });
    updateCartUI();
}

function updateCartUI() {
    const total = cart.reduce((sum, item) => sum + item.price, 0);
    document.getElementById('cart-bar').style.display = 'block';
    document.getElementById('total-price').innerText = total;
}

function sendOrder() {
    const total = document.getElementById('total-price').innerText;
    tg.sendData(JSON.stringify({
        action: 'order',
        items: cart.map(i => i.name).join(', '),
        totalPrice: total
    }));
    tg.close();
}

renderCatalog();
