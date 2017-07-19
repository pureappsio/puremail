Template.signup.events({

    'click #signup': function() {

        var data = {
            email: $('#email').val(),
            password: $('#password').val(),
            role: 'appuser'
        }

        Meteor.call('signupUser', data, function(err, data) {
            Meteor.loginWithPassword($('#email').val(), $('#password').val(), function(err, data) {
                Router.go('/');
            });
        });

    }

});
