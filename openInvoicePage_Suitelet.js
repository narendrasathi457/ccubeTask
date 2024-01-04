/*
 * Author: Narendra Reddy<narendrasathi457@gmail.com>
 */
/**
 * @NApiVersion 2.1
 * @NScriptType Suitelet
 */
var PAGE_SIZE = 50;
var CLIENT_SCRIPT_FILE_NAME = 'paginationScript_Client.js';

define(['N/ui/serverWidget','N/render','N/email','N/runtime','./functionLibrary.js'],
    function (serverWidget,render,email,runtime,functionLib) {
    function onRequest(context) {
        if (context.request.method == 'GET') {
            try {

                // Create form
                let form = serverWidget.createForm({title: 'Open Invoices Form', hideNavBar: false});

                // Adding the client script for pagination and validation purpose
                form.clientScriptFileId = functionLib.getFileId(CLIENT_SCRIPT_FILE_NAME);

                form.addSubmitButton({label: 'Submit'});

                // fetching required parameters

                var pageId = parseInt(context.request.parameters.page);
                const scriptId = context.request.parameters.script;
                const deploymentId = context.request.parameters.deploy;
                const Customer = context.request.parameters.Customer;
                const Date_Val = context.request.parameters.Date;

                // Creating a hidden data field to store the selected transactions while navigating through the pagination.
                //This enables the user to select records from multiple pages.

                let Data_val = context.request.parameters.Data;
                let Data_val_arr = [];



                let customerField = form.addField({id: 'custpage_customer',type: serverWidget.FieldType.SELECT, label: 'Customer',source: 'vendor'});
                let dataField = form.addField({id: 'custpage_data',type: serverWidget.FieldType.TEXTAREA,label: 'Data'});
                let dueDateField = form.addField({id: 'custpage_date',type: serverWidget.FieldType.DATE,label: 'Date' });

                customerField.isMandatory = true;
                dataField.updateDisplayType({displayType : serverWidget.FieldDisplayType.HIDDEN });




                // Create and display sublist only if customer is selected

                if(functionLib.validateResult(Customer)) {
                    let sublist = form.addSublist({id: 'custpage_sublist',type: serverWidget.SublistType.LIST,label: 'Open Invoices'});
                    sublist.addField({id: 'custpage_checkbox', type: serverWidget.FieldType.CHECKBOX, label: 'Select'});
                    sublist.addField({id: 'custpage_doc_no', type: serverWidget.FieldType.TEXT, label: 'Document No.'});
                    sublist.addField({id: 'custpage_internalid', type: serverWidget.FieldType.TEXT,label: 'InternalId'}).updateDisplayType({displayType : serverWidget.FieldDisplayType.HIDDEN});
                    sublist.addField({id: 'custpage_date_sublist', type: serverWidget.FieldType.DATE, label: 'Date'});
                    sublist.addField({id: 'custpage_due_date', type: serverWidget.FieldType.DATE, label: 'Due Date'});
                    sublist.addField({id: 'custpage_amount', type: serverWidget.FieldType.CURRENCY, label: 'Amount'});
                    sublist.addField({id: 'custpage_customer', type: serverWidget.FieldType.TEXT, label: 'Customer'}).updateDisplayType({displayType : serverWidget.FieldDisplayType.HIDDEN});

                    customerField.defaultValue = Customer;

                    if (functionLib.validateResult(Data_val)) {
                        dataField.defaultValue = Data_val;
                        Data_val_arr = Data_val.split(',');
                    }

                    if (functionLib.validateResult(Date_Val))
                        dueDateField.defaultValue = (Date_Val);

                    // Logic to determine total number of pages

                    let retrieveSearch = functionLib.runSearch(PAGE_SIZE, Customer, Date_Val);

                    log.debug('retrieveSearch', retrieveSearch);

                    let pageCount = Math.ceil(retrieveSearch.count / PAGE_SIZE);

                    log.debug('pageCount', pageCount);
                    // Set pageId to correct value if out of index

                    if (!pageId || pageId == '' || pageId < 0) pageId = 0;
                    else if (pageId >= pageCount) pageId = pageCount - 1;


                    // Add buttons to simulate Next & Previous
                    if (pageId != 0) {
                        form.addButton({
                            id: 'custpage_previous',
                            label: 'Previous',
                            functionName: 'getSuiteletPage(' + scriptId + ', ' + deploymentId + ', ' + (pageId - 1) + ')'
                        });
                    }

                    if (pageId != pageCount - 1) {
                        form.addButton({
                            id: 'custpage_next',
                            label: 'Next',
                            functionName: 'getSuiteletPage(' + scriptId + ', ' + deploymentId + ', ' + (pageId + 1) + ')'
                        });
                    }

                    // Add drop-down and options to navigate to specific page
                    var selectOptions = form.addField({
                        id: 'custpage_pageid',
                        label: 'Page Index',
                        type: serverWidget.FieldType.SELECT
                    });

                    for (i = 0; i < pageCount; i++) {
                        if (i == pageId) {
                            selectOptions.addSelectOption({
                                value: 'pageid_' + i,
                                text: ((i * PAGE_SIZE) + 1) + ' - ' + ((i + 1) * PAGE_SIZE),
                                isSelected: true
                            });
                        } else {
                            selectOptions.addSelectOption({
                                value: 'pageid_' + i,
                                text: ((i * PAGE_SIZE) + 1) + ' - ' + ((i + 1) * PAGE_SIZE)
                            });
                        }
                    }

                    // Get subset of data to be shown on page

                  //  log.debug('pageId',pageId);

                    if(retrieveSearch.count>0) {

                        let addResults = functionLib.fetchSearchResult(retrieveSearch, pageId);

                      //  log.debug('addResults', addResults);

                        // Set data returned to columns
                        let j = 0;
                        addResults.forEach(function (result) {
                            sublist.setSublistValue({id: 'custpage_date_sublist', line: j, value: result.trandate});

                            // checking the data field if the transaction is already marked as check?

                            if (Data_val_arr.indexOf(result.id) != '-1')
                                sublist.setSublistValue({id: 'custpage_checkbox', line: j, value: 'T'});
                            sublist.setSublistValue({id: 'custpage_internalid', line: j, value: result.id});
                            sublist.setSublistValue({id: 'custpage_date_sublist', line: j, value: result.trandate});
                            sublist.setSublistValue({id: 'custpage_customer', line: j, value: result.entity});
                            if (functionLib.validateResult(result.duedate))
                                sublist.setSublistValue({id: 'custpage_due_date', line: j, value: result.duedate});
                            if (functionLib.validateResult(result.amount))
                                sublist.setSublistValue({id: 'custpage_amount', line: j, value: result.amount});
                            if (functionLib.validateResult(result.tranid))
                                sublist.setSublistValue({id: 'custpage_doc_no', line: j, value: result.tranid});
                            j++
                        });
                    }
                }
                context.response.writePage(form);
            } catch (error) {
                log.error('error in Get Stage', error);
                context.response.writeLine('error'+error.message);
                return;
            }
        }

        else{
              try {
                  var Customer = context.request.parameters.custpage_customer;
                  var Data = context.request.parameters.custpage_data;
                  Data = Data.split(',');
                  log.debug('Data', Data);

                  let resultJson = functionLib.getTransactionGroupByDueDate(Customer, Data);

               //   log.debug('JSON', Object.keys(resultJson));

                  for (var x = 0; x < (Object.values(resultJson)).length; x++) {
                      var transactionId = Object.values(resultJson)[x];

                      log.debug('transactionId', transactionId);
                      var tpl = [];
                      for (var k = 0; k < transactionId.length; k++) {
                          tpl.push(render.transaction({
                              entityId: Number(transactionId[k]),
                              printMode: render.PrintMode.PDF,
                              inCustLocale: true
                          }));
                      }
                      const subj = 'Invoice Due Statement';
                      const Body = 'Please find the attached invoice statement';
                     // log.debug('Customer',runtime.getCurrentUser().id);

                      try {
                          email.send({
                              author: runtime.getCurrentUser().id,
                              recipients: Customer,
                              subject: subj,
                              body: Body,
                              attachments: tpl
                          });
                      }
                      catch(error)
                      {
                          log.error('error in sending email',error);
                          context.response.writeLine('error in sending email :'+error.message);
                          return;
                      }

                  }

                  context.response.write("<h4>Processed succesfully.</h4>")
              }
              catch(error){log.error('error in post',error); context.response.writeLine('error'+error.message);return;}
        }
    }
        return {
        onRequest : onRequest
    };
    });