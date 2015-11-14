// ENDPOINTS
var BASEURL = "https://api.imgur.com/3";
// https://api.imgur.com/3/gallery/{section}/{sort}/{page}?showViral=bool
var ENDPOINT_GALLERY = BASEURL + "/gallery";

var OAUTH_CONSUMER_KEY = "";
var OAUTH_CONSUMER_SECRET = ""

var ENDPOINT_GALLERY_ALBUM = ENDPOINT_GALLERY + "/album";
var ENDPOINT_GALLERY_IMAGE = ENDPOINT_GALLERY + "/image"
var ENDPOINT_ALBUM = BASEURL + "/album/";
var ENDPOINT_IMAGE = BASEURL + "/image/";

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

// get gallery album
function getGalleryAlbum(id, model, albumModel, onSuccess) {
	console.log("getGalleryAlbum(id=", id);
	
    var url = ENDPOINT_GALLERY_ALBUM;
    url += "/" + id;

    var xhr = new XMLHttpRequest();
    xhr.open("GET", url, true);
    xhr.onreadystatechange = function () {
        if (xhr.readyState === 4) {
            if (xhr.status == 200) {
                handleGalleryAlbumJSON(xhr.responseText, model, albumModel);
                onSuccess(xhr.status);
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
    }

	xhr.setRequestHeader("Authorization", "Client-ID " + OAUTH_CONSUMER_KEY);
    xhr.send();
}

// get gallery image
function getGalleryImage(id, model, albumModel, onSuccess) {
	console.log("getGalleryImage(id=",id,")");

    var url = ENDPOINT_GALLERY_IMAGE;
    url += "/" + id;
	console.log("url=",url);

    var xhr = new XMLHttpRequest();
    xhr.open("GET", url, true);
    xhr.onreadystatechange = function () {
        if (xhr.readyState === 4) {
            if (xhr.status == 200) {
                handleGalleryImageJSON(xhr.responseText, model, albumModel);
                onSuccess(xhr.status);
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
    }
	
	xhr.setRequestHeader("Authorization", "Client-ID " + OAUTH_CONSUMER_KEY);
    xhr.send();
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
//	console.log("handleGalleryJSON(response=", response);
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

/*
  Parse JSON for Image and fill albumModel.
  https://api.imgur.com/models/gallery_image
*/
function handleGalleryImageJSON(response, model, albumModel) {
//	console.log("handleGalleryImageJSON(response=", response);
    var jsonObject = JSON.parse(response);

    fillAlbumImagesModel(jsonObject.data, model);
    fillAlbumVariables(jsonObject.data, albumModel);
}

function fillAlbumImagesModel(output, model) {
    var title = setVariable(output.title);
    var description = setVariable(output.description);
    var link;
    var link_original;

    if (output.link) {
        console.log("link=" + output.link);
        link = IMGUR_IMG_URL;
        link_original = output.link;
        if (parseInt(output.width) > 640) {
            // if image isn't gif then get the smaller one
            var ext = getExt(output.link);
            if (ext === "gif" || ext === "GIF") {
                link = output.link;
            } else {
                link += output.id+"l."+ext; // l=640x640 aspec
            }
        } else {
            link = output.link;
        }

    }

    var imageData = {
        id: output.id,
        title: title,
        description: replaceURLWithHTMLLinks(description),
        datetime: (output.datetime) ? formatEpochDatetime(output.datetime) : "",
        animated: output.animated,
        type: output.type,
        vWidth: output.width,
        vHeight: output.height,
        size: (output.size) ? humanFileSize(output.size) : "",
        views: output.views,
        bandwidth: (output.bandwidth) ? humanFileSize(output.bandwidth) : "",
        link: link,
        link_original: link_original,
        ups: (output.ups) ? output.ups : 0,
        downs: (output.downs) ? output.downs : 0,
        section: (output.section) ? output.section : "",
        nsfw: (output.nsfw) ? output.nsfw : false,
        gifv: (output.gifv) ? output.gifv : "",
        mp4: (output.mp4) ? output.mp4 : "",
        webm: (output.webm) ? output.webm : "",
        looping: (output.looping) ? output.looping : false
    };

    model.push(imageData);
}

function fillAlbumVariables(output, model) {
    model.title = setVariable(output.title);
    model.description = setVariable(output.description);
    model.datetime = (output.datetime) ? formatEpochDatetime(output.datetime) : "";
    model.link = setVariable(output.link);
    model.account_url = setVariable(output.account_url);
    model.views = output.views;
    model.deletehash = setVariable(output.deletehash);

    model.ups = (output.ups) ? output.ups : 0;
    model.downs = (output.downs) ? output.downs : 0;
    model.score = (output.score) ? output.score : 0;

    model.vote = setVariable(output.vote);
    model.favorite = (output.favorite) ? output.favorite : false;
    model.images_count = (output.images_count) ? output.images_count : 0;
    model.is_album = (output.is_album) ? output.is_album : false;
    if (output.is_album) {
        model.gallery_page_link = "http://imgur.com/a/" + output.id;
    } else {
        model.gallery_page_link = "http://imgur.com/" + output.id;
    }

    var total = 0;
    if (model.ups && model.downs) {
        total = parseInt(model.ups) + parseInt(model.downs);
        model.upsPercent = Math.floor(100 * (model.ups/total));
        model.downsPercent = Math.ceil(100 * (model.downs/total));
    } else {
        model.upsPercent = 0;
        model.downsPercent = 0;
    }


    model.info = "";
    if (model.account_url !== "") {
        model.info += "by " + model.account_url + " at ";
    }
    model.info += model.datetime + ". " + model.views + " views";

    //console.log("score=" + score + "; total=" + total + "; ups=" + ups + "; downs=" + downs + " upsPercent=" + upsPercent + "; downsPercent="  + downsPercent);
}

/**
  Parse image extension from string.
*/
function getExt(resource) {
    var ext = resource.substr(resource.lastIndexOf('.') + 1);
    return ext;
}

/**
  Replace all URLs (http://example.com) with href links (<a href="http://example.com">http://example.com</a>).
*/
function replaceURLWithHTMLLinks(text) {
    if (text) {
        var exp = /(\b(https?):\/\/[-A-Z0-9+&@#\/%?=~_|!:,.;]*[-A-Z0-9+&@#\/%=~_|])/ig;
        return text.replace(exp,"<a href='$1'>$1</a>");
    }
    return text;
}

function formatEpochDatetime(epoch) {
    var date = new Date(epoch * 1000);
    return date.getHours() + ":" +
            date.getMinutes() + ":" +
            date.getSeconds() + ", " +
            date.getFullYear() + "-" + (date.getMonth() + 1) + "-" + date.getDate();
}

function setVariable(value) {
    return (value) ? value : "";
}

function humanFileSize(bytes) {
    var si = false;
    var thresh = si ? 1000 : 1024;
    if(bytes < thresh) return bytes + ' B';
    var units = si ? ['kB','MB','GB','TB','PB','EB','ZB','YB'] : ['KiB','MiB','GiB','TiB','PiB','EiB','ZiB','YiB'];
    var u = -1;
    do {
        bytes /= thresh;
        ++u;
    } while(bytes >= thresh);
    return bytes.toFixed(1)+' '+units[u];
}