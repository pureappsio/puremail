Meteor.methods({

    addSocialNetwork: function(network) {

        console.log(network);
        Networks.insert(network);

    },
    deleteSocialNetwork: function(networkId) {

        Networks.remove(networkId);

    },
    deleteUser(userId) {

        Meteor.users.remove(userId);

    },
    updateSubscribers: function() {

        Subscribers.update({ origin: 'blog' }, { $set: { origin: 'organic' } }, { multi: true });
        Subscribers.update({ origin: 'landing' }, { $set: { origin: 'ads' } }, { multi: true });

    },
    createUsers: function() {

        // Create admin user
        var adminUser = {
            email: Meteor.settings.adminUser.email,
            password: Meteor.settings.adminUser.password,
            role: 'admin'
        }
        Meteor.call('createUserAccount', adminUser);

    },
    signupUser: function(data) {

        if (Meteor.settings.disableSignup) {
            console.log('User signup blocked');
        } else {
            Meteor.call('createUserAccount', data);
        }

    },
    createUserAccount: function(data) {

        console.log(data);

        // Check if exist
        if (Meteor.users.findOne({ "emails.0.address": data.email })) {

            console.log('Updating existing user');
            var userId = Meteor.users.findOne({ "emails.0.address": data.email })._id;
            Meteor.users.update(userId, { $set: { role: data.role } });

        } else {

            console.log('Creating new user');

            // Create
            var userId = Accounts.createUser({
                email: data.email,
                password: data.password
            });

            // Assign role 
            Meteor.users.update(userId, { $set: { role: data.role } });

        }

        return userId;

    },

    generateEmails: function() {

        var listId = 'zrQfvpiEn9RHMK5SK';
        var number = 10000;

        // Create broadcast
        var broadcast = {
            subject: 'Some email',
            otherSubject: 'Some email other',
            text: '<p>Some email<br></p>',
            listId: listId,
            time: new Date(),
            filters: [],
            resent: false,
            recipients: number,
            ownerId: Meteor.user()._id
        }

        var broadcastId = Broadcasts.insert(broadcast);

        console.log('Broadcast added');

        for (i = 0; i < number; i++) {

            // Subscriber
            var subscriber = {
                email: Math.random().toString(36).slice(-5) + '.' + Math.random().toString(36).slice(-5) + '@gmail.com',
                listId: listId,
                ownerId: Meteor.user()._id,
                origin: 'blog',
                last_updated: new Date(),
                date_added: new Date()
            }

            var subscriberId = Subscribers.insert(subscriber);

            if (i < number) {

                // Insert delivered
                var stat = {
                    event: 'delivered',
                    subscriberId: subscriberId,
                    broadcastId: broadcastId,
                    ownerId: Meteor.user()._id,
                    date: new Date()
                }
                Stats.insert(stat);
            }


            // Insert opened for half
            if (i < number / 10) {
                var stat = {
                    event: 'opened',
                    subscriberId: subscriberId,
                    broadcastId: broadcastId,
                    ownerId: Meteor.user()._id,
                    date: new Date()
                }
                Stats.insert(stat);
            }

            console.log('Added subscriber ' + i);

        }

    }

});
