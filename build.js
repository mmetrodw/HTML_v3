const fs = require('fs');
const path = require('path');

// Функція для перевірки наявності файлу
function checkFileExists(filePath) {
  return fs.existsSync(path.resolve(__dirname, filePath));
}

// Функція для читання файлу
function readFile(filePath) {
  if (!checkFileExists(filePath)) {
    console.error(`Файл не знайдено: ${filePath}`);
    return null;
  }
  return fs.readFileSync(path.resolve(__dirname, filePath), 'utf8');
}

// Функція для додавання відступів до коду
function indentCode(code, indent) {
  const indentStr = indent || ''; // Визначаємо рядок для відступу
  return code.split('\n').map(line => indentStr + line.trimEnd()).join(''); // Додаємо правильний символ нового рядка
}

// Основна функція для бандлінгу файлу
function bundleFiles() {
  let mainFile = readFile('./src/index.js');
  if (!mainFile) {
    console.error('Не вдалося зібрати bundle.js через відсутність index.js.');
    return;
  }

  // Шукаємо всі @include і замінюємо на вміст відповідних файлів
  mainFile = mainFile.replace(/(\s*)\/\/ @include\('(.+?)'\)/g, (match, indent, fileName) => {
    const fileContent = readFile(`./src/${fileName}`);
    if (!fileContent) {
      console.error(`Не вдалося включити файл: ${fileName}`);
      return ''; // Повертаємо порожній рядок, якщо файл не знайдено
    }

    // Додаємо правильний відступ до коду, який вставляється
    const indentedContent = indentCode(fileContent, indent);
    return indentedContent; // Повертаємо відформатований вміст
  });

  // Записуємо об'єднаний файл у bundle.js
  fs.writeFileSync('./assets/js/bundle.js', mainFile);

  // Додаємо час створення бандлу
  const creationTime = new Date().toLocaleString();
  console.log(`Файл bundle.js створений успішно! Час: ${creationTime}`);
}

// Викликаємо функцію
bundleFiles();
