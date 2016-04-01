//
//
//


// Parameters 
//  - BKid (eq. 22180 for Toulouse/Saint-Orens)
//  - Visit date (eq. 20,03,2016  for 03/20/2016)
//  - Visit time (eq. 20,30  for 20:30)

var args = require('system').args;
var inputParam_BKID = args[1];
var inputParam_visitDate = args[2].split(',');
var inputParam_visitTime = args[3].split(',');

// Flow
//
// 1. https://www.bkvousecoute.fr/
//     --> #NextButton.click()
//
// 2. Wait for #...
//      #SurveyCode.val(BKid)
//      #InputDay.val(visitDate[0])
//      #InputMonth.val(visitDate[1])
//      #InputYear.val(visitDate[2])
//      #InputHour.val(visitTime[0])
//      #InputMinute.val(visitTime[1])
//      #NextButton.click()
//
// 3. Wait for #...  
//      $(".Opt2 .radioBranded").click()
//      $("#NextButton").click()
//
// 4++++. Wait for #..
//      $(".InputRowOdd  .inputtyperbloption .radioBranded").click()
//      $(".InputRowEven .inputtyperbloption .radioBranded").click()
//      if ($(".Opt1 .radioBranded").size() > 0) {
//          $(".Opt1 .radioBranded").click()         
//      }
//      $(".inputtypeopt .cataOption .checkboxBranded").click()
//      if ($("#S081000").size() > 0) { 
//         $("#S081000").val("Merci !") }
//      }
//      if ($("#R069000").size() > 0) {
//          $("#R069000 .Opt9").attr("selected", true)
//      }
//      if ($("#R070000").size() > 0) {
//          $("#R070000 .Opt9").attr("selected", true)
//      }
//      if ($("#S076000").size() > 0) {
//          $("#S076000").val("31000")
//      }


//      Résultat : #FNSfinishText
//      if ($("#FNSfinishText .ValCode").size() > 0) {
//          console.log($("#FNSfinishText .ValCode").text());
//      }

var webPage = require('webpage');
var page = webPage.create();
page.settings.userAgent = "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_8_3) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/28.0.1468.0 Safari/537.36";
page.settings.resourceTimeout = 10000;
page.viewportSize = {
          width: 1920,
          height: 1080
        };


function log(level, message) {
    if (level == undefined) {
        level = "ERROR ";
    }
    if (message == undefined) {
        message = " (undefined) ";
    }
    console.log(" * " + level + " - " + message);
}

page.onConsoleMessage = function(msg) {
    log('BROWSER-CONSOLE', msg);
    
    // If the msg contains "Error logged:" we take a screenshot
    if (msg.indexOf('Error logged:') > -1) {
        saveRender(page, testindex);
    }
};

page.onError = function(msg) {
    log('BROWSER-CONSOLE-ERROR', msg);
    // If the msg contains "Error logged:" we take a screenshot
    if (msg.indexOf('Error logged:') > -1) {
        saveRender(page, testindex);
    }
};

function saveRender(page, stepNumber) {
    var fileName = "phantomJSrender" + "_at-" + new Date().getTime() + "_step-" + stepNumber + ".png";
    page.render(fileName, {
        format: 'png'
    });
    log("RENDER-FILE", "A new render for step [" + stepNumber + "] is available at [" + fileName + "]");
}

function saveRenderAndExit(page, stepNumber, exitCode) {
    saveRender(page, stepNumber + "_ERROR");
    phantom.exit(exitCode);
}





function isNextButtonPresentAndNotValidated() {
    return $("#NextButton").size() > 0 && $("#NextButton").prop("alreadyValidated") == false;
}

function clickNextButtonAndValidate() {
    $("#NextButton").prop("alreadyValidated", true);
    console.log("sumbit")
    $("#surveyEntryForm").submit();
}

log("INFO", "Opening main page...")
page.open("https://www.bkvousecoute.fr/", function (httpStatus) {
    if (httpStatus !== 'success') {
        log("ERROR", "Could not load the burger King survey page");
        phantom.exit(1);
    } 

    log("INFO", "Injecting jQuery...")
    page.includeJs('https://code.jquery.com/jquery.js', function() {
        
        // Accept the conditions
        log("INFO", "Accepting conditions...")
        saveRender(page, "Conditions")
        page.evaluate(clickNextButtonAndValidate);

        // Wait for the next button ()
        log("INFO", "Waiting for parameter page...")
        while (page.evaluate(isNextButtonPresentAndNotValidated) == false) {
            //log("DEBUG", "Button present: " + page.evaluate(function() { return $("#NextButton").size() > 0}))
            //log("DEBUG", "Button already validated: " + page.evaluate(function() { return $("#NextButton").prop("alreadyValidated") }))
            saveRender(page, "WaitingParameter")
        }

        // Fill the first form with the parameters 
        log("INFO", "Filling parameters...")
        saveRender(page, "Parameters")
        page.evaluate(function(bkId, visitDate, visitTime) {
            $("#SurveyCode").val(bkId);
            $("#InputDay").val(visitDate[0]);
            $("#InputMonth").val(visitDate[1]);
            $("#InputYear").val(visitDate[2]);
            $("#InputHour").val(visitTime[0]);
            $("#InputMinute").val(visitTime[1]);
        }, inputParam_BKID, inputParam_visitDate, inputParam_visitTime);
        log("INFO", "Sending parameters...")
        page.evaluate(clickNextButtonAndValidate);

        var validationCode = null;
        var validationCodeFound = false;
        var stepCounter = 1;
        while (validationCodeFound == false) {

            page.includeJs('https://code.jquery.com/jquery.js', function() {

                log("INFO", "Waiting for NextButton on step=[" + stepCounter + "]")

                // Wait for the next button ()
                while (page.evaluate(isNextButtonPresentAndNotValidated) == false) {
                }

                log("INFO", "NextButton found on step=[" + stepCounter + "]")
                
                saveRender(page, stepCounter + "-1")

                page.evaluate(function() {
                    $(".InputRowOdd  .inputtyperbloption .radioBranded").click()
                    $(".InputRowEven .inputtyperbloption .radioBranded").click()
                    $(".inputtypeopt .cataOption .checkboxBranded").click()

                    if ($(".Opt1 .radioBranded").size() > 0) {
                        $(".Opt1 .radioBranded").click()         
                    } else if ($(".Opt2 .radioBranded").size() > 0) {
                        $(".Opt2 .radioBranded").click()         
                    }
                    
                    if ($("#S081000").size() > 0) { 
                       $("#S081000").val("Merci !")
                    }

                    if ($("#R069000").size() > 0) {
                        $("#R069000 .Opt9").attr("selected", true)
                    }
                    if ($("#R070000").size() > 0) {
                        $("#R070000 .Opt9").attr("selected", true)
                    }
                    
                    if ($("#S076000").size() > 0) {
                        $("#S076000").val("31000")
                    }
                });

                // Look for the validation code 
                var result = page.evaluate(function() {
                    if ($("#FNSfinishText .ValCode").size() > 0) {
                        return $("#FNSfinishText .ValCode").text();
                    }
                });

                if (result) {
                    validationCode = result; 
                    validationCodeFound = true;
                }

                saveRender(page, stepCounter + "-2")

                // Mark the button with the flag 
                if (validationCodeFound == false) {
                    page.evaluate(clickNextButtonAndValidate);            
                }

                stepCounter++;
            
            }); // INJECTJS
        
        } // WHILE

    });

});

