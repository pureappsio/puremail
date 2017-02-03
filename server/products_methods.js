Meteor.methods({

    getCustomersEmails: function(listId) {

        // Get integration
        if (Integrations.findOne({ type: 'purecart', listId: listId })) {

            // Get integration
            var integration = Integrations.findOne({ type: 'purecart', listId: listId });

            // Get customers
            var url = "https://" + integration.url + "/api/customers?key=" + integration.key;

            var answer = HTTP.get(url);
            if (answer.data.customers) {

                var customersEmails = [];

                for (d in answer.data.customers) {

                    customersEmails.push(answer.data.customers[d].email);

                }

                return customersEmails;
            } else {
                return [];
            }

        }

    },
    getCustomersProduct: function(productId, listId) {

        // Get integration
        if (Integrations.findOne({ type: 'purecart', listId: listId })) {

            // Get integration
            var integration = Integrations.findOne({ type: 'purecart', listId: listId });

            // Get customers
            var url = "https://" + integration.url + "/api/customers?key=" + integration.key;
            url += "&product=" + productId;

            console.log(url);

            var answer = HTTP.get(url);
            if (answer.data.customers) {
                var customersEmails = [];

                for (d in answer.data.customers) {

                    customersEmails.push(answer.data.customers[d].email);

                }

                return customersEmails;
            } else {
                return [];
            }

        }

    },
    getNumberPurchases: function(subscriber) {

        // Get integration
        if (Integrations.findOne({ type: 'purecart', listId: subscriber.listId })) {

            // Get integration
            var integration = Integrations.findOne({ type: 'purecart', listId: subscriber.listId });

            // Get product
            var url = "https://" + integration.url + "/api/customers/" + subscriber.email + "?key=" + integration.key;

            var answer = HTTP.get(url);
            if (answer.data.products) {
                return answer.data.products.length;
            } else {
                return 0;
            }

        }

    },
    getPurchasedProducts: function(subscriber) {

        // Get integration
        if (Integrations.findOne({ type: 'purecart', listId: subscriber.listId })) {

            // Get integration
            var integration = Integrations.findOne({ type: 'purecart', listId: subscriber.listId });

            // Get product
            var url = "https://" + integration.url + "/api/customers/" + subscriber.email + "?key=" + integration.key;
            console.log(url);

            var answer = HTTP.get(url);
            if (answer.data.products) {
                return answer.data.products;
            } else {
                return [];
            }

        }

    },
    getProductName: function(productId, listId) {

        // Get integration
        if (Integrations.findOne({ type: 'purecart', listId: listId })) {

            // Get integration
            var integration = Integrations.findOne({ type: 'purecart', listId: listId });

            // Get product
            var url = "https://" + integration.url + "/api/products/" + productId + "?key=" + integration.key;

            var answer = HTTP.get(url);
            return answer.data.product.name;

        }

    },
    getProducts: function(listId) {

            console.log('Fetching products from cart ...');

            // Get integration
            if (Integrations.findOne({ type: 'purecart', listId: listId })) {

                // Get integration
                var integration = Integrations.findOne({ type: 'purecart', listId: listId });

                // Get product
                var url = "https://" + integration.url + "/api/products?key=" + integration.key;
                var answer = HTTP.get(url);
                return answer.data.products;

            } else {
                return [];
            }

        }
        // refreshProducts: function(products, integration) {

    //   // Get list
    //   var list = Lists.findOne(integration.list);

    //   if (list) {

    //     for (i = 0; i < products.length; i++) {

    //       // Check if exists
    //       if (!Products.findOne({name: products[i].info.title, listId: integration.list})) {
    //         var product = {
    //           listId: list._id,
    //           ownerId: list.ownerId,
    //           name: products[i].info.title,
    //           price: products[i].pricing.amount,
    //           integrationId: products[i].info.id
    //         };
    //         console.log(product);
    //         Products.insert(product);
    //         console.log('New product!');
    //       }
    //       else {
    //         console.log('Existing product');
    //         Products.update(
    //           {name: products[i].info.title, listId: integration.list},
    //           {$set:{integrationId: products[i].info.id, price: products[i].pricing.amount}}
    //         );
    //       }

    //     }

    //   }

    // },
    // importProducts: function(data) {

    //   console.log(data);

    //   if (data.list && data.products) {

    //     // Get list
    //     var list = Lists.findOne(data.list);

    //     if (list) {

    //       var products = data.products;
    //       console.log(products.length + " products");

    //       for (i = 0; i < products.length; i++) {

    //         // Check if exists
    //         if (!Products.findOne({name: products[i].name, listId: data.list})) {
    //           var product = products[i];
    //           product.listId = list._id;
    //           product.ownerId = list.ownerId;
    //           Products.insert(product);
    //           console.log('New product!');
    //         }
    //         else {
    //           console.log('Existing product');
    //         }

    //       }

    //     }

    //   }

    // }

});
