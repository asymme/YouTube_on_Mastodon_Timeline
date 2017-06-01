// ==UserScript==
// @name         YouTube on Mastodon timeline
// @namespace    https://github.com/asymme/
// @version      0.2.2
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
                img.src = 'http://img.youtube.com/vi/' + matches[4] + '/hqdefault.jpg';
                img.width = '480';
                img.height = '360';
                img.addEventListener('mousedown', createOverlay(matches[4], statusContent), false);
                statusContent.appendChild(img);
            }
        }
    }

    function createOverlay(vid, parent_node) {
        return function(e) {
            e.preventDefault();
            e.stopPropagation();

            var div = document.createElement('div');
            div.className = 'yt-overlay';
            div.addEventListener('mousedown', removeOverlay(div), false);

            var iframe = document.createElement('iframe');
            iframe.src = 'https://www.youtube.com/embed/' + vid + '?autoplay=1';
            iframe.width = '480';
            iframe.height = '270';
            iframe.frameBorder = '0';
            iframe.allowFullscreen = 'allowfullscreen';
            iframe.style.marginLeft = '' + ((document.documentElement.clientWidth / 2) - 240) + 'px';
            iframe.style.marginTop = '' + ((document.documentElement.clientHeight / 2) - 135) + 'px';

            div.appendChild(iframe);
            parent_node.appendChild(div);
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