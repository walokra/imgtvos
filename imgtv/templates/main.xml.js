var Template = function(content) {
	return `<?xml version="1.0" encoding="UTF-8" ?>
	<document>
		<stackTemplate>
		<banner>
			<title>imgtv</title>
		</banner>
		<collectionList>
			<grid>
				<section>
					${content}
				</section>
			</grid>
		</collectionList>
		</stackTemplate>
	</document>`
}