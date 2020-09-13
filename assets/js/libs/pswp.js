
class initPhotoSwipeFromDomClass{
    constructor(selector,showCaption = false){
        this.selector = selector;
        this.showCaption = showCaption;
    }
    parseThumbnailElements(el){
        let thumbElements = el.childNodes,
            numNodes = thumbElements.length,
            items = [],
            figureEl,
            linkEl,
            size,
            item;

        for(let i = 0; i < numNodes; i++) {

            figureEl = thumbElements[i]; // <figure> element

            // include only element nodes
            if(figureEl.nodeType !== 1) {
                continue;
            }

            linkEl = figureEl.children[0]; // <a> element

            size = linkEl.getAttribute('data-size').split('x');

            // create slide object
            item = {
                src: linkEl.getAttribute('href'),
                w: parseInt(size[0], 10),
                h: parseInt(size[1], 10)
            };



            if(figureEl.children.length > 1) {
                // <figcaption> content
                item.title = figureEl.children[1].innerHTML;
            }

            if(linkEl.children.length > 0) {
                // <img> thumbnail element, retrieving thumbnail url
                item.msrc = linkEl.children[0].getAttribute('src');
            }

            item.el = figureEl; // save link to element for getThumbBoundsFn
            items.push(item);
        }

        return items;
    }
    static closest(el, fn) {
        return el && ( fn(el) ? el : initPhotoSwipeFromDomClass.closest(el.parentNode, fn) );
    }
    onThumbnailsClick(e,_self){
        e = e || window.event;
        e.preventDefault ? e.preventDefault() : e.returnValue = false;

        let eTarget = e.target || e.srcElement;

        // find root element of slide
        let clickedListItem = initPhotoSwipeFromDomClass.closest(eTarget, function(el) {
            return (el.tagName && el.tagName.toUpperCase() === 'FIGURE');
        });

        if(!clickedListItem) {
            return;
        }

        // find index of clicked item by looping through all child nodes
        // alternatively, you may define index via data- attribute
        let clickedGallery = clickedListItem.parentNode,
            childNodes = clickedListItem.parentNode.childNodes,
            numChildNodes = childNodes.length,
            nodeIndex = 0,
            index;

        for (let i = 0; i < numChildNodes; i++) {
            if(childNodes[i].nodeType !== 1) {
                continue;
            }

            if(childNodes[i] === clickedListItem) {
                index = nodeIndex;
                break;
            }
            nodeIndex++;
        }



        if(index >= 0) {
            // open PhotoSwipe if valid index found
            _self.openPhotoSwipe( index, clickedGallery );
        }
        return false;
    }
    photoswipeParseHash(){
        let hash = window.location.hash.substring(1),
            params = {};

        if(hash.length < 5) {
            return params;
        }

        let vars = hash.split('&');
        for (let i = 0; i < vars.length; i++) {
            if(!vars[i]) {
                continue;
            }
            let pair = vars[i].split('=');
            if(pair.length < 2) {
                continue;
            }
            params[pair[0]] = pair[1];
        }

        if(params.gid) {
            params.gid = parseInt(params.gid, 10);
        }
        return params;
    }
    openPhotoSwipe(index, galleryElement, disableAnimation, fromURL) {
        let pswpElement = document.querySelectorAll('.pswp')[0],
            gallery,
            options,
            items;

        items = this.parseThumbnailElements(galleryElement);

        // define options (if needed)
        options = {

            // define gallery index (for URL)
            galleryUID: galleryElement.getAttribute('data-pswp-uid'),
            shareButtons: [
                {id:'facebook', label:'Поделиться на Facebook', url:'https://www.facebook.com/sharer/sharer.php?u={{url}}'},
                {id:'twitter', label:'Твитнуть', url:'https://twitter.com/intent/tweet?text={{text}}&url={{url}}'},
            ],
            captionEl:this.showCaption,
            shareEl:false,
            getThumbBoundsFn: function(index) {
                // See Options -> getThumbBoundsFn section of documentation for more info
                let thumbnail = items[index].el.getElementsByTagName('img')[0], // find thumbnail
                    pageYScroll = window.pageYOffset || document.documentElement.scrollTop,
                    rect = thumbnail.getBoundingClientRect();

                return {x:rect.left, y:rect.top + pageYScroll, w:rect.width};
            }

        };

        // PhotoSwipe opened from URL
        if(fromURL) {
            if(options.galleryPIDs) {
                // parse real index when custom PIDs are used
                // http://photoswipe.com/documentation/faq.html#custom-pid-in-url
                for(let j = 0; j < items.length; j++) {
                    if(items[j].pid == index) {
                        options.index = j;
                        break;
                    }
                }
            } else {
                // in URL indexes start from 1
                options.index = parseInt(index, 10) - 1;
            }
        } else {
            options.index = parseInt(index, 10);
        }

        // exit if index not found
        if( isNaN(options.index) ) {
            return;
        }

        if(disableAnimation) {
            options.showAnimationDuration = 0;
        }

        // Pass data to PhotoSwipe and initialize it
        gallery = new PhotoSwipe( pswpElement, PhotoSwipeUI_Default, items, options);
        gallery.init();
    }
    init(){
        let _self = this;
        // loop through all gallery elements and bind events
        let galleryElements = document.querySelectorAll( this.selector );
        for(let i = 0, l = galleryElements.length; i < l; i++) {
            galleryElements[i].setAttribute('data-pswp-uid', i+1);
            galleryElements[i].onclick = function(e){
                _self.onThumbnailsClick(e,_self);
            }
        }

        // Parse URL and open gallery if it contains #&pid=3&gid=1
        let hashData = this.photoswipeParseHash();
        if(hashData.pid && hashData.gid) {
            this.openPhotoSwipe( hashData.pid ,  galleryElements[ hashData.gid - 1 ], true, true );
        }
    }
    openGallery(index){
        let galleryElements = document.querySelectorAll( this.selector );
        this.openPhotoSwipe( index ,  galleryElements[ 0 ], false, true );

    }
}