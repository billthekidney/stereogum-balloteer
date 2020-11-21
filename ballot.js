var commentListRoot = null;

var loadMoreCommentsTimeout = null;
const loadMoreCommentsDelay = 5 * 1000;
var loadedMoreComments = false;
var numCommentsLoaded = 0;
const commentsLoadedThreshold = 20;

function loadMoreComments() {
    loadMoreCommentsTimeout = null;
    let button = document.getElementById("load-more-comments");
    if (button) {
	loadedMoreComments = true;
	button.click();
    } 
}

function fixCommentVoting() {
    let comment_scores = commentListRoot.querySelectorAll("div.comment-info-and-votes > span.date ~ a.up.vote-for-comment ~ a.down.vote-for-comment ~ span.comment-score")
    if (comment_scores == null || comment_scores.length == 0) {
	// This will be nil if something changed but we don't care about any of those changes.

	// Hit the load-more-comments button at most once every loadMoreCommentsDelay seconds
	//Don't need this for first load-more (... && numCommentsLoaded >= commentsLoadedThreshold)
	// If the button is present there are more comments to load.
	if (!loadedMoreComments) {
	    if (loadMoreCommentsTimeout) {
		clearTimeout(loadMoreCommentsTimeout);
	    }
	    loadMoreCommentsTimeout = setTimeout(loadMoreComments, loadMoreCommentsDelay);
	}
	return;
    }

    [].slice.call(comment_scores).forEach(function (commentScore) {
	let downVote = commentScore.previousSibling;
	if (downVote.nodeName != "A" || !downVote.classList.contains("down", "vote-for-comment")) {
	    return;
	}
	let comment = commentScore.parentElement;
	let oldCountSpan = comment.removeChild(commentScore);
	comment.insertBefore(oldCountSpan, downVote);
	numCommentsLoaded += 1;
    });
}

var commentObserver;

function comments_changed_callback(mutations) {
    try {
	fixCommentVoting();
    }catch(ex) {
	console.log("stereogum-balloteer: error in fixCommentVoting: " + ex);
	console.table(ex);
    }
}

var selectors = ["div#content",
		 "div.article__content",
		 "div.article-comments",
		 "div#comments",
		 "ol.commentlist-ice.noavas"];
var selector_first_index = 0;
var current_selector_node = document;
var selector_last_index = selectors.length - 1;

function lookForLowestNode() {
    var i;
    for (i = selector_last_index; i >= selector_first_index; i -= 1) {
	var node = current_selector_node.querySelector(selectors[i]);
	if (node) {
	    if (commentObserver) {
		commentObserver.disconnect();
	    }
	    if (i == selector_last_index) {
		commentListRoot = node;
		commentObserver = new MutationObserver(comments_changed_callback);
		commentObserver.observe(commentListRoot, {subtree: true, childList: true});
	    } else {
		selector_first_index = i;
		current_selector_node = node;
		commentObserver = new MutationObserver(children_changed_callback);
		commentObserver.observe(node, {childList: true});
	    }
	    return;
	}
    }
}
		

function safeLookForLowestNode() {
    try {
	lookForLowestNode();
    } catch(ex) {
	console.log("stereogum-balloteer: error in lookForLowestNode: " + ex);
	console.table(ex);
    }
}

function children_changed_callback(mutations) {
    safeLookForLowestNode();
}


function findArticleDiv() {
    var node = document.querySelector("div.article");
    if (!node) {
	return;
    }
    safeLookForLowestNode();
}

try {
    findArticleDiv();
} catch(ex) {
    console.log("stereogum-balloteer: error in findCommentList: " + ex);
    console.table(ex);
}
