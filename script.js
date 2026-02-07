const SHEET_ID = '1Kd4ODQgS8QOFHOg2k4lCvRgizqSRnY17qiaStmV6BNY';
const GID = '415679695';
const CSV_URL = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/export?format=csv&gid=${GID}`;

let products = [];

// Словник для категорій (українською)
const categoryTranslate = {
    'Кресла': 'Крісла-Груші',
    'Игрушка': 'Крісла-Іграшки',
    'Дизайн': 'Авто-серія та Дизайн',
    'Мяч': 'М\'ячі',
    'Качеля обычная': 'Гойдалки',
    'Качеля двухместная': 'Двомісні гойдалки',
    'Футон': 'Футони'
};

async function loadProducts() {
    const container = document.getElementById('catalog-container');
    try {
        const response = await fetch(CSV_URL);
        const data = await response.text();
        const rows = data.split('\n').slice(1);
        
        products = rows.map(row => {
            const cols = row.split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/).map(c => c.replace(/"/g, '').trim());
            const parsePrice = (val) => parseFloat(val?.replace(',', '.')) || 0;

            return {
                id: cols[0],
                category: cols[1],
                name: cols[2],
                image: cols[3],
                basePrice: parsePrice(cols[4]), // ВИПРАВЛЕНО: BasePrice тепер Col E (4)
                sizeXL: parsePrice(cols[5]),    // XL тепер Col F (5)
                size2XL: parsePrice(cols[6]),
                size3XL: parsePrice(cols[7]),
                size4XL: parsePrice(cols[8]),
                velurExtra: parsePrice(cols[9]),
                innerCase: parsePrice(cols[10]),
                isDesign: cols[11]?.toLowerCase() === 'yes'
            };
        }).filter(p => p.id);

        renderMenu();
        renderCatalog();
        createModalHTML(); // Створюємо вікно один раз
    } catch (e) {
        container.innerHTML = '<p>Помилка завантаження даних.</p>';
    }
}

function renderCatalog() {
    const container = document.getElementById('catalog-container');
    container.innerHTML = '';
    const categories = [...new Set(products.map(p => p.category))];
    
    categories.forEach(cat => {
        const section = document.createElement('section');
        section.id = cat;
        section.innerHTML = `<h2 class="category-title">${categoryTranslate[cat] || cat}</h2>`;
        
        const grid = document.createElement('div');
        grid.className = 'product-grid';
        
        products.filter(p => p.category === cat).forEach(p => {
            // ЛОГІКА ЦІНИ: якщо база 0, беремо націнку за перший розмір
            const minPrice = p.basePrice > 0 ? p.basePrice : p.sizeXL;
            
            const card = document.createElement('div');
            card.className = 'product-card';
            card.innerHTML = `
                <img src="images/${p.image}" onerror="this.src='https://via.placeholder.com/150'">
                <h3>${p.name}</h3>
                <p class="price-tag">від ${minPrice} грн</p>
                <button class="btn-select" onclick="openConfigurator('${p.id}')">Налаштувати</button>
            `;
            grid.appendChild(card);
        });
        container.appendChild(grid);
        container.appendChild(section);
        section.appendChild(grid);
    });
}

// Функція "Відкриття" картки (Модальне вікно)
function openConfigurator(productId) {
    const p = products.find(item => item.id === productId);
    const modal = document.getElementById('modal');
    const content = document.getElementById('modal-body');
    
    modal.style.display = 'flex';
    content.innerHTML = `
        <img src="images/${p.image}" style="width:100%; border-radius:10px; margin-bottom:15px;">
        <h2>${p.name}</h2>
        <p style="color:#666; margin-bottom:20px;">Налаштуйте своє ідеальне крісло:</p>
        
        <div id="options-container">
            <p><strong>Розмір:</strong></p>
            <div style="display:flex; gap:10px;">
                ${p.basePrice > 0 ? '<button style="padding:10px; border:1px solid #ddd; background:none;">L</button>' : ''}
                <button style="padding:10px; border:1px solid #ddd; background:none;">XL</button>
            </div>
        </div>
        
        <div style="margin-top:30px; padding:15px; background:#f9f9f9; border-radius:10px;">
            <span style="font-size:18px; font-weight:bold;">Підсумок: ${p.basePrice || p.sizeXL} грн</span>
            <button style="float:right; background:#28a745; color:white; border:none; padding:10px 20px; border-radius:8px;">Замовити</button>
        </div>
    `;
}

function createModalHTML() {
    if (document.getElementById('modal')) return;
    const m = document.createElement('div');
    m.id = 'modal';
    m.innerHTML = `
        <div class="modal-content">
            <span class="close-modal" onclick="document.getElementById('modal').style.display='none'">&times;</span>
            <div id="modal-body"></div>
        </div>
    `;
    document.body.appendChild(m);
}

// Рендер меню (залишається як був)
function renderMenu() {
    const header = document.querySelector('header');
    let menu = document.querySelector('.category-menu');
    if (menu) menu.remove();
    menu = document.createElement('div');
    menu.className = 'category-menu';
    const categories = [...new Set(products.map(p => p.category))];
    categories.forEach(cat => {
        const btn = document.createElement('button');
        btn.innerText = categoryTranslate[cat] || cat;
        btn.onclick = () => document.getElementById(cat).scrollIntoView({ behavior: 'smooth' });
        menu.appendChild(btn);
    });
    header.appendChild(menu);
}

loadProducts();
