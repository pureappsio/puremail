// API routes

// Schedule an email
Router.route("/api/mail", { where: "server" }).post(function() {

    // Get data
    var data = this.request.body;
    var key = this.params.query.key;
    var user = Meteor.users.findOne({ apiKey: key });

    // Send response
    this.response.setHeader('Content-Type', 'application/json');

    // Check key
    if (Meteor.call('validateApiKey', user, key)) {

        // Insert email in scheduler
        if (data.listId && data.email && data.date && data.subject && data.text) {

            // Add user data
            data.userId = user._id;

            // Add email
            Meteor.call('addManualEmail', data);

            answer = {
                message: "Email inserted"
            }

        } else {

            answer = {
                message: "Invalid data"
            }

        }
        this.response.end(JSON.stringify(answer));
    } else {
        this.response.end(JSON.stringify({ message: "API key invalid" }));
    }

});

// Subscribe
Router.route("/api/subscribe", { where: "server" }).post(function() {

    // Get data
    var data = this.request.body;
    console.log(data);

    // Call function
    if (data.email && data.list) {
        Meteor.call('importSubscriber', data);
    }

    // Send response
    json = {
        imported: true
    };
    this.response.setHeader('Content-Type', 'application/json');
    this.response.end(JSON.stringify(json));

});

Router.route("/api/products", { where: "server" }).post(function() {

    // Get data
    var data = this.request.body;
    // console.log(data);

    // Call function
    Meteor.call('importProducts', data);

    // Send response
    json = {
        imported: true
    };
    this.response.setHeader('Content-Type', 'application/json');
    this.response.end(JSON.stringify(json));

});

Router.route("/api/stats", { where: "server" }).post(function() {

    // Get data
    var data = this.request.body;
    console.log('Event received: ');
    console.log(data);

    // Call function
    Meteor.call('processEvents', data);

    // Send response
    json = {
        received: true
    };
    this.response.setHeader('Content-Type', 'application/json');
    this.response.end(JSON.stringify(json));

});

// All subscribers from list
Router.route("/api/subscribers", { where: "server" }).get(function() {

    // Get data
    var key = this.params.query.key;
    var user = Meteor.users.findOne({ apiKey: key });

    // Form query
    var query = {};

    // List
    if (this.params.query.list) {
        query.listId = this.params.query.list;
    }

    // Origin
    if (this.params.query.origin) {
        query.origin = this.params.query.origin;
    }

    // From & to
    if (this.params.query.from && this.params.query.to) {

        // Get boundaries
        var from = new Date(this.params.query.from);
        var to = new Date(this.params.query.to);

        // Set to date to end of day
        to.setHours(23);
        to.setMinutes(59);
        to.setSeconds(59);

        // Set query
        query.date_added = { $gte: from, $lte: to };

    }

    // Send response
    this.response.setHeader('Content-Type', 'application/json');

    if (Meteor.call('validateApiKey', user, key)) {

        // Get subscribers
        var subscribers = Subscribers.find(query).fetch();

        json = {
            subscribers: subscribers
        };
        this.response.end(JSON.stringify(json));
    } else {
        this.response.end(JSON.stringify({ message: "API key invalid" }));
    }

});

// Subscriber
Router.route("/api/subscribers/:email", { where: "server" }).get(function() {

    // Get data
    var subscriberEmail = this.params.email;
    var key = this.params.query.key;
    var user = Meteor.users.findOne({ apiKey: key });

    // Build query
    var query = { email: subscriberEmail };

    if (this.params.query.list) {
        query.listId = this.params.query.list;
    }

    // Send response
    this.response.setHeader('Content-Type', 'application/json');

    if (Meteor.call('validateApiKey', user, key)) {

        // Get subscriber (with email)
        if (Subscribers.findOne(query)) {

            var subscriber = Subscribers.findOne(query);

            this.response.end(JSON.stringify(subscriber));
        } else if (Subscribers.findOne(subscriberEmail)) {

            var subscriber = Subscribers.findOne(subscriberEmail);

            this.response.end(JSON.stringify(subscriber));

        } else {
            this.response.end(JSON.stringify({ message: "Subscriber not found" }));
        }

    } else {
        this.response.end(JSON.stringify({ message: "API key invalid" }));
    }

});

// All lists
Router.route("/api/lists", { where: "server" }).get(function() {

    // Get data
    var key = this.params.query.key;
    var user = Meteor.users.findOne({ apiKey: key });
    if (user) {
        lists = Lists.find({ ownerId: user._id }).fetch();
    } else {
        lists = [];
    }

    // Send response
    json = {
        lists: lists
    };
    this.response.setHeader('Content-Type', 'application/json');
    this.response.end(JSON.stringify(json));

});

// One list
Router.route("/api/lists/:id", { where: "server" }).get(function() {

    // Get data
    var key = this.params.query.key;
    var user = Meteor.users.findOne({ apiKey: key });
    if (user) {
        list = Lists.findOne(this.params.id);
    } else {
        list = {};
    }

    // Send response
    this.response.setHeader('Content-Type', 'application/json');
    this.response.end(JSON.stringify(list));

});

