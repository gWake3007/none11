import axios from 'axios';
const axios = require('axios').default;

import Notiflix from 'notiflix';

// import SimpleLightbox from 'simplelightbox';
// import 'simplelightbox/dist/simple-lightbox.min.css';

// const lightbox = new SimpleLightbox('.gallery');

const refs = {
  form: document.querySelector('.search-form'),
  gallery: document.querySelector('.gallery'),
  guard: document.querySelector('.js-guard'),
};

let options = {
  root: null,
  rootMargin: '300px',
};

let page = 1;
let observer = new IntersectionObserver(callback, options);
const { searchQuery } = refs.form.elements;

refs.form.addEventListener('submit', submitWord);

function submitWord(event) {
  event.preventDefault();
  fetchUsers(searchQuery.value)
    .then(data => {
      console.log(data);
      console.log(data.data.totalHits);
      if (data.data.totalHits === 0) {
        Notiflix.Notify.failure(
          'Sorry, there are no images matching your search query. Please try again.'
        );
      } else {
        observer.observe(refs.guard);
        refs.gallery.insertAdjacentHTML(
          'beforeend',
          createMarkup(data.data.hits)
        );
        Notiflix.Notify.info(
          `"Hooray! We found totalHits images: ${data.data.totalHits}"`
        );
      }
    })
    .catch(err => console.log(err));
}

function fetchUsers(searchQuery) {
  const API_KEY = '43049853-056e70021f6fbe40aa0efe216';
  const BASE_URL = 'https://pixabay.com/api/';

  const params = new URLSearchParams({
    key: API_KEY,
    q: searchQuery,
    image_type: 'photo',
    orientation: 'horizontal',
    safesearch: 'true',
    page,
    per_page: 40,
  });
  return axios.get(`${BASE_URL}?${params}`);
}

function createMarkup(arr) {
  return arr
    .map(
      ({
        webformatURL,
        largeImageURL,
        tags,
        likes,
        views,
        comments,
        downloads,
      }) => `<div class="photo-card">
    <img src="${webformatURL}" alt="${tags}" loading="lazy" width="320px"/>
    <div class="info">
      <p class="info-item">
        <b>Likes</b>
        ${likes}
      </p>
      <p class="info-item">
        <b>Views</b>
        ${views}
      </p>
      <p class="info-item">
        <b>Comments</b>
        ${comments}
      </p>
      <p class="info-item">
        <b>Downloads</b>
        ${downloads}
      </p>
    </div>
  </div>`
    )
    .join('');
}

function callback(entries) {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      console.log(entry);
      page += 1;
      fetchUsers(searchQuery.value)
        .then(data => {
          const summPages = 500 - 40 * page + 40; //?Лічник для сторінок.Для відображення кількості стільки залишилось.
          refs.gallery.insertAdjacentHTML(
            'beforeend',
            createMarkup(data.data.hits)
          );
          Notiflix.Notify.info(
            `"Hooray! We found totalHits images: ${summPages}"`
          );
          if (data.data.totalHits / page <= 40) {
            //?Рівняння якщо всі сторінки вже завантаженні.
            observer.unobserve(refs.guard);
          }
        })
        .catch(err => console.log(err));
    }
  });
}
