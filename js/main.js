// main.js

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
  
  // Generate a random number between two values (inclusive)
  const getRandomNumber = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
  
  // Generate a single comment
  const generateComment = (id) => ({
    id,
    avatar: `img/avatar-${getRandomNumber(1, 6)}.svg`,
    message: commentMessages[getRandomNumber(0, commentMessages.length - 1)],
    name: commentAuthors[getRandomNumber(0, commentAuthors.length - 1)],
  });
  
  // Generate a list of comments
  const generateComments = () => {
    const numberOfComments = getRandomNumber(1, 5); // You can adjust the range
    const comments = [];
    for (let i = 0; i < numberOfComments; i++) {
      comments.push(generateComment(getRandomNumber(100, 999)));
    }
    return comments;
  };
  
  // Generate photo objects
  const generatePhotos = () => {
    const photos = [];
    
    for (let i = 1; i <= 25; i++) {
      const photo = {
        id: i,
        url: `images/${i}.jpg`,
        description: `Це опис для фото номер ${i}`,
        likes: getRandomNumber(15, 200),
        comments: generateComments(),
      };
      
      photos.push(photo);
    }
  
    return photos;
  };
  
  // Store the generated data in a variable
  const photos = generatePhotos();
  console.log(photos);  