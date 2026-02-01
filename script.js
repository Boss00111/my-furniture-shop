const tg = window.Telegram.WebApp;
tg.expand();

// База товарів з урахуванням твоїх категорій
const products = [
    {
        id: 'beanbag',
        name: 'Крісло-груша',
        basePrice: 850, 
        sizes: {
            'L (65*85)': 0,
            'XL (85*105)': 250,
            '2XL (90*125)': 450,
            '3XL (100*135)': 650,
            '4XL (110*145)': 900
        },
        fabrics: {
            'Оксфорд 600D': 0,
            'Велюр': 550,
            'Екошкіра': 450
        },
        colors: [
            '№1 Білий', '№2 Бежевий', '№3 Жовтий', '№4 Помаранчевий', 
            '№5 Червоний', '№6 Рожевий', '№7 Бордо', '№8 Салатовий', 
            '№9 Зелений', '№10 Т.-зелений', '№11 Блакитний', '№12 Синій', 
            '№13 Т.-синій', '№14 Фіолетовий', '№15 С.-сірий', 
            '№16 Т.-сірий', '№17 Коричневий', '№18 Чорний', '№19 Бірюзовий',
            '№20 Малиновий', '№21 Хакі', '№22 Оливковий', '№23 Кораловий',
            '№24 Т. м’ята', '№25 Шоколад', '№26 Графіт'
        ],
        hasInnerCase: true
    },
    {
        id: 'swing',
        name: 'Гойдалка підвісна',
        basePrice: 1450,
        sizes: {
            'Одинарна': 0,
            'Подвійна (сімейна)': 950
        },
        fabrics: {
            'Оксфорд (вулична)': 0,
            'Велюр (домашня)': 450
        },
        colors: ['Бежевий', 'Сірий', 'Графіт', 'Коричневий', 'Зелений'],
        hasInnerCase: false
    },
    {
        id: 'futon',
        name: 'Футон (Матрац)',
        basePrice: 1600,
        sizes: {
            'Стандарт (70*190)': 0,
            'Комфорт (90*200)': 500,
            'Люкс (140*200)': 1200
        },
        fabrics: {
            'Рогожка': 0,
            'Велюр': 450
        },
        colors: ['Сірий', 'Синій', 'Бежевий', 'Коричневий'],
        hasInnerCase: false
    }
];

let cart = [];

function renderCatalog() {
    const catalog = document.getElementById('catalog');
    catalog.innerHTML = '';

    products.forEach(product => {
        const card = document.createElement('div');
        card.className = 'product-card';
        card.innerHTML = `
            <div class="product-title">${product.name}</div>
            
            <label>Розмір:</label>
            <select id="size-${product.id}" onchange="updatePrice('${product.id}')">
                ${Object.keys(product.sizes).map(s => `<option value="${s}">${s}</option>`).join('')}
            </select>

            <label>Тканина:</label>
            <select id="fabric-${product.id}" onchange="updatePrice('${product.id}')">
                ${Object.keys(product.fabrics).map(f => `<option value="${f}">${f}</option>`).join('')}
            </select>

            <label>Колір:</label>
            <select id="color-${product.id}">
                ${product.colors.map(c => `<option value="${c}">${c}</option>`).join('')}
            </select>

            ${product.hasInnerCase ? `
                <div class="checkbox-group">
                    <input type="checkbox" id="case-${product.id}" onchange="updatePrice('${product.id}')"> 
                    <label for="case-${product.id}">Додати внутрішній чохол (+160 грн)</label>
                </div>
            ` : ''}

            <div class="price-tag"><span id="price-val-${product.id}">${product.basePrice}</span> грн</div>
            
            <button class="btn" onclick="addToCart('${product.id}')">В кошик</button>
            <button class="btn btn-support" onclick="askQuestion('${product.name}')" style="background-color: #abb7b7; margin-top: 8px;">Задати питання</button>
        `;
        catalog.appendChild(card);
        updatePrice(product.id);
    });
}

function updatePrice(productId) {
    const product = products.find(p => p.id === productId);
    const size = document.getElementById(`size-${productId}`).value;
    const fabric = document.getElementById(`fabric-${productId}`).value;
    const hasCase = document.getElementById(`case-${productId}`)?.checked;

    let total = product.basePrice + product.sizes[size] + product.fabrics[fabric];
    if (hasCase) total += 160;

    document.getElementById(`price-val-${productId}`).innerText = total;
}

function addToCart(productId) {
    const product = products.find(p => p.id === productId);
    const size = document.getElementById(`size-${productId}`).value;
    const fabric = document.getElementById(`fabric-${productId}`).value;
    const color = document.getElementById(`color-${productId}`).value;
    const price = parseInt(document.getElementById(`price-val-${productId}`).innerText);

    cart.push({
        name: `${product.name} (${size}, ${fabric}, ${color})`,
        price: price
    });

    updateCartUI();
}

function updateCartUI() {
    const total = cart.reduce((sum, item) => sum + item.price, 0);
    const cartBar = document.getElementById('cart-bar');
    if (cart.length > 0) {
        cartBar.style.display = 'block';
        document.getElementById('total-price').innerText = total;
    }
}

function askQuestion(productName) {
    tg.sendData(JSON.stringify({ action: 'question', item: productName }));
    tg.close();
}

function sendOrder() {
    const total = cart.reduce((sum, item) => sum + item.price, 0);
    const orderData = {
        action: 'order',
        items: cart.map(i => i.name).join(', '),
        totalPrice: total
    };
    tg.sendData(JSON.stringify(orderData));
    tg.close();
}

renderCatalog();
