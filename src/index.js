import axios from 'axios';
import Notiflix from 'notiflix';
import SimpleLightbox from 'simplelightbox';
import 'simplelightbox/dist/simple-lightbox.min.css';

const form = document.querySelector('.search-form');
const gallery = document.querySelector('.gallery');
const loadMore = document.querySelector('.load-more');

const key = '33829143-ea8670a872fa68e1952c5f18f';
const imageType = 'photo';
const per_page = 40;
const baseUrl = `https://pixabay.com/api/?key=${key}&image_type=${imageType}&per_page=${per_page}`;
let query = '';
let page;
let totalHits = 0;
let cardHeight;

const simpleGallery = new SimpleLightbox('.gallery a', {
  captionsData: 'alt',
  captionDelay: 250,
  captionPosition: 'bottom',
});

form.addEventListener('submit', onSubmit);
loadMore.addEventListener('click', loadMoreImages);

loadMore.classList.add('hidden-btn');

function onSubmit(event) {
  event.preventDefault();
  loadMore.classList.add('hidden-btn');
  gallery.innerHTML = '';
  query = event.target.elements.searchQuery.value;
  loadGalery();
}

async function loadGalery() {
  page = 1;
  totalHits = 0;
  let url = `${baseUrl}&q=${query}&page=${page}`;
  try {
    
    let result = await axios.get(url);
    totalHits += result.data.hits.length;
    checkTotalHits(result.data.totalHits);
    gallery.innerHTML = createMarkup(result.data.hits);
    simpleGallery.refresh();

    cardHeight = gallery.firstElementChild.getBoundingClientRect();
    window.scrollBy({
      top: cardHeight.height * (per_page / 4),
      behavior: 'smooth',
    });

  } catch (error) {
    console.log(error);
  }
}

async function loadMoreImages() {
  page += 1;
  let url = `${baseUrl}&q=${query}&page=${page}`;

  try {
    
    let result = await axios.get(url);
    totalHits += result.data.hits.length;
    checkTotalHits(result.data.totalHits);
    gallery.insertAdjacentHTML('beforeend', createMarkup(result.data.hits));
    simpleGallery.refresh();

    window.scrollBy({
      top: cardHeight.height * (per_page / 4) + 150,
      behavior: 'smooth',
    });

  } catch (error) {
    console.log(error);
  }
}

function checkTotalHits(dataTotalHits) {
  if (dataTotalHits === 0) {
    Notiflix.Notify.failure(
      'Sorry, there are no images matching your search query. Please try again.'
    );
  } else {
    if (totalHits >= dataTotalHits) {
      Notiflix.Notify.failure(
        "We're sorry, but you've reached the end of search results."
      );
      loadMore.classList.add('hidden-btn');
    } else {
      let message = `Hooray! We found ${totalHits} images.`;
      Notiflix.Notify.success(message);
      loadMore.classList.remove('hidden-btn');
    }
  }
}

function createMarkup(data) {
  let markup = data
    .map(
      item =>
        `<div class="photo-card">
        <a href="${item.largeImageURL}">
          <img src="${item.webformatURL}" alt="${item.tags}" loading="lazy" />  
        </a>
          <div class="info">
            <p class="info-item">
              <b>Likes</b>${item.likes}
            </p>
            <p class="info-item">
              <b>Views</b>${item.views}
            </p>
            <p class="info-item">
              <b>Comments</b>${item.comments}
            </p>
            <p class="info-item">
              <b>Downloads</b>${item.downloads}
            </p>
          </div>
        </div>`
    )
    .join('');
  return markup;
}
