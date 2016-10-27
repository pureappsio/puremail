Meteor.methods({

  getProductName: function(productId) {

    // Get integration
    if (Integrations.findOne({type: 'purecart'})) {

      // Get integration
      var integration = Integrations.findOne({type: 'purecart'});

      // Get product
      var url = "http://" + integration.url + "/api/products?key=" + integration.key;
      var answer = HTTP.get(url + '&product=' + productId);
      return answer.data.product;

    }

  },
  refreshProducts: function(products, integration) {

    // Get list
    var list = Lists.findOne(integration.list);

    if (list) {

      for (i = 0; i < products.length; i++) {

        // Check if exists
        if (!Products.findOne({name: products[i].info.title, listId: integration.list})) {
          var product = {
            listId: list._id,
            ownerId: list.ownerId,
            name: products[i].info.title,
            price: products[i].pricing.amount,
            integrationId: products[i].info.id
          };
          console.log(product);
          Products.insert(product);
          console.log('New product!');
        }
        else {
          console.log('Existing product');
          Products.update(
            {name: products[i].info.title, listId: integration.list},
            {$set:{integrationId: products[i].info.id, price: products[i].pricing.amount}}
          );
        }

      }

    }

  },
  importProducts: function(data) {

    console.log(data);

    if (data.list && data.products) {

      // Get list
      var list = Lists.findOne(data.list);

      if (list) {

        var products = data.products;
        console.log(products.length + " products");

        for (i = 0; i < products.length; i++) {

          // Check if exists
          if (!Products.findOne({name: products[i].name, listId: data.list})) {
            var product = products[i];
            product.listId = list._id;
            product.ownerId = list.ownerId;
            Products.insert(product);
            console.log('New product!');
          }
          else {
            console.log('Existing product');
          }

        }

      }

    }

  }

});
