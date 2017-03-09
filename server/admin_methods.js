Meteor.methods({

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
