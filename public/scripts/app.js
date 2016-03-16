require([
	"app/_appHelpers",
	"dojo/on",
	"dojo/dom",
	"dojo/query",
	"dojo/domReady!",
], function(apphelper, on, dom, query){
	if(!document.cookie) {
		window.location = "/login";
		return;
	}
	apphelper.init();
	on(dom.byId("more"), "click", function(e) {
		apphelper.showMore();
	});
	on(dom.byId("submit-urls"), "click", function(e) {
		console.log("inside app helpers");
		e.preventDefault();
		apphelper.addFeeds();
	});
});