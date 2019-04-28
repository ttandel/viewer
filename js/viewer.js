const electron = require('electron');
const path = require('path');
const fs = require('fs');
const mime = require('mime/lite');
const sharp = require('sharp');

function createVideoThumbnail(filePath) {
    var canvas = document.createElement('canvas');
    var video = document.createElement('video');
    video.src = filePath;
    var context = canvas.getContext('2d');
    var img = document.createElement('img');

    video.addEventListener('loadeddata', function () {
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        context.drawImage(video, 0, 0, video.videoWidth, video.videoHeight);
        var dataURI = canvas.toDataURL('image/jpeg');
        img.src = dataURI;
    });
    return img;
}


module.exports = class Viewer {
    constructor(dirPath) {
        this.dirPath = dirPath;
        this.mediaElementsList = document.querySelector('#media-list');
        this.currentMedia = {
            image: document.querySelector('#view-image'),
            video: document.querySelector('#view-video'),
            currentIndex: 0
        }
        this.currentFilePath = "";
        this.filePaths = [];
    }

    createMediaElement(filePath, index) {
        if (mime.getType(filePath).startsWith('image')) {
            var img = document.createElement('img');
            img.id = "index" + index;
            // TODO: replace hard coded width, height with variable
            sharp(filePath).resize({
                width: 256,
                height: 256,
                fit: sharp.fit.contain,
                background: { r: 255, g: 255, b: 255, alpha: 1 }
            }).jpeg().toBuffer(function (err, buf, info) {
                img.src = "data:image/jpeg;base64,".concat(buf.toString('base64'));
            })
            img.addEventListener('click', () => {
                this.viewImage(filePath, index);
            });
            return img;
        } else {
            var vid_thumb = createVideoThumbnail(filePath);
            vid_thumb.id = "index" + index;

            vid_thumb.addEventListener('click', () => {
                this.viewVideo(filePath, index);
            });
            return vid_thumb;
        }

    }

    static isMedia(filePath) {
        var fileType = mime.getType(filePath); // getType returns null if type not recognized
        return fileType && (fileType.startsWith('image') || fileType.startsWith('video')); // fileType returns true if it's not null

    }

    init() {
        var filesList = fs.readdirSync(this.dirPath);
        var index = 0;
        
        // remove all child elements
        // not doing this results in previous folders' images/videos still viewable in same session
        // TODO: find a better solution for opening another folder in same sesssion;
        //          reloading index.html has some other problems
        while (this.mediaElementsList.firstChild) {
            this.mediaElementsList.removeChild(this.mediaElementsList.firstChild);
        }

        // get file paths and create thumbnails (img elements)
        filesList.forEach(file => {
            var fileType = mime.getType(file);
            if (Viewer.isMedia(file)) {
                var filePath = path.join(this.dirPath, file);
                this.filePaths.push(filePath);
                this.mediaElementsList.appendChild(this.createMediaElement(filePath, index));
                index++;
            }
        });

        // show the first image/video
        if (mime.getType(this.filePaths[0]).startsWith('image')) {
            this.viewImage(this.filePaths[0], 0);
        }
        else if (mime.getType(this.filePaths[0]).startsWith('video')) {
            this.viewVideo(this.filePaths[0], 0);
        }

        // TODO: find a better solution for opening another folder in same sesssion;
        this.clearStatus();
        
        this.initStatus();
        
    }

    initStatus() {
        // max file count
        document.getElementById('max-index').appendChild(document.createTextNode(" / " + this.filePaths.length));
        document.getElementById('file-path').appendChild(document.createTextNode(this.currentFilePath));

        var indexInput = document.getElementById('goto-index');
        indexInput.max = this.filePaths.length;

        document.getElementById("goto-form").onsubmit = (ev) => {
            ev.preventDefault();

            var index = ev.target[0].value - 1; // zero-based indexing...
            
            this.goToIndexMedia(index);
            
            document.getElementById("index" + index).scrollIntoView(true);
        }
    }

    clearStatus() {
        var filePathElement = document.getElementById('file-path');
        while (filePathElement.firstChild) {
            filePathElement.removeChild(filePathElement.firstChild);
        }

        var filePathElement = document.getElementById('max-index');
        while (filePathElement.firstChild) {
            filePathElement.removeChild(filePathElement.firstChild);
        }

    }

    updateStatusFilePath() {
        var filePathElement = document.getElementById('file-path');
        while (filePathElement.firstChild) {
            filePathElement.removeChild(filePathElement.firstChild);
        }
        filePathElement.appendChild(document.createTextNode(this.currentFilePath));

    }

    goToIndexMedia(index) {
        var filePath = this.filePaths[index];
        if (mime.getType(filePath).startsWith('image')) {
            this.viewImage(filePath, index);
        }
        else if (mime.getType(filePath).startsWith('video')) {
            this.viewVideo(filePath, index);
        }
    }

    viewImage(filePath, index) {
        document.getElementById("index" + this.currentMedia.currentIndex).classList.remove('selected');

        this.currentFilePath = filePath;
        this.currentMedia.image.src = filePath;
        this.currentMedia.video.style.display = "none";
        this.currentMedia.image.style.display = "block";

        document.getElementById("index" + index).classList.add('selected');
        this.currentMedia.currentIndex = index;
        this.updateStatusFilePath();
    }

    viewVideo(filePath, index) {
        document.getElementById("index" + this.currentMedia.currentIndex).classList.remove('selected');
        this.currentMedia.video.pause();
    
        this.currentMedia.image.style.display = "none";
        this.currentMedia.video.style.display = "block";

        this.currentFilePath = filePath;

        var vid_source = document.getElementById("vid-source");
        vid_source.src = filePath;
        vid_source.type = mime.getType(filePath);

        document.getElementById("index" + index).classList.add('selected');
        this.currentMedia.currentIndex = index;

        this.currentMedia.video.load();
        this.updateStatusFilePath();
    }
}
