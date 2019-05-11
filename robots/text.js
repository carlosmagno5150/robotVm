const Algorithmia = require("algorithmia");
const algorithmiaApiKey = require("../credentials/algorithmia.json").apiKey;
const sbd = require('sbd')

async function robot(content){
  
  await fetchContentFromWikipedia(content);
  breakContentIntoSentences(content);

  async function fetchContentFromWikipedia(){
    var input = {
      "articleName": content.searchTerm,
      "lang": "en"
    };
    const wikiPediaResponse = await Algorithmia
      .client(algorithmiaApiKey)
      .algo("web/WikipediaParser/0.1.2?timeout=300")
      .pipe(input);
    const wikiDocument =  wikiPediaResponse.get();
      //content.sourceContentOriginal = wikiDocument;      
      content.summary = wikiPediaResponse.get().summary;
  }

  function breakContentIntoSentences(content){
    const sentences = sbd.sentences(content.summary);
    content.sentences =[];
    sentences.forEach( (s) => {
      content.sentences.push({
        text: s,
        keywords:[],
        images: []
      })
    });    
  }

  // function sanitizeContent(content){
  //   const blankLine = removeBlankLines(content.)
  // }
}

module.exports = robot;