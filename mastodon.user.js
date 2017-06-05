// ==UserScript==
// @name         YouTube on Mastodon timeline
// @namespace    https://github.com/asymme/
// @version      0.2.4
// @description  You can watch youtube videos on Mastodon's timeline
// @author       Asymme
// @match        https://
// @grant        none
// ==/UserScript==

(function() {
    'use strict';
    var rule = [
        '.yt-thumbnail { width: 100%; height: auto; }',
        '.yt-overlay { width: 100%; height: 120%; position: fixed; top: 0; left: 0; background-color: rgba(0, 0, 0, 0.7); z-index: 10; }'
    ];

    var style = document.createElement('style');
    style.type = 'text/css';
    document.querySelector('head').appendChild(style);
    style.sheet.insertRule(rule[0], 0);
    style.sheet.insertRule(rule[1], 1);

    var mo = new MutationObserver(function(mutations) {
        mutations.forEach(function(mutation) {
            if(mutation.type !== 'childList') { return; }

            mutation.addedNodes.forEach(function(node) {
                if(node.querySelectorAll) { addThumbnail(node); }
            });
        });
    });
    mo.observe(document, {
        'childList': true,
        'subtree': true
    });

    function addThumbnail(node) {
        var statuses = node.querySelectorAll('.status__content > p > a');
        for(var i = 0, len = statuses.length; i < len; i++) {
            var matches = statuses[i].href.match(/https:\/\/(www|m)?\.?youtu\.?be(\.com)?\/(watch\?.*v=)?([-\w]+)/);
            if(matches) {
                var statusContent = statuses[i].parentNode.parentNode;
                if(statusContent.parentNode.querySelector('.status-card-video')) { continue; }

                var img = document.createElement('img');
                img.className = 'yt-thumbnail';
                img.src = 'https://img.youtube.com/vi/' + matches[4] + '/hqdefault.jpg';
                img.width = '480';
                img.height = '360';
                img.addEventListener('mousedown', createOverlay(matches[4]), false);
                statusContent.appendChild(img);
            }
        }
    }

    function createOverlay(vid) {
        return function(e) {
            e.preventDefault();
            e.stopPropagation();

            var div = document.createElement('div');
            div.className = 'yt-overlay';
            div.addEventListener('mousedown', removeOverlay(div), false);

            var cWidth = document.documentElement.clientWidth;
            var cHeight = document.documentElement.clientHeight;
            var vWidth = (cWidth * 8 / 10) | 0;
            var vHeight = (vWidth * 9 / 16) | 0;
            var vMarginLeft = ((cWidth / 2) - (vWidth / 2)) | 0;
            var vMarginTop = ((cHeight / 2) - (vHeight / 2)) | 0;

            var iframe = document.createElement('iframe');
            iframe.src = 'https://www.youtube.com/embed/' + vid + '?autoplay=1';
            iframe.width = '' + vWidth + 'px';
            iframe.height = '' + vHeight + 'px';
            iframe.frameBorder = '0';
            iframe.allowFullscreen = 'allowfullscreen';
            iframe.style.marginLeft = '' + vMarginLeft + 'px';
            iframe.style.marginTop = '' + vMarginTop + 'px';

            div.appendChild(iframe);
            document.body.appendChild(div);
        };
    }

    function removeOverlay(elem) {
        return function(e) {
            e.preventDefault();
            e.stopPropagation();
            elem.parentNode.removeChild(elem);
        };
    }
})();