Meteor.methods({

    getSequences: function(listId) {

        return Sequences.find({ listId: listId }).fetch();

    },
    moveNextEmail: function(subscriberId) {

        // Get subscriber
        var subscriber = Subscribers.findOne(subscriberId);

        // Find next scheduled email
        var email = Scheduled.findOne({ to: subscriber.email, listId: subscriber.listId });

        // Update
        Scheduled.update(email._id, { $set: { date: new Date() } });

    },
    saveSequence: function(sequence) {

        // Save
        Sequences.insert(sequence);

    },
    updateSequence: function(sequence) {

        // Save
        console.log(sequence);
        Sequences.update(sequence._id, { $set: sequence });

    },
    deleteSequence: function(id) {

        // Remove all automation rules
        Automations.remove({ sequenceId: id });

        // Remove sequence
        Sequences.remove(id);

    },
    assignSequenceManual: function(subscriberId, sequenceId) {

        if (sequenceId != 'none') {

            // Assign to sequence
            Subscribers.update(subscriberId, { $set: { sequenceId: sequenceId } });

            // Get first email of sequence
            var firstEmail = Automations.findOne({ sequenceId: sequenceId, order: 1 });

            // Set email
            Subscribers.update(subscriberId, { $set: { "sequenceEmail": firstEmail._id } });

            // Get subscriber
            var subscriber = Subscribers.findOne(subscriberId);
            var list = Lists.findOne(subscriber.listId);
            var user = Meteor.users.findOne(subscriber.ownerId);

            // Add email to scheduler
            Meteor.call('addAutomationEmail', firstEmail, subscriber, list, user);

        } else {

            Subscribers.update(subscriberId, { $set: { sequenceId: null } });
            Subscribers.update(subscriberId, { $set: { sequenceEmail: null } });

        }

    },
    assignSequence: function(filters, sequenceId) {

        var startTime = new Date();

        // Get sequence
        var sequence = Sequences.findOne(sequenceId);
        var list = Lists.findOne(sequence.listId);

        // Get subscribers
        recipients = Meteor.call('filterSubscribers', sequence.listId, filters);

        // Get email
        var firstEmail = Automations.findOne({ sequenceId: sequence._id, order: 1 });

        // Calculate date
        var currentDate = new Date();
        currentDate = currentDate.getTime();

        if (firstEmail.period == 'minutes') {
            currentDate += firstEmail.time * 1000 * 60;
        }
        if (firstEmail.period == 'hours') {
            currentDate += firstEmail.time * 1000 * 60 * 60;
        }
        if (firstEmail.period == 'days') {
            currentDate += firstEmail.time * 1000 * 60 * 60 * 24;
        }
        var entryDate = new Date(currentDate);

        // Assign sequence
        var entries = [];
        for (i = 0; i < recipients.length; i++) {

            // Create entry for scheduler
            var entry = {
                name: list.userName,
                ownerId: Meteor.user()._id,
                listId: list._id,
                date: entryDate,
                from: list.userName + ' <' + list.brandEmail + '>',
                subject: firstEmail.emailSubject,
                text: firstEmail.emailText,
                ruleId: firstEmail._id,
                sequenceId: firstEmail.sequenceId,
                sequenceEmail: firstEmail.order
            }
            entry.to = recipients[i].email;

            // Add to array
            entries.push(entry);

            // Update subscriber
            Subscribers.update(recipients[i]._id, { $set: { "sequenceEmail": firstEmail._id, "sequenceId": sequence._id } });

        }

        // Push array in Scheduled
        // Scheduled.batchInsert(entries);
        var endTime = new Date();
        console.log('Time to assign sequence to subscribers: ' + (endTime.getTime() - startTime.getTime()) + ' ms');

    }

});
