let properties = [];

const propertyList = document.getElementById('propertyList');
const searchInput = document.getElementById('searchInput');
const objectCount = document.getElementById('objectCount');
const createButton = document.getElementById('createButton');
const createModal = document.getElementById('createModal');
const modalClose = document.getElementById('modalClose');
const cancelCreate = document.getElementById('cancelCreate');
const createForm = document.getElementById('createForm');

function formatPrice(value) {
  return value.toLocaleString('ru-RU', {
    style: 'currency',
    currency: 'RUB',
    maximumFractionDigits: 0,
  });
}

function renderProperties(list) {
  propertyList.innerHTML = '';

  if (!list.length) {
    propertyList.innerHTML = '<div class="no-results">Ничего не найдено. Попробуйте изменить запрос.</div>';
    objectCount.textContent = 'Найдено 0 объектов';
    return;
  }

  objectCount.textContent = `Найдено ${list.length} объектов`;

  list.forEach((property) => {
    const card = document.createElement('article');
    card.className = 'card';
    card.innerHTML = `
      <img class="card__image" src="${property.image}" alt="${property.title}" />
      <div class="card__body">
        <h2 class="card__title">${property.title}</h2>
        <p class="card__location">${property.location}</p>
        <p class="card__details">${property.rooms} комнаты · ${property.area} м²</p>
        <p class="card__price">${formatPrice(property.price)}</p>
      </div>
      <div class="card__footer">
        <span class="card__badge">ID ${property.id}</span>
        <a class="button" href="#" onclick="showDetails(${property.id}); return false;">Подробнее</a>
      </div>
    `;

    propertyList.appendChild(card);
  });
}

function showDetails(id) {
  const property = properties.find((item) => item.id === id);
  if (!property) return;

  const message = `${property.title}\n\n${property.description}\n\nЦена: ${formatPrice(property.price)}\nПлощадь: ${property.area} м²\nКомнат: ${property.rooms}`;
  alert(message);
}

function openModal() {
  createModal.classList.add('modal--active');
  createModal.setAttribute('aria-hidden', 'false');
}

function closeModal() {
  createModal.classList.remove('modal--active');
  createModal.setAttribute('aria-hidden', 'true');
  createForm.reset();
}

function handleSearch() {
  const query = searchInput.value.trim().toLowerCase();
  const filtered = properties.filter((item) => item.title.toLowerCase().includes(query));
  renderProperties(filtered);
}

async function loadProperties() {
  try {
    const response = await fetch('/flats');
    if (!response.ok) {
      throw new Error('Не удалось загрузить список объявлений');
    }
    properties = await response.json();
    renderProperties(properties);
  } catch (error) {
    propertyList.innerHTML = `<div class="no-results">Ошибка загрузки объявлений: ${error.message}</div>`;
    objectCount.textContent = 'Не удалось загрузить данные';
  }
}

async function handleCreate(event) {
  event.preventDefault();

  const formData = new FormData(createForm);
  const title = formData.get('title').trim();
  const location = formData.get('location').trim();
  const price = Number(formData.get('price'));
  const area = Number(formData.get('area')) || 0;
  const rooms = Number(formData.get('rooms')) || 0;
  const image = formData.get('image').trim() || 'https://images.unsplash.com/photo-1494526585095-c41746248156?auto=format&fit=crop&w=900&q=80';
  const description = formData.get('description').trim() || 'Описание будет добавлено позже.';

  if (!title || !price) {
    alert('Заполните, пожалуйста, название и цену.');
    return;
  }

  try {
    const response = await fetch('/flat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        title,
        location: location || 'Не указано',
        price,
        area,
        rooms,
        image,
        description,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => null);
      throw new Error(errorData?.description || 'Ошибка создания объявления');
    }

    const createdProperty = await response.json();
    properties.unshift(createdProperty);
    closeModal();
    createForm.reset();
    searchInput.value = '';
    renderProperties(properties);
  } catch (error) {
    alert(`Не удалось создать объявление: ${error.message}`);
  }
}

createButton.addEventListener('click', openModal);
modalClose.addEventListener('click', closeModal);
cancelCreate.addEventListener('click', closeModal);
createModal.addEventListener('click', (event) => {
  if (event.target === createModal) {
    closeModal();
  }
});
createForm.addEventListener('submit', handleCreate);
searchInput.addEventListener('input', handleSearch);
loadProperties();
