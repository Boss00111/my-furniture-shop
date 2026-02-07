const SHEET_ID = '1Kd4ODQgS8QOFHOg2k4lCvRgizqSRnY17qiaStmV6BNY';
const GID = '415679695';
const CSV_URL = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/export?format=csv&gid=${GID}`;

let products = [];

// Словник перекладу (ЖОРСТКИЙ)
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
        enableMouseScroll(); // Вмикаємо скрол мишкою
    } catch (e) {
        container.innerHTML = '<p>Помилка завантаження.</p>';
    }
}

function renderMenu() {
    const header = document.querySelector('header');
    // Очищаємо старе меню та обгортку
    const oldWrapper = document.querySelector('.menu-wrapper');
    if (oldWrapper) oldWrapper.remove();

    const wrapper = document.createElement('div');
    wrapper.className = 'menu-wrapper';
    
    const menu = document.createElement('div');
    menu.className = 'category-menu';
    
    const displayCategories = [...new Set(Object.values(categoryMap))];
    
    displayCategories.forEach(displayCat => {
        const btn = document.createElement('button');
        btn.innerText = displayCat;
        btn.onclick = () => {
            // Знаходимо секцію за текстом заголовка
            const titles = document.querySelectorAll('.category-title');
            for (let t of titles) {
                if (t.innerText.includes(displayCat)) {
                    const offset = 120; // Відступ зверху, щоб заголовок не ховався під шапку
                    const bodyRect = document.body.getBoundingClientRect().top;
                    const elementRect = t.getBoundingClientRect().top;
                    const elementPosition = elementRect - bodyRect;
                    const offsetPosition = elementPosition - offset;

                    window.scrollTo({
                        top: offsetPosition,
                        behavior: 'smooth'
                    });
                    break;
                }
            }
        };
        menu.appendChild(btn);
    });
    
    wrapper.appendChild(menu);
    header.appendChild(wrapper);
}

function renderCatalog() {
    const container = document.getElementById('catalog-container');
    container.innerHTML = '';
    
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
        container.appendChild(section);
        section.appendChild(grid);
    }
}

// Допоміжна функція для скролу мишкою (drag-to-scroll)
function enableMouseScroll() {
    const slider = document.querySelector('.category-menu');
    let isDown = false;
    let startX;
    let scrollLeft;

    slider.addEventListener('mousedown', (e) => {
        isDown = true;
        startX = e.pageX - slider.offsetLeft;
        scrollLeft = slider.scrollLeft;
    });
    slider.addEventListener('mouseleave', () => { isDown = false; });
    slider.addEventListener('mouseup', () => { isDown = false; });
    slider.addEventListener('mousemove', (e) => {
        if (!isDown) return;
        e.preventDefault();
        const x = e.pageX - slider.offsetLeft;
        const walk = (x - startX) * 2;
        slider.scrollLeft = scrollLeft - walk;
    });
}

// Функції модалки (залишаються як були)
function openConfigurator(productId) {
    const p = products.find(item => item.id === productId);
    const modal = document.getElementById('modal');
    modal.style.display = 'flex';
    document.getElementById('modal-body').innerHTML = `
        <img src="images/${p.image}" style="width:100%; border-radius:10px;">
        <h2>${p.name}</h2>
        <p>Ціна бази: ${p.basePrice || p.sizeXL} грн</p>
        <button onclick="document.getElementById('modal').style.display='none'" style="width:100%; padding:12px; background:#666; color:white; border:none; border-radius:8px; margin-top:15px;">Закрити</button>
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
