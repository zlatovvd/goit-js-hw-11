import axios from 'axios';
import Notiflix from 'notiflix';
import SimpleLightbox from 'simplelightbox';
import 'simplelightbox/dist/simple-lightbox.min.css';

const refs = {
  form: document.querySelector('.search-form'),
  gallery: document.querySelector('.gallery'),
  loadMoreBtn: document.querySelector('.load-more'),
  guard: document.querySelector('.js-guard'),
};

const key = '33829143-ea8670a872fa68e1952c5f18f';
const imageType = 'photo';
const per_page = 40;
const baseUrl = `https://pixabay.com/api/?key=${key}&image_type=${imageType}&per_page=${per_page}`;
let query = '';
let page;
let totalHits = 0;
let cardHeight;

const options = {
  root: null,
  rootMargin: '200px',
  threshold: 1.0,
}

const observer = new IntersectionObserver(onLoad, options);

const simpleGallery = new SimpleLightbox('.gallery a', {
  captionsData: 'alt',
  captionDelay: 250,
  captionPosition: 'bottom',
});

refs.form.addEventListener('submit', onSubmit);
refs.loadMoreBtn.addEventListener('click', loadMoreImages);

refs.loadMoreBtn.classList.add('hidden-btn');

function onLoad(entries, observer) {
  entries.forEach(element => {
    if (element.isIntersecting) {
      loadMoreImages();
    }
    
  });
  console.log(entries);
}

function onSubmit(event) {
  event.preventDefault();
  refs.loadMoreBtn.classList.add('hidden-btn');
  refs.gallery.innerHTML = '';
  query = event.currentTarget.elements.searchQuery.value;
  loadGalery();
}

async function loadGalery() {
  page = 1;
  totalHits = 0;

  try {
    const result = await loadData();
    checkTotalHits(result.data.totalHits);
    refs.gallery.innerHTML = createMarkup(result.data.hits);
    simpleGallery.refresh();

    observer.observe(refs.guard)

    // cardHeight = refs.gallery.firstElementChild.getBoundingClientRect();
    // window.scrollBy({
    //   top: cardHeight.height * (per_page / 4),
    //   behavior: 'smooth',
    // });
  } catch (error) {
    console.log(error);
  }
}

async function loadMoreImages() {
  refs.loadMoreBtn.setAttribute('disabled', 'disabled');

  try {
    const result = await loadData();
    checkTotalHits(result.data.totalHits);
    refs.gallery.insertAdjacentHTML(
      'beforeend',
      createMarkup(result.data.hits)
    );
    refs.loadMoreBtn.removeAttribute('disabled');
    simpleGallery.refresh();

    // window.scrollBy({
    //   top: cardHeight.height * (per_page / 4) + 150,
    //   behavior: 'smooth',
    // });
  } catch (error) {
    console.log(error);
  }
}

async function loadData() {
  const url = `${baseUrl}&q=${query}&page=${page}`;
  const result = await axios.get(url);
  totalHits += result.data.hits.length;
  page += 1;
  return result;
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
      refs.loadMoreBtn.classList.add('hidden-btn');
    } else {
      let message = `Hooray! We found ${totalHits} images.`;
      Notiflix.Notify.success(message);
      refs.loadMoreBtn.classList.remove('hidden-btn');
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
