var resourceloader;

var javascriptFiles;
var apiFiles;
var options;

App.onLaunch = function(opt) {
	console.log('App.onLaunch, ', JSON.stringify(opt));
	
	options = opt;
	javascriptFiles = [
		`${options.BASEURL}js/resourceloader.js`,
		`${options.BASEURL}js/presenter.js`
	];
	apiFiles = [
		`${options.BASEURL}js/imgur.js`
	];
	
	var mainGalleryItems = [];
	// section hot | top | user
	// sort	viral | top | time | rising (only available with user section)
	// window Change the date range of the request if the section is "top", day | week | month | year | all
	var settings = {
		section: "hot"
//		, sort: "time"
//		, window: "day"
//		, showViral: "true"
	}
	
	evaluateScripts(apiFiles, function(success) {
		console.log("evaluateScripts, imgur.js");
		
		if(success) {
			console.log("getGallery, mainGalleryItems");
			getGallery(mainGalleryItems, 0, settings, function(status) {
				var content = "";
				 mainGalleryItems.forEach(function(element, index, array) {
					// console.log(index, element);					
					content += `<lockup imgurId="${element.id}" album="${element.is_album}"><img src="${element.link}" width="320" height="320" /></lockup>`;
				});
					   
				createMainGallery(content);
			});
		} else {
			// Handle the error
			var errorDoc = createAlert("Evaluate Scripts Error", "Error attempting to evaluate external JavaScript files.");
			navigationDocument.presentModal(errorDoc);
		}
	});
}

function createMainGallery(content) {
	evaluateScripts(javascriptFiles, function(success) {
		console.log("evaluateScripts, " + javascriptFiles);
		if(success) {
			resourceLoader = new ResourceLoader(options.BASEURL);
			resourceLoader.loadResource(`${options.BASEURL}templates/main.xml.js`, function(resource) {
					var doc = Presenter.makeDocument(resource);
					doc.addEventListener("select", Presenter.load.bind(Presenter));
					Presenter.pushDocument(doc);
			}, content);
		} else {
			// Handle the error
			var errorDoc = createAlert("Evaluate Scripts Error", "Error attempting to evaluate external JavaScript files.");
			navigationDocument.presentModal(errorDoc);
		}
	});
}


// alertTemplate used here is one of the 18, and its main purpose is to display important information, such as a message telling the user to perform an action before continuing.
var createAlert = function(title, description) {
    var alertString = `<?xml version="1.0" encoding="UTF-8" ?>
    <document>
        <alertTemplate>
            <title>${title}</title>
            <description>${description}</description>
        </alertTemplate>
    </document>`
    var parser = new DOMParser();
    var alertDoc = parser.parseFromString(alertString, "application/xml");
    return alertDoc
}

/*
// If getting alerttemplate from server
App.onLaunch = function(options) {
    var templateURL = 'http://localhost:9001/main.tvml';
    getDocument(templateURL);
}
 
function getDocument(url) {
    var templateXHR = new XMLHttpRequest();
    templateXHR.responseType = "document";
    templateXHR.addEventListener("load", function() {pushDoc(templateXHR.responseXML);}, false);
    templateXHR.open("GET", url, true);
    templateXHR.send();
    return templateXHR;
}

function pushDoc(document) {
    navigationDocument.pushDocument(document);
}
*/

App.onExit = function() {
    console.log('App finished');
}