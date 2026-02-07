const SHEET_ID = '1Kd4ODQgS8QOFHOg2k4lCvRgizqSRnY17qiaStmV6BNY';
const GID = '415679695';
const CSV_URL = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/export?format=csv&gid=${GID}`;

let products = [];

async function loadProducts() {
    const container = document.getElementById('catalog-container');
    if (!container) {
        console.error("Помилка: Не знайдено catalog-container в HTML!");
        return;
    }
    
    container.innerHTML = '<p style="text-align:center;">Завантаження товарів...</p>';

    try {
        const response = await fetch(CSV_URL);
        if (!response.ok) throw new Error('Помилка мережі');
        const data = await response.text();
        
        const rows = data.split('\n').slice(1);
        
        products = rows.map(row => {
            // Очищення від лапок та поділ
            const cols = row.split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/).map(c => c.replace(/"/g, '').trim());
            
            // Функція для перетворення ціни (заміна коми на крапку)
            const parsePrice = (val) => parseFloat(val?.replace(',', '.')) || 0;

            return {
                id: cols[0] || '',
                category: cols[1] || '',
                name: cols[2] || '',
                image: cols[3] || '',
                basePrice: parsePrice(cols[5]),
                sizeXL: parsePrice(cols[6]),
                size2XL: parsePrice(cols[7]),
                size3XL: parsePrice(cols[8]),
                size4XL: parsePrice(cols[9]),
                innerCase: parsePrice(cols[10]),
                velurExtra: parsePrice(cols[11]),
                isDesign: cols[12]?.toLowerCase() === 'yes'
            };
        }).filter(p => p.id !== '');

        if (products.length === 0) {
            container.innerHTML = '<p style="text-align:center;">Товари не знайдені в таблиці.</p>';
        } else {
            renderCatalog();
        }
    } catch (error) {
        container.innerHTML = `<p style="text-align:center; color:red;">Помилка зв'язку з таблицею. Перевірте публікацію.</p>`;
    }
}

function renderCatalog() {
    const container = document.getElementById('catalog-container');
    container.innerHTML = '';
    
    const categories = [...new Set(products.map(p => p.category))];
    
    categories.forEach(cat => {
        const sectionTitle = document.createElement('h2');
        sectionTitle.style.cssText = 'text-align:center; margin-top:30px; border-bottom: 2px solid #eee; padding-bottom:10px;';
        sectionTitle.innerText = `--- ${cat} ---`;
        container.appendChild(sectionTitle);

        const categoryProducts = products.filter(p => p.category === cat);
        
        const grid = document.createElement('div');
        grid.style.cssText = 'display: flex; flex-wrap: wrap; justify-content: center; gap: 15px;';
        
        categoryProducts.forEach(product => {
            const card = document.createElement('div');
            card.className = 'product-card';
            card.style.cssText = 'width: 160px; border: 1px solid #eee; border-radius: 12px; padding: 10px; text-align: center; background: white;';

            // Визначаємо стартову ціну
            const displayPrice = product.basePrice > 0 ? product.basePrice : product.sizeXL;

            card.innerHTML = `
                <img src="images/${product.image}" style="width:100%; height:140px; object-fit: cover; border-radius: 8px;" 
                     onerror="this.src='https://via.placeholder.com/150?text=Фото'">
                <h3 style="font-size: 14px; margin: 10px 0;">${product.name}</h3>
                <p style="font-weight: bold; color: #28a745; margin-bottom: 10px;">від ${displayPrice} грн</p>
                <button style="width: 100%; padding: 8px; border: none; border-radius: 6px; background: #007bff; color: white; cursor: pointer;">Вибрати</button>
            `;
            grid.appendChild(card);
        });
        container.appendChild(grid);
    });
}

loadProducts();
