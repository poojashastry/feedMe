define([
    'dojo',
    'dojo/_base/declare',
    'dojo/request/xhr',
    'dojo/dom',
    'dojo/dom-construct',
    'dojo/query',
    "dojo/on",
    "dojo/ready"
], function(dojo, declare, xhr, dom, domConstruct, query, on, ready) {
    return {
        init: function(){
            this.fetchFeeds();
        },

        addFeeds : function() {
            console.log("add feeds is running!");
            xhr("/saveFeeds", {
                handleAs: "text",
                method: "POST",
                data: {feeds: dom.byId("urls").value}
            }).then(function(data){
                var help = require("app/_appHelpers");
                help.fetchFeeds();
            }, function(err){
                
            }, function(evt){
                // Handle a progress event from the request if the
                // browser supports XHR2
            });
        },

        fetchFeeds : function() {
            domConstruct.empty("content");
            domConstruct.empty("feeds");

            xhr("/getFeeds", {
                handleAs: "json"
            })
            .then(function(data){
                if(data.dbFeeds.feeds.length == 0) {
                    var noFeedAlert = dom.byId("no-feeds");
                    console.log(noFeedAlert);
                    console.log("hi");
                    if(noFeedAlert === null) {
                        var alert = domConstruct.create("div", { 
                            id:"no-feeds",
                            class:"alert alert-info",
                            role:"alert", 
                            innerHTML:data.message, 
                            style:"text-align:center"
                        });
                        var location = dom.byId("page-content-wrapper");

                        domConstruct.place(alert,location,"first");
                    }
                }
                window.srcCount = data.dbFeeds.feeds.length;
                window.result = [];
                window.pivot = 0;
                window.sources = 0;
                google.load("feeds", "1", { 
                    obj: this, 
                    "callback" : function() {
                        var _appHelpers = require("app/_appHelpers");
                        for(var i in data.dbFeeds.feeds) {
                            var noFeeds = dom.byId("no-feeds");
                            if(noFeeds != null) {
                                domConstruct.destroy("no-feeds");
                            }
                            console.log(data.dbFeeds.feeds[i]);
                            console.log(i);
                            var feed = new google.feeds.Feed(data.dbFeeds.feeds[i]);
                            feed.setNumEntries(500);
                            feed.includeHistoricalEntries();
                            feed.load(function(result) {
                                window.sources++;
                                if (!result.error) {
                                    console.log(result);
                                    var deleteFeedButton = domConstruct.create("div",{class:"deleteFeed",rssLink:result.feed.feedUrl});
                                    var wrapperButton = domConstruct.create("button", {class:"btn btn-xs btn-danger"});
                                    var deleteButton = domConstruct.create("span",{class:"glyphicon glyphicon-minus-sign"});
                                    var myFeeds = query("#feeds")[0];
                                    console.log(myFeeds);
                                    var sideBar = query(".sidebar-nav")[0];
                                    var listItem = domConstruct.create("li",{innerHTML:result.feed.title});
                                    domConstruct.place(deleteButton,wrapperButton,"first");
                                    domConstruct.place(wrapperButton,deleteFeedButton,"last");
                                    domConstruct.place(deleteFeedButton,listItem,"first");
                                    domConstruct.place(listItem,myFeeds,"last");
                                    var flag = 1;
                                    window.result = window.result.concat(result.feed.entries);
                                    _appHelpers.shuffle(window.result);
                                    _appHelpers.renderFeeds(this);
                                }
                            });     
                        }
                    }
                });
            }, 
            function(err){
                // Handle the error condition
                console.log(err);
             }, 
            function(evt){
               // Handle a progress event from the request if the
               // browser supports XHR2
            });
        },

        showMore: function(){
            this.renderFeeds();
        },

        renderFeeds: function(flag) {
            var container = document.getElementById("feed");
            if (window.sources < window.srcCount) {
                return;
            }
            for (var i = window.pivot; i < window.pivot+10 ; i++) {
                var entry = window.result[i];
                var imgSrc = entry.content;
                var title = entry.title;
                var snippit= entry.contentSnippet;
                var author = entry.author;
                var date = new Date(entry.publishedDate);
                var categories = entry.categories
                var link = entry.link;
          
                var fakeDiv = domConstruct.create("div",{innerHTML:imgSrc});
                var image = fakeDiv.getElementsByTagName("img");
                var paragraph = fakeDiv.getElementsByTagName("p");
                var wrapperDiv = domConstruct.create("div",{class:"paragraphs", dataLink: link});
                var rowDiv = domConstruct.create("div",{class:"row"});
                var spanDiv = domConstruct.create("div",{class:"span4"});
                var contentDiv = domConstruct.create("div",{class:"clearfix content-heading"});
                var title = domConstruct.create("h3",{innerHTML:title});
                var authName = domConstruct.create("small",{innerHTML:author+" "});
                var date = domConstruct.create("small",{innerHTML:date.toDateString() +" "+date.toLocaleTimeString()});
                var snippet = domConstruct.create("p",{innerHTML:snippit});
                domConstruct.place(image[0],contentDiv,"first");
                domConstruct.place(title,contentDiv,"last");
                domConstruct.place(authName,title,"after");
                domConstruct.place(date,authName,"after");
                domConstruct.place(snippet,date,"after");
                domConstruct.place(contentDiv,spanDiv,"last");
                domConstruct.place(spanDiv,rowDiv,"last");
                domConstruct.place(rowDiv,wrapperDiv,"last");
                var container = dom.byId("content");

                on(wrapperDiv, "click", function(e){
                    var help = require("app/_appHelpers");
                    help.filterProp(e, "datalink", help.openInNewTab);
                });
                domConstruct.place(wrapperDiv,container,"last");
            }

            on(query(".deleteFeed"), "click", function(evt){
                var help = require("app/_appHelpers");
                help.filterProp(evt, "rsslink", help.deleteFeed);
            });
            window.pivot = window.pivot + 10;
        },

        shuffle: function(arr){
            arr.sort(function(a,b){
                // Turn your strings into dates, and then subtract them
                // to get a value that is either negative, positive, or zero.
                return new Date(b.publishedDate) - new Date(a.publishedDate);
            });
        },

        filterProp: function(e, className, doSomething) {
            var div = e.path.filter(function(item) {
                for(var attr in item.attributes) {
                    if(typeof item.attributes[attr] === "object" && item.attributes[attr].hasOwnProperty) {
                        if(item.attributes.hasOwnProperty(className)) {
                            return true;
                        }
                    } 
                }
                return false;
            });
            var list = div[0].attributes;
            for(var i in list) {
                if(list[i].name == className) {
                    doSomething(list[i].nodeValue);
                }
            }
        },

        openInNewTab: function(ele) {
            var win = window.open(ele, '_blank');
            win.focus();
        },

        deleteFeed: function(ele) {
            xhr("/deleteFeed", {
                handleAs: "text",
                data: { url:ele },
                method: "POST"
            }).then(function(data){
                var help = require("app/_appHelpers");
                help.fetchFeeds();
            }, function(err){
                // Handle the error condition
                console.log(err);
            }, function(evt){
                // Handle a progress event from the request if the
                // browser supports XHR2
            });
        }
    }
});