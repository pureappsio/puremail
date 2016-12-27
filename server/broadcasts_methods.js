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
        var subscribers = Subscribers.find({ listId: listId }).fetch();

        // Filter
        var filteredCustomers = [];

        for (i = 0; i < subscribers.length; i++) {

            currentSubscriber = subscribers[i];
            addSubscriberArray = [];

            for (f = 0; f < filters.length; f++) {

                criteria = filters[f].criteria;
                option = filters[f].option;

                if (criteria == 'subscribed') {

                    addSubscriberArray[f] = false;

                    if (currentSubscriber.listId == option) {
                        addSubscriberArray[f] = true;
                    }

                }

                if (criteria == 'notsubscribed') {

                    addSubscriberArray[f] = true;

                    if (currentSubscriber.listId == option) {
                        addSubscriberArray[f] = false;
                    }

                }

                if (criteria == 'opened') {

                    addSubscriberArray[f] = false;

                    if (currentSubscriber.opened >= option) {
                        addSubscriberArray[f] = true;
                    }

                }

                if (criteria == 'clicked') {

                    addSubscriberArray[f] = false;

                    if (currentSubscriber.clicked >= option) {
                        addSubscriberArray[f] = true;
                    }

                }

                if (criteria == 'coming') {

                    addSubscriberArray[f] = false;

                    if (currentSubscriber.origin == option) {
                        addSubscriberArray[f] = true;
                    }

                }

                if (criteria == 'notcoming') {

                    addSubscriberArray[f] = true;

                    if (currentSubscriber.origin == option) {
                        addSubscriberArray[f] = false;
                    }

                }

                if (criteria == 'bought') {

                    addSubscriberArray[f] = false;

                    if (currentSubscriber.nb_products >= option) {
                        addSubscriberArray[f] = true;
                    }

                }

                if (criteria == 'boughtless') {

                    addSubscriberArray[f] = false;

                    if (currentSubscriber.nb_products <= option || !currentSubscriber.nb_products) {
                        addSubscriberArray[f] = true;
                    }

                }

                if (criteria == 'boughtproduct') {

                    addSubscriberArray[f] = false;

                    if (currentSubscriber.products) {
                        for (j = 0; j < currentSubscriber.products.length; j++) {
                            if (currentSubscriber.products[j] == option) {
                                addSubscriberArray[f] = true;
                            }
                        }
                    }
                }

                if (criteria == 'notboughtproduct') {

                    addSubscriberArray[f] = true;

                    if (currentSubscriber.products) {
                        for (j = 0; j < currentSubscriber.products.length; j++) {
                            if (currentSubscriber.products[j] == option) {
                                addSubscriberArray[f] = false;
                            }
                        }
                    }
                }

                if (criteria == 'are') {

                    addSubscriberArray[f] = false;

                    if (option == 'customers' && currentSubscriber.nb_products >= 1) {
                        addSubscriberArray[f] = true;
                    }

                    if (option == 'notcustomers') {
                        if (currentSubscriber.nb_products == 0 || !currentSubscriber.nb_products) {
                            addSubscriberArray[f] = true
                        }
                    }

                    if (option == 'sequence' && currentSubscriber.sequenceId != null) {
                        addSubscriberArray[f] = true;
                    }

                    if (option == 'notsequence') {
                        if (currentSubscriber.sequenceId == null || !currentSubscriber.sequenceId) {
                            addSubscriberArray[f] = true
                        }
                    }

                }

                if (criteria == 'interested') {

                    addSubscriberArray[f] = false;
                    if (currentSubscriber.tags) {
                        for (j = 0; j < currentSubscriber.tags.length; j++) {
                            if (currentSubscriber.tags[j] == option) {
                                addSubscriberArray[f] = true;
                            }
                        }
                    }

                }

                if (criteria == 'plan') {

                    addSubscriberArray[f] = false;

                    if (option == 'yes') {

                        if (currentSubscriber.plan) {
                            addSubscriberArray[f] = true;
                        } else {
                            addSubscriberArray[f] = false;
                        }

                    }
                    if (option == 'no') {

                        if (currentSubscriber.plan) {
                            addSubscriberArray[f] = false;
                        } else {
                            addSubscriberArray[f] = true;
                        }

                    }

                }

            }

            addSubscriber = true;
            for (c = 0; c < addSubscriberArray.length; c++) {
                addSubscriber = addSubscriber * addSubscriberArray[c];
            }

            if (addSubscriber) {
                filteredCustomers.push(currentSubscriber);
            }

        }

        return filteredCustomers;

    }

});
