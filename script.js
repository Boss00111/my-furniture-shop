const SHEET_ID = '1Kd4ODQgS8QOFHOg2k4lCvRgizqSRnY17qiaStmV6BNY';
const GID = '415679695';
const CSV_URL = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/export?format=csv&gid=${GID}`;

let products = [];

// Твій оновлений список категорій для сайту
const categoryMap = {
    'Кресла': 'Крісла Classic',
    'Игрушка': 'Крісла-Іграшки',
    'Дизайн': 'Крісла з дизайном',
    'Мяч': 'М\'ячі',
    'Качеля обычная': 'Гойдалки',
    'Качеля двухместная': 'Гойдалки',
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
                basePrice: parsePrice(cols[4]),
                sizeXL: parsePrice(cols[5]),
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
        createModalHTML();
    } catch (e) {
        container.innerHTML = '<p>Помилка завантаження. Перевірте інтернет.</p>';
    }
}

function renderMenu() {
    const header = document.querySelector('header');
    let menu = document.querySelector('.category-menu');
    if (menu) menu.remove();
    
    menu = document.createElement('div');
    menu.className = 'category-menu';
    
    // Отримуємо унікальні імена для кнопок (після перекладу та об'єднання)
    const displayCategories = [...new Set(Object.values(categoryMap))];
    
    displayCategories.forEach(displayCat => {
        const btn = document.createElement('button');
        btn.innerText = displayCat;
        btn.onclick = () => {
            // Шукаємо перший заголовок з такою назвою та скролимо до нього
            const sections = document.querySelectorAll('.category-title');
            for (let s of sections) {
                if (s.innerText.includes(displayCat)) {
                    s.scrollIntoView({ behavior: 'smooth', block: 'start' });
                    break;
                }
            }
        };
        menu.appendChild(btn);
    });
    header.appendChild(menu);
}

function renderCatalog() {
    const container = document.getElementById('catalog-container');
    container.innerHTML = '';
    
    // Створюємо список груп (об'єднуємо звичайні та двомісні гойдалки)
    const grouped = {};
    products.forEach(p => {
        const catName = categoryMap[p.category] || p.category;
        if (!grouped[catName]) grouped[catName] = [];
        grouped[catName].push(p);
    });

    for (let catName in grouped) {
        const section = document.createElement('section');
        section.innerHTML = `<h2 class="category-title">--- ${catName} ---</h2>`;
        
        const grid = document.createElement('div');
        grid.className = 'product-grid';
        
        grouped[catName].forEach(p => {
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
    }
}

// Залишаємо openConfigurator та createModalHTML як були раніше
function openConfigurator(productId) {
    const p = products.find(item => item.id === productId);
    const modal = document.getElementById('modal');
    const content = document.getElementById('modal-body');
    modal.style.display = 'flex';
    content.innerHTML = `
        <img src="images/${p.image}" style="width:100%; border-radius:10px; margin-bottom:15px;">
        <h2>${p.name}</h2>
        <div style="margin-top:20px; padding:15px; background:#f9f9f9; border-radius:10px;">
            <span style="font-size:18px; font-weight:bold;">Ціна: ${p.basePrice || p.sizeXL} грн</span>
            <button onclick="document.getElementById('modal').style.display='none'" style="float:right; background:#666; color:white; border:none; padding:8px 15px; border-radius:6px;">Закрити</button>
        </div>
    `;
}

function createModalHTML() {
    if (document.getElementById('modal')) return;
    const m = document.createElement('div');
    m.id = 'modal';
    m.innerHTML = `<div class="modal-content"><span class="close-modal" onclick="document.getElementById('modal').style.display='none'">&times;</span><div id="modal-body"></div></div>`;
    document.body.appendChild(m);
}

loadProducts();
