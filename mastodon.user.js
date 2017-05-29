// ==UserScript==
// @name         YouTube on Mastodon timeline
// @namespace    https://github.com/asymme/
// @version      0.2.1
// @description  You can watch youtube videos on Mastodon's timeline
// @author       Asymme
// @match        https://
// @grant        none
// ==/UserScript==

(function() {
    'use strict';
    var mo = new MutationObserver(function(mutations) {
        mutations.forEach(function(mutation) {
            if(mutation.type !== 'childList') { return; }

            for(var i = 0; i < mutation.addedNodes.length; i++) {
                var node = mutation.addedNodes[i];
                if(node.querySelectorAll) { embedYouTube(node); }
            }
        });
    });
    mo.observe(document, {
        'childList': true,
        'subtree': true
    });

    function embedYouTube(node) {
        var statuses = node.querySelectorAll('.status__content > p > a');
        for(var i = 0; i < statuses.length; i++) {
            var matches = statuses[i].href.match(/https:\/\/(www|m)?\.?youtu\.?be(\.com)?\/(watch\?.*v=)?([-\w]+)/);
            if(matches) {
                var statusContent = statuses[i].parentNode.parentNode;
                if(alreadyEmbedded(statusContent.parentNode.childNodes)) { continue; }

                var iframe = document.createElement('iframe');
                iframe.src = 'https://www.youtube.com/embed/' + matches[4] + '?feature=oembed';
                iframe.width = '480';
                iframe.height = '270';
                iframe.frameBorder = '0';
                iframe.style.width = '100%';
                iframe.style.height = 'auto';
                statusContent.appendChild(iframe);
            }
        }
    }

    function alreadyEmbedded(nodes) {
        var flag = false;
        for(var i = 0; i < nodes.length; i++) {
            if(nodes[i].className === 'status-card-video') {
                flag = true;
                break;
            }
        }
        return flag;
    }
})();