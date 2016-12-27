describe('Subscribe to a list', function() {

    before(function() {
        browser.url('http://localhost:3000')
            .click('.dropdown-toggle')
            .setValue('#login-email', 'marcolivier.schwartz@gmail.com')
            .setValue('#login-password', 'beyond08')
            .click('#login-buttons-password')
    });

    it('should redirect to the thank you page @watch', function() {

        browser.url('http://localhost:3000/subscribetest')
            .setValue('#email', 'johnjohnywhite@gmail.com')
            .click('#submit')

        // expect(list).not.to.be.an('undefined');
    });

    // after(function() {
    //     browser.url('http://localhost:3000')
    //         .click('.dropdown-toggle')
    //     browser.waitForExist('#login-buttons-logout')
    //     browser.click('#login-buttons-logout')
    // });

});
