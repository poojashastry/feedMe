module.exports = {
    'Test Login' : function(browser) {
        browser
            .url('http://localhost:3000/login')
            .waitForElementVisible('body',1000)
            .setValue('input[id=username]','legit5')
            .setValue('input[type=password]','legit5')
            .waitForElementVisible('button[type=submit]',1000)
            .click('button[type=submit]')
            .pause(5000)
            .assert.containsText('#wrapper',"Logout")
            .end();
    },

    'Test Invalid Login' : function(browser) {
        browser
            .url('http://localhost:3000/login')
            .waitForElementVisible('body',1000)
            .setValue('input[id=username]','invalid')
            .setValue('input[type=password]','invalid')
            .waitForElementVisible('button[type=submit]',1000)
            .click('button[type=submit]')
            .pause(5000)
            .assert.visible('.alert')
            .end();
    }
};