// All sequences of a list
Router.route("/api/sequences", { where: "server" }).get(function() {

    // Get data
    var listId = this.params.query.list;
    var list = Lists.findOne(listId)
    var user = Meteor.users.findOne(list.ownerId);
    var key = this.params.query.key;

    // Get data
    var sequences = Sequences.find({ listId: listId }).fetch();

    // Send response
    json = {
        sequences: sequences,
        listId: listId
    };

    // Send response
    this.response.setHeader('Content-Type', 'application/json');

    if (Meteor.call('validateApiKey', user, key)) {
        this.response.end(JSON.stringify(json));
    } else {
        this.response.end(JSON.stringify({ message: "API key invalid" }));
    }

});

// All tags
Router.route("/api/tags", { where: "server" }).get(function() {

    // Get data
    var key = this.params.query.key;
    var user = Meteor.users.findOne({ apiKey: key });

    var query = {};

    if (this.params.query.list) {
        query.listId = this.params.query.list;
    }

    // Get data
    var tags = Interests.find(query).fetch();

    // Send response
    json = {
        tags: tags
    };

    // Send response
    this.response.setHeader('Content-Type', 'application/json');

    if (Meteor.call('validateApiKey', user, key)) {
        this.response.end(JSON.stringify(json));
    } else {
        this.response.end(JSON.stringify({ message: "API key invalid" }));
    }

});

// All offers
Router.route("/api/offers", { where: "server" }).get(function() {

    // Get data
    var key = this.params.query.key;
    var user = Meteor.users.findOne({ apiKey: key });

    var query = {};

    if (this.params.query.list) {
        query.listId = this.params.query.list;
    }

    if (this.params.query.subscriber) {
        query.subscriberId = this.params.query.subscriber;
    }

    // Get data
    var offers = Offers.find(query).fetch();

    // Send response
    json = {
        offers: offers
    };

    // Send response
    this.response.setHeader('Content-Type', 'application/json');

    if (Meteor.call('validateApiKey', user, key)) {
        this.response.end(JSON.stringify(json));
    } else {
        this.response.end(JSON.stringify({ message: "API key invalid" }));
    }

});

// Specific offer
Router.route("/api/offers/:id", { where: "server" }).get(function() {

    // Get data
    var key = this.params.query.key;
    var user = Meteor.users.findOne({ apiKey: key });
    var offerId = this.params.id;

    // Get data
    var offer = Offers.findOne(offerId);

    // Send response
    json = offer;

    // Send response
    this.response.setHeader('Content-Type', 'application/json');

    if (Meteor.call('validateApiKey', user, key)) {
        this.response.end(JSON.stringify(json));
    } else {
        this.response.end(JSON.stringify({ message: "API key invalid" }));
    }

});

// Stats for sequence
Router.route("/api/sequences/stats", { where: "server" }).get(function() {

    // Get data
    var sequenceId = this.params.query.sequence;
    var sequence = Sequences.findOne(sequenceId);
    var user = Meteor.users.findOne(sequence.ownerId);
    var key = this.params.query.key;

    // Query
    var deliveredQuery = { event: 'delivered', sequenceId: sequenceId };
    var openedQuery = { event: 'opened', sequenceId: sequenceId };
    var clickedQuery = { event: 'clicked', sequenceId: sequenceId };
    var subscribedQuery = { event: 'subscribed', sequenceId: sequenceId };

    // Process request
    if (this.params.query.from && this.params.query.to) {

        // Get boundaries
        var from = new Date(this.params.query.from);
        var to = new Date(this.params.query.to);

        // Set to date to end of day
        to.setHours(23);
        to.setMinutes(59);
        to.setSeconds(59);

        // Update query
        deliveredQuery.date = { $gte: from, $lte: to };
        openedQuery.date = { $gte: from, $lte: to };
        clickedQuery.date = { $gte: from, $lte: to };
        subscribedQuery.date = { $gte: from, $lte: to };

    }

    // Origin ?
    if (this.params.query.origin) {

        // Update query
        deliveredQuery.origin = this.params.query.origin;
        openedQuery.origin = this.params.query.origin;
        clickedQuery.origin = this.params.query.origin;
        subscribedQuery.origin = this.params.query.origin;

    }

    // Get data
    var delivered = Stats.find(deliveredQuery).fetch();
    var opened = Stats.find(openedQuery).fetch();
    var clicked = Stats.find(clickedQuery).fetch();
    var subscribed = Stats.find(subscribedQuery).fetch();

    // Create response
    json = {
        delivered: delivered.length,
        opened: opened.length,
        clicked: clicked.length,
        subscribed: subscribed.length,
        sequenceId: sequenceId
    };

    // Send response
    this.response.setHeader('Content-Type', 'application/json');

    if (Meteor.call('validateApiKey', user, key)) {
        this.response.end(JSON.stringify(json));
    } else {
        this.response.end(JSON.stringify({ message: "API key invalid" }));
    }

});
