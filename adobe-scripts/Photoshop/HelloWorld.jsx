// Creates a new 2x2 inch document and brings it to the front.
var doc = app.documents.add(2, 2);
doc.artLayers.add();
alert("Created a new document in Photoshop!");
doc.close(SaveOptions.DONOTSAVECHANGES);
doc = null;