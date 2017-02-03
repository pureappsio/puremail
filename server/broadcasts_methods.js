// Import SendGrid
import sendgridModule from 'sendgrid';
const sendgrid = require('sendgrid')(Meteor.settings.sendGridAPIKey);

Meteor.methods({

    sendBroadcast: function(scheduled) {

        console.log('Sending brodcast');

        // Get list
        var list = Lists.findOne(scheduled.listId);

        // Get recipients
        allRecipients = Meteor.call('filterSubscribers', scheduled.listId, scheduled.filters);

        // Get host
        host = Meteor.absoluteUrl();

        // Add unsubscribe data
        if (list.language) {
            if (list.language == 'en') {
                var unsubscribeText = "Unsubscribe";
            }
            if (list.language == 'fr') {
                var unsubscribeText = "Se désinscrire";
            }
        } else {
            var unsubscribeText = "Unsubscribe";
        }
        scheduled.text += "<p><a style='color: gray;' href='" + host + "unsubscribe?s=-subscriberId-'>" + unsubscribeText + "</a></p>";

        // Split for API
        var apiLimit = 500;
        if (allRecipients.length < apiLimit) {
            var splitRecipients = [allRecipients];
        } else {
            var splitRecipients = [];
            var recipientsGroups = Math.ceil(allRecipients.length / apiLimit);
            for (g = 0; g < recipientsGroups; g++) {
                splitRecipients[g] = allRecipients.slice(g * apiLimit, apiLimit * (g + 1));
            }

        }

        for (s = 0; s < splitRecipients.length; s++) {

            recipients = splitRecipients[s];
            console.log('Sending for ' + recipients.length);

            // Mail object
            var helper = sendgridModule.mail;
            mail = new helper.Mail()

            // Get emails
            var emails = [];
            for (r = 0; r < recipients.length; r++) {

                if (recipients[r].email != "") {

                    personalization = new helper.Personalization();

                    email = new helper.Email(recipients[r].email);
                    personalization.addTo(email);

                    custom_arg = new helper.CustomArgs("subscriberId", recipients[r]._id);
                    personalization.addCustomArg(custom_arg);

                    substitution = new helper.Substitution("-subscriberId-", recipients[r]._id);
                    personalization.addSubstitution(substitution);

                    mail.addPersonalization(personalization);

                }

            }

            // Common
            email = new helper.Email(list.brandEmail, list.userName);
            mail.setFrom(email);
            mail.setSubject(scheduled.subject);
            content = new helper.Content("text/html", scheduled.text);
            mail.addContent(content)

            if (scheduled.broadcastId) {
                custom_arg = new helper.CustomArgs("broadcastId", scheduled.broadcastId);
                mail.addCustomArg(custom_arg);
            }

            // Send
            var requestBody = mail.toJSON()
                // console.log(requestBody.personalizations[0]);
            var request = sendgrid.emptyRequest()
            request.method = 'POST'
            request.path = '/v3/mail/send'
            request.body = requestBody

            if (Meteor.settings.mode != 'demo') {
                sendgrid.API(request, function(err, response) {
                    if (response.statusCode != 202) {
                        console.log('Successfuly sent broadcast');
                    }
                });
            }

        }

        // Remove
        Scheduled.remove(scheduled._id);

    },
    getBroadcastStats: function(broadcastId, event) {

        // Get broadcast
        var broadcast = Broadcasts.findOne(broadcastId);

        // Get stats
        var stat = Stats.find({ broadcastId: broadcastId, event: event }).fetch().length;
        if (stat != 0) {
            return ((stat / broadcast.recipients) * 100).toFixed(2);
        } else {
            return 0;
        }

    },
    sendEmails: function(broadcastId) {

        var startTime = new Date();

        // Get broadcast
        broadcast = Broadcasts.findOne(broadcastId);

        // Get list
        list = Lists.findOne(broadcast.listId);
        from = list.userName + ' <' + list.brandEmail + '>';

        console.log('Sending broadcast email from: ' + from);

        // Make entry
        entry = {

            name: list.userName,
            ownerId: Meteor.user()._id,
            listId: broadcast.listId,
            date: broadcast.time,
            from: list.userName + ' <' + list.brandEmail + '>',
            subject: broadcast.subject,
            filters: broadcast.filters,
            text: broadcast.text,
            type: 'broadcast',
            broadcastId: broadcastId,
            recipients: broadcast.recipients
        };
        Scheduled.insert(entry);

    },
    saveBroadcast: function(broadcast) {

        // Get number of recipients
        var recipients = Meteor.call('filterSubscribers', broadcast.listId, broadcast.filters);
        broadcast.recipients = recipients.length;
        console.log(broadcast);

        // Insert
        var broadcastId = Broadcasts.insert(broadcast);
        return broadcastId;

    },
    deleteBroadcast: function(broadcastId) {

        // Delete
        Broadcasts.remove(broadcastId);

    },
    getNumberFilteredSubscribers: function(listId, filters) {

        var filteredSubscribers = Meteor.call('filterSubscribers', listId, filters);
        return filteredSubscribers.length;

    },
    filterSubscribers: function(listId, filters) {

        // Get all subscribers
        var subscribers = Subscribers.find().fetch();

        // Filter
        var filteredCustomers = [];

        // Pre-load data
        for (c in filters) {

            if (filters[c].criteria == 'boughtproduct' || filters[c].criteria == 'notboughtproduct') {

                filters[c].data = Meteor.call('getCustomersProduct', filters[c].option, listId);

            }

            if (filters[c].option == 'customers' || filters[c].option == 'notcustomers') {

                filters[c].data = Meteor.call('getCustomersEmails', listId);
            }

        }

        // Filter with query
        var query = { listId: listId };

        for (f = 0; f < filters.length; f++) {

            criteria = filters[f].criteria;
            option = filters[f].option;

            if (criteria == 'opened') {

                query.opened = {$gte: option};

            }

            if (criteria == 'clicked') {

               query.clicked = {$gte: option};

            }

            if (criteria == 'coming') {

                query.origin = option;

            }

            if (criteria == 'notcoming') {

                query.origin = { $ne: option };

            }

            if (criteria == 'boughtproduct') {

                query.email = { $in: filters[f].data };

            }

            if (criteria == 'notboughtproduct') {

                query.email = { $nin: filters[f].data };
            }

            if (criteria == 'are') {


                if (option == 'sequence') {

                    query.sequenceId = { $ne: null };

                }

                if (option == 'notsequence') {

                    query.sequenceId = null;

                }

                if (option == 'customers') {

                    query.email = { $in: filters[f].data };

                }

                if (option == 'notcustomers') {

                    query.email = { $nin: filters[f].data };

                }

            }

            if (criteria == 'interested') {

                query.tags = option;

            }

            if (criteria == 'plan') {

                if (option == 'yes') {

                    query.option = { $exists: true };

                }
                if (option == 'no') {

                    query.option = { $exists: true };

                }

            }
        }

        var subscribers = Subscribers.find(query).fetch();

        return subscribers;

        //         if (criteria == 'bought') {

        //             addSubscriberArray[f] = false;

        //             var nb_products = Meteor.call('getNumberPurchases', currentSubscriber);

        //             if (nb_products >= option) {
        //                 addSubscriberArray[f] = true;
        //             }

        //         }

        //         if (criteria == 'boughtless') {

        //             addSubscriberArray[f] = false;

        //             var nb_products = Meteor.call('getNumberPurchases', currentSubscriber);

        //             if (nb_products <= option) {
        //                 addSubscriberArray[f] = true;
        //             }

        //         }


    }

});
