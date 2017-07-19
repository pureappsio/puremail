// Import SendGrid
import sendgridModule from 'sendgrid';
const sendgrid = require('sendgrid')(Meteor.settings.sendGridAPIKey);

var cheerio = Npm.require("cheerio");

Meteor.methods({

    reSendBroadcasts: function() {

        console.log('Re-sending broadcasts');

        // Get all broadcasts that are not sent
        var broadcasts = Broadcasts.find({ resent: false, otherSubject: { $exists: true } }).fetch();

        for (i in broadcasts) {

            // Check if it's time to send
            var now = new Date();
            var timeDifference = now.getTime() - (broadcasts[i].time).getTime();
            var delay = 3 * 24 * 60 * 60 * 1000;
            // var delay = 1000;

            if (timeDifference > delay) {

                var startTime = new Date();

                console.log('Re-sending broadcast ' + broadcasts[i].subject);

                // Get all people that didn't open
                var delivered = Stats.find({
                    broadcastId: broadcasts[i]._id,
                    event: 'delivered'
                }, { fields: { subscriberId: 1 } }).fetch();

                var opened = Stats.find({
                    broadcastId: broadcasts[i]._id,
                    event: 'opened'
                }, { fields: { subscriberId: 1 } }).fetch();

                delivered = delivered.map(function(item) {
                    return item.subscriberId;
                })
                opened = opened.map(function(item) {
                    return item.subscriberId;
                })

                console.log('Delivered: ' + delivered.length);
                console.log('Opened: ' + opened.length);

                // Send again
                filters = broadcasts[i].filters;
                filters.push({
                    criteria: 'resent',
                    option: {
                        delivered: delivered,
                        opened: opened
                    }
                });
                broadcasts[i].filters = filters;
                // console.log(broadcasts[i]);

                var list = Lists.findOne(broadcasts[i].listId);
                var recipients = Meteor.call('filterSubscribers', broadcasts[i].listId, broadcasts[i].filters);
                console.log('Recipients of second send: ' + recipients.length);

                var scheduled = {

                    name: list.userName,
                    ownerId: broadcasts[i].ownerId,
                    listId: broadcasts[i].listId,
                    date: new Date(),
                    from: list.userName + ' <' + list.brandEmail + '>',
                    subject: broadcasts[i].otherSubject,
                    filters: broadcasts[i].filters,
                    text: broadcasts[i].text,
                    type: 'broadcast',
                    broadcastId: broadcasts[i]._id,
                    recipients: recipients
                };

                var endTime = new Date();
                var diff = (endTime.getTime() - startTime.getTime()) / 1000;
                console.log('Compute time: ' + diff + ' s');

                // Send
                Meteor.call('sendBroadcast', scheduled);

                // Mark as sent again
                Broadcasts.update(broadcasts[i]._id, { $set: { resent: true } });

            }


        }

    },
    sendBroadcast: function(scheduled) {

        console.log('Sending broadcast');

        // Get list
        var list = Lists.findOne(scheduled.listId);

        // Get recipients
        allRecipients = Meteor.call('filterSubscribers', scheduled.listId, scheduled.filters);

        // Get host
        host = Meteor.absoluteUrl();

        if (scheduled.tagging == 'tagging') {

            // Add substitions if tagging is enabled
            $ = cheerio.load(scheduled.text);

            // Process links
            $('a').each(function(i, elem) {
                // Check if it's not the unsubscribe link
                if (($(elem)[0].attribs.href).indexOf('unsubscribe') == -1) {
                    $(elem)[0].attribs.href += '&subscriber=-subscriberId-';
                }
            });

            scheduled.text = $.html();

            console.log('Tagging done');

        }

        scheduled.text = Meteor.call('addEmailEnding', scheduled.text, list, 'broadcast');

        console.log(scheduled.text);

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
            recipients: broadcast.recipients,
            tagging: broadcast.tagging
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

            if (filters[c].criteria == 'notboughtsince') {

                // Get date
                var date = filters[c].option;
                var now = new Date();
                if (date == 'oneweek') {
                    var purchaseDate = new Date(now.getTime() - 7 * 24 * 3600 * 1000);
                }
                if (date == 'twoweeks') {
                    var purchaseDate = new Date(now.getTime() - 14 * 24 * 3600 * 1000);
                }
                if (date == 'onemonth') {
                    var purchaseDate = new Date(now.getTime() - 30.5 * 24 * 3600 * 1000);
                }

                filters[c].data = Meteor.call('getCustomersPurchaseDate', purchaseDate, listId);

            }

            if (filters[c].option == 'customers' || filters[c].option == 'notcustomers') {

                filters[c].data = Meteor.call('getCustomersEmails', listId);
            }

            if (filters[c].criteria == 'received' || filters[c].criteria == 'notreceived') {

                var stats = Stats.find({ event: 'delivered', broadcastId: filters[c].option }, { _id: 1 }).fetch();
                filters[c].data = stats.map(function(a) {
                    return a.subscriberId;
                });
            }

            if (filters[c].criteria == 'openedbroadcast' || filters[c].criteria == 'notopenedbroadcast') {

                var stats = Stats.find({ event: 'opened', broadcastId: filters[c].option }, { _id: 1 }).fetch();
                filters[c].data = stats.map(function(a) {
                    return a.subscriberId;
                });
            }

            if (filters[c].criteria == 'clickedbroadcast' || filters[c].criteria == 'notclickedbroadcast') {

                var stats = Stats.find({ event: 'clicked', broadcastId: filters[c].option }, { _id: 1 }).fetch();
                filters[c].data = stats.map(function(a) {
                    return a.subscriberId;
                });
            }

        }

        // Filter with query
        var query = { listId: listId };

        for (f = 0; f < filters.length; f++) {

            criteria = filters[f].criteria;
            option = filters[f].option;

            if (criteria == 'resent') {

                query._id = { $in: option.delivered, $nin: option.opened };

            }

            if (criteria == 'opened') {

                query.opened = { $gte: option };

            }

            if (criteria == 'clicked') {

                query.clicked = { $gte: option };

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

            if (criteria == 'notboughtsince') {

                query.email = { $in: filters[f].data };

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

                if (option == 'inactive') {

                    var now = new Date();
                    var delay = new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000);

                    query.lastClick = { $lt: delay };
                    query.lastOpen = { $lt: delay };

                }

                if (option == 'active') {

                    var now = new Date();
                    var delay = new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000);

                    // query.lastClick = { $gte: delay };
                    query.lastOpen = { $gte: delay };

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

            if (criteria == 'limit') {

                var nbSubscribers = Subscribers.find({ listId: listId }).fetch().length;
                var sampleSize = parseInt(parseInt(option) * nbSubscribers / 100);

                if (sampleSize == 0) {
                    sampleSize = 1;
                }
            }

            if (criteria == 'received' || criteria == 'openedbroadcast' || criteria == 'clickedbroadcast') {

                query._id = { $in: filters[f].data };

            }

            if (criteria == 'notreceived' || criteria == 'notopenedbroadcast' || criteria == 'notclickedbroadcast') {

                query._id = { $nin: filters[f].data };

            }
        }

        if (sampleSize) {
            console.log('Using aggregate');
            var subscribers = Subscribers.aggregate([{ $match: query }, { $sample: { size: sampleSize } }]);

        } else {
            var subscribers = Subscribers.find(query).fetch();

        }

        console.log(query);

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
