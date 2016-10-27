// API routes

// Schedule an email
Router.route("/api/mail", { where: "server" } ).post( function() {

  // Get data
  var data = this.request.body;
  var key = this.params.query.key;
  var user = Meteor.users.findOne({apiKey: key});

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

    }
    else {

      answer = {
        message: "Invalid data"
      }

    }
    this.response.end(JSON.stringify(answer));
  }
  else {
    this.response.end(JSON.stringify({message: "API key invalid"}));
  }  

});

// Subscribe
Router.route( "/api/subscribe", { where: "server" } ).post( function() {

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

Router.route( "/api/products", { where: "server" } ).post( function() {

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

Router.route("/api/stats", { where: "server" } ).post( function() {

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

Router.route("/api/subscribers", { where: "server" } ).get( function() {

  // Get data
  var listId = this.params.query.list;
  if (this.params.query.from && this.params.query.to) {

    // Get boundaries
    var from = new Date(this.params.query.from);
    var to = new Date(this.params.query.to);

    // Set to date to end of day
    to.setHours(23);
    to.setMinutes(59);
    to.setSeconds(59);

    var subscribers = Subscribers.find({listId: listId, date_added: {$gte: from, $lte: to}}).fetch();
  }
  else {
    var subscribers = Subscribers.find({listId: listId}).fetch();
  }

  // Send response
  json = {
    subscribers: subscribers.length,
    listId: listId
  };
  this.response.setHeader('Content-Type', 'application/json');
  this.response.end(JSON.stringify(json));

});

// All lists
Router.route("/api/lists", { where: "server" } ).get( function() {

  // Get data
  var key = this.params.query.key;
  var user = Meteor.users.findOne({apiKey: key});
  if (user) {
    lists = Lists.find({ownerId: user._id}).fetch();
  }
  else {
    lists = [];
  }
   
  // Send response
  json = {
    lists: lists
  };
  this.response.setHeader('Content-Type', 'application/json');
  this.response.end(JSON.stringify(json));

});

// All sequences of a list
Router.route("/api/sequences", { where: "server" } ).get( function() {

  // Get data
  var listId = this.params.query.list;
  var list = Lists.findOne(listId)
  var user = Meteor.users.findOne(list.ownerId);
  var key = this.params.query.key;

  // Get data
  var sequences = Sequences.find({listId: listId}).fetch();
   
  // Send response
  json = {
    sequences: sequences,
    listId: listId
  };

  // Send response
  this.response.setHeader('Content-Type', 'application/json');

  if (Meteor.call('validateApiKey', user, key)) {
    this.response.end(JSON.stringify(json));
  }
  else {
    this.response.end(JSON.stringify({message: "API key invalid"}));
  }  

});

// Stats for sequence
Router.route("/api/sequences/stats", { where: "server" } ).get( function() {

  // Get data
  var sequenceId = this.params.query.sequence;
  var sequence = Sequences.findOne(sequenceId);
  var user = Meteor.users.findOne(sequence.ownerId);
  var key = this.params.query.key;

  // Query
  var deliveredQuery = {event: 'delivered', sequenceId: sequenceId};
  var openedQuery = {event: 'opened', sequenceId: sequenceId};
  var clickedQuery = {event: 'clicked', sequenceId: sequenceId};
  var subscribedQuery = {event: 'subscribed', sequenceId: sequenceId};

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
    deliveredQuery.date = {$gte: from, $lte: to};
    openedQuery.date = {$gte: from, $lte: to};
    clickedQuery.date = {$gte: from, $lte: to};
    subscribedQuery.date = {$gte: from, $lte: to};

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
    sequenceId: sequenceId,
  };

  // Send response
  this.response.setHeader('Content-Type', 'application/json');

  if (Meteor.call('validateApiKey', user, key)) {
    this.response.end(JSON.stringify(json));
  }
  else {
    this.response.end(JSON.stringify({message: "API key invalid"}));
  }  

});