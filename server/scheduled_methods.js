Meteor.methods({

    sendScheduled: function() {

        // Grab next scheduled messages
        var scheduled = Scheduled.findOne({}, { sort: { date: 1 } });

        if (scheduled) {

            // console.log('Scheduled message: ')
            // console.log(scheduled);

            var currentDate = new Date();
            currentDate = currentDate.getTime();
            scheduledDate = (scheduled.date).getTime();

            var user = Meteor.users.findOne(scheduled.ownerId);

            // console.log('User: ')
            // console.log(user);

            // Add style to text
            scheduled.text = '<div style="font-size: 16px;">' + scheduled.text + '</div>';

            if ((currentDate - scheduledDate) > 0) {

            	// console.log('Sending scheduled message')

                if (scheduled.type == 'simple') {

                    Meteor.call('sendSimpleEmail', scheduled);

                } else if (scheduled.type == 'broadcast') {

                    // Send broacast
                    Meteor.call('sendBroadcast', scheduled);

                } else {

                    // Send automation email
                    Meteor.call('sendAutomationEmail', scheduled);

                }

            }


        }

    },

});
