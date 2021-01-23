var DocxReader = function(){ 
    // Var
    this.url = "";
    this.error = null;
    this.zipContent = null;
    this.file = {
		contentAsString : null,
        contentAsXml : null
    };
    this.docxtemplater = null;
    this.name = "output.docx";
	
    // Methods

    this.Load = function(url, loaded){
        this.url = url;
        var splitUrl = this.url.split('/');
        this.name = splitUrl[splitUrl.length - 1];

		var docThis = this;

        JSZipUtils.getBinaryContent(this.url, function(error,content){
            if(error){
                docThis.error = error;
                console.log(docThis.error, "!!!")
                return;
            }

            docThis.zipContent = new JSZip(content);

            var documentxml = docThis.zipContent.file("word/document.xml");
            var strDocumentxml = documentxml.asText();

            docThis.file.contentAsString = strDocumentxml;
            docThis.file.contentAsXml = $(strDocumentxml);
            docThis.docxtemplater = new Docxtemplater();
            docThis.docxtemplater.loadZip(docThis.zipContent);

            loaded();
        });
    };

	this.Search = function(txt){
        var lowerCaseTxt = txt.toLowerCase();
        var innerDocument = this.file.contentAsXml.find('w\\:body').text().toLowerCase();
        if(innerDocument.indexOf(lowerCaseTxt) != -1){
            return true;
        }

        return false;

    };

    this.Replace = function(oldtxt, newtxt){
        var oldContent = this.file.contentAsString;
        var newContent = oldContent.replace(new RegExp(oldtxt,'g'), newtxt);
        this.zipContent.file("word/document.xml", newContent);

        // Update object
        this.docxtemplater.loadZip(this.zipContent);
        this.file.contentAsString = newContent;
        this.file.contentAsXml = $(newContent);
    };

    this.ReplaceVariable = function(variables){
        this.docxtemplater = setData(variables);
        this.docxtemplater.render();

        // Update object
        this.zipContent = this.docxtemplater.getZip();
        var documentxml = this.zipContent.file("word/document.xml");
        var strDocumentxml = documentxml.asText();
        this.file.contentAsString = strDocumentxml;
        this.file.contentAsXml = $(strDocumentxml);

    };

    this.SetName = function(name){
        this.name = name + ".docx";
    };

    this.Download = function(){
        var out = this.docxtemplater.getZip().generate({
            type:"blob",
            mimeType: "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
        })

        return {
            out: out,
            name: this.name,
        }
    };

    this.UploadToSharePoint = function(clientContext, jsomListObject, onSucceed, onFailed){
        var base64 = this.zipContent.generate();
		var listRootFolder = jsomListObject.get_rootFolder();
		clientContext.load(listRootFolder);
		clientContext.executeQueryAsync(Function.createDelegate(this, function(){
			 var fileName = listRootFolder.get_serverRelativeUrl() + '/' + this.name;

			//Create FileCreationInformation object using the read file data  
			var createInfo = new SP.FileCreationInformation(); 
			createInfo.set_content(base64); 
			createInfo.set_url(fileName); 

			//Add the file to the library  
			var uploadedDocument = jsomListObject.get_rootFolder().get_files().add(createInfo);

			//Load client context and execcute the batch  
			clientContext.load(uploadedDocument); 
			clientContext.executeQueryAsync(Function.createDelegate(this, onSucceed), Function.createDelegate(this, onFailed));
		}), Function.createDelegate(this, onFailed));

    };
}