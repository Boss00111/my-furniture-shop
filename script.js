const SHEET_ID = '1Kd4ODQgS8QOFHOg2k4lCvRgizqSRnY17qiaStmV6BNY';
const GID = '415679695';
const CSV_URL = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/export?format=csv&gid=${GID}`;

let products = [];

// Словник для перекладу категорій
const categoryTranslate = {
    'Кресла': 'Крісла-Груші',
    'Игрушка': 'Крісла-Іграшки',
    'Дизайн': 'Авто-серія та Дизайн',
    'Мяч': 'М\'ячі',
    'Качеля обычная': 'Гойдалки (одномісні)',
    'Качеля двухместная': 'Гойдалки (двомісні)',
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
                basePrice: parsePrice(cols[5]),
                sizeXL: parsePrice(cols[6]),
                size2XL: parsePrice(cols[7]),
                size3XL: parsePrice(cols[8]),
                size4XL: parsePrice(cols[9]),
                innerCase: parsePrice(cols[10]),
                velurExtra: parsePrice(cols[11]),
                isDesign: cols[12]?.toLowerCase() === 'yes'
            };
        }).filter(p => p.id);

        renderMenu();
        renderCatalog();
    } catch (e) {
        container.innerHTML = '<p>Помилка оновлення. Спробуйте пізніше.</p>';
    }
}

function renderMenu() {
    const header = document.querySelector('header');
    const menu = document.createElement('div');
    menu.className = 'category-menu';
    
    const categories = [...new Set(products.map(p => p.category))];
    categories.forEach(cat => {
        const btn = document.createElement('button');
        btn.innerText = categoryTranslate[cat] || cat;
        btn.onclick = () => {
            document.getElementById(cat).scrollIntoView({ behavior: 'smooth' });
        };
        menu.appendChild(btn);
    });
    header.appendChild(menu);
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
        section.appendChild(grid);
        container.appendChild(section);
    });
}

function openConfigurator(productId) {
    const p = products.find(item => item.id === productId);
    alert(`Конфігуратор для ${p.name} в розробці. Ціна бази: ${p.basePrice} грн. Скоро тут буде вибір кольору!`);
}

loadProducts();
