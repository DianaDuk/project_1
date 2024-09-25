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
const generateComment = (id) => ({
  id,
  avatar: `img/avatar-${getRandomNumber(1, AVATAR_COUNT)}.svg`,
  message: commentMessages[getRandomNumber(0, commentMessages.length - 1)],
  name: commentAuthors[getRandomNumber(0, commentAuthors.length - 1)],
});

// Generate a list of comments
const generateComments = () => {
  const numberOfComments = getRandomNumber(MIN_COMMENTS, MAX_COMMENTS);
  return Array.from({ length: numberOfComments }, (_, index) => generateComment(index + 1));
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
    photos.map(createThumbnail).forEach((thumbnail) => {
      fragment.appendChild(thumbnail);
    });
    picturesContainer.appendChild(fragment);
  };

  return {
    createThumbnail,
    renderThumbnails,
  };
})();

// Додаємо обробник події на клік для кожної мініатюри
const addThumbnailClickListener = () => {
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
addThumbnailClickListener(); // Додаємо обробник події для мініатюр

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
    commentElement.innerHTML = `
      <img class="social__picture" src="${comment.avatar}" alt="${comment.name}" width="35" height="35">
      <p class="social__text">${comment.message}</p>
    `;
    return commentElement;
  };

  // Функція для відкриття повнорозмірного зображення
  const openFullView = (photo) => {
    bigPictureImg.src = photo.url;
    likesCountElement.textContent = photo.likes;
    commentsCountElement.textContent = photo.comments.length;
    captionElement.textContent = photo.description;

    // Очищуємо старі коментарі
    commentsContainer.innerHTML = '';

    // Додаємо нові коментарі
    const commentsFragment = document.createDocumentFragment();
    photo.comments.forEach(comment => {
      commentsFragment.appendChild(createCommentElement(comment));
    });
    commentsContainer.appendChild(commentsFragment);

    // Відображаємо вікно
    bigPictureElement.classList.remove('hidden');
    bodyElement.classList.add('modal-open');

    // Закриття по Esc
    document.addEventListener('keydown', onEscPress);
  };

  // Функція для закриття повнорозмірного зображення
  const closeFullView = () => {
    bigPictureElement.classList.add('hidden');
    bodyElement.classList.remove('modal-open');
    document.removeEventListener('keydown', onEscPress);
  };

  // Закриття по Esc
  const onEscPress = (evt) => {
    if (evt.key === 'Escape' || evt.key === 'Esc') {
      closeFullView();
    }
  };

  // Закриття по кліку на кнопку
  closeButton.addEventListener('click', closeFullView);

  return {
    openFullView,
  };
})();
