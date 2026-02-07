// Заміни ВСЕ у файлі script.js на цей код:

// Твій ключ з посилання на публікацію
const SHEET_ID = '1Kd4ODQgS8QOFHOg2k4lCvRgizqSRnY17qiaStmV6BNY';
const GID = '415679695';
const CSV_URL = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/export?format=csv&gid=${GID}`;

let products = [];

async function loadProducts() {
    try {
        console.log("Пробую завантажити дані...");
        const response = await fetch(CSV_URL);
        const data = await response.text();
        
        // Розбиваємо CSV на рядки та колонки
        const rows = data.split('\n').slice(1); // пропускаємо заголовок
        
        products = rows.map(row => {
            const cols = row.split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/); // Коректний поділ CSV
            return {
                id: cols[0]?.trim() || '',
                category: cols[1]?.trim() || '',
                name: cols[2]?.trim() || '',
                image: cols[3]?.trim() || '',
                basePrice: parseFloat(cols[5]) || 0,
                sizeXL: parseFloat(cols[6]) || 0,
                size2XL: parseFloat(cols[7]) || 0,
                size3XL: parseFloat(cols[8]) || 0,
                size4XL: parseFloat(cols[9]) || 0,
                innerCase: parseFloat(cols[10]) || 0,
                velurExtra: parseFloat(cols[11]) || 0,
                isDesign: cols[12]?.trim().toLowerCase() === 'yes'
            };
        }).filter(p => p.id !== '');

        console.log("Завантажено товарів:", products.length);
        renderCatalog();
    } catch (error) {
        console.error("Помилка:", error);
        document.getElementById('catalog-container').innerHTML = '<p style="color:red">Помилка завантаження таблиці. Перевірте публікацію.</p>';
    }
}

function renderCatalog() {
    const container = document.getElementById('catalog-container');
    if (!container) return;
    container.innerHTML = '';
    
    const categories = [...new Set(products.map(p => p.category))];
    
    categories.forEach(cat => {
        const sectionTitle = document.createElement('h2');
        sectionTitle.style.textAlign = 'center';
        sectionTitle.style.margin = '40px 0 20px';
        sectionTitle.innerText = `--- ${cat} ---`;
        container.appendChild(sectionTitle);

        const categoryProducts = products.filter(p => p.category === cat);
        
        categoryProducts.forEach(product => {
            const card = document.createElement('div');
            card.className = 'product-card';
            card.style.border = '1px solid #ddd';
            card.style.margin = '10px';
            card.style.padding = '15px';
            card.style.borderRadius = '10px';
            card.style.display = 'inline-block';
            card.style.width = '250px';
            card.style.verticalAlign = 'top';

            const price = product.basePrice > 0 ? product.basePrice : product.sizeXL;

            card.innerHTML = `
                <img src="images/${product.image}" style="width:100%; border-radius:8px;" alt="${product.name}" onerror="this.src='https://via.placeholder.com/200?text=No+Image'">
                <h3 style="font-size:18px;">${product.name}</h3>
                <p>Ціна від: <strong>${price} грн</strong></p>
                <button style="width:100%; padding:10px; background:#28a745; color:white; border:none; border-radius:5px; cursor:pointer;">Вибрати</button>
            `;
            container.appendChild(card);
        });
    });
}

// Запуск
loadProducts();
