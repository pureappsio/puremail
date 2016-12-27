Meteor.methods({

  addGumroadAccount: function(token) {

    var userData = Meteor.call('getUserData', token);
    console.log(userData);

    GumroadAccounts.insert({
      token: token,
      ownerId: Meteor.user()._id
    });

  },

  getUserData: function(token) {

    // Parameters
    var url = 'https://api.gumroad.com/v2/user?access_token=' + token;
    console.log(url);

    try {
      res = HTTP.get(url);
      return res.data;
    }
    catch (err) {
      console.log(err);
      return {};
    }

  },
  userAddGumroadOauthCredentials: function(token, secret) {

	  var data = Gumroad.retrieveCredential(token, secret).serviceData;
	  console.log(data);

    // Update user
	  Meteor.users.update({_id: Meteor.user()._id}, { $set: {"services.gumroad": data} }, function(error) {
	    if (error) {console.log(error);}
	  });

  },
  refreshAllGumroad: function() {

    // Get all users
    var users = Meteor.users.find({}).fetch();

    // Refresh all
    for (u = 0; u < users.length; u++) {

      // Get all Sales
      console.log('Fetching sales ...');
      var sales = Meteor.call('getAllSales', users[u]);

      // Get all customers
      console.log('Fetching customers ...');
      var customers = Meteor.call('getAllCustomers', sales, users[u]);

      // Refresh subscribers
      console.log('Refreshing subscribers ...');
      Meteor.call('refreshSubscribers', customers, users[u]);

    }
  },
  importGumroadData: function() {

    // Get all Sales
    console.log('Fetching sales ...');
    var sales = Meteor.call('getAllSales', Meteor.user());

    // Get all customers
    console.log('Fetching customers ...');
    var customers = Meteor.call('getAllCustomers', sales, Meteor.user());

    // Refresh subscribers
    console.log('Refreshing subscribers ...');
    Meteor.call('refreshSubscribers', customers, Meteor.user());

  },
  getAllSales: function(user, after) {

    // Parameters
    var baseUrl = 'https://api.gumroad.com/v2/sales';
    var token = user.services.gumroad.accessToken;

    // Get all sales current period
    gotSales = true;
    var allSales = [];
    var currentPage = 1;

    while(gotSales) {

      // Make request
      if (after !== undefined) {
        var query = '?access_token=' + token + '&page=' + currentPage + '&after=' + after;
      }
      else {
        var query = '?access_token=' + token + '&page=' + currentPage;
      }

      res = HTTP.get(baseUrl + query);

      for (i = 0; i < res.data.sales.length; i++) {
        sale = res.data.sales[i];
        sale.ownerId = user._id;
        allSales.push(sale);

      }

      // Increment page
      currentPage++;

      if (!res.data.next_page_url) {
        gotSales = false;
        console.log(allSales[0]);
        return allSales;
      }
    }
  },
  getAllCustomers: function(allSales, user) {

    // Get all customers
    var customers = [];

    for (i = 0; i < allSales.length; i++) {

      // Check if not exist
      var customerExist = false;
      var customerIndex;
      for (j = 0; j < customers.length; j++) {
        if (customers[j].email == allSales[i].purchase_email) {
          customerExist = true;
          customerIndex = j;
        }
      }

      if (!customerExist) {

        var customer = {};
        customer.date_added = new Date(allSales[i].created_at);
        customer.ltv = allSales[i].price/100;
        customer.email = allSales[i].purchase_email;
        customer.products = [];
        customer.products.push(allSales[i].product_name);
        customer.nb_products = customer.products.length;
        customer.emailed = 0;
        if (allSales[i].can_contact) {
          customers.push(customer);
        }

      }

      else {
        customers[customerIndex].ltv = customers[customerIndex].ltv + allSales[i].price/100;
        customers[customerIndex].products.push(allSales[i].product_name);
        customers[customerIndex].nb_products = customers[customerIndex].products.length;
      }

    }

  return customers;

  }

});
