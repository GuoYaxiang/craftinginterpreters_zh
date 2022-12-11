const footnotes = function (hook) {
    hook.beforeEach(function (content) {
        if (/\[\^([A-Za-z0-9]+)\][^:]/.test(content)) {
            content = content
                .replace(/\[\^([0-9]+)\](?!\:)/gm, '<sup class="fn-symbol" id="fn-$1">[\[$1]\](#fnref-$1)</sup>')                 //  /\[\^([0-9]+)\][^:]/gm
                .replace(/\[\^([0-9]+)\](?=\:)/gm, '\n<strong class="fn-ref-symbol" id="fnref-$1">[\[$1\]](#fn-$1) </strong> ')   //  /\[\^([0-9]+)\]\: /gm
        }
        return content;
    })
}

if ($docsify) {
    $docsify.plugins = [footnotes, ...($docsify.plugins || [])]
}