module.exports = {
    'Test Login' : function(browser) {
        browser
            .url('http://45.55.0.184:3000/login')
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
            .url('http://45.55.0.184:3000/login')
            .waitForElementVisible('body',1000)
            .setValue('input[id=username]','invalid')
            .setValue('input[type=password]','invalid')
            .waitForElementVisible('button[type=submit]',1000)
            .click('button[type=submit]')
            .pause(5000)
            .assert.visible('.alert')
            .end();
    },

    'Test Empty Form' : function(browser) {
        browser
            .url('http://45.55.0.184:3000/register')
            .waitForElementVisible('body',1000)
            .waitForElementVisible('button[type=submit]',1000)
            .click('button[type=submit]')
            .pause(5000)
            .assert.visible('.alert')
            .end();

    },

    'Test Password Match' : function(browser) {
        browser
        .url('http://45.55.0.184:3000/register')
        .waitForElementVisible('body',1000)
        .setValue('input[id=username]','testuser')
        .setValue('input[id=password]','testpwd')
        .setValue('input[id=confirmpassword]','mismatch')
        .click('button[type=submit]')
        .pause(3000)
        .assert.visible('.alert')
        .end();
    }
};