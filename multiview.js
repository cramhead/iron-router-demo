Posts = new Meteor.Collection("posts");

Router.configure({
    layout: 'layout',
    loadingTemplate: 'loading',
    notFoundTemplate: 'notFound'
});

Router.map(function() {
    this.route("posts", {
        template: 'posts',
        path: '/',
        waitOn: function() {
            return App.subs.posts;
        },
        data: {
            posts: function() {
                return Posts.find({}, {
                    sort: {
                        order: 1
                    }
                });
            }
        }
    });

    this.route('postShow', {
        path: '/posts/:_id'
    });
});

if (Meteor.isClient) {
    App = {
        subs: {
            posts: Meteor.subscribe('posts')
        }
    };

    PostShowController = RouteController.extend({
        template: 'postShow',
        before: function() {
            var _id = this.params._id;

            if (App.subs.post) {
                App.subs.post.stop();
            }
            App.subs.post = Meteor.subscribe('post', _id);
        },
        waitOn: function() {
            return App.subs.post;
        },
        data: function() {
            return Posts.findOne({
                _id: this.params._id
            });
        },
        run: function() {
            this.render('postShow');
            this.render({
                postShowSidebar: {
                    to: 'sidebar',
                    waitOn: null
                }
            });
        }
    });
}

if (Meteor.isServer) {
    Meteor.startup(function() {
        if (Posts.find().count() === 0) {
            for (var i = 100 - 1; i >= 0; i--) {
                Posts.insert({
                    title: "Post " + i,
                    body: "The post value",
                    order: i
                });
            }
        }
    });

    Meteor.publish("posts", function() {
        return Posts.find({}, {
            sort: {
                order: 1
            }
        });
    });

    Meteor.publish('post', function(id) {
        return Posts.findOne({
            _id: id
        });
    });
}