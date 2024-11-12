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
  return code.split('\n').map(line => indentStr + line.trimEnd()).join('\n'); // Додаємо символ нового рядка
}

// Рекурсивна функція для обробки @include вказівок у файлах
function processIncludes(content) {
  return content.replace(/([ \t]*)\/\/ @include\('(.+?)'\)/g, (match, indent, fileName) => {
    const fileContent = readFile(`./src/${fileName}`);
    if (!fileContent) {
      console.error(`Не вдалося включити файл: ${fileName}`);
      return ''; // Повертаємо порожній рядок, якщо файл не знайдено
    }
    // Обробляємо вміст вкладеного файлу на наявність інших @include
    const processedContent = processIncludes(fileContent);
    
    // Додаємо правильний відступ до вкладеного вмісту
    return indentCode(processedContent, indent);
  });
}

// Основна функція для бандлінгу файлів
function bundleFiles() {
  let mainFile = readFile('./src/index.js');
  if (!mainFile) {
    console.error('Не вдалося зібрати bundle.js через відсутність index.js.');
    return;
  }

  // Обробляємо всі вкладені @include в основному файлі
  mainFile = processIncludes(mainFile);

  // Записуємо об'єднаний файл у bundle.js
  fs.writeFileSync('./assets/js/tPlayer-script.js', mainFile);

  // Додаємо час створення бандлу
  const creationTime = new Date().toLocaleString();
  console.log(`Файл bundle.js створений успішно! Час: ${creationTime}`);
}

// Викликаємо функцію
bundleFiles();