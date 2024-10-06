// Array of random comment messages
const commentMessages = [
  'Все відмінно!',
  'Загалом все непогано. Але не всі.',
  'Коли ви робите фотографію, добре б прибирати палець із кадру. Зрештою, це просто непрофесійно.',
  'Моя бабуся випадково чхнула з фотоапаратом у руках і у неї вийшла фотографія краще.',
  'Я послизнувся на банановій шкірці і впустив фотоапарат на кота і у мене вийшла фотографія краще.',
  'Обличчя людей на фотці перекошені, ніби їх побивають. Як можна було зловити такий невдалий момент?'
];

const commentAuthors = ['Артем', 'Олена', 'Іван', 'Марія', 'Сергій', 'Катерина'];
const MIN_COMMENTS = 1;
const MAX_COMMENTS = 5;
const MIN_LIKES = 15;
const MAX_LIKES = 200;
const TOTAL_PHOTOS = 25;
const AVATAR_COUNT = 6;

const getRandomNumber = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;

const generateComment = (id) => {
  const avatarIndex = getRandomNumber(1, AVATAR_COUNT);
  const messageIndex = getRandomNumber(0, commentMessages.length - 1);
  const authorIndex = getRandomNumber(0, commentAuthors.length - 1);
  
  return {
    id,
    avatar: `img/avatar-${avatarIndex}.svg`,
    message: commentMessages[messageIndex],
    name: commentAuthors[authorIndex],
  };
};

const generateComments = () => {
  const numberOfComments = getRandomNumber(MIN_COMMENTS, MAX_COMMENTS);
  const comments = new Set();

  while (comments.size < numberOfComments) {
    comments.add(generateComment(comments.size + 1));
  }

  return Array.from(comments);
};

const generatePhotos = () => {
  return Array.from({ length: TOTAL_PHOTOS }, (_, index) => {
    const id = index + 1;
    return {
      id,
      url: `images/${id}.jpg`,
      description: `Це опис для фото номер ${id}`,
      likes: getRandomNumber(MIN_LIKES, MAX_LIKES),
      comments: generateComments(),
    };
  });
};

// Модуль для малювання мініатюр
const thumbnailModule = (() => {
  const pictureTemplate = document.querySelector('#picture').content.querySelector('.picture');
  const picturesContainer = document.querySelector('.pictures');

  const createThumbnail = (photo) => {
    const pictureElement = pictureTemplate.cloneNode(true);
    pictureElement.querySelector('.picture__img').src = photo.url;
    pictureElement.querySelector('.picture__likes').innerHTML = 
      `<img src="/icons/heart.png" alt="" width="16" height="16"> ${photo.likes}`;
    pictureElement.querySelector('.picture__comments').innerHTML = `
      <img src="/icons/comment.png" alt="" width="16" height="16"> ${photo.comments.length}`;
    return pictureElement;
  };

  const renderThumbnails = (photos) => {
    const fragment = document.createDocumentFragment();
    photos.forEach(photo => fragment.appendChild(createThumbnail(photo)));
    picturesContainer.appendChild(fragment);
  };

  return {
    createThumbnail,
    renderThumbnails,
  };
})();

const addThumbnailClickListener = (photos) => {
  const thumbnails = document.querySelectorAll('.picture');
  thumbnails.forEach((thumbnail, index) => {
    thumbnail.addEventListener('click', (evt) => {
      evt.preventDefault();
      fullViewModule.openFullView(photos[index]);
    });
  });
};

// Генерація фотографій
const photos = generatePhotos();
thumbnailModule.renderThumbnails(photos);
addThumbnailClickListener(photos);

// Додати блок фільтрів
const imgFilters = document.querySelector('.img-filters');
imgFilters.classList.remove('img-filters--inactive');

// Отримання елементів фільтрів
const filterButtons = document.querySelectorAll('.img-filters__button');

// Функція для очищення зображень
const clearThumbnails = () => {
  const picturesContainer = document.querySelector('.pictures');
  picturesContainer.innerHTML = '';
};

// Функція для відображення усіх фотографій
const showAllPhotos = (photos) => {
  clearThumbnails();
  thumbnailModule.renderThumbnails(photos);
  addThumbnailClickListener(photos);
};

// Функція для показу випадкових фотографій
const showRandomPhotos = (photos) => {
  clearThumbnails();
  const randomPhotos = [];
  const usedIndices = new Set();
  while (randomPhotos.length < 10) {
    const randomIndex = getRandomNumber(0, photos.length - 1);
    if (!usedIndices.has(randomIndex)) {
      usedIndices.add(randomIndex);
      randomPhotos.push(photos[randomIndex]);
    }
  }
  thumbnailModule.renderThumbnails(randomPhotos);
  addThumbnailClickListener(randomPhotos);
};

// Функція для показу обговорюваних фотографій
const showDiscussedPhotos = (photos) => {
  clearThumbnails();
  const discussedPhotos = [...photos].sort((a, b) => b.comments.length - a.comments.length);
  thumbnailModule.renderThumbnails(discussedPhotos);
  addThumbnailClickListener(discussedPhotos);
};

// Обробка зміни фільтрів з усуненням брязкоту
const debounce = (func, delay) => {
  let timeoutId;
  return function (...args) {
    if (timeoutId) {
      clearTimeout(timeoutId);
    }
    timeoutId = setTimeout(() => {
      func.apply(this, args);
    }, delay);
  };
};

