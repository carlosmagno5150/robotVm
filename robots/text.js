const Algorithmia = require("algorithmia");
const algorithmiaApiKey = require("../credentials/algorithmia.json").apiKey;
const watsonConfig = require("../credentials/watson-nlu.json");
//const naturalLang = require('watson-developer-cloud/natural-language-understanding/v1');
var NaturalLanguageUnderstandingV1 = require('watson-developer-cloud/natural-language-understanding/v1');
const sbd = require('sbd');
const normalize = require('normalize-text');
const state = require('./state');


async function robot(content){

//   var teste = await fetchWatsonKeywords(`Michael Jeffrey Jordan (born February 17, 1963), also known by his initials, MJ, is an American former professional basketball player who is the principal owner and chairman of the Charlotte Hornets of  the National Basketball Association (NBA).`);
//   console.log(teste);
// process.exit();

  //await fetchContentFromWikipedia(content);  
  //await sanitizeContent(content);
  //await breakContentIntoSentences(content);  
  content = state.load();
  console.log(content);
  //await fetchKeyWords(content);      

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

 async function sanitizeContent(content){    
   return new Promise  ((res, rej) => {
      const allLines = content.summary.split('\n');
      const withoutBlankLines = allLines.filter( (lines) =>{
        if (lines.trim() === 0 || lines.trim().startsWith('=')){
          return false;
        }
        return true;
      });
      content.summary =withoutBlankLines.join(' ');
      res('OK');
    });
  }

  async function breakContentIntoSentences(content){
    return new Promise  ((res, rej) => {
      const sentences = sbd.sentences(content.summary);
      content.sentences =[];
      sentences.forEach( (s) => {
        content.sentences.push({
          text: s,
          keywords:[],
          images: []
        })
      });    
      res('ok');
    });
  }

  async function fetchKeyWords(content){
    content.sentences = content.sentences.slice(0,2);    
     for(const s of content.sentences){      
       console.log('fetching for :', s);
       s.keywords = await fetchWatsonKeywords(s.text);      
     }    
     console.log('>>>>>>>>>>>>>>>>>>>>>>>>>>');
     //console.log(content.sentences);
     state.save(content);
  }

  function fetchWatsonKeywords(sentence){    
    return new Promise((res, rej) => {
      // sentence = normalize.normalizeWhitespaces(sentence);
      // sentence = normalize.normalizeDiacritics(sentence);
      // sentence = normalize.normalizeParagraph(sentence);
      // sentence = normalize.normalizeName(sentence);
      console.log('processando sentence: ',  sentence);
      const watsonApiKey = watsonConfig.apikey;
      const urlPath = watsonConfig.url;      
      var nlu = new NaturalLanguageUnderstandingV1({
        iam_apikey: watsonApiKey,
        version: '2018-04-05',
        url: urlPath
      });
      const response = nlu.analyze({
        text: sentence,
        features: {
          keywords: {}
        }
      }).then((response) => {     
        //console.log(response);
        const ret = response.keywords.map((kw) => {
          return kw.text;          
        });
        res(ret);
      }).catch((err) => {
        console.log("Erro: ", err);
      });
    });
  }

}

module.exports = robot;