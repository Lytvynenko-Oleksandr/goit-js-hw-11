import Notiflix from 'notiflix';
import SimpleLightbox from 'simplelightbox';
import axios from 'axios';

const lightbox = new SimpleLightbox('.gallery a');

let page = 1;
const perPage = 40;
const API_KEY = '37177651-5ec5a04b96ead6e1e080dffcf';
const BASE_URL = 'https://pixabay.com/api/';

async function fetchImages(query) {
  try {
    const response = await axios.get(BASE_URL, {
      params: {
        key: API_KEY,
        q: query,
        image_type: 'photo',
        orientation: 'horizontal',
        safesearch: true,
        page,
        per_page: perPage,
      },
    });

    const data = response.data;
    const images = data.hits;

    if (images.length === 0) {
      Notiflix.Notify.failure('Sorry, there are no images matching your search query. Please try again.');
    } else {
      const gallery = document.querySelector('.gallery');

      if (page === 1) {
        gallery.innerHTML = '';
        lightbox.refresh();
      }

      images.forEach((image) => {
        const card = document.createElement('div');
        card.className = 'photo-card';

        const link = document.createElement('a');
        link.href = image.largeImageURL;

        const img = document.createElement('img');
        img.src = image.webformatURL;
        img.alt = image.tags;
        img.loading = 'lazy';

        const info = document.createElement('div');
        info.className = 'info';

        const likes = createInfoItem('Likes', image.likes);
        const views = createInfoItem('Views', image.views);
        const comments = createInfoItem('Comments', image.comments);
        const downloads = createInfoItem('Downloads', image.downloads);

        info.appendChild(likes);
        info.appendChild(views);
        info.appendChild(comments);
        info.appendChild(downloads);

        link.appendChild(img);
        card.appendChild(link);
        card.appendChild(info);

        gallery.appendChild(card);
      });

      lightbox.refresh();

      if (data.totalHits <= page * perPage) {
        const loadMoreBtn = document.querySelector('.load-more');
        loadMoreBtn.style.display = 'none';
        Notiflix.Notify.info("We're sorry, but you've reached the end of search results.");
      } else {
        const loadMoreBtn = document.querySelector('.load-more');
        loadMoreBtn.style.display = 'block';
      }

      page++;
      Notiflix.Notify.success(`Hooray! We found ${data.totalHits} images.`);
    }
  } catch (error) {
    Notiflix.Notify.failure('Oops! Something went wrong. Please try again later.');
  }
}

function createInfoItem(label, value) {
  const item = document.createElement('p');
  item.className = 'info-item';
  item.innerHTML = `<b>${label}:</b> ${value}`;
  return item;
}

// Обработчик события отправки формы
document.querySelector('#search-form').addEventListener('submit', async (event) => {
  event.preventDefault();
  const searchQuery = event.target.elements.searchQuery.value.trim();

  if (searchQuery === '') {
    Notiflix.Notify.failure('Please enter a search query.');
    return; // Прекратить выполнение функции, если поле ввода пустое
  }

  page = 1; // Сброс значения страницы при новом поиске
  await fetchImages(searchQuery);
  window.scrollBy({
    top: document.querySelector('.gallery').firstElementChild.getBoundingClientRect().height * 2,
    behavior: 'smooth',
  });
});

// Обработчик события клика по кнопке "Load more"
document.querySelector('.load-more').addEventListener('click', async () => {
  const searchQuery = document.querySelector('#search-form input[name="searchQuery"]').value.trim();

  if (searchQuery === '') {
    Notiflix.Notify.failure('Please enter a search query.');
    return; // Прекратить выполнение функции, если поле ввода пустое
  }

  await fetchImages(searchQuery);
  window.scrollBy({
    top: document.querySelector('.gallery').firstElementChild.getBoundingClientRect().height * 2,
    behavior: 'smooth',
  });
});

