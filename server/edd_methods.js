Meteor.methods({

  deleteIntegration: function(integrationId) {

  	// Delete
  	Integrations.remove(integrationId);

  },

  addEddAccount: function(accountData) {

  	// Add user & insert in DB
  	accountData.service = "edd";
  	accountData.ownerId = Meteor.user()._id;
  	Integrations.insert(accountData);

  },
  refreshAllEdd: function() {

    // Get all users
    var users = Meteor.users.find({}).fetch();

    // Refresh all users
    for (u = 0; u < users.length; u++) {

      console.log('Fetching EDD data for user: ' + users[u]._id);

      // Grab all EDD integrations for this user
      integrations = Integrations.find({ownerId: users[u]._id, service: "edd"}).fetch();

      // Go through all integrations
      for (l = 0; l < integrations.length; l++) {

  		integration = integrations[l];

  		// Refresh products
  		console.log('Refreshing products ...');
	    var products = Meteor.call('getEddProducts', integration);
	    Meteor.call('refreshProducts', products, integration);

  		// Get all Sales
	    console.log('Fetching sales ...');
	    var sales = Meteor.call('getEddSales', integration);

      if (sales) {

        // Get all customers
        console.log('Fetching customers ...');
        var customers = Meteor.call('getEddCustomers', sales);

        // Refresh subscribers
        console.log('Refreshing subscribers ...');
        Meteor.call('refreshSubscribers', customers, integration);

      }

      }

      console.log('Finished fetching EDD data for user: ' + users[u]._id);

    }
  },
  getEddProducts: function(integration) {

	  // Parameters
	  var baseUrl = 'http://' + integration.url + '/edd-api/products/';
	  var token = integration.token;
	  var key = integration.key;

	  // Query
	  request = baseUrl + '?key=' + key + '&token=' + token;
	  res = HTTP.get(request);

	  return res.data.products;

  },
  getEddSales: function(integration) {

	  // Parameters
	  var baseUrl = 'http://' + integration.url + '/edd-api/sales/';
	  var token = integration.token;
	  var key = integration.key;

	  // Query
	  request = baseUrl + '?key=' + key + '&token=' + token;
	  res = HTTP.get(request);

	  return res.data.sales;

  },
  getEddCustomers: function(allSales) {

    // Get all customers
    var customers = [];

    for (i = 0; i < allSales.length; i++) {

      // Check if not exist
      var customerExist = false;
      var customerIndex;
      for (j = 0; j < customers.length; j++) {
        if (customers[j].email == allSales[i].email) {
          customerExist = true;
          customerIndex = j;
        }
      }

      if (!customerExist) {

        var customer = {};
        customer.date_added = new Date(allSales[i].date);
        customer.ltv = parseFloat(allSales[i].total);
        customer.email = allSales[i].email;
        customer.products = [];
        for (p = 0; p < allSales[i].products.length; p++) {
          customer.products.push({name: allSales[i].products[p].name});
        }
        customer.nb_products = customer.products.length;
        customer.emailed = 0;
        customers.push(customer);

      }

      else {
        customers[customerIndex].ltv = customers[customerIndex].ltv + parseFloat(allSales[i].total);
        for (p = 0; p < allSales[i].products.length; p++) {
          customers[customerIndex].products.push({name: allSales[i].products[p].name});
        }
        customers[customerIndex].nb_products = customers[customerIndex].products.length;
      }

    }

  return customers;

  }

});
