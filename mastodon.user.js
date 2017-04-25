// ==UserScript==
// @name         YouTube on Mastodon timeline
// @namespace    https://github.com/asymme/
// @version      0.1
// @description  You can watch youtube videos on Mastodon's timeline
// @author       Asymme
// @match        https://
// @grant        none
// ==/UserScript==

(function() {
    'use strict';
    function loop() {
        var contentList = $('.status__content');
        var width = contentList.width();
        var height = parseInt(width * 9 / 16);
        contentList.each(function(outIdx, outElem) {
            var content = $(outElem);
            var a = content.find('a');
            if(a.length === 0 || content.find('.ytVideo').length > 0) {
                return true;
            }
            a.each(function(inIdx, inElem) {
                var matches = $(inElem).attr('href').match(/https:\/\/(www|m)?\.?youtu\.?be(\.com)?\/(watch\?.*v=)?([-\w]+)/);
                if(matches === null) {
                    return true;
                }
                content.append( $('<iframe>').attr({
                    'src': 'https://www.youtube.com/embed/' + matches[4],
                    'width': width,
                    'height': height,
                    'frameborder': '0',
                    'class': 'ytVideo'
                }) );
            });
        });
        setTimeout(loop, 5000);
    }
    loop();
})();