

/******************** actual implementation **************/

var bayes = require('bayes');

var classifier = bayes();

// teach it positive phrases

classifier.learn('amazing, awesome movie!! Yeah!! Oh boy.', 'positive');
classifier.learn('Sweet, this is incredibly, amazing, perfect, great!!', 'positive');

// teach it a negative phrase

classifier.learn('terrible, shitty thing. Damn. Sucks!!', 'negative');

// now ask it to categorize a document it has never seen before

//console.log(classifier.categorize('awesome, cool, amazing!! Yay.'))
function test() {
    var input = document.getElementById("input").value;
    console.log(input);
    document.getElementById("output").innerHTML = classifier.categorize(input);
}

window.test = test;


/* convert classifier into json and back and use it to test for other outputs */
// serialize the classifier's state as a JSON string.
//var stateJson = {"categories":{"positive":true,"negative":true},"docCount":{"positive":2,"negative":1},"totalDocuments":3,"vocabulary":{"amazing":true,"awesome":true,"movie":true,"Yeah":true,"Oh":true,"boy":true,"":true,"Sweet":true,"this":true,"is":true,"incredibly":true,"perfect":true,"great":true,"terrible":true,"shitty":true,"thing":true,"Damn":true,"Sucks":true},"vocabularySize":18,"wordCount":{"positive":15,"negative":6},"wordFrequencyCount":{"positive":{"amazing":2,"awesome":1,"movie":1,"Yeah":1,"Oh":1,"boy":1,"":2,"Sweet":1,"this":1,"is":1,"incredibly":1,"perfect":1,"great":1},"negative":{"terrible":1,"shitty":1,"thing":1,"Damn":1,"Sucks":1,"":1}},"options":{}}

// load the classifier back from its JSON representation.
//var revivedClassifier = bayes.fromJson(stateJson)

//console.log(revivedClassifier.categorize('awesome, cool, amazing!! Yay.'))

/* till here */