// Додавання обробників для фільтрів
filterButtons.forEach((button) => {
  button.addEventListener('click', debounce((evt) => {
    const activeButton = imgFilters.querySelector('.img-filters__button--active');
    
    // Додана перевірка на наявність activeButton
    if (activeButton) {
      activeButton.classList.remove('img-filters__button--active');
    }
    
    evt.currentTarget.classList.add('img-filters__button--active');
    
    switch (evt.currentTarget.id) {
      case 'filter-random':
        showRandomPhotos(photos);
        break;
      case 'filter-discussed':
        showDiscussedPhotos(photos);
        break;
      default:
        showAllPhotos(photos);
        break;
    }
  }, 500));
});


// Відображення усіх фотографій за замовчуванням
showAllPhotos(photos);


// Завантаження зображення
const uploadFileInput = document.querySelector('#upload-file');
const imgUploadOverlay = document.querySelector('.img-upload__overlay');

uploadFileInput.addEventListener('change', () => {
  const file = uploadFileInput.files[0];
  const reader = new FileReader();

  reader.onload = () => {
    imgPreview.src = reader.result;
    imgUploadOverlay.classList.remove('hidden');
    document.body.classList.add('modal-open');
  };

  if (file) {
    reader.readAsDataURL(file);
  }
});

const scaleControlSmaller = document.querySelector('.scale__control--smaller');
const scaleControlBigger = document.querySelector('.scale__control--bigger');
const scaleControlValue = document.querySelector('.scale__control--value');
const imgPreview = document.querySelector('.img-upload__preview img');

let scaleValue = 100;

function updateScale() {
  scaleControlValue.value = `${scaleValue}%`;
  imgPreview.style.transform = `scale(${scaleValue / 100})`;
}

scaleControlSmaller.addEventListener('click', () => {
  if (scaleValue > 25) {
    scaleValue -= 25;
    updateScale();
  }
});

scaleControlBigger.addEventListener('click', () => {
  if (scaleValue < 100) {
    scaleValue += 25;
    updateScale();
  }
});

updateScale();

const effectLevelSlider = document.querySelector('.effect-level__slider');
const effectLevelValue = document.querySelector('.effect-level__value');
const effectsRadio = document.querySelectorAll('.effects__radio');

noUiSlider.create(effectLevelSlider, {
  range: {
    min: 0,
    max: 100,
  },
  start: 100,
  step: 1,
  connect: 'lower',
});

let currentEffect = 'none';

const effectSettings = {
  chrome: { filter: 'grayscale', unit: '', min: 0, max: 1, step: 0.1 },
  sepia: { filter: 'sepia', unit: '', min: 0, max: 1, step: 0.1 },
  marvin: { filter: 'invert', unit: '%', min: 0, max: 100, step: 1 },
  phobos: { filter: 'blur', unit: 'px', min: 0, max: 3, step: 0.1 },
  heat: { filter: 'brightness', unit: '', min: 1, max: 3, step: 0.1 },
  none: { filter: '', unit: '', min: 0, max: 100, step: 1 },
};

function applyEffect(intensity) {
  const { filter, unit } = effectSettings[currentEffect];
  imgPreview.style.filter = filter ? `${filter}(${intensity}${unit})` : '';
}

effectLevelSlider.noUiSlider.on('update', (values) => {
  effectLevelValue.value = values[0];
  if (currentEffect !== 'none') {
    applyEffect(values[0] / 100 * (effectSettings[currentEffect].max - effectSettings[currentEffect].min) + effectSettings[currentEffect].min);
  }
});

effectsRadio.forEach((radio) => {
  radio.addEventListener('change', (event) => {
    currentEffect = event.target.value;
    const settings = effectSettings[currentEffect];
    if (currentEffect === 'none') {
      effectLevelSlider.setAttribute('disabled', true);
      imgPreview.style.filter = '';
    } else {
      effectLevelSlider.removeAttribute('disabled');
      effectLevelSlider.noUiSlider.updateOptions({
        range: {
          min: settings.min,
          max: settings.max,
        },
        start: settings.max,
        step: settings.step,
      });
      applyEffect(settings.max);
    }
  });
});

const fullViewModule = (() => {
  const bigPictureElement = document.querySelector('.big-picture');
  const bigPictureImg = bigPictureElement.querySelector('.big-picture__img img');
  const likesCountElement = bigPictureElement.querySelector('.likes-count');
  const commentsCountElement = bigPictureElement.querySelector('.comments-count');
  const commentsContainer = bigPictureElement.querySelector('.social__comments');
  const captionElement = bigPictureElement.querySelector('.social__caption');
  const bodyElement = document.body;
  const closeButton = bigPictureElement.querySelector('.big-picture__cancel');

  const createCommentElement = (comment) => {
    const commentElement = document.createElement('li');
    commentElement.classList.add('social__comment');
    const img = document.createElement('img');
    img.classList.add('social__picture');
    img.src = comment.avatar;
    img.alt = comment.name;
    img.width = 35;
    img.height = 35;
    const text = document.createElement('p');
    text.classList.add('social__text');
    text.textContent = comment.message;
    commentElement.appendChild(img);
    commentElement.appendChild(text);
    return commentElement;
  };

  const renderComments = (comments) => {
    commentsContainer.innerHTML = '';
    comments.forEach((comment) => commentsContainer.appendChild(createCommentElement(comment)));
  };

  const openFullView = (photo) => {
    bigPictureElement.classList.remove('hidden');
    bodyElement.classList.add('modal-open');
    bigPictureImg.src = photo.url;
    likesCountElement.textContent = photo.likes;
    commentsCountElement.textContent = photo.comments.length;
    captionElement.textContent = photo.description;
    renderComments(photo.comments);
  };

  const closeFullView = () => {
    bigPictureElement.classList.add('hidden');
    bodyElement.classList.remove('modal-open');
  };

  closeButton.addEventListener('click', closeFullView);
  document.addEventListener('keydown', (evt) => {
    if (evt.key === 'Escape') {
      closeFullView();
    }
  });

  return {
    openFullView,
  };
})();

