const readLine = require('readline-sync');

function userInput(content){
  
  content.searchTerm = askAndReturnSearchTerm();
  content.prefix = askAndReturnPrefix();

  function askAndReturnSearchTerm(){
    return readLine.question('Type a Wikipedia search term: ');
  }
  function askAndReturnPrefix(){
    const prefixes = ['Who is', 'What is', 'The history of' ];
    const selectedPrefixIndex = readLine.keyInSelect(prefixes, 'Choose one option');    
    return prefixes[selectedPrefixIndex];
  }
}

module.exports = userInput;