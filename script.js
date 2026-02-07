// Конфігурація
const SHEET_ID = '1Kd4ODQgS8QOFHOg2k4lCvRgizqSRnY17qiaStmV6BNY'; // Твій ID
const SHEET_URL = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?tqx=out:json&gid=415679695`;

let products = [];

// Завантаження даних з Google Таблиці
async function loadProducts() {
    try {
        const response = await fetch(SHEET_URL);
        const text = await response.text();
        const json = JSON.parse(text.substr(47).slice(0, -2));
        
        const rows = json.table.rows;
        products = rows.map(row => ({
            id: row.c[0]?.v || '',
            category: row.c[1]?.v || '',
            name: row.c[2]?.v || '',
            image: row.c[3]?.v || '',
            isDesign: row.c[4]?.v === 'Yes',
            basePrice: parseFloat(row.c[5]?.v) || 0,
            sizeXL: parseFloat(row.c[6]?.v) || 0,
            size2XL: parseFloat(row.c[7]?.v) || 0,
            size3XL: parseFloat(row.c[8]?.v) || 0,
            size4XL: parseFloat(row.c[9]?.v) || 0,
            innerCase: parseFloat(row.c[10]?.v) || 0,
            velurExtra: parseFloat(row.c[11]?.v) || 0
        }));

        renderCatalog();
    } catch (error) {
        console.error("Помилка завантаження таблиці:", error);
    }
}

function renderCatalog() {
    const container = document.getElementById('catalog-container');
    container.innerHTML = '';
    
    // Групуємо товари за категоріями для заголовків
    const categories = [...new Set(products.map(p => p.category))];
    
    categories.forEach(cat => {
        const sectionTitle = document.createElement('h2');
        sectionTitle.className = 'category-title';
        sectionTitle.innerText = `--- ${cat} ---`;
        container.appendChild(sectionTitle);

        const categoryProducts = products.filter(p => p.category === cat);
        
        // Якщо це "Груша/Овал" або "Дизайн" - робимо одну комбіновану картку
        if (cat === 'Груша/Овал' || cat === 'Дизайн' || cat === 'Качеля обычная') {
            const card = createCombinedCard(categoryProducts, cat);
            container.appendChild(card);
        } else {
            // Для інших (іграшки, м'ячі) - кожна стрічка окрема картка
            categoryProducts.forEach(product => {
                const card = createSingleCard(product);
                container.appendChild(card);
            });
        }
    });
}

function createCombinedCard(items, catType) {
    const firstItem = items[0];
    const card = document.createElement('div');
    card.className = 'product-card';
    
    // Тут логіка вибору моделі (селект), яка змінює картинку та ціну
    // Я підготую детальний рендер нижче, коли ми переконаємося, що дані тягнуться
    card.innerHTML = `<h3>${catType} (Виберіть модель)</h3>
                      <p>Завантаження конфігуратора...</p>`;
    
    // Для початку просто виведемо імена, щоб перевірити зв'язок
    setupSmartCard(card, items, catType);
    return card;
}

function createSingleCard(p) {
    const card = document.createElement('div');
    card.className = 'product-card';
    card.innerHTML = `
        <img src="images/${p.image}" alt="${p.name}" onerror="this.src='https://via.placeholder.com/200'">
        <h3>${p.name}</h3>
        <p class="price">Від ${p.basePrice || p.sizeXL} грн</p>
        <button onclick="openConfigurator('${p.id}')">Вибрати</button>
    `;
    return card;
}

// Запуск
loadProducts();
