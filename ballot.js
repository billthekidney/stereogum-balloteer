var commentListRoot = null;

function fixCommentVoting() {
    let comment_scores = commentListRoot.querySelectorAll("div.comment-info-and-votes > span.date ~ a.up.vote-for-comment ~ a.down.vote-for-comment ~ span.comment-score")
    if (comment_scores == null || comment_scores.length == 0) {
	// This will be nil if something changed but we don't care about any of those changes.
	//console.log("stereogum-balloteer: comment_scores not found");
	return;
    }

    i = 0;
    [].slice.call(comment_scores).forEach(function (commentScore) {
	let downVote = commentScore.previousSibling;
	if (downVote.nodeName != "A" || !downVote.classList.contains("down", "vote-for-comment")) {
	    //console.log("QQQ: balloteer: comment " + i + ": a.down not to left of " + commentScore.nodeName + "." + commentScore.classList);
	    i += 1;
	    return;
	}
	let comment = commentScore.parentElement;
	let oldCountSpan = comment.removeChild(commentScore);
	comment.insertBefore(oldCountSpan, downVote);
	i += 1;
    });
}

var getCommentListTry = 0;
var getCommentListLimit = 10;
var getCommentListTimeout = 3 * 1000;

var commentObserver;

function comments_changed_callback(mutations) {
    try {
	//let t1 = new Date();
	fixCommentVoting();
	//let t2 = new Date();
	//console.log("QQQ: balloteer: time to change " + mutations.length + " items: " + ((t2 - t1) / 1000) + " msecs");
    }catch(ex) {
	console.log("stereogum-balloteer: error in fixCommentVoting: " + ex);
	console.table(ex);
    }
}

function startTheObserver() {
    //TODO: Consider verifying that
    // $body.classList matches "page--post-template" although the class-name might be longer,
    // like page--post-template-default
    commentListRoot = document.querySelector("ol.commentlist-ice.noavas");
    if (!commentListRoot) {
	getCommentListTry += 1;
	if (getCommentListTry > getCommentListLimit) {
	    // This happens for non-article items
	    //console.log("QQQ: stereogum-balloteer: can't find comment-list at ol.commentlist-ice.noavas")
	    return;
	}
	//console.log("QQQ: stereogum-balloteer: didn't get a comment-list at attempt " + getCommentListTry);
	setTimeout(startTheObserver, getCommentListTimeout);
	return;
    }
    try {
	commentObserver = new MutationObserver(comments_changed_callback);
	commentObserver.observe(commentListRoot, {subtree: true, childList: true});
    } catch(ex) {
	console.log("stereogum-balloteer: error trying to start the observer: " + ex);
	console.table(ex);
    }
}

try {
    startTheObserver();
} catch(ex) {
    console.log("stereogum-balloteer: error in the observer: " + ex);
    console.table(ex);
}
