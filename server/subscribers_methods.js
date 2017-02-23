// Import SendGrid
import sendgridModule from 'sendgrid';
const sendgrid = require('sendgrid')(Meteor.settings.sendGridAPIKey);

// Methods
Meteor.methods({

    getUserLocation: function(httpHeaders) {

        // console.log(httpHeaders);

        if (httpHeaders['cf-ipcountry']) {
            country_code = httpHeaders['cf-ipcountry'];
        } else {
            country_code = 'US';
        }

        return country_code;

    },

    getSubscribers: function(query) {
        return Subscribers.find(query).fetch();
    },

    getSubscriber: function(subscriberId) {

        return Subscribers.findOne(subscriberId);
    },

    removeSubscriber: function(email, listId) {

        // Remove all from list
        console.log('Deleting subscriber with email: ' + email + 'in list: ' + listId);
        Subscribers.remove({ email: email, listId: listId });

    },
    removeSubscribersList: function(listId) {

        // Remove all from list
        Subscribers.remove({ listId: listId });

    },
    addManualSubscriber: function(email, subscriberInterests, listId) {

        // Build object
        var subscriber = {
            email: email,
            listId: listId,
            ownerId: Meteor.user()._id,
            origin: 'blog',
            last_updated: new Date(),
            date_added: new Date()
        }

        // Insert interests
        subscriber.tags = subscriberInterests;

        // Add
        console.log(subscriber);
        Subscribers.insert(subscriber);

    },
    refreshSubscribers: function(customers, integration) {

        console.log(integration);

        // Refresh Subscribers
        for (var i = 0; i < customers.length; i++) {

            // Check if already in list
            var criterias = { email: customers[i].email, ownerId: integration.ownerId, listId: integration.list };
            var isSubscriber = Subscribers.findOne(criterias);

            if (isSubscriber) {
                console.log('Refreshing subscriber');
                subscriber = Subscribers.findOne(criterias);

                // Update subscriber
                Subscribers.update(subscriber._id, { $set: { "ltv": customers[i].ltv } });
                Subscribers.update(subscriber._id, { $set: { "products": customers[i].products } });
                Subscribers.update(subscriber._id, { $set: { "nb_products": customers[i].nb_products } });

                // Not in sequence ?
                if (subscriber.sequenceId == null) {

                    // Check if there is a new subscriber sequence
                    if (Sequences.findOne({ listId: integration.list, trigger: 'customers' })) {

                        // Get sequence
                        var newSequence = Sequences.findOne({ listId: integration.list, trigger: 'customers' });

                        // Get email
                        var newEmail = Automations.findOne({ sequenceId: newSequence._id, order: 1 });

                        // Add to scheduler
                        var user = Meteor.users.findOne(integration.ownerId);
                        Meteor.call('addAutomationEmail', newEmail, subscriber, integration.list, user);

                        // Update subscriber
                        Subscribers.update(subscriber._id, { $set: { "sequenceEmail": newEmail._id } });
                        Subscribers.update(subscriber._id, { $set: { "sequenceId": newSequence._id } });

                    }

                }

            } else {

                // Add new subscriber & customer
                console.log('New subscriber');
                customers[i].last_updated = new Date();
                customers[i].listId = integration.list;
                customers[i].ownerId = integration.ownerId;
                var subscriberId = Subscribers.insert(customers[i]);

                // Check if there is a new subscriber sequence
                if (Sequences.findOne({ listId: integration.list, trigger: 'customers' })) {

                    // Get sequence
                    var newSequence = Sequences.findOne({ listId: integration.list, trigger: 'customers' });

                    // Get email
                    var newEmail = Automations.findOne({ sequenceId: newSequence._id, order: 1 });

                    // Add to scheduler
                    var subscriber = Subscribers.findOne(subscriberId);
                    var user = Meteor.users.findOne(integration.ownerId);
                    Meteor.call('addAutomationEmail', newEmail, subscriber, integration.list, user);

                    // Update subscriber
                    Subscribers.update(subscriber._id, { $set: { "sequenceEmail": newEmail._id } });
                    Subscribers.update(subscriber._id, { $set: { "sequenceId": newSequence._id } });

                }

            }

        }

    },
    updateSubscriberInterests: function(subscriber, interests) {

        // Current interests
        if (subscriber.tags) {
            currentInterests = subscriber.tags;

            // Add new interests
            for (j = 0; j < interests.length; j++) {
                var interestPresent = false;
                for (l = 0; l < currentInterests.length; l++) {
                    if (interests[j] == currentInterests[l]) { interestPresent = true; }
                }
                if (!interestPresent) { currentInterests.push(interests[j]); }
            }
        } else {
            currentInterests = interests;
        }

        // Return
        subscriber.tags = currentInterests;
        return subscriber;

    },
    confirmSubscriber: function(subscriberId) {

        // Check if subscriber exists
        var subscriber = Subscribers.findOne(subscriberId);

        if (subscriber) {

            // Update
            console.log('Confirming new subscriber: ');
            // console.log(subscriber);
            Subscribers.update(subscriberId, { $set: { "confirmed": true } });

            // Get data
            var user = Meteor.users.findOne(subscriber.ownerId);
            var list = Lists.findOne(subscriber.listId);

            // console.log('List: ');
            // console.log(list);

            // Send notifications
            if (Integrations.findOne({ type: 'puremetrics' })) {

                // Get integration
                var integration = Integrations.findOne({ type: 'puremetrics' });

                // Parameters
                parameters = {
                    type: 'subscription',
                    message: 'New subscriber to the ' + list.name + ' email list'
                };

                // Add origin
                if (subscriber.origin) {
                    parameters.origin = subscriber.origin;
                }

                // Post
                HTTP.post('https://' + integration.url + '/api/notifications?key=' + integration.key, { params: parameters });

            }

            // Assign subscriber in sequence
            if (subscriber.sequenceId) {

                // Get first email of sequence
                var firstEmail = Automations.findOne({ sequenceId: subscriber.sequenceId, order: 1 });

                // Set email
                if (firstEmail) {

                    Subscribers.update(subscriber._id, { $set: { "sequenceEmail": firstEmail._id } });

                    // Add email to scheduler
                    Meteor.call('addAutomationEmail', firstEmail, subscriber, list, user);

                }


            }

        }
    },
    addAutomationEmail: function(rule, subscriber, list, user) {

        console.log('Adding automation email');
        // console.log(rule);
        // console.log(subscriber);
        // console.log(list);
        // console.log(user);

        // Calculate date
        var currentDate = new Date();
        currentDate = currentDate.getTime();

        if (rule.period == 'seconds') {
            currentDate += rule.time * 1000;
        }
        if (rule.period == 'minutes') {
            currentDate += rule.time * 1000 * 60;
        }
        if (rule.period == 'hours') {
            currentDate += rule.time * 1000 * 60 * 60;
        }
        if (rule.period == 'days') {
            currentDate += rule.time * 1000 * 60 * 60 * 24;
        }

        var entryDate = new Date(currentDate);

        // Create new entry for scheduler
        var entry = {
            name: list.userName,
            ownerId: user._id,
            listId: subscriber.listId,
            date: entryDate,
            to: subscriber.email,
            from: list.userName + ' <' + list.brandEmail + '>',
            subject: rule.emailSubject,
            text: rule.emailText,
            ruleId: rule._id
        }

        // Sequence?
        if (rule.sequenceId) {
            entry.sequenceId = rule.sequenceId;
            entry.sequenceEmail = rule.order;
        }

        // Insert
        Scheduled.insert(entry);

        // Offers ?
        if (rule.useOffer) {

            console.log('Offer found');

            // Calculate expiry date
            var finalDate = new Date();
            finalDate.setTime(entryDate.getTime() + rule.expiryDate * 86400000);

            // Create offer
            var offer = {
                ownerId: user._id,
                listId: subscriber.listId,
                productId: rule.productId,
                expiryDate: finalDate,
                subscriberId: subscriber._id,
                ruleId: rule._id,
                offerDiscount: rule.offerDiscount
            }
            console.log(offer);
            Offers.insert(offer);

        }

    },
    addSubscriber: function(data) {

        console.log(data);

        // New subscriber
        subscriber = {
            email: data.email
        }

        // Get list & user
        var list = Lists.findOne({ _id: data.list });
        var user = Meteor.users.findOne({ _id: list.ownerId });

        // Process data
        if (data.tag) {

            if (Array.isArray(data.tag)) {

                // Insert
                subscriber.tags = data.tag;

            } else {

                // Insert
                subscriber.tags = [data.tag];
            }

        }

        if (data.origin) {
            subscriber.origin = data.origin;
        }

        if (data.location) {
            subscriber.location = data.location;
        }

        if (data.sequence) {
            subscriber.sequenceId = data.sequence;
        }

        // Set dates
        subscriber.last_updated = new Date();
        subscriber.date_added = new Date();

        // Set list/owner
        subscriber.listId = data.list;
        subscriber.ownerId = user._id;

        // Check if already in list
        var isSubscriber = Subscribers.findOne({ email: data.email, listId: data.list, ownerId: user._id });

        if (isSubscriber) {

            console.log('Updating subscriber');

            // Fuse interests
            if (subscriber.tags) {

                // Get all interests
                var previousInterests = Subscribers.findOne(isSubscriber._id).tags;
                var newInterests = subscriber.tags;

                if (previousInterests && newInterests) {

                    // Combine
                    var interests = newInterests;

                    for (p = 0; p < previousInterests.length; p++) {
                        var matchInterest = false;
                        for (n = 0; n < newInterests.length; n++) {

                            if (previousInterests[p] && newInterests[n]) {

                                if (previousInterests[p] == newInterests[n]) {
                                    matchInterest = true;
                                }

                            }

                        }
                        if (!matchInterest) {
                            interests.push(previousInterests[p]);
                        }
                    }

                    // Update
                    Subscribers.update(isSubscriber._id, { $set: { "tags": interests } });

                }

            }

            // Origin and date
            if (subscriber.origin) {
                Subscribers.update(isSubscriber._id, { $set: { "origin": subscriber.origin } });
            }
            Subscribers.update(isSubscriber._id, { $set: { "last_updated": new Date() } });

            // Assign returning status
            Subscribers.update(isSubscriber._id, { $set: { "status": "returning" } });

            // Assign to new sequence ?
            if (isSubscriber.sequenceId == null) {

                // Assign new sequence
                if (subscriber.sequenceId) {

                    Subscribers.update(isSubscriber._id, { $set: { "sequenceId": subscriber.sequenceId } });

                    // Get first email of sequence
                    var firstEmail = Automations.findOne({ sequenceId: subscriber.sequenceId, order: 1 });

                    // Set email
                    if (firstEmail) {

                        Subscribers.update(isSubscriber._id, { $set: { "sequenceEmail": firstEmail._id } });

                        // Add email to scheduler
                        Meteor.call('addAutomationEmail', firstEmail, isSubscriber, list, user);
                    }


                }

            } else {

                // Just send first email of new sequence
                if (subscriber.sequenceId) {

                    // Get sequence
                    var sequence = Sequences.findOne(subscriber.sequenceId);

                    // Get first email
                    var firstEmail = Automations.findOne({ sequenceId: sequence._id, order: 1 });

                    // Add email
                    if (firstEmail) {
                        Meteor.call('addAutomationEmail', firstEmail, subscriber, subscriber.listId, user);
                    }

                }

            }

            return isSubscriber._id;

        } else {

            // Set not confirmed
            subscriber.confirmed = false;
            subscriber.status = 'new';
            console.log('New subscriber');
            console.log(subscriber);

            // Insert
            var subscriberId = Subscribers.insert(subscriber);

            // Insert in stats
            var stat = {
                date: new Date(),
                subscriberId: subscriberId,
                ownerId: user._id,
                event: 'subscribed'
            }
            if (subscriber.sequenceId) {
                stat.sequenceId = subscriber.sequenceId;
            }
            if (subscriber.origin) {
                stat.origin = subscriber.origin;
            }
            if (subscriber.location) {
                stat.location = subscriber.location;
            }

            Stats.insert(stat);

            if (data.confirmed || (list.skipConfirmation == 'enabled')) {

                console.log('Skipping confirmation email');

            } else {

                // Send confirmation email
                if (list.language) {

                    if (list.language == 'fr') {
                        var confirmationSubject = "Confirmez votre inscription à " + list.brandName;
                        SSR.compileTemplate('confirmationEmail', Assets.getText('confirmation_email_fr.html'));
                    } else {
                        var confirmationSubject = "Confirm your subscription to " + list.brandName;
                        SSR.compileTemplate('confirmationEmail', Assets.getText('confirmation_email_.html'));
                    }
                } else {
                    var confirmationSubject = "Confirm your subscription to " + list.brandName;
                    SSR.compileTemplate('confirmationEmail', Assets.getText('confirmation_email.html'));
                }

                // Host
                host = Meteor.absoluteUrl();

                // Set name & brand
                name = list.userName;
                brand = list.brandName;
                if (name == brand) {
                    brand = '';
                }

                // Build mail
                var helper = sendgridModule.mail;
                from_email = new helper.Email(list.brandEmail);
                to_email = new helper.Email(subscriber.email);
                subject = confirmationSubject;
                content = new helper.Content("text/html", SSR.render("confirmationEmail", { host: host, name: name, brand: brand, subscriberId: subscriberId }));
                mail = new helper.Mail(from_email, subject, to_email, content);
                mail.from_email.name = list.userName;

                // Send
                var requestBody = mail.toJSON();
                var request = sendgrid.emptyRequest();
                request.method = 'POST';
                request.path = '/v3/mail/send';
                request.body = requestBody;

                if (Meteor.settings.mode != 'demo') {
                    sendgrid.API(request, function(err, response) {
                        if (response.statusCode != 202) {
                            console.log(response.body);
                        }
                    });

                }

            }

            // Return ID
            return subscriberId;
        }

    },
    deleteSubscriber: function(id) {

        // Get data
        var subscriber = Subscribers.findOne(id); 
        if (subscriber) {
            var list = Lists.findOne(subscriber.listId);
        }

        // Delete
        Subscribers.remove(id);

        // Send notifications
        if (list && subscriber && Integrations.findOne({ type: 'puremetrics' })) {

            // Get integration
            var integration = Integrations.findOne({ type: 'puremetrics' });

            // Parameters
            parameters = {
                type: 'unsubscribed',
                message: 'Unsubscription to the ' + list.name + ' email list'
            };

            // Add origin
            if (subscriber.origin) {
                parameters.origin = subscriber.origin;
            }

            // Post
            HTTP.post('https://' + integration.url + '/api/notifications?key=' + integration.key, { params: parameters });

        }

    },
    importSubscriber: function(data) {

        // New subscriber
        subscriber = {
            email: data.email
        }

        // Get list & user
        var list = Lists.findOne({ _id: data.list });
        var user = Meteor.users.findOne({ _id: list.ownerId });

        // Process data
        if (data.tag) {
            subscriber.tags = data.tag;
        }
        if (data.origin) {
            subscriber.origin = data.origin;
        }
        if (data.plan) {
            subscriber.plan = data.plan;
        }
        if (data.product) {
            // for (p = 0; p < data.products.length; p++) {
            //   products.push({"name": data.products[p]});
            // }
            subscriber.products = [data.product];
        }

        // Set dates
        subscriber.last_updated = new Date();
        subscriber.date_added = new Date();

        // Set list/owner
        subscriber.listId = data.list;
        subscriber.ownerId = user._id;

        // Check if already in list
        var isSubscriber = Subscribers.findOne({ email: data.email, listId: data.list, ownerId: user._id });

        if (isSubscriber) {

            console.log('Updating subscriber');
            console.log(subscriber);

            var existingSubscriber = Subscribers.findOne({ email: data.email, listId: data.list, ownerId: user._id });

            if (subscriber.interests) {
                Subscribers.update(existingSubscriber._id, { $set: { "interests": subscriber.interests } });
            }
            if (subscriber.product) {

                // Get current product
                var existingProducts = existingSubscriber.products;

                if (existingProducts.indexOf(subscriber.product) == -1) {
                    existingProducts.push(subscriber.product);
                }

                // Refresh
                Subscribers.update(existingSubscriber._id, { $set: { "products": existingProducts } });

            }
            if (subscriber.origin) {
                Subscribers.update(existingSubscriber._id, { $set: { "origin": subscriber.origin } });
            }
            if (subscriber.plan) {
                Subscribers.update(existingSubscriber._id, { $set: { "plan": subscriber.plan } });
            }
            // Subscribers.update({email: data.email, listId: data.list, ownerId: user._id}, {$set: {"last_updated": new Date() } });
        } else {

            // Set confirmed
            subscriber.confirmed = true;
            console.log('Imported subscriber: ');
            console.log(subscriber);

            // Insert
            var subscriberId = Subscribers.insert(subscriber);

        }

    },
    wakeUpDyingLeads: function() {

        // Get  all users
        var users = Meteor.users.find({}).fetch();

        // Go through all users
        for (u = 0; u < users.length; u++) {

            // Get all lists from user
            var lists = Lists.find({ ownerId: users[u]._id }).fetch();

            // Go through all lists
            for (l = 0; l < lists.length; l++) {

                // Check if list has a wake up sequence
                if (Sequences.findOne({ listId: lists[l]._id, trigger: "dying" })) {

                    // Get sequence
                    var sequence = Sequences.findOne({ listId: lists[l]._id, trigger: "dying" })

                    // Get email
                    var newEmail = Automations.findOne({ sequenceId: sequence._id, order: 1 });

                    // Find all subscribers for this list
                    var subscribers = Subscribers.find({ listId: lists[l]._id }).fetch();

                    // Find all subscribers that are inactive
                    for (s = 0; s < subscribers.length; s++) {

                        // Check if subscriber is inactive
                        if (Meteor.call('isInactive', subscribers[s])) {

                            // Assign the wake up sequence
                            Subscribers.update(subscribers[s]._id, { $set: { "sequenceEmail": newEmail._id } });
                            Subscribers.update(subscribers[s]._id, { $set: { "sequenceId": sequence._id } });

                            // Send first email
                            Meteor.call('addAutomationEmail', newEmail, subscribers[s], lists[l], users[u]);

                        }

                    }

                }

            }

        }


    },
    isInactive: function(subscriber) {

        var inactive = false;
        var timeDelay = 60 * 24 * 60 * 60 * 1000; // 60 days

        if (subscriber.sequenceId == null) {

            // Check creation date
            var today = new Date();
            var last_updated = subscriber.last_updated;
            var difference = today.getTime() - last_updated.getTime();

            if (difference > timeDelay) {

                if (subscriber.lastOpen && subscriber.lastClick) {

                    // Check last click or last open date
                    var today = new Date();
                    var last_click = subscriber.lastOpen;
                    var last_open = subscriber.lastClick;
                    var differenceClick = today.getTime() - last_updated.getTime();
                    var differenceOpen = today.getTime() - last_updated.getTime();

                    if ((differenceClick > timeDelay) || (differenceOpen > timeDelay)) {

                        // Set inactive
                        inactive = true;

                    }

                }

            }

        }

        return inactive;

    }

});

function cleanArray(array) {
    var i, j, len = array.length,
        out = [],
        obj = {};
    for (i = 0; i < len; i++) {
        obj[array[i]] = 0;
    }
    for (j in obj) {
        out.push(j);
    }
    return out;
}
