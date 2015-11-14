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
	console.log("getGallery(", page, ", ", JSON.stringify(settings), ")");
	
	var url = ENDPOINT_GALLERY;
	url += "/" + settings.section + "/" + settings.sort + "/" + settings.window + "/" + page + "/?showViral=" + settings.showViral;
	console.log("getGallery: " + url);
	sendJSONRequest(url, model, onSuccess);
}

function sendJSONRequest(url, model, onSuccess) {
	console.log("sendJSONRequest, ", url);
	
	var xhr = new XMLHttpRequest();
	xhr.responseType = 'json';
	xhr.onreadystatechange = function () {
		try {
			if (xhr.readyState === 4) {
				if (xhr.status == 200) {
					// console.log("ok");
					handleGalleryJSON(xhr.responseText, model);
					// console.log("model.length=", model.length);
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