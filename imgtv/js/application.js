var resourceloader;

App.onLaunch = function(options) {
//	console.log('App.onLaunch, ', JSON.stringify(options));
	
	var javascriptFiles = [
		`${options.BASEURL}js/resourceloader.js`,
		`${options.BASEURL}js/presenter.js`
	];
	
	var mainGalleryItems = []
	// section hot | top | user
	// sort	viral | top | time | rising (only available with user section)
	// window Change the date range of the request if the section is "top", day | week | month | year | all
	var settings = {
		section: "hot",
//		sort: "time",
//		window: "day",
//		showViral: "true"
	}
	getGallery(mainGalleryItems, 0, settings, function(status) {
		var content = "";
	     mainGalleryItems.forEach(function(element, index, array) {
//				console.log(index, element);
				content += `<lockup><img src="${element.link}" width="320" height="320" /></lockup>`;
		});
			   
	   evaluateScripts(javascriptFiles, function(success) {
		   if(success) {
			   resourceLoader = new ResourceLoader(options.BASEURL);
			   resourceLoader.loadResource(`${options.BASEURL}templates/main.xml.js`, function(resource) {
				   var doc = Presenter.makeDocument(resource);
				   //doc.addEventListener("select", Presenter.load.bind(Presenter));
				   Presenter.pushDocument(doc);
				   }, content);
			   } else {
			   // Handle the error
			   var errorDoc = createAlert("Evaluate Scripts Error", "Error attempting to evaluate external JavaScript files.");
			   navigationDocument.presentModal(errorDoc);
			   }
		   });
	});
}

// ENDPOINTS
var BASEURL = "https://api.imgur.com/3";
// https://api.imgur.com/3/gallery/{section}/{sort}/{page}?showViral=bool
var ENDPOINT_GALLERY = BASEURL + "/gallery";

var OAUTH_CONSUMER_KEY = "";
var OAUTH_CONSUMER_SECRET = ""

var IMGUR_IMG_URL = "http://i.imgur.com/";

/*
 Gallery
 Returns the images in the gallery. For example the main gallery is https://api.imgur.com/3/gallery/hot/viral/0.json
 
 https://api.imgur.com/3/gallery/{section}/{sort}/{window}/{page}?showViral=bool
*/
function getGallery(model, page, settings, onSuccess) {
	var url = ENDPOINT_GALLERY;
	url += "/" + settings.section + "/" + settings.sort + "/" + settings.window + "/" + page + "/?showViral=" + settings.showViral;
	console.log("getGallery: " + url);
	sendJSONRequest(url, model, onSuccess);
}

function sendJSONRequest(url, model, onSuccess) {
//	console.log("sendJSONRequest, ", url);
	var xhr = new XMLHttpRequest();
	xhr.responseType = 'json';
	xhr.onreadystatechange = function () {
		try {
		if (xhr.readyState === 4) {
			if (xhr.status == 200) {
//				console.log("ok");
				handleGalleryJSON(xhr.responseText, model);
//				console.log("model.length=", model.length);
				return onSuccess(xhr.status);
			} else {
				console.log("error: " + xhr.status+"; "+ xhr.responseText);
				try {
					var jsonObject = JSON.parse(xhr.responseText);
					console.log(xhr.status, xhr.statusText + ": " + jsonObject.data.error);
				} catch (err) {
					console.log("Error getting data from imgur: " + err );
				}
			}
		}
		} catch (err) {
			xhr.abort();
			console.log("Error making request to: " + url + " error: " + err);
		}
	}
	
	xhr.open("GET", url, true);

	xhr.setRequestHeader("Authorization", "Client-ID " + OAUTH_CONSUMER_KEY);
	xhr.send();

	return xhr;
}

/*
 Parse JSON for main Gallery (main, search, random) and fill galleryModel.
 */
function handleGalleryJSON(response, model) {
//	console.log("handleGalleryJSON");
	var showNsfw = false;
	
	var jsonObject = JSON.parse(response);
	
	for (var i in jsonObject.data) {
		var output = jsonObject.data[i];
		var ext = 'jpg';
		var link = IMGUR_IMG_URL;
		var linkLarge = output.link;
		var id = "";
		
		if (output.is_album === false) {
			id = output.id;
		} else {
			id = output.cover;
		}
		
		link += id+"m."+ext; // s=90x90, b=160x160, t=160x160 (aspect), m=320x320, l=640x640
		
		var title = "";
		if (output.title) {
			title = output.title;
		}
		var vote = "";
		if (output.vote) {
			vote = output.vote;
		}
		
		if (output.nsfw !== true || showNsfw === true) {
			model.push({
						 id: output.id,
						 title: title,
						 link: link,
						 is_album: output.is_album,
						 vote: vote
			});
		}
	}
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