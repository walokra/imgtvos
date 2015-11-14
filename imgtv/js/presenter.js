var Presenter = {
	makeDocument: function(resource) {
		if (!Presenter.parser) {
			Presenter.parser = new DOMParser();
		}
		var doc = Presenter.parser.parseFromString(resource, "application/xml");
	return doc;
	},

	modalDialogPresenter: function(xml) {
		navigationDocument.presentModal(xml);
	},
 
	pushDocument: function(xml) {
		navigationDocument.pushDocument(xml);
	},

	load: function(event) {
		var self = this,
		ele = event.target
		imgurId = ele.getAttribute("imgurId")
		isAlbum = ele.getAttribute("album")
		console.log("imgurId=", imgurId, ", album=", isAlbum);
		
		var model= [];
		var albumModel= {};
		
		if(imgurId) {
			if (isAlbum == true) {
				//getGalleryAlbum(imgur_id);
				console.log("Not yet implemented");
			} else {
//				console.log("getGalleryImage");
				getGalleryImage(imgurId, model, albumModel, function(status) {
//					console.log("model=",JSON.stringify(model));
					var imgDoc = createImage(model[0], albumModel);
					navigationDocument.presentModal(imgDoc);
				});
			}
//			var player = new Player();
//			var playlist = new Playlist();
//			var mediaItem = new MediaItem("video", videoURL);
//			
//			player.playlist = playlist;
//			player.playlist.push(mediaItem);
//			player.present();
		}
	}
}

var createImage = function(model, albumModel) {
	console.log("link=",model.link_original, ", width=", model.vWidth, ", height=", model.vHeight);
    var imgString = `<?xml version="1.0" encoding="UTF-8" ?>
    <document>
        <alertTemplate>
            <title>${model.title}</title>
			<img src="${model.link_original}" width="${model.vWidth}" height="${model.vHeight}" />
        </alertTemplate>
    </document>`
    var parser = new DOMParser();
    var imgDoc = parser.parseFromString(imgString, "application/xml");
    return imgDoc
}