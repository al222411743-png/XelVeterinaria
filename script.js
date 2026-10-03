// URL y API Key de The Dog API
const API_URL = 'https://api.thedogapi.com/v1/breeds';
const API_KEY = 'live_RPyk2edu5cJq3ASMOSIjpQhVPEqRNXTVQctNxj38Qo0CCcnSQx0mUjNR9kKhfF8t';

let allBreeds = [];

// Elementos del DOM
const dogsContainer = document.getElementById('dogsContainer');
const searchInput = document.getElementById('searchInput');
const temperamentSelect = document.getElementById('temperamentSelect');
const sizeSelect = document.getElementById('sizeSelect');

// Eventos para filtrar dinámicamente al escribir o cambiar una opción
searchInput.addEventListener('input', applyFilters);
temperamentSelect.addEventListener('change', applyFilters);
sizeSelect.addEventListener('change', applyFilters);

// Función principal para obtener razas desde la API
async function fetchBreeds() {
  try {
    const res = await fetch(API_URL, {
      headers: {
        'x-api-key': API_KEY
      }
    });
    
    if (!res.ok) {
      throw new Error(`Error HTTP: ${res.status}`);
    }

    const data = await res.json();

    // Procesar datos y clasificar tamaño por peso promedio
    allBreeds = data.map(breed => {
      const avgWeight = getAverageWeight(breed.weight?.metric);
      const categorySize = classifySize(avgWeight);

      return {
        id: breed.id,
        name: breed.name,
        image: breed.image?.url || 'https://via.placeholder.com/300x200?text=Sin+Imagen',
        lifeExpectancy: breed.life_span || 'No especificada',
        temperament: breed.temperament || 'No especificado',
        weightKg: avgWeight,
        sizeCategory: categorySize, // pequeño, mediano, grande
        description: breed.bred_for || breed.temperament || 'Sin descripción disponible.'
      };
    });

    renderBreeds(allBreeds);
  } catch (error) {
    console.error('Error al consultar The Dog API:', error);
    dogsContainer.innerHTML = '<p class="loading">Ocurrió un error al obtener la información de las razas.</p>';
  }
}

// Clasificación de tamaño según el peso promedio en Kg
function classifySize(weight) {
  if (!weight) return 'desconocido';
  if (weight < 10) return 'pequeno';
  if (weight <= 25) return 'mediano';
  return 'grande';
}

// Obtener peso promedio desde cadenas formateadas como "6 - 8"
function getAverageWeight(metricWeight) {
  if (!metricWeight) return null;
  const parts = metricWeight.split('-').map(str => parseFloat(str.trim()));
  if (parts.length === 2 && !isNaN(parts[0]) && !isNaN(parts[1])) {
    return (parts[0] + parts[1]) / 2;
  } else if (parts.length === 1 && !isNaN(parts[0])) {
    return parts[0];
  }
  return null;
}

// Filtrar según Búsqueda por Nombre, Temperamento y Tamaño
function applyFilters() {
  const searchTerm = searchInput.value.toLowerCase().trim();
  const selectedTemp = temperamentSelect.value.toLowerCase();
  const selectedSize = sizeSelect.value;

  // Mapeo Español -> Inglés para los temperamentos devueltos por The Dog API
  const tempMap = {
    'afectuoso': ['affectionate', 'loving', 'friendly', 'gentle'],
    'agil': ['agile', 'active', 'lively', 'energetic'],
    'jugueton': ['playful', 'boisterous', 'fun-loving'],
    'alerta': ['alert', 'watchful', 'keen', 'attentive'],
    'territorial': ['territorial', 'protective', 'assertive', 'suspicious']
  };

  const filtered = allBreeds.filter(breed => {
    // 1. Filtrar por Nombre
    const matchesName = breed.name.toLowerCase().includes(searchTerm);

    // 2. Filtrar por Temperamento
    let matchesTemp = true;
    if (selectedTemp) {
      const keywords = tempMap[selectedTemp] || [selectedTemp];
      matchesTemp = keywords.some(key => breed.temperament.toLowerCase().includes(key));
    }

    // 3. Filtrar por Tamaño
    let matchesSize = true;
    if (selectedSize) {
      matchesSize = breed.sizeCategory === selectedSize;
    }

    return matchesName && matchesTemp && matchesSize;
  });

  renderBreeds(filtered);
}

// Renderizar tarjetas dinámicamente en el HTML
function renderBreeds(breeds) {
  dogsContainer.innerHTML = '';

  if (breeds.length === 0) {
    dogsContainer.innerHTML = '<p class="loading">No se encontraron perros que coincidan con la búsqueda.</p>';
    return;
  }

  breeds.forEach(breed => {
    const card = document.createElement('article');
    card.className = 'dog-card';

    const sizeText = breed.sizeCategory === 'pequeno' ? 'Raza Pequeña' :
                     breed.sizeCategory === 'mediano' ? 'Raza Mediana' :
                     breed.sizeCategory === 'grande' ? 'Raza Grande' : 'Tamaño No Disponible';

    card.innerHTML = `
      <img src="${breed.image}" alt="${breed.name}" loading="lazy">
      <div class="dog-info">
        <h3>${breed.name}</h3>
        <span class="badge ${breed.sizeCategory}">${sizeText}</span>
        <p><strong>Esperanza de vida:</strong> ${breed.lifeExpectancy}</p>
        <p><strong>Temperamento:</strong> ${breed.temperament}</p>
        <p><strong>Descripción:</strong> ${breed.description}</p>
      </div>
    `;

    dogsContainer.appendChild(card);
  });
}

// Ejecutar al cargar la página
fetchBreeds();