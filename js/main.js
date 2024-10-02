// Array of random comment messages
const commentMessages = [
  'Все відмінно!',
  'Загалом все непогано. Але не всі.',
  'Коли ви робите фотографію, добре б прибирати палець із кадру. Зрештою, це просто непрофесійно.',
  'Моя бабуся випадково чхнула з фотоапаратом у руках і у неї вийшла фотографія краща.',
  'Я послизнувся на банановій шкірці і впустив фотоапарат на кота і у мене вийшла фотографія краще.',
  'Обличчя людей на фотці перекошені, ніби їх побивають. Як можна було зловити такий невдалий момент?'
];

// Array of random names
const commentAuthors = ['Артем', 'Олена', 'Іван', 'Марія', 'Сергій', 'Катерина'];

// Constants for ranges
const MIN_COMMENTS = 1;
const MAX_COMMENTS = 5;
const MIN_LIKES = 15;
const MAX_LIKES = 200;
const TOTAL_PHOTOS = 25;
const AVATAR_COUNT = 6;

// Generate a random number between two values (inclusive)
const getRandomNumber = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;

// Generate a single comment
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

// Generate a list of unique comments
const generateComments = () => {
  const numberOfComments = getRandomNumber(MIN_COMMENTS, MAX_COMMENTS);
  const comments = new Set();

  while (comments.size < numberOfComments) {
    comments.add(generateComment(comments.size + 1));
  }

  return Array.from(comments);
};

// Generate photo objects
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

  // Функція для створення однієї мініатюри
  const createThumbnail = (photo) => {
    const pictureElement = pictureTemplate.cloneNode(true);
    pictureElement.querySelector('.picture__img').src = photo.url;

    // Оновлюємо блок лайків: додаємо іконку лайка та кількість
    pictureElement.querySelector('.picture__likes').innerHTML = 
      `<img src="/icons/heart.png" alt="" width="16" height="16"> ${photo.likes}`;

    // Оновлюємо блок коментарів: додаємо іконку коментаря та кількість
    pictureElement.querySelector('.picture__comments').innerHTML = `
      <img src="/icons/comment.png" alt="" width="16" height="16"> ${photo.comments.length}`;

    return pictureElement;
  };

  // Функція для створення всіх мініатюр
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

// Додаємо обробник події на клік для кожної мініатюри
const addThumbnailClickListener = (photos) => {
  const thumbnails = document.querySelectorAll('.picture');
  thumbnails.forEach((thumbnail, index) => {
    thumbnail.addEventListener('click', (evt) => {
      evt.preventDefault(); // Запобігаємо переходу за посиланням
      fullViewModule.openFullView(photos[index]); // Відкриваємо повнорозмірне зображення
    });
  });
};

// Генерація фото та їх відображення
const photos = generatePhotos();
thumbnailModule.renderThumbnails(photos);
addThumbnailClickListener(photos); // Додаємо обробник події для мініатюр

// Масштабування зображення
const scaleControlSmaller = document.querySelector('.scale__control--smaller');
const scaleControlBigger = document.querySelector('.scale__control--bigger');
const scaleControlValue = document.querySelector('.scale__control--value');
const imgPreview = document.querySelector('.img-upload__preview img');

let scaleValue = 100; // Значення за замовчуванням

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

// Початкове значення
updateScale();

// --- Накладення ефектів через noUiSlider ---
const effectLevelSlider = document.querySelector('.effect-level__slider');
const effectLevelValue = document.querySelector('.effect-level__value');
const effectsRadio = document.querySelectorAll('.effects__radio');

// Налаштування слайдера noUiSlider
noUiSlider.create(effectLevelSlider, {
  range: {
    min: 0,
    max: 100,
  },
  start: 100,
  step: 1,
  connect: 'lower',
});

// Оновлення ефекту на основі вибраного фільтра
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

  // Функція для створення коментаря
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

  // Функція для відображення повнорозмірного зображення
  const openFullView = (photo) => {
    bigPictureElement.classList.remove('hidden');
    bodyElement.classList.add('modal-open');
    bigPictureImg.src = photo.url;
    likesCountElement.textContent = photo.likes;
    commentsCountElement.textContent = photo.comments.length;
    captionElement.textContent = photo.description;

    // Очищуємо старі коментарі
    commentsContainer.innerHTML = '';
    const fragment = document.createDocumentFragment();
    photo.comments.forEach(comment => {
      fragment.appendChild(createCommentElement(comment));
    });
    commentsContainer.appendChild(fragment);

    // Закриття по Esc
    document.addEventListener('keydown', onEscPress);
  };

  // Функція для закриття повнорозмірного зображення
  const closeFullView = () => {
    bigPictureElement.classList.add('hidden');
    bodyElement.classList.remove('modal-open');
    document.removeEventListener('keydown', onEscPress); // При закритті видаляємо обробник
  };

  // Закриття по Esc
  const onEscPress = (evt) => {
    if (evt.key === 'Escape' || evt.key === 'Esc') {
      closeFullView();
    }
  };

  // Закриття при натисканні на кнопку закриття
  closeButton.addEventListener('click', () => {
    closeFullView();
  });

  return {
    openFullView,
  };
})();
